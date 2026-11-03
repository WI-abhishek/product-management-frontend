import { Paths } from "@/constants";
import { mainRoles } from "@/constants/role.constants";
import { DashboardComponent } from "@/components/app/admin/dashboard/dashboard.component";
import { CategoryListComponent } from "@/components/app/admin/category/category-list.component";
import { ProductListComponent } from "@/components/app/admin/product/product-list.component";

export const adminRoutesStatic: any = {
  adminRoutes: [
    {
      routePath: `${Paths.dashboard}`,
      component: <DashboardComponent />,
      roles: [mainRoles.admin],
      loginRedirectRoute: false,
      indexedRoute: true,
      haveSubRoutes: false,
    },
    {
      routePath: `${Paths.category}`,
      component: <CategoryListComponent />,
      roles: [mainRoles.admin],
      loginRedirectRoute: false,
      indexedRoute: true,
      haveSubRoutes: false,
    },
    {
      routePath: `${Paths.product}`,
      component: <ProductListComponent />,
      roles: [mainRoles.admin],
      loginRedirectRoute: false,
      indexedRoute: true,
      haveSubRoutes: false,
    },
  ],
};
