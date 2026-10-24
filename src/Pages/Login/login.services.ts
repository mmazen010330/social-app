import axios from "axios";
import type { LoginResponseType, LoginUserDataType } from "./login.interface";

const API_BASE_URL =
  import.meta.env.VITE_BASE_URL || "https://route-posts.routemisr.com";

export async function userLogin(userData: LoginUserDataType): Promise<LoginResponseType> {
  try {
    const data = await axios.post<LoginResponseType>(
      `${API_BASE_URL}/users/signin`,
      userData,
    );

    return data.data;


  } catch (err) {
    if (axios.isAxiosError<{message:string}>(err)) {
      throw new Error(err.response?.data.message);
      
    }

    throw new Error("NetWork Error");
  }
}
