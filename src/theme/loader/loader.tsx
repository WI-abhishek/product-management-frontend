import Popup from "reactjs-popup";
import "@/theme/loader/loader.style.scss";
import { commonUtils } from "@/constants";
import { Spinner } from "@/theme/spinner/spinner";

export function LoaderComponent({ isLoading = false }: { isLoading?: boolean }) {
  return (
    <Popup open={isLoading} modal closeOnDocumentClick={false} className="loader-popup">
      <div className="pop">
        <div className="content">
          <div className="flex items-center flex-col relative justify-center">
            <img
              src={commonUtils.faviconImage}
              alt="logo"
              width={90}
              className="rounded-full mt-[22px]"
            />
            <div className="flex items-center flex-row mt-2 justify-center">
              <Spinner color={"var(--primary)"} className="absolute top-0  w-[130px] h-[130px]" />
            </div>
          </div>
        </div>
      </div>
    </Popup>
  );
}
