import type {
  HubRequestParams,
  UniquePackageMetadataResponse,
  UniquePackageResponse,
} from "@app/api/models";
import { client } from "@app/axios-config/apiInit";
import {
  apiPypiPypiRead,
  apiPypiSimpleRead,
  contentPythonPackagesList,
} from "@app/client";
import type { PythonPythonPackageContentResponse } from "@app/client";
import { PULP_DOMAIN } from "@app/Constants";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { mockQueryFn } from "./helpers";
import {
  packageMock,
  packagesMock,
  packageVersionsMock,
  uniquePackageMock,
  uniquePackagesMock,
} from "./mocks/packages.mock";

export const UniquePackagesQueryKey = "unique-packages";
export const PackagesQueryKey = "packages";
export const PackageByIdQueryKey = "package-by-id";
export const PackageVersionsQueryKey = "package-versions";

export const useFetchUniquePackages = (
  args: { distributionPath: string },
  disableQuery = false,
) => {
  const { distributionPath } = args;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [UniquePackagesQueryKey, distributionPath],
    queryFn: () =>
      mockQueryFn(async () => {
        const response = await apiPypiSimpleRead({
          client,
          path: {
            pulp_domain: PULP_DOMAIN,
            path: distributionPath,
          },
          headers: {
            Accept: "application/vnd.pypi.simple.v1+json",
          },
          maxRedirects: 0,
        });
        return response.data as UniquePackageResponse;
      }, uniquePackagesMock),
    enabled: !disableQuery,
  });

  return {
    packages: data?.projects || [],
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
    refetch,
  };
};

export const useFetchUniquePackageMetadata = (
  args: {
    distributionPath: string;
    packageName: string;
    packageVersion?: string;
  },
  disableQuery = false,
) => {
  const { distributionPath, packageName, packageVersion } = args;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      UniquePackagesQueryKey,
      distributionPath,
      packageName,
      packageVersion,
    ],
    queryFn: () =>
      mockQueryFn(async () => {
        const response = await apiPypiPypiRead({
          client,
          path: {
            pulp_domain: PULP_DOMAIN,
            path: distributionPath,
            // `meta` must be a path in form of `{package}/json/` or `{package}/{version}/json/`
            meta: !packageVersion
              ? `${packageName}/json`
              : `${packageName}/${packageVersion}/json`,
          },
        });
        return response.data as UniquePackageMetadataResponse;
      }, uniquePackageMock),
    enabled: !disableQuery,
  });

  return {
    pkg: data,
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
    refetch,
  };
};

export const packageByIdQueryOptions = (packageId: string) => {
  // The packageId can be either:
  // - A package name (e.g. "scipy") from the card list via the PyPI Simple API
  // - A Pulp href (e.g. "/api/pulp/.../content/python/packages/019c24e4-.../")
  //   from the versions tab when navigating to a specific version
  const isPulpHref =
    packageId.startsWith("/api/pulp/") || packageId.startsWith("/pulp/");

  // Note: contentPythonPackagesRead from @app/client cannot be used here because
  // the generated client's path serializer (core/utils.gen.ts) encodes the Pulp href
  // with encodeURIComponent, turning slashes into %2F and producing an invalid URL.
  // e.g. "/api/pulp/domain/api/v3/content/python/packages/uuid/"
  //   -> "%2Fapi%2Fpulp%2Fdomain%2Fapi%2Fv3%2Fcontent%2Fpython%2Fpackages%2Fuuid%2F"
  return {
    queryKey: [PackageByIdQueryKey, packageId],
    queryFn: () =>
      mockQueryFn(async () => {
        if (isPulpHref) {
          const response = await client.get({
            url: packageId,
            responseType: "json",
          });
          return response.data as PythonPythonPackageContentResponse;
        }

        const response = await contentPythonPackagesList({
          client,
          path: {
            pulp_domain: PULP_DOMAIN,
          },
          query: { name: packageId, limit: 1 },
        });
        const results = response.data?.results ?? [];
        return results[
          results.length - 1
        ] as PythonPythonPackageContentResponse;
      }, packageMock),
  };
};

export const useFetchPackageById = (
  packageId: string,
  disableQuery = false,
) => {
  const { data, isLoading, error, refetch } = useQuery({
    ...packageByIdQueryOptions(packageId),
    enabled: !disableQuery,
  });

  return {
    pkg: data,
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
    refetch,
  };
};

export const useFetchPackageVersions = (
  packageName: string,
  disableQuery = false,
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [PackageVersionsQueryKey, packageName],
    queryFn: () =>
      mockQueryFn(async () => {
        const response = await contentPythonPackagesList({
          client,
          path: {
            pulp_domain: PULP_DOMAIN,
          },
          query: {
            name: packageName,
          },
        });
        return response.data;
      }, packageVersionsMock),
    enabled: !disableQuery && !!packageName,
  });

  return {
    versions: data?.results || [],
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
    refetch,
  };
};

export const useFetchPackages = (
  params: HubRequestParams = {},
  disableQuery = false,
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [PackagesQueryKey, params],
    queryFn: () =>
      mockQueryFn(async () => {
        const response = await contentPythonPackagesList({
          client,
          path: {
            pulp_domain: PULP_DOMAIN,
          },
        });
        return response.data;
      }, packagesMock),
    enabled: !disableQuery,
  });

  return {
    result: {
      data: data?.results || [],
      total: data?.count ?? 0,
      params: params,
    },
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
    refetch,
  };
};
