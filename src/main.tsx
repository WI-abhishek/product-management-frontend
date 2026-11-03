import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/store";
import "@/index.css";
import "@/app.scss";
import MainRoutes from "@/routes/main.routes.tsx";
import { BrowserRouter, HashRouter } from "react-router-dom";

const isElectron = navigator.userAgent.toLowerCase().includes("electron");
const Router = isElectron ? HashRouter : BrowserRouter;

createRoot(document.getElementById("root")!).render(
    <Router>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <MainRoutes />
        </PersistGate>
      </Provider>
    </Router>
);
