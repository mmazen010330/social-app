import { useContext, useEffect, useState, useCallback } from "react";
import { UserAuthContext } from "../../Context/UserAuthProvider/UserAuthProvider";
import { LeftSidebar, type FeedFilter } from "./components/LeftSidebar";
import { CreatePostCard } from "./components/CreatePostCard";
import { PostCard } from "./components/PostCard";
import { RightSidebar } from "./components/RightSidebar";
import { fetchAllPosts, fetchHomeFeed } from "./posts.services";
import type { Post } from "./posts.interface";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import { fetchUserPosts, fetchUserBookmarks } from "../Profile/profile.services";

function Posts() {
  const { userData } = useContext(UserAuthContext);

  const [posts, setPosts] = useState<Post[]>([]);
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("feed");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPosts = useCallback(
    async (page = 1, append = false) => {
      try {
        if (!append) setIsLoading(true);
        else setIsLoadingMore(true);
        setErrorMessage(null);

        if (activeFilter === "my-posts") {
          const userId =
            userData?._id || (userData as { id?: string })?.id || "";
          const myPosts = userId
            ? await fetchUserPosts(userId, userData?.username)
            : [];
          setPosts(myPosts);
          setTotalPages(1);
          setCurrentPage(1);
          return;
        }

        if (activeFilter === "saved") {
          const savedPosts = await fetchUserBookmarks();
          setPosts(savedPosts);
          setTotalPages(1);
          setCurrentPage(1);
          return;
        }

        let data;
        if (activeFilter === "feed") {
          data = await fetchHomeFeed("all", page, 10);
        } else {
          data = await fetchAllPosts(page, 10);
        }

        const fetchedPosts = data.posts || [];
        if (append) {
          setPosts((prev) => [...prev, ...fetchedPosts]);
        } else {
          setPosts(fetchedPosts);
        }

        if (data.pagination?.numberOfPages) {
          setTotalPages(data.pagination.numberOfPages);
        }
        setCurrentPage(page);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load posts";
        setErrorMessage(msg);
        if (!append) {
          toast.error(msg);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }
    },
    [activeFilter, userData]
  );

  useEffect(() => {
    loadPosts(1, false);
  }, [loadPosts]);

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedPostId: string) => {
    setPosts((prev) =>
      prev.filter((p) => (p._id || p.id) !== deletedPostId)
    );
  };

  const handlePostShared = (sharedPost: Post) => {
    setPosts((prev) => [sharedPost, ...prev]);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadPosts(1, false);
  };

  // Directly use posts loaded for the selected filter
  const displayedPosts = posts;

  const savedCount = posts.filter((p) => p.bookmarked).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Sidebar (Feed, My Posts, Community, Saved) */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-20">
            <LeftSidebar
              activeFilter={activeFilter}
              onSelectFilter={(f) => setActiveFilter(f)}
              savedCount={savedCount}
            />
          </div>
        </div>

        {/* Center Main Feed */}
        <main className="col-span-1 lg:col-span-6 space-y-4 max-w-2xl mx-auto lg:max-w-none w-full">
          {/* Mobile Filter Tabs */}
          <div className="lg:hidden flex items-center gap-1.5 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-xs mb-3 overflow-x-auto no-scrollbar">
            {(
              [
                { id: "feed", label: "Feed" },
                { id: "my-posts", label: "My Posts" },
                { id: "community", label: "Community" },
                { id: "saved", label: "Saved" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveFilter(t.id)}
                className={`flex-1 min-w-[75px] py-1.5 text-xs font-bold rounded-xl transition-all text-center shrink-0 cursor-pointer ${
                  activeFilter === t.id
                    ? "bg-blue-50 text-blue-600 shadow-2xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Create Post Component */}
          <CreatePostCard
            currentUser={userData}
            onPostCreated={handlePostCreated}
          />

          {/* Feed Header with manual refresh */}
          <div className="flex items-center justify-between px-2 pt-1">
            <h2 className="text-sm font-bold text-gray-700 capitalize">
              {activeFilter === "feed"
                ? "Recent Posts"
                : activeFilter.replace("-", " ")}
            </h2>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <RefreshCw
                size={13}
                className={isRefreshing ? "animate-spin text-blue-600" : ""}
              />
              <span>Refresh</span>
            </button>
          </div>

          {/* Loading Skeletons */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs animate-pulse space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 bg-gray-200 rounded-md w-28" />
                      <div className="h-2.5 bg-gray-100 rounded-md w-20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded-md w-full" />
                    <div className="h-3 bg-gray-100 rounded-md w-4/5" />
                  </div>
                  <div className="h-48 bg-gray-100 rounded-xl w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!isLoading && errorMessage && (
            <div className="bg-red-50/70 border border-red-200 rounded-2xl p-4 text-center space-y-2">
              <AlertCircle size={28} className="text-red-500 mx-auto" />
              <p className="text-sm font-semibold text-red-800">
                {errorMessage}
              </p>
              <button
                onClick={() => loadPosts(1, false)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-all cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Posts List */}
          {!isLoading && !errorMessage && displayedPosts.length > 0 && (
            <div>
              {displayedPosts.map((post) => (
                <PostCard
                  key={post._id || post.id}
                  post={post}
                  currentUser={userData}
                  onPostDeleted={handlePostDeleted}
                  onPostShared={handlePostShared}
                />
              ))}

              {/* Load More Button */}
              {currentPage < totalPages && (
                <div className="pt-2 pb-6 text-center">
                  <button
                    type="button"
                    disabled={isLoadingMore}
                    onClick={() => loadPosts(currentPage + 1, true)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-blue-600 shadow-xs transition-all cursor-pointer"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-blue-600" />
                        <span>Loading more posts...</span>
                      </>
                    ) : (
                      <span>Load More Posts</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !errorMessage && displayedPosts.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center font-bold text-lg">
                ✍️
              </div>
              <h3 className="text-base font-bold text-gray-800">
                {activeFilter === "my-posts"
                  ? "You haven't posted anything yet"
                  : activeFilter === "saved"
                  ? "No saved posts yet"
                  : "No posts found"}
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {activeFilter === "my-posts"
                  ? "Share an update, photo, or thought using the box above!"
                  : activeFilter === "saved"
                  ? "Bookmark posts to view them quickly anytime."
                  : "Be the first to share something with the community!"}
              </p>
            </div>
          )}
        </main>

        {/* Right Sidebar (Suggested Friends) */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-20">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Posts;
