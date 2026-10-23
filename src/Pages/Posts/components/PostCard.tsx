import React, { useState } from "react";
import {
  Globe,
  MoreHorizontal,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  Trash2,
  Copy,
  Send,
  Loader2,
  CornerDownRight,
} from "lucide-react";
import toast from "react-hot-toast";
import type { Post, PostComment } from "../posts.interface";
import type { UserData } from "../../../Context/UserAuthProvider/userAuthProvider.interface";
import { formatTimeAgo } from "../utils/timeAgo";
import {
  toggleLikePost,
  toggleBookmarkPost,
  sharePostById,
  deletePostById,
  fetchPostComments,
  createPostComment,
} from "../posts.services";

interface PostCardProps {
  post: Post;
  currentUser: UserData | null;
  onPostDeleted?: (postId: string) => void;
  onPostShared?: (newPost: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onPostDeleted,
  onPostShared,
}) => {
  const currentUserId = currentUser?._id;

  // Like state
  const isInitiallyLiked = currentUserId
    ? post.likes?.includes(currentUserId)
    : false;
  const [isLiked, setIsLiked] = useState<boolean>(isInitiallyLiked);
  const [likesCount, setLikesCount] = useState<number>(
    post.likesCount ?? post.likes?.length ?? 0
  );

  // Bookmark state
  const [isBookmarked, setIsBookmarked] = useState<boolean>(
    Boolean(post.bookmarked)
  );

  // Shares count state
  const [sharesCount, setSharesCount] = useState<number>(post.sharesCount ?? 0);

  // Options menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Comments state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>(
    post.topComment ? [post.topComment] : []
  );
  const [commentsCount, setCommentsCount] = useState<number>(
    post.commentsCount ?? (post.topComment ? 1 : 0)
  );
  const [loadingComments, setLoadingComments] = useState(false);
  const [hasLoadedFullComments, setHasLoadedFullComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Fallbacks
  const authorName = post.user?.name || "User";
  const authorUsername = post.user?.username || "user";
  const authorPhoto =
    post.user?.photo ||
    "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";

  const isOwner =
    currentUserId &&
    (currentUserId === post.user?._id ||
      currentUser?.username === post.user?.username);

  const handleToggleLike = async () => {
    // Optimistic update
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await toggleLikePost(post._id || post.id || "");
    } catch {
      // Revert on error
      setIsLiked(!nextState);
      setLikesCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
      toast.error("Failed to update like");
    }
  };

  const handleToggleBookmark = async () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    try {
      await toggleBookmarkPost(post._id || post.id || "");
      toast.success(nextState ? "Saved to bookmarks" : "Removed from bookmarks");
    } catch {
      setIsBookmarked(!nextState);
      toast.error("Failed to bookmark post");
    }
  };

  const handleShare = async () => {
    try {
      const shared = await sharePostById(post._id || post.id || "");
      setSharesCount((prev) => prev + 1);
      toast.success("Post shared to your feed!");
      if (onPostShared && shared) {
        onPostShared(shared);
      }
    } catch {
      toast.error("Failed to share post");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      setIsDeleting(true);
      await deletePostById(post._id || post.id || "");
      toast.success("Post deleted");
      if (onPostDeleted) {
        onPostDeleted(post._id || post.id || "");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete post");
      setIsDeleting(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/posts/${post._id || post.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
    setIsMenuOpen(false);
  };

  const handleToggleCommentsSection = async () => {
    const nextShow = !showComments;
    setShowComments(nextShow);

    if (nextShow && !hasLoadedFullComments) {
      try {
        setLoadingComments(true);
        const fetched = await fetchPostComments(post._id || post.id || "");
        setComments(fetched);
        setHasLoadedFullComments(true);
        if (fetched.length > commentsCount) {
          setCommentsCount(fetched.length);
        }
      } catch {
        // keep top comment if any
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      setSubmittingComment(true);
      const created = await createPostComment(
        post._id || post.id || "",
        newCommentText.trim()
      );
      if (created) {
        setComments((prev) => [created, ...prev]);
        setCommentsCount((prev) => prev + 1);
        setNewCommentText("");
        toast.success("Comment added!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <article className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 mb-5 transition-all">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={authorPhoto}
            alt={authorName}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";
            }}
            className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-xs"
          />
          <div>
            <h3 className="text-sm font-bold text-gray-900 leading-tight">
              {authorName}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
              <span>@{authorUsername}</span>
              <span>·</span>
              <span>{formatTimeAgo(post.createdAt)}</span>
              <span>·</span>
              <div className="flex items-center gap-1 text-gray-400">
                <Globe size={11} />
                <span>Public</span>
              </div>
            </div>
          </div>
        </div>

        {/* Options Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <MoreHorizontal size={18} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-30 py-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left transition-colors"
              >
                <Copy size={14} className="text-gray-500" />
                <span>Copy post link</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleToggleBookmark();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left transition-colors"
              >
                <Bookmark
                  size={14}
                  className={
                    isBookmarked
                      ? "text-blue-600 fill-blue-600"
                      : "text-gray-500"
                  }
                />
                <span>{isBookmarked ? "Remove bookmark" : "Save post"}</span>
              </button>

              {isOwner && (
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleDelete();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 text-left transition-colors"
                >
                  <Trash2 size={14} className="text-red-500" />
                  <span>{isDeleting ? "Deleting..." : "Delete post"}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Text */}
      {post.body && (
        <p className="text-[15px] text-gray-800 font-normal leading-relaxed mb-3 whitespace-pre-wrap break-words">
          {post.body}
        </p>
      )}

      {/* Post Image */}
      {post.image && (
        <div className="rounded-xl overflow-hidden mb-3 border border-gray-100 bg-gray-50">
          <img
            src={post.image}
            alt="Post media"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
            className="w-full max-h-[500px] object-cover"
          />
        </div>
      )}

      {/* Shared Post Container */}
      {post.sharedPost && (
        <div className="border border-gray-200/90 rounded-xl p-3.5 mb-3 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
            <CornerDownRight size={13} className="text-gray-400" />
            <span className="font-semibold text-gray-800">
              {post.sharedPost.user?.name || "Shared user"}
            </span>
            <span>·</span>
            <span>{formatTimeAgo(post.sharedPost.createdAt)}</span>
          </div>
          {post.sharedPost.body && (
            <p className="text-sm text-gray-800 mb-2">{post.sharedPost.body}</p>
          )}
          {post.sharedPost.image && (
            <img
              src={post.sharedPost.image}
              alt="Shared content"
              className="rounded-lg max-h-72 w-full object-cover"
            />
          )}
        </div>
      )}

      {/* Reaction Counts Summary */}
      <div className="flex items-center justify-between text-xs text-gray-500 pb-2.5 pt-1 px-1">
        <div className="flex items-center gap-1.5">
          {likesCount > 0 && (
            <span className="flex items-center gap-1 text-gray-600 font-medium">
              <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">
                👍
              </span>
              <span>{likesCount}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {commentsCount > 0 && (
            <button
              onClick={handleToggleCommentsSection}
              className="hover:underline cursor-pointer"
            >
              {commentsCount} {commentsCount === 1 ? "comment" : "comments"}
            </button>
          )}
          {sharesCount > 0 && (
            <span>
              {sharesCount} {sharesCount === 1 ? "share" : "shares"}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-4 border-t border-b border-gray-100 py-1 my-1">
        <button
          type="button"
          onClick={handleToggleLike}
          className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            isLiked
              ? "text-blue-600 bg-blue-50/60"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <ThumbsUp
            size={17}
            className={isLiked ? "fill-blue-600 text-blue-600" : ""}
          />
          <span>Like</span>
        </button>

        <button
          type="button"
          onClick={handleToggleCommentsSection}
          className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <MessageSquare size={17} />
          <span>Comment</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <Share2 size={17} />
          <span>Share</span>
        </button>

        <button
          type="button"
          onClick={handleToggleBookmark}
          className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            isBookmarked
              ? "text-blue-600 bg-blue-50/60"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <Bookmark
            size={17}
            className={isBookmarked ? "fill-blue-600 text-blue-600" : ""}
          />
          <span>Save</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="pt-3 space-y-3">
          {/* Add Comment Box */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2">
            <img
              src={
                currentUser?.photo ||
                "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png"
              }
              alt={currentUser?.name || "Me"}
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
            <div className="relative flex-1">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-4 py-2 pr-10 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={submittingComment || !newCommentText.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                {submittingComment ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
          </form>

          {/* Loading Indicator */}
          {loadingComments && (
            <div className="flex items-center justify-center py-4 text-xs text-gray-400 gap-2">
              <Loader2 size={16} className="animate-spin text-blue-500" />
              <span>Loading comments...</span>
            </div>
          )}

          {/* Comment List */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {comments.map((comment) => (
              <div key={comment._id} className="flex items-start gap-2.5">
                <img
                  src={
                    comment.commentCreator?.photo ||
                    "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png"
                  }
                  alt={comment.commentCreator?.name || "Commenter"}
                  className="w-7 h-7 rounded-full object-cover border border-gray-100"
                />
                <div className="flex-1 bg-gray-50 rounded-2xl px-3.5 py-2 text-xs border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">
                      {comment.commentCreator?.name || "User"}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}

            {!loadingComments && comments.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-2">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
};
