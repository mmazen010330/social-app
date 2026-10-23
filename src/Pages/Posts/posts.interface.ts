export interface PostUser {
  _id: string;
  name: string;
  username: string;
  photo?: string;
  email?: string;
}

export interface CommentUser {
  _id: string;
  name: string;
  username: string;
  photo?: string;
}

export interface PostComment {
  _id: string;
  content: string;
  commentCreator: CommentUser;
  post: string;
  parentComment?: string | null;
  likes?: string[];
  createdAt: string;
}

export interface Post {
  _id: string;
  id?: string;
  body?: string;
  image?: string;
  privacy?: string;
  user: PostUser;
  sharedPost?: Post | null;
  likes: string[];
  likesCount?: number;
  commentsCount?: number;
  topComment?: PostComment | null;
  sharesCount?: number;
  isShare?: boolean;
  bookmarked?: boolean;
  createdAt: string;
}

export interface SuggestedFriend {
  _id: string;
  name: string;
  username: string;
  photo?: string;
  followersCount?: number;
  mutualFollowersCount?: number;
  isFollowing?: boolean;
}

export interface PaginationInfo {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  nextPage?: number | null;
  total?: number;
}

export interface PostsApiResponse {
  success: boolean;
  message: string;
  data: {
    posts: Post[];
  };
  meta?: {
    pagination?: PaginationInfo;
  };
}

export interface SuggestionsApiResponse {
  success: boolean;
  message: string;
  data: {
    suggestions: SuggestedFriend[];
  };
}

export interface CommentsApiResponse {
  success: boolean;
  message: string;
  data: {
    comments: PostComment[];
  };
}
