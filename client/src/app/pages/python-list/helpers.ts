import type { Path } from "react-router-dom";

import { TablePersistenceKeyPrefixes } from "@app/Constants";
import { serializeFilterUrlParams } from "@app/hooks/table-controls";
import { trimAndStringifyUrlParams } from "@app/hooks/useUrlParams";
import { distributionBasePathQueryParam, Paths } from "@app/Routes";

export const getPackagesFilteredByDistributionAndText = (args: {
  distributionPath: string;
  filterText: string;
}): Pick<Path, "pathname" | "search"> => {
  const { distributionPath, filterText } = args;

  const prefix = (key: string) =>
    `${TablePersistenceKeyPrefixes.python_wheels}:${key}`;

  const filterParams = serializeFilterUrlParams({
    name: [filterText],
  });

  const params = `${distributionBasePathQueryParam}=${distributionPath}&${trimAndStringifyUrlParams(
    {
      newPrefixedSerializedParams: {
        [prefix("filters")]: filterParams.filters,
      },
    },
  )}`;

  return {
    pathname: Paths.python,
    search: params,
  };
};
