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
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeftIcon, CopyIcon } from "@patternfly/react-icons";
import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { useFetchUniquePackageMetadata } from "@app/queries/packages";
import { PathParam, useRouteParams } from "@app/Routes";
import { OverviewTab, VersionsTab, FilesTab } from "./components";

export const PythonDetails: React.FC = () => {
  const distributionBasePath = useRouteParams(PathParam.DISTRIBUTION_BASE_PATH);
  const packageName = useRouteParams(PathParam.PYTHON_ID);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const versionParam = searchParams.get("version") ?? undefined;

  const [activeTabKey, setActiveTabKey] = React.useState<number>(0);

  const { pkg, isFetching } = useFetchUniquePackageMetadata({
    distributionPath: distributionBasePath,
    packageName,
    packageVersion: versionParam,
  });

  if (isFetching) {
    return (
      <PageSection>
        <Bullseye style={{ padding: "4rem 0" }}>
          <Spinner aria-label="Loading package details" />
        </Bullseye>
      </PageSection>
    );
  }

  if (!pkg?.info) {
    return (
      <PageSection>
        <h1>No package found</h1>
      </PageSection>
    );
  }

  const { info, releases } = pkg;
  const classifiers = info.classifiers ?? [];

  return (
    <>
      <DocumentMetadata title={info.name ?? "Python"} />
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
                      {info.name}
                    </Title>
                  </FlexItem>
                  <FlexItem>
                    <Label color="blue" isCompact>
                      v{info.version}
                    </Label>
                  </FlexItem>
                </Flex>
              </FlexItem>
              <FlexItem>
                <p style={{ fontSize: "var(--pf-v6-global--FontSize--lg)" }}>
                  {info.summary}
                </p>
              </FlexItem>
              <FlexItem>
                <Flex spaceItems={{ default: "spaceItemsSm" }}>
                  {classifiers.slice(0, 5).map((tag) => {
                    const parts = tag.split(" :: ");
                    const shortTag = parts[parts.length - 1];
                    return (
                      <FlexItem key={tag}>
                        <Label color="grey" isCompact>
                          #{shortTag}
                        </Label>
                      </FlexItem>
                    );
                  })}
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
                  `pip install ${info.name}==${info.version}`,
                );
              }}
            >
              pip install {info.name}=={info.version}
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
                <OverviewTab info={info} />
              </TabContentBody>
            </TabContent>
          </Tab>
          <Tab eventKey={1} title={<TabTitleText>Versions</TabTitleText>}>
            <TabContent>
              <TabContentBody hasPadding>
                <VersionsTab
                  releases={releases ?? {}}
                  currentVersion={info.version ?? ""}
                  distributionBasePath={distributionBasePath}
                  packageName={info.name ?? ""}
                />
              </TabContentBody>
            </TabContent>
          </Tab>
          <Tab eventKey={2} title={<TabTitleText>Files</TabTitleText>}>
            <TabContent>
              <TabContentBody hasPadding>
                <FilesTab
                  releases={releases ?? {}}
                  currentVersion={info.version ?? ""}
                />
              </TabContentBody>
            </TabContent>
          </Tab>
        </Tabs>
      </PageSection>
    </>
  );
};
