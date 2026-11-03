import "@/components/auth/login/login.style.scss";
import { Form, Formik } from "formik";
import { Button } from "@/theme/button/button";
import { PiSignInThin } from "react-icons/pi";
import { loginStatic } from "./login.static";
import { toast } from "sonner";
import { login } from "@/redux/auth.slice";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { apiService } from "@/services/app.service";
import { commonService } from "@/services/common.service";
import { RenderField } from "@/theme/render-field/render-field";
import { LuPackage, LuLayers } from "react-icons/lu";

export const LoginComponent = () => {
  const dispatch = useDispatch();
  const [submit, setIsSubmit] = useState(false);

  const {
    staticInitialValues: loginInitialValues,
    validationSchema: loginValidationSchema,
    formFields: loginFields,
  } = loginStatic;

  const onLoginSubmit = async (values: any) => {
    setIsSubmit(true);
    const apiName = "userLogin";
    const body = {
      email: values.email,
      password: values.password,
    };
    try {
      const response = await apiService.PostAPICall(apiName, body);
      switch (response?.status) {
        case 1:
          commonService.resetAPIFlag(apiName, false);
          toast.success(response.message);
          dispatch(
            login({
              user: response.data,
              token: response.data?.accessToken,
            }),
          );
          setIsSubmit(false);
          break;
        case 0:
          toast.error(response?.message);
          commonService.resetAPIFlag(apiName, false);
          setIsSubmit(false);
          break;
      }
    } catch (error) {
      console.error("onLoginSubmit ~ error:", error);
      commonService.resetAPIFlag(apiName, false);
      setIsSubmit(false);
    }
  };

  return (
    <main className="login-split-wrapper">
      <section className="login-showcase-panel srcoll-visible-only-vertical">
        <div className="showcase-bg-container">
          <div className="showcase-grid-bg" />
          <div className="showcase-glow-orb orb-top" />
          <div className="showcase-glow-orb orb-bottom" />
        </div>

        <div className="showcase-content">
          <h1 className="showcase-headline">
            Modern <br />
            <span className="text-gradient">Product</span> &{" "}
            <span className="text-accent">Inventory</span> ERP.
          </h1>

          <p className="showcase-description">
            Empower your operations with seamless multi-category product catalog management,
            real-time stock threshold tracking, and valuation insights.
          </p>

          <div className="bento-activity-row">
            <div className="activity-mini-card">
              <div className="mini-icon">
                <LuPackage />
              </div>
              <div className="mini-text">
                <p>Catalog Control</p>
                <span>Dynamic SKU & Stock</span>
              </div>
            </div>

            <div className="activity-mini-card">
              <div className="mini-icon">
                <LuLayers />
              </div>
              <div className="mini-text">
                <p>Categories & Pricing</p>
                <span>Automated Margins & Alerts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="login-form-section srcoll-visible-only-vertical">
        <div className="login-form-container">
          <div className="login-header-group">
            <h2>Admin Portal</h2>
            <p>
              Enter your administrator credentials to access the console
            </p>
          </div>

          {/* ── LOGIN FORM ── */}
          <Formik
            enableReinitialize
            initialValues={loginInitialValues}
            validationSchema={loginValidationSchema}
            onSubmit={onLoginSubmit}
          >
            {(props: any) => (
              <Form className="login-form-fields">
                <div className="space-y-3.5">
                  {loginFields.map((field) => (
                    <div key={field.name}>
                      <RenderField field={field} />
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 mt-5">
                  <Button
                    btnType="submit"
                    btnText="Access Admin Console"
                    isLoading={submit}
                    btnClass="w-full"
                    isDisabled={props.isSubmitting || !props.isValid}
                    rightContent={<PiSignInThin className="text-xl" strokeWidth={18} />}
                  />
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </section>
    </main>
  );
};
