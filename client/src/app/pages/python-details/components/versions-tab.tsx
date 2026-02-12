import type React from "react";
import { useMemo } from "react";
import {
  Title,
  Label,
  Button,
  Bullseye,
  EmptyState,
  EmptyStateBody,
  Spinner,
} from "@patternfly/react-core";
import { Table, Thead, Tr, Th, Tbody, Td } from "@patternfly/react-table";
import { generatePath, useNavigate } from "react-router-dom";
import { Paths } from "@app/Routes";
import { useFetchPackageVersions } from "@app/queries/packages";
import prettyBytes from "pretty-bytes";

interface VersionsTabProps {
  packageName: string;
  currentVersion: string;
}

export const VersionsTab: React.FC<VersionsTabProps> = ({
  packageName,
  currentVersion,
}) => {
  const navigate = useNavigate();
  const { versions, isFetching } = useFetchPackageVersions(packageName);

  const versionEntries = useMemo(() => {
    return [...versions].reverse();
  }, [versions]);

  if (isFetching) {
    return (
      <Bullseye style={{ padding: "2rem 0" }}>
        <Spinner aria-label="Loading versions" />
      </Bullseye>
    );
  }

  if (versionEntries.length === 0) {
    return (
      <EmptyState titleText="No versions found" headingLevel="h3">
        <EmptyStateBody>
          No versions were found for this package.
        </EmptyStateBody>
      </EmptyState>
    );
  }

  const getStabilityLabel = (version: string) => {
    if (version.includes("rc"))
      return (
        <Label color="yellow" isCompact>
          RC
        </Label>
      );
    if (version.includes("beta"))
      return (
        <Label color="purple" isCompact>
          Beta
        </Label>
      );
    if (version.includes("alpha"))
      return (
        <Label color="red" isCompact>
          Alpha
        </Label>
      );
    if (version.includes("dev"))
      return (
        <Label color="grey" isCompact>
          Dev
        </Label>
      );
    return (
      <Label color="green" isCompact>
        Stable
      </Label>
    );
  };

  const navigateToVersion = (pulpHref: string) => {
    navigate(
      generatePath(Paths.pythonDetails, {
        pythonId: pulpHref,
      }),
    );
  };

  return (
    <>
      <Title headingLevel="h2" size="xl">
        Versions
      </Title>
      <p style={{ marginTop: "0.5rem" }}>
        All available versions of this package.
      </p>
      <Table
        aria-label="Versions table"
        variant="compact"
        style={{ marginTop: "1.5rem" }}
      >
        <Thead>
          <Tr>
            <Th>Version</Th>
            <Th>Release Type</Th>
            <Th>Python Version</Th>
            <Th>Requires Python</Th>
            <Th>Upload Date</Th>
            <Th>Size</Th>
          </Tr>
        </Thead>
        <Tbody>
          {versionEntries.map((item) => {
            const version = item.version ?? "";
            const isCurrentVersion = version === currentVersion;
            return (
              <Tr
                key={item.pulp_href ?? version}
                style={
                  isCurrentVersion
                    ? {
                        backgroundColor:
                          "var(--pf-v6-global--BackgroundColor--200)",
                      }
                    : undefined
                }
              >
                <Td dataLabel="Version">
                  <Button
                    variant="link"
                    isInline
                    onClick={() => navigateToVersion(item.pulp_href ?? "")}
                    style={{
                      fontWeight: isCurrentVersion ? "bold" : "normal",
                    }}
                  >
                    {version}
                  </Button>
                  {isCurrentVersion && (
                    <Label
                      color="blue"
                      isCompact
                      style={{ marginLeft: "0.5rem" }}
                    >
                      current
                    </Label>
                  )}
                </Td>
                <Td dataLabel="Release Type">{getStabilityLabel(version)}</Td>
                <Td dataLabel="Python Version">
                  <code
                    style={{
                      backgroundColor:
                        "var(--pf-v6-global--BackgroundColor--200)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "var(--pf-v6-global--FontSize--sm)",
                      fontFamily: "var(--pf-v6-global--FontFamily--monospace)",
                    }}
                  >
                    {item.python_version ?? "N/A"}
                  </code>
                </Td>
                <Td dataLabel="Requires Python">
                  {item.requires_python ?? "N/A"}
                </Td>
                <Td dataLabel="Upload Date">
                  {item.pulp_created
                    ? new Date(item.pulp_created).toLocaleDateString()
                    : "N/A"}
                </Td>
                <Td dataLabel="Size">{prettyBytes(item.size ?? 0)}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </>
  );
};
