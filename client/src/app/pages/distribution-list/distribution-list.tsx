import type React from "react";
import { generatePath, Link } from "react-router-dom";

import {
  PageSection,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";

import { TablePersistenceKeyPrefixes } from "@app/Constants";
import { Paths } from "@app/Routes";
import { getDistributionId } from "@app/api/models";
import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { FilterToolbar, FilterType } from "@app/components/FilterToolbar";
import { LoadingDataEmptyState } from "@app/components/LoadingDataEmptyState";
import { LoadingWrapper } from "@app/components/LoadingWrapper";
import { SimplePagination } from "@app/components/SimplePagination";
import {
  ConditionalTableBody,
  TableHeaderContentWithControls,
  TableRowContentWithControls,
} from "@app/components/TableControls";
import { useLocalTableControls } from "@app/hooks/table-controls";
import { useFetchDistributions } from "@app/queries/distributions";

export const DistributionList: React.FC = () => {
  const { distributions, isFetching, fetchError } = useFetchDistributions();

  // Table
  const tableControls = useLocalTableControls({
    persistenceKeyPrefix: TablePersistenceKeyPrefixes.distributions,
    tableName: "distributions-table",
    persistTo: {
      filter: "urlParams",
      pagination: "sessionStorage",
      sort: "sessionStorage",
    },
    idProperty: "base_path",
    items: distributions,
    isLoading: isFetching,
    columnNames: {
      name: "Name",
    },
    hasActionsColumn: false,
    isSortEnabled: true,
    sortableColumns: ["name"],
    initialSort: {
      columnKey: "name",
      direction: "asc",
    },
    getSortValues: (item) => {
      return {
        name: item.name,
      };
    },
    isPaginationEnabled: true,
    isFilterEnabled: true,
    filterCategories: [
      {
        categoryKey: "name",
        title: "Name",
        type: FilterType.search,
        placeholderText: "Search by name...",
        getItemValue: (item) => item.name || "",
      },
    ],
    isExpansionEnabled: false,
  });

  const {
    currentPageItems,
    numRenderedColumns,
    propHelpers: {
      toolbarProps,
      paginationToolbarItemProps,
      paginationProps,
      tableProps,
      filterToolbarProps,
      getThProps,
      getTrProps,
      getTdProps,
    },
    expansionDerivedState: { isCellExpanded },
  } = tableControls;

  return (
    <>
      <DocumentMetadata title={"Python"} />
      <LoadingWrapper
        isFetching={isFetching}
        fetchError={fetchError}
        isFetchingState={<LoadingDataEmptyState />}
      >
        <PageSection>
          <Title headingLevel="h1" size="2xl">
            Distributions
          </Title>
        </PageSection>
        <PageSection>
          <Toolbar {...toolbarProps}>
            <ToolbarContent>
              <FilterToolbar {...filterToolbarProps} />
              <ToolbarItem {...paginationToolbarItemProps}>
                <SimplePagination
                  idPrefix="distribution-table"
                  isTop
                  paginationProps={paginationProps}
                />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
          <Table {...tableProps} aria-label="distribution-table">
            <Thead>
              <Tr>
                <TableHeaderContentWithControls {...tableControls}>
                  <Th {...getThProps({ columnKey: "name" })} />
                </TableHeaderContentWithControls>
              </Tr>
            </Thead>
            <ConditionalTableBody
              isLoading={isFetching}
              isError={!!fetchError}
              isNoData={distributions.length === 0}
              numRenderedColumns={numRenderedColumns}
            >
              {currentPageItems?.map((item, rowIndex) => {
                return (
                  <Tbody key={item.pulp_href} isExpanded={isCellExpanded(item)}>
                    <Tr {...getTrProps({ item })}>
                      <TableRowContentWithControls
                        {...tableControls}
                        item={item}
                        rowIndex={rowIndex}
                      >
                        <Td
                          width={100}
                          modifier="breakWord"
                          {...getTdProps({ columnKey: "name" })}
                        >
                          <Link
                            to={generatePath(Paths.packageList, {
                              distributionId: getDistributionId(item),
                            })}
                          >
                            {item.name}
                          </Link>
                        </Td>
                      </TableRowContentWithControls>
                    </Tr>
                  </Tbody>
                );
              })}
            </ConditionalTableBody>
          </Table>
          <SimplePagination
            idPrefix="distribution-table"
            isTop={false}
            paginationProps={paginationProps}
          />
        </PageSection>
      </LoadingWrapper>
    </>
  );
};
