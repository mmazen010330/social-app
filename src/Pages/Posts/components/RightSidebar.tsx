import React, { useState, useEffect } from "react";
import { Users, Search, UserPlus, Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import type { SuggestedFriend } from "../posts.interface";
import { fetchSuggestedFriends } from "../posts.services";

export const RightSidebar: React.FC = () => {
  const [friends, setFriends] = useState<SuggestedFriend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadSuggestions(1);
  }, []);

  const loadSuggestions = async (pageNum: number) => {
    try {
      setIsLoading(true);
      const data = await fetchSuggestedFriends(pageNum, 5);
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setFriends((prev) => (pageNum === 1 ? data : [...prev, ...data]));
      }
    } catch {
      // quiet fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFollow = (friendId: string, friendName: string) => {
    const isNowFollowing = !followingMap[friendId];
    setFollowingMap((prev) => ({
      ...prev,
      [friendId]: isNowFollowing,
    }));

    if (isNowFollowing) {
      toast.success(`You are now following ${friendName}`);
    } else {
      toast.success(`Unfollowed ${friendName}`);
    }
  };

  const filteredFriends = friends.filter(
    (f) =>
      f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-full">
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            <h3 className="text-sm font-bold text-gray-900">
              Suggested Friends
            </h3>
          </div>
          <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center">
            {friends.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200/80 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
          />
        </div>

        {/* Friends List */}
        <div className="space-y-3">
          {isLoading && friends.length === 0 ? (
            <div className="py-6 flex flex-col items-center justify-center gap-2 text-xs text-gray-400">
              <Loader2 size={18} className="animate-spin text-blue-500" />
              <span>Finding suggestions...</span>
            </div>
          ) : (
            filteredFriends.map((friend) => {
              const isFollowing = followingMap[friend._id];
              return (
                <div
                  key={friend._id}
                  className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={
                        friend.photo ||
                        "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png"
                      }
                      alt={friend.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";
                      }}
                      className="w-9 h-9 rounded-full object-cover border border-gray-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate leading-tight">
                        {friend.name}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">
                        @{friend.username}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                        <span>{friend.followersCount ?? 0} followers</span>
                        <span>·</span>
                        <span>
                          {friend.mutualFollowersCount ?? 1} mutual
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleFollow(friend._id, friend.name)}
                    className={`shrink-0 flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isFollowing
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "border border-blue-200 bg-blue-50/50 text-blue-600 hover:bg-blue-600 hover:text-white"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <Check size={12} />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={12} />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}

          {!isLoading && filteredFriends.length === 0 && (
            <p className="text-center text-xs text-gray-400 py-3">
              No matching suggestions
            </p>
          )}
        </div>

        {/* View More Button */}
        {hasMore && (
          <button
            type="button"
            onClick={() => {
              const next = page + 1;
              setPage(next);
              loadSuggestions(next);
            }}
            className="w-full mt-3 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 rounded-xl transition-all cursor-pointer"
          >
            View more
          </button>
        )}
      </div>
    </aside>
  );
};
