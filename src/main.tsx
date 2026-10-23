import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import { router } from "./AppRouter/AppRouter";
import CounterContextProvider from "./Context/CounterContext/CounterContext";
import UserAuthProvider from "./Context/UserAuthProvider/UserAuthProvider";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.js'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserAuthProvider>
      <CounterContextProvider>
        <RouterProvider router={router} />
      </CounterContextProvider>
    </UserAuthProvider>
  </StrictMode>,
);
