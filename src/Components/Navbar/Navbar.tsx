import { useContext, useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import {
  Home,
  User as UserIcon,
  Bell,
  Menu,
  Settings as SettingsIcon,
} from "lucide-react";
import { UserAuthContext } from "../../Context/UserAuthProvider/UserAuthProvider";
import { fetchUnreadCount } from "../../Pages/Notifications/notifications.services";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { userData, setUserData } = useContext(UserAuthContext);
  const router = useNavigate();

  useEffect(() => {
    if (userData) {
      fetchUnreadCount().then(setUnreadCount);
    }
  }, [userData]);

  function handleLogOut() {
    localStorage.removeItem("user_tkn");
    setUserData(null);
    setIsOpen(false);
    router("/login");
  }

  const displayName = userData?.name || userData?.username || "mazen";
  const userPhoto =
    userData?.photo ||
    "https://img.heroui.chat/image/avatar?w=400&h=400&u=3";

  return (
    <nav className="bg-white fixed w-full z-50 top-0 inset-x-0 border-b border-gray-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Center: Navigation Pill Bar */}
        {userData && (
          <div className="hidden md:flex items-center bg-gray-50 border border-gray-200/80 rounded-full p-1 shadow-2xs">
            <NavLink
              to="/posts"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? "bg-white text-blue-600 shadow-xs border border-gray-200/60"
                    : "text-gray-600 hover:text-gray-900"
                }`
              }
            >
              <Home size={15} />
              <span>Feed</span>
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? "bg-white text-gray-950 shadow-xs border-2 border-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`
              }
            >
              <UserIcon size={15} />
              <span>Profile</span>
            </NavLink>

            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                `relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? "bg-white text-gray-950 shadow-xs border-2 border-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`
              }
            >
              <div className="relative">
                <Bell size={15} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span>Notifications</span>
            </NavLink>
          </div>
        )}

        {/* Right: User Menu */}
        <div className="relative flex items-center gap-3">
          {userData ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-gray-50 border border-gray-200/80 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <img
                  src={userPhoto}
                  alt={displayName}
                  className="w-7 h-7 rounded-full object-cover border border-gray-200"
                />
                <span className="text-xs font-bold text-gray-800 hidden sm:inline-block max-w-25 truncate">
                  {displayName}
                </span>
                <Menu size={16} className="text-gray-600" />
              </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-2 space-y-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <UserIcon size={17} className="text-slate-600" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <SettingsIcon size={17} className="text-slate-600" />
                      <span>Settings</span>
                    </Link>

                    <div className="border-t border-gray-100 my-1" />

                    <button
                      type="button"
                      onClick={handleLogOut}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#e11d48] bg-[#fff1f2] hover:bg-[#ffe4e6] transition-colors cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-1.5 text-xs font-bold text-gray-700 hover:text-blue-600 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-xs transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
