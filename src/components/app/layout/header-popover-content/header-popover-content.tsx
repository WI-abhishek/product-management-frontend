import { Button } from "@/theme/button/button";
import "@/components/app/layout/header-popover-content/header-popover-content.scss";
import { useState } from "react";
import { MdLogout } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Paths } from "@/constants";
import { useDispatch } from "react-redux";
import { ConfirmationModal } from "@/theme/confirmation-modal/confirmation-modal";
import { logout } from "@/redux/auth.slice";
import { setSingleSideBarToggler } from "@/redux/sidebar.slice";
import { apiService } from "@/services/app.service";
import { commonService } from "@/services/common.service";
import { toast } from "sonner";

interface SettingsPopOverContentProps {
  onClose?: () => void;
}

export const SettingsPopOverContent = ({ onClose }: SettingsPopOverContentProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logOutConfirmation, setLogOutConfirmation] = useState({ isOpen: false });

  const handleLogOut = async () => {
    const apiName = "userLogout";
    try {
      const response = await apiService.PostAPICall(apiName, {});
      switch (response?.status) {
        case 1:
          commonService.resetAPIFlag(apiName, false);
          toast.success(response.message);
          setLogOutConfirmation({ isOpen: false });
          onClose?.();
          dispatch(logout());
          dispatch(setSingleSideBarToggler(false));
          navigate(`/${Paths.auth}`, { replace: true });
          break;
        case 0:
          toast.error(response?.message);
          commonService.resetAPIFlag(apiName, false);
          break;
      }
    } catch (error) {
      console.error("handleLogOut ~ error:", error);
      commonService.resetAPIFlag(apiName, false);
    }
  };

  return (
    <div className="p-3">
      <div className="flex flex-col gap-3">
        <Button
          btnText="Logout"
          btnClass="px-2 w-full h-10"
          leftContent={<MdLogout />}
          onBtnClick={() => setLogOutConfirmation({ isOpen: true })}
        />
      </div>

      <ConfirmationModal
        title="Logout"
        isOpen={logOutConfirmation?.isOpen}
        content="Are you sure you want to logout?"
        onClose={() => setLogOutConfirmation((prev: any) => ({ ...prev, isOpen: false }))}
        confirmation={handleLogOut}
      />
    </div>
  );
};
