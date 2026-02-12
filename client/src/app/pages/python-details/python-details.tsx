import React from "react";

import {
  Button,
  Bullseye,
  Flex,
  FlexItem,
  Label,
  PageSection,
  PageSectionVariants,
  Spinner,
  Tab,
  TabContent,
  TabContentBody,
  Tabs,
  TabTitleText,
  Title,
} from "@patternfly/react-core";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, CopyIcon } from "@patternfly/react-icons";
import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { useFetchPackageById } from "@app/queries/packages";
import { PathParam, useRouteParams } from "@app/Routes";
import { parseClassifiers } from "./helpers";
import { OverviewTab, VersionsTab, FilesTab } from "./components";

export const PythonDetails: React.FC = () => {
  const pythonId = useRouteParams(PathParam.PYTHON_ID);
  const navigate = useNavigate();

  const [activeTabKey, setActiveTabKey] = React.useState<number>(0);

  const { pkg, isFetching } = useFetchPackageById(pythonId);

  if (isFetching) {
    return (
      <PageSection>
        <Bullseye style={{ padding: "4rem 0" }}>
          <Spinner aria-label="Loading package details" />
        </Bullseye>
      </PageSection>
    );
  }

  if (!pkg) {
    return (
      <PageSection>
        <h1>No package found</h1>
      </PageSection>
    );
  }

  const classifiers = parseClassifiers(pkg.classifiers);

  return (
    <>
      <DocumentMetadata title={pkg.name ?? "Python"} />
      <PageSection variant={PageSectionVariants.default}>
        <Button
          variant="link"
          icon={<ArrowLeftIcon />}
          onClick={() => navigate("/")}
          style={{ paddingLeft: 0, marginBottom: "1rem" }}
        >
          Back to Packages
        </Button>
        <Flex
          justifyContent={{ default: "justifyContentSpaceBetween" }}
          alignItems={{ default: "alignItemsCenter" }}
        >
          <FlexItem>
            <Flex
              direction={{ default: "column" }}
              spaceItems={{ default: "spaceItemsSm" }}
            >
              <FlexItem>
                <Flex
                  alignItems={{ default: "alignItemsCenter" }}
                  spaceItems={{ default: "spaceItemsSm" }}
                >
                  <FlexItem>
                    <Title headingLevel="h1" size="2xl">
                      {pkg.name}
                    </Title>
                  </FlexItem>
                  <FlexItem>
                    <Label color="blue" isCompact>
                      v{pkg.version}
                    </Label>
                  </FlexItem>
                </Flex>
              </FlexItem>
              <FlexItem>
                <p style={{ fontSize: "var(--pf-v6-global--FontSize--lg)" }}>
                  {pkg.summary}
                </p>
              </FlexItem>
              <FlexItem>
                <Flex spaceItems={{ default: "spaceItemsSm" }}>
                  {classifiers.slice(0, 5).map((tag) => (
                    <FlexItem key={tag}>
                      <Label color="grey" isCompact>
                        #{tag}
                      </Label>
                    </FlexItem>
                  ))}
                </Flex>
              </FlexItem>
            </Flex>
          </FlexItem>
          <FlexItem>
            <Button
              variant="secondary"
              icon={<CopyIcon />}
              onClick={() => {
                navigator.clipboard.writeText(
                  `pip install ${pkg.name}==${pkg.version}`,
                );
              }}
            >
              pip install {pkg.name}=={pkg.version}
            </Button>
          </FlexItem>
        </Flex>
      </PageSection>
      <PageSection>
        <Tabs
          activeKey={activeTabKey}
          onSelect={(_event, tabIndex) => setActiveTabKey(tabIndex as number)}
        >
          <Tab eventKey={0} title={<TabTitleText>Overview</TabTitleText>}>
            <TabContent>
              <TabContentBody hasPadding>
                <OverviewTab pkg={pkg} />
              </TabContentBody>
            </TabContent>
          </Tab>
          <Tab eventKey={1} title={<TabTitleText>Versions</TabTitleText>}>
            <TabContent>
              <TabContentBody hasPadding>
                <VersionsTab
                  packageName={pkg.name ?? ""}
                  currentVersion={pkg.version ?? ""}
                />
              </TabContentBody>
            </TabContent>
          </Tab>
          <Tab eventKey={2} title={<TabTitleText>Files</TabTitleText>}>
            <TabContent>
              <TabContentBody hasPadding>
                <FilesTab
                  packageName={pkg.name ?? ""}
                  currentVersion={pkg.version ?? ""}
                />
              </TabContentBody>
            </TabContent>
          </Tab>
        </Tabs>
      </PageSection>
    </>
  );
};
