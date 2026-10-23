import axios from "axios";
import type {
  CommentsApiResponse,
  PostsApiResponse,
  SuggestionsApiResponse,
  Post,
  PaginationInfo,
} from "./posts.interface";

const getBaseUrl = () =>
  import.meta.env.VITE_BASE_URL || "https://route-posts.routemisr.com";

const getHeaders = () => {
  const token = localStorage.getItem("user_tkn") || "";
  return {
    token,
    Authorization: `Bearer ${token}`,
  };
};

export async function fetchAllPosts(page = 1, limit = 10): Promise<{
  posts: Post[];
  pagination?: PaginationInfo;
}> {
  try {
    const res = await axios.get<PostsApiResponse>(`${getBaseUrl()}/posts`, {
      headers: getHeaders(),
      params: { page, limit },
    });

    const posts = res.data?.data?.posts || [];
    const pagination = res.data?.meta?.pagination;
    return { posts, pagination };
  } catch (err) {
    if (axios.isAxiosError<{ message: string }>(err)) {
      throw new Error(err.response?.data?.message || "Failed to fetch posts");
    }
    throw new Error("Failed to load posts");
  }
}

export async function fetchHomeFeed(
  only = "all",
  page = 1,
  limit = 10
): Promise<{
  posts: Post[];
  pagination?: PaginationInfo;
}> {
  try {
    const res = await axios.get<PostsApiResponse>(`${getBaseUrl()}/posts/feed`, {
      headers: getHeaders(),
      params: { only, page, limit },
    });

    const posts = res.data?.data?.posts || [];
    const pagination = res.data?.meta?.pagination;
    return { posts, pagination };
  } catch {
    // If feed fails or has different permissions, fallback to all posts
    return fetchAllPosts(page, limit);
  }
}

export async function createNewPost(formData: FormData): Promise<Post> {
  try {
    const res = await axios.post<{ success: boolean; data: { post: Post } }>(
      `${getBaseUrl()}/posts`,
      formData,
      {
        headers: {
          ...getHeaders(),
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data?.data?.post;
  } catch (err) {
    if (axios.isAxiosError<{ message: string; errors?: string[] }>(err)) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.join(", ") ||
        "Failed to create post";
      throw new Error(msg);
    }
    throw new Error("Network error creating post");
  }
}

export async function deletePostById(postId: string): Promise<boolean> {
  try {
    await axios.delete(`${getBaseUrl()}/posts/${postId}`, {
      headers: getHeaders(),
    });
    return true;
  } catch (err) {
    if (axios.isAxiosError<{ message: string }>(err)) {
      throw new Error(err.response?.data?.message || "Failed to delete post");
    }
    throw new Error("Failed to delete post");
  }
}

export async function toggleLikePost(postId: string): Promise<void> {
  try {
    await axios.put(
      `${getBaseUrl()}/posts/${postId}/like`,
      {},
      { headers: getHeaders() }
    );
  } catch (err) {
    if (axios.isAxiosError<{ message: string }>(err)) {
      throw new Error(err.response?.data?.message || "Failed to update like");
    }
    throw new Error("Failed to like post");
  }
}

export async function toggleBookmarkPost(postId: string): Promise<void> {
  try {
    await axios.put(
      `${getBaseUrl()}/posts/${postId}/bookmark`,
      {},
      { headers: getHeaders() }
    );
  } catch (err) {
    if (axios.isAxiosError<{ message: string }>(err)) {
      throw new Error(err.response?.data?.message || "Failed to bookmark");
    }
    throw new Error("Failed to bookmark post");
  }
}

export async function sharePostById(postId: string): Promise<Post> {
  try {
    const res = await axios.post<{ success: boolean; data: { post: Post } }>(
      `${getBaseUrl()}/posts/${postId}/share`,
      {},
      { headers: getHeaders() }
    );
    return res.data?.data?.post;
  } catch (err) {
    if (axios.isAxiosError<{ message: string }>(err)) {
      throw new Error(err.response?.data?.message || "Failed to share post");
    }
    throw new Error("Failed to share post");
  }
}

export async function fetchPostComments(
  postId: string,
  page = 1,
  limit = 20
) {
  try {
    const res = await axios.get<CommentsApiResponse>(
      `${getBaseUrl()}/posts/${postId}/comments`,
      {
        headers: getHeaders(),
        params: { page, limit },
      }
    );
    return res.data?.data?.comments || [];
  } catch {
    return [];
  }
}

export async function createPostComment(postId: string, content: string) {
  try {
    const formData = new FormData();
    formData.append("content", content);

    const res = await axios.post<{
      success: boolean;
      data: { comment: import("./posts.interface").PostComment };
    }>(`${getBaseUrl()}/posts/${postId}/comments`, formData, {
      headers: {
        ...getHeaders(),
      },
    });

    return res.data?.data?.comment;
  } catch (err) {
    if (axios.isAxiosError<{ message: string }>(err)) {
      throw new Error(err.response?.data?.message || "Failed to add comment");
    }
    throw new Error("Failed to add comment");
  }
}

export async function fetchSuggestedFriends(page = 1, limit = 5) {
  try {
    const res = await axios.get<SuggestionsApiResponse>(
      `${getBaseUrl()}/users/suggestions`,
      {
        headers: getHeaders(),
        params: { page, limit },
      }
    );
    return res.data?.data?.suggestions || [];
  } catch {
    return [];
  }
}
