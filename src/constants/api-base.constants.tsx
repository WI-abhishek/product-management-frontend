export const apiBase: any = {
  apiUrl: import.meta.env.VITE_GATEWAY,
  imageApiUrl: import.meta.env.VITE_IMAGE,

  // User & Auth
  userLogin: "Auth/Login",
  userRegister: "Auth/Register",
  userRefreshToken: "Auth/RefreshToken",
  userGetProfile: "Auth/GetProfile",
  userLogout: "Auth/Logout",

  // Category
  categoryList: "Category/List",
  categoryAdd: "Category/Add",
  categoryUpdate: "Category/Update",
  categoryDelete: "Category/Delete/",
  categorySelectById: "Category/SelectById/",
  categoryGetCategories: "Category/GetCategories",

  // Product
  productList: "Product/List",
  productAdd: "Product/Add",
  productUpdate: "Product/Update",
  productStatus: "Product/Status",
  productSelectById: "Product/SelectById/",
  productDelete: "Product/Delete/",
};
