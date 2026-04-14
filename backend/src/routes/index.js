const express = require('express');
const { protect } = require('../middleware/auth');
const authCtrl = require('../controllers/authController');
const projectCtrl = require('../controllers/projectController');
const boardCtrl = require('../controllers/boardController');
const taskCtrl = require('../controllers/taskController');

const router = express.Router();

// ── Auth ─────────────────────────────────────────────────────────────────────
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', protect, authCtrl.getMe);
router.put('/auth/profile', protect, authCtrl.updateProfile);
router.get('/auth/users', protect, authCtrl.getUsers);

// ── Proyectos ─────────────────────────────────────────────────────────────────
router.get('/projects', protect, projectCtrl.getProjects);
router.post('/projects', protect, projectCtrl.createProject);
router.post('/projects/template/:type', protect, projectCtrl.createProjectFromTemplate); // Builder + Director
router.get('/projects/:id', protect, projectCtrl.getProject);
router.put('/projects/:id', protect, projectCtrl.updateProject);
router.delete('/projects/:id', protect, projectCtrl.deleteProject);
router.post('/projects/:id/members', protect, projectCtrl.addMember);

// ── Tableros ──────────────────────────────────────────────────────────────────
router.get('/boards/project/:projectId', protect, boardCtrl.getBoardsByProject);
router.post('/boards', protect, boardCtrl.createBoard);
router.get('/boards/:id', protect, boardCtrl.getBoard);
router.put('/boards/:id', protect, boardCtrl.updateBoard);
router.delete('/boards/:id', protect, boardCtrl.deleteBoard);
router.post('/boards/:id/clone', protect, boardCtrl.cloneBoard);   // Prototype
router.post('/boards/:id/columns', protect, boardCtrl.addColumn);
router.delete('/boards/:id/columns/:columnId', protect, boardCtrl.deleteColumn);

// ── Tareas ────────────────────────────────────────────────────────────────────
router.post('/tasks', protect, taskCtrl.createTask);                // Factory Method
router.get('/tasks/board/:boardId', protect, taskCtrl.getTasksByBoard);
router.get('/tasks/:id', protect, taskCtrl.getTask);
router.put('/tasks/:id', protect, taskCtrl.updateTask);
router.put('/tasks/:id/move', protect, taskCtrl.moveTask);
router.delete('/tasks/:id', protect, taskCtrl.deleteTask);
router.post('/tasks/:id/clone', protect, taskCtrl.cloneTask);       // Prototype
router.post('/tasks/:id/subtasks', protect, taskCtrl.addSubtask);
router.put('/tasks/:id/subtasks/:subtaskId', protect, taskCtrl.toggleSubtask);
router.post('/tasks/:id/comments', protect, taskCtrl.addComment);

module.exports = router;
