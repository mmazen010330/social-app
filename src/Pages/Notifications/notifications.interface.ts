export interface NotificationActor {
  _id: string;
  name: string;
  username?: string;
  photo?: string;
}

export interface NotificationEntity {
  _id?: string;
  name?: string;
  username?: string;
  photo?: string;
  body?: string;
  content?: string;
  [key: string]: unknown;
}

export interface NotificationItem {
  _id: string;
  recipient?: NotificationActor;
  actor: NotificationActor;
  type: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
  entity?: NotificationEntity;
}

export interface NotificationsApiResponse {
  success: boolean;
  message: string;
  data: {
    notifications: NotificationItem[];
  };
  meta?: {
    pagination?: {
      currentPage: number;
      limit: number;
      total: number;
      numberOfPages: number;
    };
  };
}

export interface UnreadCountApiResponse {
  success: boolean;
  message: string;
  data: {
    unreadCount: number;
  };
}
