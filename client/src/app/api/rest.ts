import axios from "axios";

import { serializeRequestParamsForHub } from "@app/hooks/table-controls/getHubRequestParams";

import type { HubPaginatedResult, HubRequestParams } from "./models";

const API = "/api";

export const ORGANIZATIONS = `${API}/v2/organization`;
export const ADVISORIES = `${API}/v2/advisory`;
export const SBOMS = `${API}/v2/sbom`;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export const getHubPaginatedResult = <T>(
  url: string,
  params: HubRequestParams = {},
  extraQueryParams: { key: string; value: string }[] = [],
): Promise<HubPaginatedResult<T>> => {
  const requestParams = serializeRequestParamsForHub(params);
  for (const param of extraQueryParams) {
    requestParams.append(param.key, param.value);
  }

  return axios
    .get<PaginatedResponse<T>>(url, {
      params: requestParams,
    })
    .then(({ data }) => ({
      data: data.items,
      total: data.total,
      params,
    }));
};
