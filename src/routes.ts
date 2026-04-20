import { createBrowserRouter } from "react-router";
import { Home } from "./screens/Home";
import { Login } from "./screens/Login";
import { AdminPanel } from "./screens/AdminPanel";
import { AuthCallback } from "./screens/AuthCallback";

export const router = createBrowserRouter([
  { path: "/", Component: Home },
  { path: "/login", Component: Login },
  { path: "/admin", Component: AdminPanel },
  { path: "/auth/:provider/callback", Component: AuthCallback },
]);
