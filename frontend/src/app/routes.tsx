import { createBrowserRouter } from "react-router";

import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/DashboardLayout";

import HomePage from "./pages/HomePage";
import StockPage from "./pages/StockPage";
import SalesPage from "./pages/SalesPage";

import AddSalePage from "./pages/AddSalePage";
import AddStockPage from "./pages/AddStockPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,

    children: [
      { index: true, Component: HomePage },

      { path: "stock", Component: StockPage },

      { path: "sales", Component: SalesPage },

      {
        path: "add-sale",
        Component: AddSalePage,
      },

      {
        path: "add-stock",
        Component: AddStockPage,
      },
    ],
  },
]);