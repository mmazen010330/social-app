import axios from "axios";

const getBaseUrl = () =>
  (import.meta.env.VITE_BASE_URL || "https://route-posts.routemisr.com")
    .trim()
    .replace(/\/$/, "");

export async function changeUserPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ message: string; token?: string }> {
  const token = localStorage.getItem("user_tkn") || "";
  const payload = {
    password: currentPassword,
    newPassword: newPassword,
  };

  const headers = {
    token,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    // Route Posts uses PATCH for /users/change-password
    const res = await axios.patch(
      `${getBaseUrl()}/users/change-password`,
      payload,
      { headers }
    );

    const refreshedToken = res.data?.token || res.data?.data?.token;
    if (refreshedToken) {
      localStorage.setItem("user_tkn", refreshedToken);
    }

    return {
      message: res.data?.message || "Password changed successfully",
      token: refreshedToken,
    };
  } catch (err: any) {
    // Fallback to PUT if PATCH returns 405 (Method Not Allowed) or 404
    if (err.response?.status === 405 || err.response?.status === 404) {
      try {
        const putRes = await axios.put(
          `${getBaseUrl()}/users/change-password`,
          payload,
          { headers }
        );
        const refreshedToken = putRes.data?.token || putRes.data?.data?.token;
        if (refreshedToken) {
          localStorage.setItem("user_tkn", refreshedToken);
        }
        return {
          message: putRes.data?.message || "Password changed successfully",
          token: refreshedToken,
        };
      } catch (putErr) {
        err = putErr;
      }
    }

    if (axios.isAxiosError(err)) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (Array.isArray(err.response?.data?.errors)
          ? err.response?.data?.errors.join(", ")
          : err.response?.data?.errors) ||
        "Failed to change password";
      throw new Error(msg);
    }
    throw new Error("Network error changing password");
  }
}
