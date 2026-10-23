import type { Post } from "../Posts/posts.interface";

export interface ProfileUserData {
  _id: string;
  name: string;
  username: string;
  email: string;
  dateOfBirth?: string;
  gender?: string;
  photo?: string;
  cover?: string;
  bookmarks?: string[] | Post[];
  followers?: string[];
  following?: string[];
  createdAt?: string;
  followersCount?: number;
  followingCount?: number;
  bookmarksCount?: number;
}

export interface ProfileDataResponse {
  success: boolean;
  message: string;
  data: {
    user: ProfileUserData;
  };
}

export interface UserPostsResponse {
  success: boolean;
  message: string;
  data: {
    posts: Post[];
  };
}

export interface UserBookmarksResponse {
  success: boolean;
  message: string;
  data: {
    bookmarks: Post[];
  };
}
