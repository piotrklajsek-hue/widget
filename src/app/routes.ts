import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import AuthCallback from "./pages/AuthCallback";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/admin",
    Component: AdminPanel,
  },
  // OAuth callback routes — provider redirectuje tu po zalogowaniu
  {
    path: "/auth/:provider/callback",
    Component: AuthCallback,
  },
]);
