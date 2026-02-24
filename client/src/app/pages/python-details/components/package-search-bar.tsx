import React from "react";
import { useNavigate } from "react-router-dom";

import { SearchInput } from "@patternfly/react-core";

import { getDistributionId } from "@app/api/models";
import type { PythonPythonDistributionResponse } from "@app/client";
import { getPackagesFilteredByDistributionAndText } from "@app/pages/python-list/helpers";

interface PackageSearchBarProps {
  distribution: PythonPythonDistributionResponse;
}

export const PackageSearchBar: React.FC<PackageSearchBarProps> = ({
  distribution,
}) => {
  const navigate = useNavigate();

  const [value, setValue] = React.useState("");

  const onSearch = () => {
    if (!value) return;

    navigate(
      getPackagesFilteredByDistributionAndText({
        distributionId: getDistributionId(distribution),
        filterText: value,
      }),
    );
  };

  return (
    <SearchInput
      aria-label="Search package"
      placeholder="Search by name..."
      value={value}
      onChange={(_event, value) => setValue(value)}
      onClear={() => setValue("")}
      onSearch={onSearch}
    />
  );
};
