import type {
  UniquePackageMetadataResponse,
  UniquePackageResponse,
} from "@app/api/models";
import { client } from "@app/axios-config/apiInit";
import type { PythonPythonPackageContentResponse } from "@app/client";
import { apiPypiSimpleRead, contentPythonPackagesList } from "@app/client";
import { PULP_DOMAIN } from "@app/Constants";
import {
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { mockQueryFn } from "./helpers";
import {
  packageMock,
  uniquePackageMock,
  uniquePackagesMock,
} from "./mocks/packages.mock";

export const PackagesQueryKey = "packages";

export const useFetchUniquePackages = (
  args: { distributionPath: string },
  disableQuery = false,
) => {
  const { distributionPath } = args;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [PackagesQueryKey, distributionPath],
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

// Note: apiPypiPypiRead from @app/client cannot be used here because
// the generated client's path serializer encodes slashes in the `meta`
// parameter with encodeURIComponent, turning `package/version/json` into
// `package%2Fversion%2Fjson`. The Pulp server uses PurePath to parse the
// meta path and encoded slashes break the pattern matching.
export const useFetchUniquePackageMetadata = (
  args: {
    distributionPath: string;
    packageName: string;
    packageVersion?: string;
  },
  disableQuery = false,
) => {
  const { data, isLoading, error, refetch } = useQuery({
    ...uniquePackageMetadataQueryOptions(args),
    enabled: !disableQuery,
  });
  return {
    pkg: data,
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
    refetch,
  };
};

export const useSuspenseUniquePackageMetadata = (args: {
  distributionPath: string;
  packageName: string;
  packageVersion?: string;
}) => {
  const { data, isLoading, error, refetch } = useSuspenseQuery({
    ...uniquePackageMetadataQueryOptions(args),
  });
  return {
    pkg: data,
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
    refetch,
  };
};

export const uniquePackageMetadataQueryOptions = (args: {
  distributionPath: string;
  packageName: string;
  packageVersion?: string;
}) => {
  const { distributionPath, packageName, packageVersion } = args;

  const meta = !packageVersion
    ? `${packageName}/json`
    : `${packageName}/${packageVersion}/json`;

  return queryOptions({
    queryKey: [PackagesQueryKey, distributionPath, packageName, packageVersion],
    queryFn: () =>
      mockQueryFn(async () => {
        const response = await client.get({
          url: `/api/pypi/${PULP_DOMAIN}/${distributionPath}/pypi/${meta}/`,
          responseType: "json",
        });
        return response.data as UniquePackageMetadataResponse;
      }, uniquePackageMock),
  });
};

export const useFetchPackageContent = (args: {
  name: string;
  version?: string;
}) => {
  const { name, version } = args;

  const { data, isLoading, error } = useQuery({
    queryKey: [PackagesQueryKey, null, name, version],
    queryFn: () =>
      mockQueryFn(async () => {
        const response = await contentPythonPackagesList({
          client,
          path: { pulp_domain: PULP_DOMAIN },
          query: { name, version, limit: 1 },
        });
        const results = response.data?.results ?? [];
        return results[0] as PythonPythonPackageContentResponse | undefined;
      }, packageMock),
    enabled: !!version,
  });

  return {
    contentPkg: data,
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
  };
};
