import type { UserData } from "../UserAuthProvider/userAuthProvider.interface";

export interface UploadPhotoResponse {
  message: string;
  user?: UserData;
  data?: {
    user: UserData;
  };
}

export interface ProfilePicFormValues {
  imageUrl?: string;
  file?: File | null;
}
