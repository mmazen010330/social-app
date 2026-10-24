import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router";
import {
  Camera,
  Users,
  Mail,
  FileText,
  Bookmark,
  ThumbsUp,
  Share2,
  MessageSquare,
  Clock,
  Loader2,
  AlertCircle,
  ExternalLink,
  Maximize2,
  Trash2,
  X,
  RefreshCw,
  CornerDownRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { UserAuthContext } from "../../Context/UserAuthProvider/UserAuthProvider";
import {
  fetchProfileData,
  fetchUserPosts,
  fetchUserBookmarks,
  uploadCoverPhoto,
  deleteCoverPhoto,
} from "./profile.services";
import type { ProfileUserData } from "./profile.interface";
import type { Post } from "../Posts/posts.interface";

function formatPostDate(dateString?: string): string {
  if (!dateString) return "Recently";
  try {
    const d = new Date(dateString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateString;
  }
}

function Profile() {
  const { userData, setUserData } = useContext(UserAuthContext);

  const [profile, setProfile] = useState<ProfileUserData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isDeletingCover, setIsDeletingCover] = useState(false);
  const [isViewingCover, setIsViewingCover] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const loadProfileInformation = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      let user: ProfileUserData | null = null;
      try {
        user = await fetchProfileData();
      } catch (e) {
        console.warn("fetchProfileData error, using local userData:", e);
      }

      const effectiveUser = user || (userData as ProfileUserData | null);

      if (effectiveUser) {
        setProfile(effectiveUser);
        if (user) {
          setUserData((prev) => (prev ? { ...prev, ...user } : prev));
        }

        const userId =
          effectiveUser._id ||
          (effectiveUser as { id?: string }).id ||
          userData?._id ||
          (userData as { id?: string })?.id;

        const username = effectiveUser.username || userData?.username;

        if (userId) {
          const [userPosts, userBookmarks] = await Promise.all([
            fetchUserPosts(userId, username),
            fetchUserBookmarks(),
          ]);
          setPosts(userPosts);
          setBookmarks(userBookmarks);
        }
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load profile"
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userData, setUserData]);

  useEffect(() => {
    loadProfileInformation();
  }, [loadProfileInformation]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    try {
      setIsUploadingCover(true);
      const previewUrl = URL.createObjectURL(file);
      setCoverPreview(previewUrl);

      const res = await uploadCoverPhoto(file);
      toast.success(res.message || "Cover photo updated successfully!");

      const newCover = res.cover || previewUrl;
      setProfile((prev) => (prev ? { ...prev, cover: newCover } : prev));
      setUserData((prev) => (prev ? { ...prev, cover: newCover } : prev));

      // Reload to pull new "updated cover photo." post into the feed
      await loadProfileInformation(true);
    } catch (err) {
      setCoverPreview(null);
      toast.error(
        err instanceof Error ? err.message : "Failed to upload cover"
      );
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) {
        coverInputRef.current.value = "";
      }
    }
  };

  const handleDeleteCover = async () => {
    if (!window.confirm("Are you sure you want to remove your cover photo?")) {
      return;
    }

    try {
      setIsDeletingCover(true);
      await deleteCoverPhoto();
      toast.success("Cover photo removed");
      setCoverPreview(null);
      setProfile((prev) => (prev ? { ...prev, cover: "" } : prev));
      setUserData((prev) => (prev ? { ...prev, cover: "" } : prev));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove cover"
      );
    } finally {
      setIsDeletingCover(false);
    }
  };

  const activeUser = profile || (userData as ProfileUserData | null);

  const currentCover =
    coverPreview ||
    activeUser?.cover ||
    "";

  const userAvatar =
    activeUser?.photo ||
    "https://img.heroui.chat/image/avatar?w=400&h=400&u=3";

  const hasCustomCover = Boolean(currentCover && currentCover.trim() !== "");

  const displayedList = activeTab === "posts" ? posts : bookmarks;

  if (isLoading && !activeUser) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-16 flex flex-col items-center justify-center gap-3 text-gray-500">
        <Loader2 size={30} className="animate-spin text-blue-600" />
        <span className="text-sm font-semibold">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
      {/* Cover Photo Banner */}
      <div className="w-full h-56 sm:h-72 rounded-2xl overflow-hidden relative group shadow-sm bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#2563eb]">
        {hasCustomCover ? (
          <img
            src={currentCover}
            alt="Profile cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-30 select-none">
            <span className="text-white text-xl sm:text-2xl font-black tracking-widest uppercase">
              Route Posts
            </span>
          </div>
        )}

        {/* Action Icons on Top-Right Corner */}
        {hasCustomCover ? (
          /* When cover is custom (not default): show View cover, Change cover, Remove */
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex items-center gap-1 sm:gap-2 z-20 opacity-95 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
            <button
              type="button"
              onClick={() => setIsViewingCover(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-black/75 hover:bg-black text-white text-[11px] sm:text-xs font-semibold backdrop-blur-md shadow-sm transition-all cursor-pointer"
            >
              <Maximize2 size={12} />
              <span className="hidden sm:inline">View cover</span>
              <span className="sm:hidden">View</span>
            </button>

            <button
              type="button"
              disabled={isUploadingCover}
              onClick={() => coverInputRef.current?.click()}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-black/75 hover:bg-black text-white text-[11px] sm:text-xs font-semibold backdrop-blur-md shadow-sm transition-all cursor-pointer"
            >
              {isUploadingCover ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Camera size={12} />
                  <span className="hidden sm:inline">Change cover</span>
                  <span className="sm:hidden">Change</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isDeletingCover}
              onClick={handleDeleteCover}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-black/75 hover:bg-black text-white text-[11px] sm:text-xs font-semibold backdrop-blur-md shadow-sm transition-all cursor-pointer"
            >
              {isDeletingCover ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Trash2 size={12} />
              )}
              <span className="hidden sm:inline">Remove</span>
              <span className="sm:hidden">Del</span>
            </button>
          </div>
        ) : (
          /* When cover is default: show Change cover */
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20 opacity-95 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
            <button
              type="button"
              disabled={isUploadingCover}
              onClick={() => coverInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-black/70 hover:bg-black text-white text-[11px] sm:text-xs font-semibold backdrop-blur-md shadow-md transition-all cursor-pointer"
            >
              {isUploadingCover ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Camera size={13} />
                  <span>Change cover</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Hidden File Input for Cover */}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverUpload}
          className="hidden"
        />
      </div>

      {/* Expand / View Cover Modal */}
      {isViewingCover && currentCover && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsViewingCover(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsViewingCover(false)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors z-10 cursor-pointer shadow-md"
            >
              <X size={20} />
            </button>
            <img
              src={currentCover}
              alt="Full cover"
              className="max-h-[85vh] w-auto object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

      {/* Profile Info Summary Card (Overlapping Banner) */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 sm:p-7 -mt-14 sm:-mt-20 mx-1.5 sm:mx-6 relative z-10">
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-5">
          {/* Avatar & User Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 text-center sm:text-left w-full lg:w-auto">
            <div className="relative shrink-0">
              <img
                src={userAvatar}
                alt={activeUser?.name || "User"}
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-md object-cover bg-white"
              />
              <Link
                to="/change-profile-pic"
                className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 p-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer"
                title="Change profile picture"
              >
                <Camera size={14} />
              </Link>
            </div>

            <div className="pt-0 sm:pt-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight truncate">
                {activeUser?.name || "User"}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-gray-400 mt-0.5 truncate">
                @{activeUser?.username || "user"}
              </p>
              <div className="mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200/60 text-blue-700 text-xs font-bold">
                  <Users size={13} />
                  <span>Route Posts member</span>
                </span>
              </div>
            </div>
          </div>

          {/* Followers / Following / Bookmarks Counters */}
          <div className="grid grid-cols-3 gap-2 w-full lg:w-auto">
            <div className="bg-white border border-gray-200/80 rounded-xl sm:rounded-2xl px-2 sm:px-5 py-2.5 sm:py-3 text-center min-w-0 sm:min-w-[100px]">
              <span className="block text-[9px] sm:text-[11px] font-extrabold text-gray-400 tracking-wider truncate">
                FOLLOWERS
              </span>
              <span className="block text-lg sm:text-2xl font-extrabold text-gray-900 mt-0.5">
                {activeUser?.followersCount ?? activeUser?.followers?.length ?? 1}
              </span>
            </div>

            <div className="bg-white border border-gray-200/80 rounded-xl sm:rounded-2xl px-2 sm:px-5 py-2.5 sm:py-3 text-center min-w-0 sm:min-w-[100px]">
              <span className="block text-[9px] sm:text-[11px] font-extrabold text-gray-400 tracking-wider truncate">
                FOLLOWING
              </span>
              <span className="block text-lg sm:text-2xl font-extrabold text-gray-900 mt-0.5">
                {activeUser?.followingCount ?? activeUser?.following?.length ?? 2}
              </span>
            </div>

            <div className="bg-white border border-gray-200/80 rounded-xl sm:rounded-2xl px-2 sm:px-5 py-2.5 sm:py-3 text-center min-w-0 sm:min-w-[100px]">
              <span className="block text-[9px] sm:text-[11px] font-extrabold text-gray-400 tracking-wider truncate">
                BOOKMARKS
              </span>
              <span className="block text-lg sm:text-2xl font-extrabold text-gray-900 mt-0.5">
                {activeUser?.bookmarksCount ?? bookmarks.length}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-6 pt-6 border-t border-gray-100">
          {/* About Box */}
          <div className="md:col-span-7 bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
              About
            </h3>
            <div className="space-y-2 text-xs font-medium text-gray-600">
              <div className="flex items-center gap-2.5">
                <Mail size={15} className="text-gray-400 shrink-0" />
                <span className="truncate">{activeUser?.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Users size={15} className="text-gray-400 shrink-0" />
                <span>Active on Route Posts</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Column */}
          <div className="md:col-span-5 space-y-3">
            <div className="bg-white border border-gray-200/80 rounded-2xl px-5 py-3">
              <span className="block text-[10px] font-extrabold text-gray-400 tracking-wider">
                MY POSTS
              </span>
              <span className="block text-xl font-extrabold text-gray-900 mt-0.5">
                {posts.length}
              </span>
            </div>

            <div className="bg-white border border-gray-200/80 rounded-2xl px-5 py-3">
              <span className="block text-[10px] font-extrabold text-gray-400 tracking-wider">
                SAVED POSTS
              </span>
              <span className="block text-xl font-extrabold text-gray-900 mt-0.5">
                {activeUser?.bookmarksCount ?? bookmarks.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row (My Posts / Saved) */}
      <div className="mt-4 sm:mt-6 mb-4 flex items-center justify-between bg-white rounded-2xl p-1.5 sm:p-2 border border-gray-100 shadow-xs">
        <div className="flex items-center gap-1 sm:gap-1.5 flex-1 sm:flex-none">
          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-none ${
              activeTab === "posts"
                ? "bg-blue-50 text-blue-600 shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileText size={15} />
            <span>My Posts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("saved")}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-none ${
              activeTab === "saved"
                ? "bg-blue-50 text-blue-600 shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Bookmark size={15} />
            <span>Saved</span>
          </button>
        </div>

        <div className="flex items-center gap-2 mr-1 sm:mr-2">
          <button
            type="button"
            onClick={() => loadProfileInformation(true)}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Refresh posts"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? "animate-spin text-blue-600" : ""}
            />
          </button>
          <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center">
            {displayedList.length}
          </span>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {displayedList.map((post) => (
          <article
            key={post._id || post.id}
            className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 transition-all"
          >
            {/* Author Row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <img
                  src={
                    post.user?.photo ||
                    userAvatar ||
                    "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png"
                  }
                  alt={post.user?.name || "User"}
                  className="w-10 h-10 rounded-full object-cover border border-gray-100"
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-900 leading-tight">
                    {post.user?.name || activeUser?.name}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    @{post.user?.username || activeUser?.username}
                  </p>
                </div>
              </div>

              <Link
                to={`/posts`}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                <span>View details</span>
                <ExternalLink size={12} />
              </Link>
            </div>

            {/* Post Content */}
            {post.body ? (
              <p className="text-sm text-gray-800 leading-relaxed mb-3 font-normal whitespace-pre-wrap">
                {post.body}
              </p>
            ) : !post.sharedPost ? (
              <p className="text-sm text-gray-400 italic mb-3">
                No text content
              </p>
            ) : null}

            {/* Shared Post Container */}
            {post.sharedPost && (
              <div className="border border-gray-200/90 rounded-xl p-3.5 mb-3 bg-gray-50/50">
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                  <CornerDownRight size={13} className="text-gray-400" />
                  <span className="font-semibold text-gray-800">
                    {post.sharedPost.user?.name || "Shared user"}
                  </span>
                  <span>·</span>
                  <span>{formatPostDate(post.sharedPost.createdAt)}</span>
                </div>
                {post.sharedPost.body && (
                  <p className="text-sm text-gray-800 mb-2 whitespace-pre-wrap">
                    {post.sharedPost.body}
                  </p>
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

            {/* Post Image */}
            {post.image && (
              <div className="rounded-xl overflow-hidden mb-3 border border-gray-100 max-h-[550px] bg-black/5 flex items-center justify-center">
                <img
                  src={post.image}
                  alt="Post attachment"
                  className="w-full max-h-[550px] object-contain"
                />
              </div>
            )}

            {/* Footer Stats Row */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <ThumbsUp size={14} className="text-blue-500" />
                  <span>{post.likesCount ?? post.likes?.length ?? 0} likes</span>
                </span>
                <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <Share2 size={14} className="text-emerald-500" />
                  <span>{post.sharesCount ?? 0} shares</span>
                </span>
                <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <MessageSquare size={14} className="text-amber-500" />
                  <span>{post.commentsCount ?? 0} comments</span>
                </span>
              </div>

              <div className="flex items-center gap-1 text-gray-400">
                <Clock size={13} />
                <span>{formatPostDate(post.createdAt)}</span>
              </div>
            </div>
          </article>
        ))}

        {displayedList.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center space-y-2 shadow-xs">
            <AlertCircle size={32} className="text-gray-300 mx-auto" />
            <h4 className="text-sm font-bold text-gray-700">
              {activeTab === "posts" ? "No posts yet" : "No saved posts"}
            </h4>
            <p className="text-xs text-gray-400">
              {activeTab === "posts"
                ? "Posts you create will show up here."
                : "Saved posts will appear here for quick access."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
