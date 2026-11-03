import { mainRoles } from "@/constants/role.constants";
import { Paths } from "@/constants/route-paths.constants";

export const adminMenusStatic: any = [
  {
    applicationMenuId: 1,
    id: "dashboard",
    path: `/${Paths.admin}/${Paths.dashboard}`,
    title: "Dashboard",
    icon: "dashboard",
    haveChilds: false,
    childs: [],
    roles: [mainRoles.admin],
  },
  {
    applicationMenuId: 2,
    id: "category",
    path: `/${Paths.admin}/${Paths.category}`,
    title: "Categories",
    icon: "category",
    haveChilds: false,
    childs: [],
    roles: [mainRoles.admin],
  },
  {
    applicationMenuId: 3,
    id: "product",
    path: `/${Paths.admin}/${Paths.product}`,
    title: "Products",
    icon: "product",
    haveChilds: false,
    childs: [],
    roles: [mainRoles.admin],
  }
];
