// authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Handle OPTIONS requests for CORS preflight
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/child-login', authController.childLogin);
router.post('/create-child', authenticateToken, authController.createChildAccount);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/verify-token', authenticateToken, (req, res) => {
  res.status(200).json({ valid: true, user: req.user });
});

module.exports = router;