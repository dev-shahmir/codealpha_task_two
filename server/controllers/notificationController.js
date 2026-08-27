import Notification from '../models/Notification.js';
import { ok, fail } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('sender', 'name username avatar')
    .sort({ createdAt: -1 })
    .limit(100);

  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });

  return ok(res, { notifications, unreadCount });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
  if (!notification) return fail(res, 'Notification not found', 'NOTIFICATION_NOT_FOUND', 404);

  notification.read = true;
  await notification.save();

  return ok(res, { notification }, 'Marked as read');
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
  return ok(res, null, 'All notifications marked as read');
});
