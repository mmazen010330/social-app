import axios from "axios";
import type {
  ProfileDataResponse,
  ProfileUserData,
  UserPostsResponse,
  UserBookmarksResponse,
} from "./profile.interface";
import type { Post } from "../Posts/posts.interface";

const getBaseUrl = () =>
  (import.meta.env.VITE_BASE_URL || "https://route-posts.routemisr.com")
    .trim()
    .replace(/\/$/, "");

const getHeaders = () => {
  const token = localStorage.getItem("user_tkn") || "";
  return {
    token,
    Authorization: `Bearer ${token}`,
  };
};

export async function fetchProfileData(): Promise<ProfileUserData | null> {
  try {
    const res = await axios.get<ProfileDataResponse>(
      `${getBaseUrl()}/users/profile-data`,
      {
        headers: {
          ...getHeaders(),
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        params: {
          _t: Date.now(),
        },
      }
    );
    return res.data?.data?.user || null;
  } catch (err) {
    if (axios.isAxiosError<{ message: string }>(err)) {
      throw new Error(err.response?.data?.message || "Failed to load profile");
    }
    throw new Error("Failed to load profile data");
  }
}

export async function fetchUserProfileById(
  userId: string
): Promise<ProfileUserData | null> {
  try {
    const res = await axios.get<{
      success: boolean;
      data: { user: ProfileUserData };
    }>(`${getBaseUrl()}/users/${userId}/profile`, {
      headers: getHeaders(),
    });
    return res.data?.data?.user || null;
  } catch {
    return null;
  }
}

export async function fetchUserPosts(
  userId: string,
  username?: string
): Promise<Post[]> {
  if (!userId) return [];
  try {
    const headers = getHeaders();

    // 1. Nested user posts: GET /users/:userId/posts
    let userPosts: Post[] = [];
    try {
      const res = await axios.get<UserPostsResponse>(
        `${getBaseUrl()}/users/${userId}/posts`,
        { headers }
      );
      userPosts =
        res.data?.data?.posts ||
        (res.data as unknown as { posts?: Post[] })?.posts ||
        [];
    } catch (e) {
      console.warn("Direct nested posts request error:", e);
    }

    // 2. Fetch general posts to guarantee all newly added posts are included
    try {
      const feedRes = await axios.get<{
        success: boolean;
        data?: { posts?: Post[] };
        posts?: Post[];
      }>(`${getBaseUrl()}/posts?limit=50`, {
        headers,
      });

      const allPosts =
        feedRes.data?.data?.posts || feedRes.data?.posts || [];

      const myFeedPosts = allPosts.filter(
        (p) =>
          p.user?._id === userId ||
          (p.user && (p.user as { id?: string }).id === userId) ||
          (Boolean(username) && p.user?.username === username)
      );

      // Merge and deduplicate by post ID
      const postMap = new Map<string, Post>();
      for (const p of userPosts) {
        const id = p._id || p.id;
        if (id) postMap.set(id, p);
      }
      for (const p of myFeedPosts) {
        const id = p._id || p.id;
        if (id) postMap.set(id, p);
      }

      return Array.from(postMap.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch {
      return userPosts;
    }
  } catch {
    return [];
  }
}

export async function fetchUserBookmarks(): Promise<Post[]> {
  try {
    const res = await axios.get<UserBookmarksResponse>(
      `${getBaseUrl()}/users/bookmarks`,
      {
        headers: getHeaders(),
      }
    );
    return res.data?.data?.bookmarks || [];
  } catch {
    return [];
  }
}

export async function uploadCoverPhoto(
  file: File | Blob
): Promise<{ message: string; cover?: string }> {
  try {
    const formData = new FormData();
    formData.append("cover", file);

    const res = await axios.put<{
      message: string;
      data?: { user?: { cover?: string } };
      cover?: string;
    }>(`${getBaseUrl()}/users/upload-cover`, formData, {
      headers: {
        ...getHeaders(),
      },
    });

    const cover = res.data?.data?.user?.cover || res.data?.cover;
    return { message: res.data?.message || "Cover updated", cover };
  } catch (err) {
    if (axios.isAxiosError<{ message: string; errors?: string }>(err)) {
      throw new Error(
        err.response?.data?.message ||
          err.response?.data?.errors ||
          "Failed to upload cover"
      );
    }
    throw new Error("Failed to upload cover photo");
  }
}

export async function deleteCoverPhoto(): Promise<boolean> {
  try {
    await axios.delete(`${getBaseUrl()}/users/cover`, {
      headers: getHeaders(),
    });
    return true;
  } catch (err) {
    if (axios.isAxiosError<{ message: string }>(err)) {
      throw new Error(
        err.response?.data?.message || "Failed to remove cover photo"
      );
    }
    throw new Error("Failed to remove cover photo");
  }
}
