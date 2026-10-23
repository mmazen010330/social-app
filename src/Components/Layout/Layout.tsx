import { Outlet } from "react-router";
import Navbar from "../Navbar/Navbar";
import { Toaster } from "react-hot-toast";

function Layout() {
  return (
    <>
      <Navbar />
      <div className="bg-[#f0f2f5] min-h-screen pt-16 flex flex-col">
        <Outlet />
        <Toaster position="top-right" />
      </div>
    </>
  );
}

export default Layout;
