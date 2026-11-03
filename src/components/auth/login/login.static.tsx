import * as Yup from "yup";
import { configuration } from "@/configs";
import { AiOutlineMail } from "react-icons/ai";
import { HiOutlineLockClosed } from "react-icons/hi2";

export const loginStatic = {
  staticInitialValues: {
    email: "",
    password: "",
  },

  validationSchema: Yup.object({
    email: Yup.string()
      .required("Email is required")
      .matches(configuration.emailAddressPattern, "Enter a valid email"),

    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  }),

  formFields: [
    {
      name: "email",
      placeholder: "Enter email",
      fieldType: "email",
      isPrefixShowIcon: true,
      inputClassName: "bg-white!",
      PrefixShowIcon: AiOutlineMail,
    },
    {
      name: "password",
      placeholder: "Enter password",
      fieldType: "password",
      isPrefixShowIcon: true,
      inputClassName: "bg-white!",
      PrefixShowIcon: HiOutlineLockClosed,
    },
  ],
};
