import { Route, Routes } from "react-router-dom";
import ErrorLayout from "@/components/error/error.layout";
import Error404Component from "@/components/error/component/error-404.component";
import { Paths } from "@/constants";

export default function ErrorRoutes() {
  return (
    <div className="container-fluid h-100-vh m-0 p-0">
      <Routes>
        <Route element={<ErrorLayout />}>
          <Route path={`${Paths.notFound}`} element={<Error404Component />} />
          <Route index element={<Error404Component />} />
        </Route>
      </Routes>
    </div>
  );
}
