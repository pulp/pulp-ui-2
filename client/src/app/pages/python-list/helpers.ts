import type { Path } from "react-router-dom";

import { TablePersistenceKeyPrefixes } from "@app/Constants";
import { serializeFilterUrlParams } from "@app/hooks/table-controls";
import { trimAndStringifyUrlParams } from "@app/hooks/useUrlParams";
import { PathParam, Paths } from "@app/Routes";

export const getPackagesFilteredByDistributionAndText = (args: {
  distributionId: string;
  filterText: string;
}): Pick<Path, "pathname" | "search"> => {
  const { distributionId, filterText } = args;

  const prefix = (key: string) =>
    `${TablePersistenceKeyPrefixes.python_wheels}:${key}`;

  const filterParams = serializeFilterUrlParams({
    name: [filterText],
  });

  const params = `${trimAndStringifyUrlParams({
    newPrefixedSerializedParams: {
      [prefix("filters")]: filterParams.filters,
    },
  })}`;

  const processedUrl = Paths.packageList.replace(
    `/:${PathParam.DISTRIBUTION_ID}`,
    `/${encodeURIComponent(distributionId)}`,
  );

  return {
    pathname: processedUrl,
    search: params,
  };
};
