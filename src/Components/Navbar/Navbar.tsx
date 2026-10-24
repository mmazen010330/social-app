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
    <>
      <nav className="bg-white fixed w-full z-50 top-0 inset-x-0 border-b border-gray-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
          {/* Left: Brand Logo */}
          <Link
            to={userData ? "/posts" : "/login"}
            className="flex items-center gap-2 group shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
              R
            </div>
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-gray-900">
              Route<span className="text-blue-600">Posts</span>
            </span>
          </Link>

          {/* Center: Desktop Navigation Pill Bar */}
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
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
                <span>Notifications</span>
              </NavLink>
            </div>
          )}

          {/* Right: User Menu */}
          <div className="relative flex items-center gap-2 sm:gap-3">
            {userData ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 px-2 sm:px-2.5 py-1.5 rounded-full bg-gray-50 border border-gray-200/80 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <img
                    src={userPhoto}
                    alt={displayName}
                    className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0"
                  />
                  <span className="text-xs font-bold text-gray-800 hidden sm:inline-block max-w-24 truncate">
                    {displayName}
                  </span>
                  <Menu size={16} className="text-gray-600 shrink-0" />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-2 space-y-1">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {displayName}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {userData?.email || `@${userData?.username || "user"}`}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <UserIcon size={16} className="text-slate-600 shrink-0" />
                        <span>Profile</span>
                      </Link>

                      <Link
                        to="/change-profile-pic"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <UserIcon size={16} className="text-slate-600 shrink-0" />
                        <span>Update Photo</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <SettingsIcon size={16} className="text-slate-600 shrink-0" />
                        <span>Settings</span>
                      </Link>

                      <div className="border-t border-gray-100 my-1" />

                      <button
                        type="button"
                        onClick={handleLogOut}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#e11d48] bg-[#fff1f2] hover:bg-[#ffe4e6] transition-colors cursor-pointer"
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
                  className="px-3 sm:px-4 py-1.5 text-xs font-bold text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 sm:px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-xs transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (Visible on mobile screens < md) */}
      {userData && (
        <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 px-2 py-1.5 shadow-lg flex items-center justify-around safe-area-pb">
          <NavLink
            to="/posts"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-900"
              }`
            }
          >
            <Home size={19} />
            <span>Feed</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-900"
              }`
            }
          >
            <UserIcon size={19} />
            <span>Profile</span>
          </NavLink>

          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-900"
              }`
            }
          >
            <div className="relative">
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            <span>Alerts</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-900"
              }`
            }
          >
            <SettingsIcon size={19} />
            <span>Settings</span>
          </NavLink>
        </div>
      )}
    </>
  );
}

export default Navbar;
