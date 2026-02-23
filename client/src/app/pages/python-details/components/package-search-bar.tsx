import { getPackagesFilteredByDistributionAndText } from "@app/pages/python-list/helpers";
import { SearchInput } from "@patternfly/react-core";
import React from "react";
import { useNavigate } from "react-router-dom";

interface PackageSearchBarProps {
  distributionBasePath: string;
}

export const PackageSearchBar: React.FC<PackageSearchBarProps> = ({
  distributionBasePath,
}) => {
  const navigate = useNavigate();

  const [value, setValue] = React.useState("");

  const onSearch = () => {
    if (!value) return;

    navigate(
      getPackagesFilteredByDistributionAndText({
        distributionPath: distributionBasePath,
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
