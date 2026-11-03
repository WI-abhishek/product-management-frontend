import { Modal } from "@/theme/modal/modal";
import { Form, Formik } from "formik";
import { Button } from "@/theme/button/button";
import { apiService, commonService } from "@/services";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import { categoryStatic } from "./category.static";
import { RenderField } from "@/theme/render-field/render-field";
import { FiCheck, FiPlus, FiX } from "react-icons/fi";

type AddUpdateCategoryModalProps = {
    isOpen: boolean;
    onClose: (isSuccess?: boolean) => void;
    singleData: any;
};

export const AddUpdateCategoryModal = ({
    isOpen,
    onClose,
    singleData,
}: AddUpdateCategoryModalProps) => {
    const { staticInitialValues, validationSchema, formFields } = categoryStatic;

    const isEdit = Boolean(singleData?.categoryId);
    const [initialValues, setInitialValues] = useState(staticInitialValues);
    const formikRef = useRef<any>(null);

    const onsubmit = async (values: any) => {
        const apiName = isEdit ? "categoryUpdate" : "categoryAdd";

        const payload: any = {
            name: values.name.trim(),
            description: values.description ? values.description.trim() : null,
        };

        if (isEdit) {
            payload.categoryId = singleData.categoryId;
        }

        try {
            const response = isEdit
                ? await apiService.PutAPICall(apiName, payload)
                : await apiService.PostAPICall(apiName, payload);

            switch (response?.status) {
                case 1:
                    commonService.resetAPIFlag(apiName, false);
                    toast.success(response.message);
                    onClose(true);
                    break;
                case 0:
                    toast.error(response?.message);
                    commonService.resetAPIFlag(apiName, false);
                    break;
            }
        } catch (error) {
            console.error("onsubmit ~ error:", error);
            commonService.resetAPIFlag(apiName, false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            if (singleData?.categoryId) {
                setInitialValues({
                    name: singleData.name || "",
                    description: singleData.description || "",
                });
            } else {
                setInitialValues(staticInitialValues);
                formikRef.current?.resetForm({ values: staticInitialValues });
            }
        }
    }, [isOpen, singleData]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => onClose(false)}
            title={`${isEdit ? "Update" : "Add"} Category`}
            width="max-w-lg"
        >
            <Formik
                innerRef={formikRef}
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onsubmit}
            >
                {(formikProps: any) => (
                    <Form className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-4">
                            {formFields.map((field) => (
                                <div key={field.name} className="col-span-1">
                                    <RenderField field={field} props={formikProps} />
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4 mt-4 justify-end border-t pt-4">
                            <Button
                                themeType="reset"
                                btnText="Cancel"
                                btnClass="px-4 h-9"
                                onBtnClick={() => onClose(false)}
                                leftContent={<FiX className="text-base" />}
                            />
                            <Button
                                btnType="submit"
                                btnText={isEdit ? "Save Changes" : "Create Category"}
                                btnClass="px-5 h-9"
                                isLoading={formikProps.isSubmitting}
                                isDisabled={formikProps.isSubmitting || !formikProps.isValid}
                                leftContent={
                                    isEdit ? <FiCheck className="text-base" /> : <FiPlus className="text-base" />
                                }
                            />
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

