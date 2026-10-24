import axios from "axios";
import type { RegisterResponseType, UserDataType } from "./register.interface";

const API_BASE_URL =
  import.meta.env.VITE_BASE_URL || "https://route-posts.routemisr.com";

export async function userRegister(userData: UserDataType): Promise<string> {
  try {
    const res = await axios.post<RegisterResponseType>(
      `${API_BASE_URL}/users/signup`,
      userData,
    );

    return res.data.message;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const message =
        err.response?.data?.message ??
        err.response?.data?.error ??
        "Registration failed";

      throw new Error(message);
    }

    throw new Error("NetWork Error");
  }
}
