import axios from "axios";
import type {
  NotificationsApiResponse,
  UnreadCountApiResponse,
  NotificationItem,
} from "./notifications.interface";

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

export async function fetchNotifications(
  unreadOnly = false,
  page = 1,
  limit = 50
): Promise<{
  notifications: NotificationItem[];
  pagination?: {
    currentPage: number;
    limit: number;
    total: number;
    numberOfPages: number;
  };
}> {
  try {
    const params: Record<string, string | number> = {
      page,
      limit,
    };
    // Crucial: Only attach unread param if true. The backend excludes notifications if unread=false is sent.
    if (unreadOnly) {
      params.unread = "true";
    }

    const res = await axios.get<NotificationsApiResponse>(
      `${getBaseUrl()}/notifications`,
      {
        headers: getHeaders(),
        params,
      }
    );

    const notifications = res.data?.data?.notifications || [];
    const pagination = res.data?.meta?.pagination;
    return { notifications, pagination };
  } catch {
    return { notifications: [] };
  }
}

export async function fetchUnreadCount(): Promise<number> {
  try {
    const res = await axios.get<UnreadCountApiResponse>(
      `${getBaseUrl()}/notifications/unread-count`,
      {
        headers: getHeaders(),
      }
    );
    return res.data?.data?.unreadCount ?? 0;
  } catch {
    return 0;
  }
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<boolean> {
  try {
    await axios.patch(
      `${getBaseUrl()}/notifications/${notificationId}/read`,
      {},
      { headers: getHeaders() }
    );
    return true;
  } catch (err) {
    if (axios.isAxiosError<{ message: string }>(err)) {
      throw new Error(err.response?.data?.message || "Failed to mark as read");
    }
    throw new Error("Failed to mark notification as read");
  }
}

export async function markAllNotificationsAsRead(): Promise<boolean> {
  try {
    await axios.patch(
      `${getBaseUrl()}/notifications/read-all`,
      {},
      { headers: getHeaders() }
    );
    return true;
  } catch (err) {
    if (axios.isAxiosError<{ message: string }>(err)) {
      throw new Error(
        err.response?.data?.message || "Failed to mark all as read"
      );
    }
    throw new Error("Failed to mark all notifications as read");
  }
}
