import { Route, Routes } from "react-router-dom";
import AuthLayout from "@/components/auth/auth.layout.tsx";
import { LoginComponent } from "@/components/auth/login/login.component.tsx";
import ErrorLayout from "@/components/error/error.layout.tsx";
import Error404Component from "@/components/error/component/error-404.component.tsx";
import { Paths } from "@/constants/index.tsx";

export default function AuthRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path={`${Paths.login}`} element={<LoginComponent />} />
        <Route path={`${Paths.admin}/${Paths.login}`} element={<LoginComponent />} />
        <Route index element={<LoginComponent />} />
      </Route>
      <Route path="*" element={<ErrorLayout />}>
        <Route index path="*" element={<Error404Component />} />
      </Route>
    </Routes>
  );
}
