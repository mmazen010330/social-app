import { createBrowserRouter } from "react-router";
import Posts from "../Pages/Posts/Posts";
import Login from "../Pages/Login/Login";
import Register from "../Pages/Register/Register";
import NotFound from "../Pages/NotFound/NotFound";
import Layout from "../Components/Layout/Layout";
import ProtectedRoute from "../Components/ProtectedRoute/ProtectedRoute";
import AuthProtected from "../Components/AuthProtected/AuthProtected";

import ChangeProfilePic from "../Context/changeUserData/changeProfilePic";
import Profile from "../Pages/Profile/Profile";
import Notifications from "../Pages/Notifications/Notifications";
import Settings from "../Pages/Settings/Settings";

export const router = createBrowserRouter([
  {
    path: "",
    element: <Layout />,
    children: [
      { index: true, element: <ProtectedRoute><Posts /></ProtectedRoute> },
      { path: "posts", element: <ProtectedRoute><Posts /></ProtectedRoute> },
      { path: "profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: "notifications", element: <ProtectedRoute><Notifications /></ProtectedRoute> },
      { path: "settings", element: <ProtectedRoute><Settings /></ProtectedRoute> },
      { path: "change-profile-pic", element: <ProtectedRoute><ChangeProfilePic /></ProtectedRoute> },
      { path: "login", element: <AuthProtected><Login /></AuthProtected> },
      { path: "register", element: <AuthProtected><Register /></AuthProtected> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

// RouterProvider
