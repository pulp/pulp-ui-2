import type React from "react";
import {
  ClipboardCopy,
  Content,
  Grid,
  GridItem,
  Title,
} from "@patternfly/react-core";
import Markdown from "react-markdown";
import type { PythonPythonPackageContentResponse } from "@app/client";
import { MetadataSidebar } from "./metadata-sidebar";

interface OverviewTabProps {
  pkg: PythonPythonPackageContentResponse;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ pkg }) => {
  const description = pkg.description ?? "No description available.";

  return (
    <Grid hasGutter>
      <GridItem span={12} lg={9}>
        {/* About section */}
        <Title headingLevel="h2" size="xl">
          About
        </Title>
        <Content isEditorial style={{ marginTop: "0.5rem" }}>
          <Markdown>{description}</Markdown>
        </Content>

        {/* Installation section */}
        <Title headingLevel="h2" size="xl" style={{ marginTop: "2rem" }}>
          Installation
        </Title>
        <ClipboardCopy
          isReadOnly
          hoverTip="Copy"
          clickTip="Copied"
          style={{ marginTop: "0.5rem" }}
        >
          pip install {pkg.name ?? ""}
        </ClipboardCopy>
      </GridItem>

      <GridItem span={12} lg={3}>
        <MetadataSidebar pkg={pkg} />
      </GridItem>
    </Grid>
  );
};
