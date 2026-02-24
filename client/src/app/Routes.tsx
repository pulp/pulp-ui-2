import { lazy } from "react";
import { createBrowserRouter, useParams, type Params } from "react-router-dom";

import { LazyRouteElement } from "@app/components/LazyRouteElement";

import App from "./App";
import { RouteErrorBoundary } from "./components/RouteErrorBoundary";
import { queryClient } from "./queries/config";
import { distributionByIdQueryOptions } from "./queries/distributions";
import { uniquePackageMetadataQueryOptions } from "./queries/packages";

const DistributionList = lazy(() => import("./pages/distribution-list"));
const PythonList = lazy(() => import("./pages/python-list"));
const PythonDetails = lazy(() => import("./pages/python-details"));
const NotFound = lazy(() => import("./pages/not-found"));

export const PathParam = {
  DISTRIBUTION_ID: "distributionId",
  PYTHON_ID: "pythonId",
} as const;

type PathParamType = (typeof PathParam)[keyof typeof PathParam];

export const Paths = {
  distributionList: "/",
  packageList: `/:${PathParam.DISTRIBUTION_ID}`,
  packageDetails: `/:${PathParam.DISTRIBUTION_ID}/:${PathParam.PYTHON_ID}`,
} as const;

export const distributionBasePathQueryParam = "distribution";

export const usePathFromParams = (
  params: Params<string>,
  pathParam: PathParamType,
) => {
  const value = params[pathParam];
  if (value === undefined) {
    throw new Error(
      `ASSERTION FAILURE: required path parameter not set: ${pathParam}`,
    );
  }
  return value;
};

export const AppRoutes = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        {
          path: Paths.distributionList,
          element: (
            <LazyRouteElement
              identifier="distributions"
              component={<DistributionList />}
            />
          ),
        },
        {
          path: Paths.packageList,
          element: (
            <LazyRouteElement
              identifier="packages"
              component={<PythonList />}
            />
          ),
          errorElement: <RouteErrorBoundary />,
          loader: async ({ params }) => {
            const distributionId = usePathFromParams(
              params,
              PathParam.DISTRIBUTION_ID,
            );

            const response = await queryClient.ensureQueryData(
              distributionByIdQueryOptions({
                distributionId: distributionId,
              }),
            );
            return {
              distribution: response,
            };
          },
        },
        {
          path: Paths.packageDetails,
          element: (
            <LazyRouteElement
              identifier="package-details"
              component={<PythonDetails />}
            />
          ),
          errorElement: <RouteErrorBoundary />,
          loader: async ({ params, request }) => {
            const distributionId = usePathFromParams(
              params,
              PathParam.DISTRIBUTION_ID,
            );
            const distributionResponse = await queryClient.ensureQueryData(
              distributionByIdQueryOptions({
                distributionId: distributionId,
              }),
            );

            const packageName = usePathFromParams(params, PathParam.PYTHON_ID);
            const url = new URL(request.url);
            const version = url.searchParams.get("version") ?? undefined;
            const packageResponse = await queryClient.ensureQueryData(
              uniquePackageMetadataQueryOptions({
                distributionPath: distributionResponse.base_path,
                packageName,
                packageVersion: version,
              }),
            );
            return {
              distribution: distributionResponse,
              package: packageResponse,
            };
          },
        },
        {
          path: "*",
          element: (
            <LazyRouteElement identifier="not-found" component={<NotFound />} />
          ),
        },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
);

export const useRouteParams = (pathParam: PathParamType) => {
  const params = useParams();
  const value = params[pathParam];
  if (value === undefined) {
    throw new Error(
      `ASSERTION FAILURE: required path parameter not set: ${pathParam}`,
    );
  }
  return value;
};
