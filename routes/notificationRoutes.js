// routes/notificationRoutes.js
const express = require('express');
const {
  sendTestSMS,
  getNotificationSettings,
  updateNotificationSettings,
  getNotifications,
  markNotificationsRead
} = require('../controllers/notificationController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// SMS routes
router.post('/test-sms', sendTestSMS);

// Notification settings routes
router.get('/settings', getNotificationSettings);
router.put('/settings', updateNotificationSettings);

// Notification management routes
router.get('/', getNotifications);
router.post('/read', markNotificationsRead);

module.exports = router;