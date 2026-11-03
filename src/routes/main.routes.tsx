import { Navigate, Route, Routes } from "react-router-dom";
import { Paths, reduxName } from "@/constants";
import ErrorRoutes from "@/routes/error.routes";
import AuthRoutes from "@/routes/auth.routes";
import App from "@/app";
import { useSelector } from "react-redux";
import AdminRoutes from "./admin/admin.routes";

export default function MainRoutes() {
  const { token } = useSelector((state: any) => state[reduxName.auth]);

  return (
    <div className="container-fluid h-100-vh m-0 p-0">
      <Routes>
        <Route path={`${Paths.error}/*`} element={<ErrorRoutes />} />
        <Route element={<App />}>
          {token ? (
            <>
              {/* ADMIN PANEL */}
              <Route path={`${Paths.admin}/*`} element={<AdminRoutes />} />
              <Route
                path="*"
                element={<Navigate to={`/${Paths.admin}/${Paths.dashboard}`} replace />}
              />
            </>
          ) : (
            <>
              {/* Authentication */}
              <Route path={`${Paths.auth}/*`} element={<AuthRoutes />} />
              <Route path="*" element={<Navigate to={`/${Paths.auth}/${Paths.login}`} replace />} />
            </>
          )}
        </Route>
      </Routes>
    </div>
  );
}
