import { useNavigate } from "react-router-dom";
import "@/components/error/component/error-404.style.scss";
import { useDispatch } from "react-redux";
import { setSideBarApplicationMenu } from "@/redux/sidebar.slice";

export default function Error404Component() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  return (
    <div className="error-404-page flex flex-col items-center justify-center min-h-screen px-4">
      {/* Illustration */}
      <div className="error-404-illustration mb-6 select-none">
        <div className="error-404-number flex items-center gap-2">
          <span>4</span>
          <div className="error-404-cone">
            <div className="cone-body" />
            <div className="cone-base" />
          </div>
          <span>4</span>
        </div>
      </div>

      {/* Text */}
      <h1
        className="text-2xl font-semibold mb-2 text-center"
        style={{ color: "var(--bold-font-color)" }}
      >
        Page Not Found
      </h1>
      <p
        className="text-sm text-center max-w-sm mb-8"
        style={{ color: "var(--general-font-color)" }}
      >
        The page you're looking for doesn't exist or has been moved.
      </p>

      {/* Button */}
      <button
        className="error-404-btn rounded-lg px-6 h-9 text-sm font-medium duration-200"
        onClick={() => {
          navigate("/");
          dispatch(setSideBarApplicationMenu({ applicationMenuId: 1, subApplicationMenuId: 0 }));
        }}
      >
        Back to Home
      </button>
    </div>
  );
}
