import type React from "react";
import { useMemo } from "react";
import {
  Title,
  Card,
  CardBody,
  ClipboardCopy,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Label,
  Bullseye,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Spinner,
} from "@patternfly/react-core";
import { useFetchPackageVersions } from "@app/queries/packages";
import prettyBytes from "pretty-bytes";

interface FilesTabProps {
  packageName: string;
  currentVersion: string;
}

export const FilesTab: React.FC<FilesTabProps> = ({
  packageName,
  currentVersion,
}) => {
  const { versions, isFetching } = useFetchPackageVersions(packageName);

  const files = useMemo(() => {
    return versions.filter((item) => item.version === currentVersion);
  }, [versions, currentVersion]);

  if (isFetching) {
    return (
      <Bullseye style={{ padding: "2rem 0" }}>
        <Spinner aria-label="Loading files" />
      </Bullseye>
    );
  }

  if (files.length === 0) {
    return (
      <EmptyState titleText="No files found" headingLevel="h3">
        <EmptyStateBody>
          No distribution files were found for version {currentVersion}.
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <>
      <Title headingLevel="h2" size="xl">
        Files
      </Title>
      <p style={{ marginTop: "0.5rem" }}>
        Distribution files for version {currentVersion}.
      </p>
      <Flex
        direction={{ default: "column" }}
        gap={{ default: "gapMd" }}
        style={{ marginTop: "1.5rem" }}
      >
        {files.map((file) => (
          <FlexItem key={file.sha256 ?? file.filename}>
            <Card isCompact>
              <CardBody>
                <Title headingLevel="h4" size="md">
                  {file.filename ?? "Unknown file"}
                  <Label
                    color={file.packagetype === "sdist" ? "orange" : "blue"}
                    isCompact
                    style={{ marginLeft: "0.5rem" }}
                  >
                    {file.packagetype ?? "unknown"}
                  </Label>
                </Title>
                <DescriptionList isCompact style={{ marginTop: "1rem" }}>
                  <DescriptionListGroup>
                    <DescriptionListTerm>Python Version</DescriptionListTerm>
                    <DescriptionListDescription>
                      {file.python_version ?? "N/A"}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>Size</DescriptionListTerm>
                    <DescriptionListDescription>
                      {prettyBytes(file.size ?? 0)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  {file.requires_python && (
                    <DescriptionListGroup>
                      <DescriptionListTerm>Requires Python</DescriptionListTerm>
                      <DescriptionListDescription>
                        {file.requires_python}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  )}
                  {file.sha256 && (
                    <DescriptionListGroup>
                      <DescriptionListTerm>SHA256</DescriptionListTerm>
                      <DescriptionListDescription>
                        <ClipboardCopy
                          isReadOnly
                          hoverTip="Copy"
                          clickTip="Copied"
                          variant="inline-compact"
                        >
                          {file.sha256}
                        </ClipboardCopy>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  )}
                </DescriptionList>
              </CardBody>
            </Card>
          </FlexItem>
        ))}
      </Flex>
    </>
  );
};
