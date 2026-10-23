import axios from "axios";
import type { UploadPhotoResponse } from "./changeProfilePic.interface";

/**
 * Uploads a profile photo file to Route Misr posts API via PUT request
 * Curl equivalent:
 * curl --location --request PUT 'https://route-posts.routemisr.com/users/upload-photo' \
 * --form 'photo=@"/path/to/file"'
 */
export async function uploadProfilePhoto(file: File | Blob): Promise<UploadPhotoResponse> {
  try {
    const formData = new FormData();
    formData.append("photo", file);

    const token = localStorage.getItem("user_tkn");

    const baseUrl = import.meta.env.VITE_BASE_URL || "https://route-posts.routemisr.com";
    const res = await axios.put<UploadPhotoResponse>(
      `${baseUrl}/users/upload-photo`,
      formData,
      {
        headers: {
          token: token || "",
        },
      }
    );

    return res.data;
  } catch (err) {
    if (axios.isAxiosError<{ message: string; error?: string }>(err)) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to upload profile picture";
      throw new Error(message);
    }
    throw new Error(err instanceof Error ? err.message : "Network Error");
  }
}

/**
 * Helper function to download an image from a URL and convert it into a File object
 * so it can be uploaded via FormData.
 */
export async function convertUrlToFile(
  imageUrl: string,
  filename = "profile-pic.jpg"
): Promise<File> {
  try {
    const response = await fetch(imageUrl, { mode: "cors" });
    if (!response.ok) {
      throw new Error(`Failed to load image from URL (HTTP ${response.status})`);
    }
    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) {
      throw new Error("The specified URL does not return a valid image.");
    }
    const ext = blob.type.split("/")[1]?.replace("+xml", "") || "jpg";
    const finalFilename = filename.includes(".") ? filename : `${filename}.${ext}`;
    return new File([blob], finalFilename, { type: blob.type });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Failed to load")) {
      throw error;
    }
    throw new Error(
      "Could not load image from URL (possibly blocked by CORS). Please download the image and use the file uploader."
    );
  }
}
