import { Modal } from "@/theme/modal/modal";
import { Form, Formik } from "formik";
import { Button } from "@/theme/button/button";
import { apiService, commonService } from "@/services";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import { RenderField } from "@/theme/render-field/render-field";
import { FiCheck, FiPlus, FiX, FiUploadCloud, FiTrash2 } from "react-icons/fi";
import { productStatic } from "./product.static";

type AddUpdateProductModalProps = {
    isOpen: boolean;
    onClose: (isSuccess?: boolean) => void;
    singleData: any;
};

export const AddUpdateProductModal = ({
    isOpen,
    onClose,
    singleData,
}: AddUpdateProductModalProps) => {
    const { staticInitialValues, validationSchema, formFields, statusData } = productStatic;

    const isEdit = Boolean(singleData?.productId);
    const [initialValues, setInitialValues]: any = useState(staticInitialValues);
    const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
    const formikRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchCategories = async () => {
        const apiName = "categoryGetCategories";
        try {
            const response = await apiService.GetAPICall(apiName);
            switch (response?.status) {
                case 1:
                    commonService.resetAPIFlag(apiName, false);
                    setCategoryOptions(response?.data || []);
                    break;
                case 0:
                    commonService.resetAPIFlag(apiName, false);
                    setCategoryOptions([]);
                    break;
            }
        } catch (error) {
            console.error("fetchCategories ~ error:", error);
            commonService.resetAPIFlag(apiName, false);
            setCategoryOptions([]);
        }
    };

    const onsubmit = async (values: any) => {
        const apiName = isEdit ? "productUpdate" : "productAdd";

        const formData = new FormData();
        formData.append("name", values.name.trim());
        formData.append("sku", values.sku.trim());

        const categoryIdVal = values.categoryId?.value || values.categoryId || "";
        formData.append("categoryId", categoryIdVal);

        formData.append("costPrice", String(values.costPrice));
        formData.append("sellingPrice", String(values.sellingPrice));

        if (values.brand) formData.append("brand", values.brand.trim());
        if (values.unit) formData.append("unit", values.unit.trim());

        if (values.stockQuantity !== undefined && values.stockQuantity !== null && values.stockQuantity !== "") {
            formData.append("stockQuantity", String(values.stockQuantity));
        }
        if (values.lowStockThreshold !== undefined && values.lowStockThreshold !== null && values.lowStockThreshold !== "") {
            formData.append("lowStockThreshold", String(values.lowStockThreshold));
        }

        const statusVal = values.status?.value || values.status || "ACTIVE";
        formData.append("status", statusVal);

        if (values.description) formData.append("description", values.description.trim());

        if (values.image instanceof File) {
            formData.append("image", values.image);
        } else if (!values.image && isEdit) {
            formData.append("imageUrl", "");
        }

        if (isEdit) {
            formData.append("productId", singleData.productId);
        }

        try {
            const response = isEdit
                ? await apiService.PutFormDataAPICall(apiName, formData)
                : await apiService.PostFormDataAPICall(apiName, formData);

            switch (response?.status) {
                case 1:
                    commonService.resetAPIFlag(apiName, false);
                    toast.success(response?.message);
                    onClose(true);
                    break;
                case 0:
                    commonService.resetAPIFlag(apiName, false);
                    toast.error(response?.message);
                    break;
            }
        } catch (error) {
            console.error("onsubmit ~ error:", error);
            commonService.resetAPIFlag(apiName, false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            if (singleData?.productId) {
                console.log("singleData.sellingPrice", singleData.sellingPrice);

                setInitialValues({
                    name: singleData?.name || "",
                    sku: singleData?.sku || "",
                    categoryId: singleData?.categoryId
                        ? {
                            label: singleData?.category?.name || singleData?.categoryName || "",
                            value: singleData.categoryId,
                        }
                        : "",
                    brand: singleData?.brand && singleData.brand !== "-" ? singleData.brand : "",
                    unit: singleData?.unit || "pcs",
                    costPrice: singleData?.costPrice != null ? singleData.costPrice : "",
                    sellingPrice: singleData?.rawSellingPrice != null ? singleData.rawSellingPrice : "",
                    stockQuantity: singleData?.stockQuantity != null ? singleData.stockQuantity : 0,
                    lowStockThreshold: singleData?.lowStockThreshold != null ? singleData.lowStockThreshold : 10,
                    status: statusData.find((s: any) => s.value === singleData?.status) || {
                        label: "Active",
                        value: "ACTIVE",
                    },
                    description: singleData?.description || "",
                    image: singleData?.imageUrl || "",
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
            title={`${isEdit ? "Update" : "Add"} Product`}
            width="max-w-2xl"
        >
            <Formik
                innerRef={formikRef}
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onsubmit}
            >
                {(formikProps: any) => {
                    const imageValue = formikProps.values.image;
                    const imagePreviewUrl =
                        imageValue instanceof File
                            ? URL.createObjectURL(imageValue)
                            : typeof imageValue === "string" && imageValue
                                ? imageValue
                                : null;

                    return (
                        <Form className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium theme-bold-font-color-text">
                                    Product Image (Optional)
                                </label>
                                <div className="flex items-center gap-4">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden relative group bg-gray-50 dark:bg-dark-900 shrink-0"
                                    >
                                        {imagePreviewUrl ? (
                                            <img
                                                src={imagePreviewUrl}
                                                alt="Product preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-2 text-center">
                                                <FiUploadCloud className="text-2xl text-gray-400 group-hover:text-primary transition-colors" />
                                                <span className="text-[10px] text-gray-500 mt-1">Upload</span>
                                            </div>
                                        )}
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                formikProps.setFieldValue("image", file);
                                            }
                                            e.target.value = "";
                                        }}
                                    />

                                    {imagePreviewUrl && (
                                        <button
                                            type="button"
                                            onClick={() => formikProps.setFieldValue("image", "")}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                                        >
                                            <FiTrash2 className="text-sm" />
                                            Remove Image
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {formFields.map((field) => {
                                    const fieldConfig: any = {
                                        ...field,
                                    };

                                    if (field.name === "categoryId") {
                                        fieldConfig.options = categoryOptions;
                                    } else if (field.name === "status") {
                                        fieldConfig.options = statusData;
                                    }

                                    return (
                                        <div key={field.name} className={field.colSpan || "col-span-1"}>
                                            <RenderField field={fieldConfig} props={formikProps} />
                                        </div>
                                    );
                                })}
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
                                    btnText={isEdit ? "Save Changes" : "Create Product"}
                                    btnClass="px-5 h-9"
                                    isLoading={formikProps.isSubmitting}
                                    isDisabled={formikProps.isSubmitting || !formikProps.isValid}
                                    leftContent={
                                        isEdit ? <FiCheck className="text-base" /> : <FiPlus className="text-base" />
                                    }
                                />
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </Modal>
    );
};

