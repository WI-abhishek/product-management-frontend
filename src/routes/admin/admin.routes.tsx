import { Route, Routes } from "react-router-dom";
import { Paths } from "@/constants";
import ApplicationLayout from "@/components/app/application.layout.tsx";
import ErrorLayout from "@/components/error/error.layout";
import Error404Component from "@/components/error/component/error-404.component.tsx";
import { useRole } from "@/hooks/use-role";
import { adminRoutesStatic } from "./admin.routes.static";

export default function AdminRoutes() {
  const { userDetails } = useRole();

  return (
    <Routes>
      <Route element={<ApplicationLayout />}>
        {adminRoutesStatic?.adminRoutes?.map((val: any, i: number) =>
          val?.loginRedirectRoute ? (
            val?.roles?.includes(userDetails?.role) && (
              <Route key={`route-${i}`} path={`${Paths.auth}/*`} element={val?.component} />
            )
          ) : val?.haveSubRoutes ? (
            <Route key={`route-${i}`} path={`${val?.routePath}`}>
              {val?.subRoutes?.map((subVal: any, j: number) =>
                subVal?.haveSubRoutes ? (
                  <Route key={`subroute-${i}-${j}`} path={`${subVal?.routePath}`}>
                    {subVal?.subRoutes?.map((innerSubVal: any, k: number) =>
                      innerSubVal?.indexedRoute
                        ? innerSubVal?.roles?.includes(userDetails?.role) && (
                          <Route
                            key={`inner-index-${i}-${j}-${k}`}
                            index
                            element={innerSubVal?.component}
                          />
                        )
                        : innerSubVal?.roles?.includes(userDetails?.role) && (
                          <Route
                            key={`inner-index-${i}-${j}-${k}`}
                            path={`${innerSubVal.routePath}`}
                            element={innerSubVal?.component}
                          />
                        ),
                    )}
                  </Route>
                ) : subVal?.indexedRoute ? (
                  subVal?.roles?.includes(userDetails?.role) && (
                    <Route key={`sub-index-${i}-${j}`} index element={subVal?.component} />
                  )
                ) : (
                  subVal?.roles?.includes(userDetails?.role) && (
                    <Route
                      key={`sub-index-${i}-${j}`}
                      path={`${subVal.routePath}`}
                      element={subVal?.component}
                    />
                  )
                ),
              )}
            </Route>
          ) : (
            val?.roles?.includes(userDetails?.role) && (
              <Route key={`main-${i}`} path={`${val?.routePath}`}>
                <Route index={val?.indexedRoute ? true : false} element={val?.component} />
              </Route>
            )
          ),
        )}
      </Route>

      <Route path="*" element={<ErrorLayout />}>
        <Route index path="*" element={<Error404Component />} />
      </Route>
    </Routes>
  );
}
