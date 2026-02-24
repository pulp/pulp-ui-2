import {
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { client } from "@app/axios-config/apiInit";
import {
  distributionsList,
  type PythonPythonDistributionResponse,
} from "@app/client";
import { PULP_DOMAIN } from "@app/Constants";

import { mockQueryFn } from "./helpers";
import {
  distributionMock,
  distributionsMock,
} from "./mocks/distributions.mock";

export const DistributionsQueryKey = "distributions";

export const useFetchDistributions = (disableQuery = false) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [DistributionsQueryKey],
    queryFn: () =>
      mockQueryFn(async () => {
        const response = await distributionsList({
          client,
          path: {
            pulp_domain: PULP_DOMAIN,
          },
        });
        return response.data;
      }, distributionsMock),
    enabled: !disableQuery,
  });

  return {
    distributions: data?.results || [],
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
    refetch,
  };
};

export const distributionByIdQueryOptions = (args: {
  distributionId: string;
}) => {
  const { distributionId } = args;

  return queryOptions({
    queryKey: [DistributionsQueryKey, distributionId],
    queryFn: () =>
      mockQueryFn(async () => {
        const response = await client.get({
          url: `/api/pulp/${PULP_DOMAIN}/api/v3/distributions/python/pypi/${distributionId}/`,
          responseType: "json",
        });
        return response.data as PythonPythonDistributionResponse;
      }, distributionMock),
  });
};

export const useFetchDistributionById = (distributionId: string) => {
  const { data, isLoading, error } = useQuery({
    ...distributionByIdQueryOptions({ distributionId }),
  });

  return {
    distribution: data ?? null,
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
  };
};

export const useSuspenseDistributionById = (distributionId: string) => {
  const { data, isLoading, error, refetch } = useSuspenseQuery({
    ...distributionByIdQueryOptions({ distributionId }),
  });
  return {
    distribution: data,
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
    refetch,
  };
};
