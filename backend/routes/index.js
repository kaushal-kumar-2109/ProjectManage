const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const projectController = require('../controllers/projectController');
const taskController = require('../controllers/taskController');
const messageController = require('../controllers/messageController');
const { auth } = require('../middleware/auth');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
    body('email').isEmail(),
    body('password').isLength({ min: 6 })
], authController.register);

router.post('/verify-otp', authController.verifyOtp);

router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);

// Projects
router.post('/projects', auth, projectController.createProject);
router.get('/projects', auth, projectController.getProjects);
router.post('/projects/:id/members', auth, projectController.addMember);

// Tasks
router.post('/tasks', auth, taskController.createTask);
router.get('/tasks/:projectId', auth, taskController.getTasks);
router.get('/task/:id', auth, taskController.getTask);
router.put('/tasks/:id', auth, taskController.updateTask);

// Messages & Invites
router.get('/messages/unread-count', auth, messageController.getUnreadCount);
router.post('/messages/invites', auth, messageController.createInviteMessage);
router.get('/messages', auth, messageController.getMessages);
router.post('/messages/:id', auth, messageController.handleMessageAction);

module.exports = router;