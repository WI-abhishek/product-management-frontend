import { Outlet } from "react-router-dom";
export default function ErrorLayout() {
  return (
    <div className="d-flex flex-column flex-root">
      <div className="d-flex flex-column flex-center flex-column-fluid">
        <div className="d-flex flex-column flex-center text-center p-2-5rem">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
