import { useEffect, useState, useCallback } from "react";
import {
  Check,
  CheckCheck,
  UserPlus,
  MessageSquare,
  ThumbsUp,
  Share2,
  Bell,
  Loader2,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "./notifications.services";
import type { NotificationItem } from "./notifications.interface";
import { formatTimeAgo } from "../Posts/utils/timeAgo";

function getNotificationText(notif: NotificationItem) {
  const actorName = notif.actor?.name || "Someone";
  const type = notif.type?.toLowerCase() || "";
  if (type.includes("follow")) {
    return `${actorName} followed you`;
  }
  if (type.includes("comment")) {
    return `${actorName} commented on your post`;
  }
  if (type.includes("like")) {
    return `${actorName} liked your post`;
  }
  if (type.includes("share")) {
    return `${actorName} shared your post`;
  }
  return `${actorName} interacted with your profile`;
}

function getNotificationSubline(notif: NotificationItem) {
  if (notif.entity && typeof notif.entity === "object") {
    if (typeof notif.entity.content === "string" && notif.entity.content.trim()) {
      return notif.entity.content;
    }
    if (typeof notif.entity.body === "string" && notif.entity.body.trim()) {
      return notif.entity.body;
    }
  }
  return notif.actor?.name || notif.actor?.username || "";
}

function getNotificationIcon(type: string) {
  const t = type?.toLowerCase() || "";
  if (t.includes("follow")) {
    return <UserPlus size={14} className="text-purple-600" />;
  }
  if (t.includes("comment")) {
    return <MessageSquare size={14} className="text-blue-500" />;
  }
  if (t.includes("like")) {
    return <ThumbsUp size={14} className="text-blue-600" />;
  }
  if (t.includes("share")) {
    return <Share2 size={14} className="text-emerald-500" />;
  }
  return <Bell size={14} className="text-gray-500" />;
}

function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [markingIds, setMarkingIds] = useState<Record<string, boolean>>({});

  const loadNotificationsData = useCallback(
    async (page = 1, append = false, currentFilter = filter) => {
      try {
        if (!append) setIsLoading(true);
        else setIsLoadingMore(true);

        const unreadOnly = currentFilter === "unread";
        const [data, count] = await Promise.all([
          fetchNotifications(unreadOnly, page, 50),
          fetchUnreadCount(),
        ]);

        const fetched = data.notifications || [];
        if (append) {
          setNotifications((prev) => [...prev, ...fetched]);
        } else {
          setNotifications(fetched);
        }

        setUnreadCount(count);
        if (data.pagination?.numberOfPages) {
          setTotalPages(data.pagination.numberOfPages);
        }
        setCurrentPage(page);
      } catch {
        toast.error("Failed to load notifications");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    loadNotificationsData(1, false, filter);
  }, [filter, loadNotificationsData]);

  const handleMarkAsRead = async (id: string) => {
    try {
      setMarkingIds((prev) => ({ ...prev, [id]: true }));
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success("Notification marked as read");
    } catch {
      toast.error("Failed to update notification");
    } finally {
      setMarkingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingAll(true);
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-6">
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-7">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Notifications
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Realtime updates for likes, comments, shares, and follows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadNotificationsData(1, false, filter)}
              disabled={isLoading}
              className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw
                size={14}
                className={isLoading ? "animate-spin text-blue-600" : ""}
              />
            </button>

            <button
              type="button"
              disabled={isMarkingAll || unreadCount === 0}
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isMarkingAll ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <CheckCheck size={14} />
              )}
              <span>Mark all as read</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 my-5">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filter === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filter === "unread"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span
                className={`w-4 h-4 rounded-full text-[10px] font-extrabold flex items-center justify-center ${
                  filter === "unread"
                    ? "bg-white text-blue-600"
                    : "bg-blue-600 text-white"
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-gray-400">
            <Loader2 size={24} className="animate-spin text-blue-600" />
            <span>Loading notifications...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && notifications.length === 0 && (
          <div className="py-16 text-center space-y-2">
            <Bell size={36} className="text-gray-300 mx-auto" />
            <h3 className="text-sm font-bold text-gray-700">
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </h3>
            <p className="text-xs text-gray-400">
              When friends like, comment, or follow you, updates will appear here.
            </p>
          </div>
        )}

        {/* Notifications List */}
        {!isLoading && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const isUnread = !notif.isRead;
              const isMarking = markingIds[notif._id];
              const actorPhoto =
                notif.actor?.photo ||
                "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";

              const subline = getNotificationSubline(notif);

              return (
                <div
                  key={notif._id}
                  className={`flex items-start justify-between gap-3 p-4 rounded-2xl border transition-all ${
                    isUnread
                      ? "bg-blue-50/50 border-blue-200/70 shadow-2xs"
                      : "bg-white border-gray-200/80 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={actorPhoto}
                      alt={notif.actor?.name || "User"}
                      className="w-11 h-11 rounded-full object-cover border border-gray-200 shrink-0 mt-0.5"
                    />

                    <div className="min-w-0 space-y-1">
                      <p className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                        {getNotificationText(notif)}
                      </p>

                      {subline && (
                        <p className="text-xs text-gray-500 truncate">
                          {subline}
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white border border-gray-200">
                          {getNotificationIcon(notif.type)}
                        </span>

                        {isUnread ? (
                          <button
                            type="button"
                            disabled={isMarking}
                            onClick={() => handleMarkAsRead(notif._id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-[11px] font-semibold text-gray-700 transition-colors cursor-pointer shadow-2xs"
                          >
                            {isMarking ? (
                              <Loader2 size={11} className="animate-spin" />
                            ) : (
                              <Check size={12} className="text-gray-600" />
                            )}
                            <span>Mark as read</span>
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                            <Check size={12} />
                            <span>Read</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-1 text-xs text-gray-400">
                    <span>{formatTimeAgo(notif.createdAt)}</span>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Load More Button */}
            {currentPage < totalPages && (
              <div className="pt-3 pb-2 text-center">
                <button
                  type="button"
                  disabled={isLoadingMore}
                  onClick={() =>
                    loadNotificationsData(currentPage + 1, true, filter)
                  }
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Loading more...</span>
                    </>
                  ) : (
                    <span>Load more notifications</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
