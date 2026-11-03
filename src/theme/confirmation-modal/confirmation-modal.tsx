import { Button } from "@/theme/button/button";
import { Modal } from "../modal/modal";
import { useState } from "react";
export const ConfirmationModal = ({
  isOpen,
  onClose,
  title = "",
  content = "",
  confirmation,
}: any) => {
  const [loading, setLoading] = useState(false);

  const handleConfirmation = async () => {
    setLoading(true);
    await confirmation();
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="modal-content w-full">
        <span className="text-sm theme-general-font-color-text">{content}</span>
      </div>

      <div className="flex gap-4 mt-5 justify-end">
        <Button themeType="reset" btnText="No" btnClass="px-6 h-8.75" onBtnClick={onClose} />
        <Button
          btnType="submit"
          btnText="Yes"
          isLoading={loading}
          btnClass="px-6 h-8.75"
          onBtnClick={() => handleConfirmation()}
        />
      </div>
    </Modal>
  );
};
