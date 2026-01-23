import DeliveryNotification from "../modules/delivery/deliveryNotification.js";
import dayjs from "dayjs";

// Simple in-memory rate limiter
const notifCache = new Map();
// Format: notifCache.set(deliveryPersonId, { lastMessage, lastTime })

const RATE_LIMIT_MS = 5000; // 5 seconds

const pushDeliveryNotification = async ({
  deliveryPersonId,
  storeId,
  orderId,
  type,
  title,
  message,
  expiresInHours = 72,
}) => {
  try {
    if (!deliveryPersonId || !type || !title || !message) {
      console.warn("Missing required notification fields");
      return;
    }

    // rate limiting + preventing duplicates
    const now = Date.now();
    const cache = notifCache.get(deliveryPersonId);

    if (cache) {
      const sameMessage = cache.lastMessage === message;
      const tooSoon = now - cache.lastTime < RATE_LIMIT_MS;

      if (sameMessage && tooSoon) {
        console.log(`Notification suppressed (dupe): DP ${deliveryPersonId}`);
        return;
      }
    }

    notifCache.set(deliveryPersonId, { lastMessage: message, lastTime: now });

    // notification expiry logic
    const expiresAt = dayjs().add(expiresInHours, "hours").toDate();

    // save to db
    const notification = await DeliveryNotification.create({
      deliveryPersonId,
      storeId,
      orderId,
      type,
      title,
      message,
      expiresAt,
    });

    // get updated unread count
    const unreadCount = await DeliveryNotification.countDocuments({
      deliveryPersonId,
      isRead: false,
    });

    // Real time notification push
    if (global.io) {
      const roomId = `dp_${deliveryPersonId}`;
      const room = global.io.sockets.adapter.rooms.get(roomId);

      if (room && room.size > 0) {
        // Send notification + badge update
        global.io.to(roomId).emit("notification", notification);
        global.io.to(roomId).emit("notificationBadgeUpdate", { unreadCount });
        console.log(`Real-time notif + badge sent → ${roomId}`);
      } else {
        console.log(`DP ${deliveryPersonId} offline — saved to DB`);
      }
    }

    return notification;
  } catch (err) {
    console.error("Notification Error:", err.message);
  }
};

export default pushDeliveryNotification;
