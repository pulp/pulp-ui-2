import type React from "react";

import { PageSection, Title } from "@patternfly/react-core";

import { PathParam, useRouteParams } from "@app/Routes";
import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { useSuspenseDistributionById } from "@app/queries/distributions";

import { CardList } from "./components/CardList";

export const PythonList: React.FC = () => {
  const distributionId = useRouteParams(PathParam.DISTRIBUTION_ID);

  const { distribution } = useSuspenseDistributionById(distributionId);

  return (
    <>
      <DocumentMetadata title={distribution.name} />
      <PageSection>
        <Title headingLevel="h1" size="2xl">
          {distribution.name}
        </Title>
      </PageSection>
      <PageSection>
        <CardList distribution={distribution} />
      </PageSection>
    </>
  );
};
