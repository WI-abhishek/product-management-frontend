import { useSelector } from "react-redux";
import { reduxName } from "../constants/redux.constants";

export const authRoles = ["ADMIN"] as const;

export function useRole() {
  const { user, token } = useSelector((state: any) => state[reduxName.auth]);
  const userType = user?.role;

  return {
    userType,
    userDetails: user,
    isAuthUser: Boolean(token),

    /** True for ADMIN */
    isAdmin: true,

    token,
  };
}
