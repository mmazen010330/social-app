import { useState } from "react";
import { Key, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { changeUserPassword } from "./settings.services";

function Settings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (!newPassword) {
      toast.error("Please enter your new password");
      return;
    }

    // Password regex: at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error(
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Confirm password does not match new password");
      return;
    }

    try {
      setIsLoading(true);
      const res = await changeUserPassword(currentPassword, newPassword);
      toast.success(res.message || "Password changed successfully!");
      setIsSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to change password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex items-start justify-center px-2 sm:px-4 py-4 sm:py-10 bg-[#f8fafc]">
      <div className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8 md:p-10">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-7">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
            <Key size={20} className="rotate-45" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Change Password
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
              Keep your account secure by using a strong password.
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {isSuccess && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>Your password has been updated and your session refreshed.</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current password */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Current password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setIsSuccess(false);
                }}
                placeholder="Enter current password"
                className="w-full px-4 py-3 text-sm bg-[#f8fafc] border border-gray-200 rounded-xl placeholder:text-gray-400 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              New password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setIsSuccess(false);
                }}
                placeholder="Enter new password"
                className="w-full px-4 py-3 text-sm bg-[#f8fafc] border border-gray-200 rounded-xl placeholder:text-gray-400 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              At least 8 characters with uppercase, lowercase, number, and special character.
            </p>
          </div>

          {/* Confirm new password */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Confirm new password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setIsSuccess(false);
                }}
                placeholder="Re-enter new password"
                className="w-full px-4 py-3 text-sm bg-[#f8fafc] border border-gray-200 rounded-xl placeholder:text-gray-400 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
              className="w-full py-3.5 rounded-xl font-semibold text-sm sm:text-base text-white bg-[#3b82f6] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Updating password...</span>
                </>
              ) : (
                <span>Update password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;
