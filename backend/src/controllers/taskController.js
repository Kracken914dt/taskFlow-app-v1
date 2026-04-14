const Task = require('../models/Task');
const Board = require('../models/Board');
const { getTaskCreator } = require('../patterns/TaskFactory');
const { TaskPrototype } = require('../patterns/Prototype');

// POST /api/tasks — FACTORY METHOD: Crear tarea según tipo
const createTask = async (req, res) => {
  try {
    const { type, ...rest } = req.body;

    // Obtener el creator correspondiente al tipo
    const creator = getTaskCreator(type);
    const taskData = creator.create({ ...rest, createdBy: req.user._id });

    // Verificar que el boardId existe y obtener el projectId si no viene
    const board = await Board.findById(taskData.boardId);
    if (!board) return res.status(404).json({ message: 'Tablero no encontrado.' });

    if (!taskData.projectId) {
      taskData.projectId = board.projectId;
    }

    // Asignar la columna al primer slot de la columna destino si no viene
    if (!taskData.column || !board.columns.some(c => c.name === taskData.column)) {
      taskData.column = board.columns[0]?.name || 'TODO';
    }

    const task = await Task.create(taskData);
    await task.populate('createdBy', 'name email avatar');

    res.status(201).json({
      task,
      pattern: 'Factory Method',
      creatorUsed: creator.constructor.name,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/tasks/board/:boardId
const getTasksByBoard = async (req, res) => {
  try {
    const { priority, type, search } = req.query;
    const filter = { boardId: req.params.boardId };

    if (priority) filter.priority = priority;
    if (type) filter.type = type;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ order: 1, createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/tasks/:id
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('comments.author', 'name email avatar');

    if (!task) return res.status(404).json({ message: 'Tarea no encontrada.' });
    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!task) return res.status(404).json({ message: 'Tarea no encontrada.' });
    res.json({ task });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/tasks/:id/move — Mover entre columnas
const moveTask = async (req, res) => {
  try {
    const { column } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { column, status: column },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada.' });
    res.json({ task });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada.' });
    res.json({ message: 'Tarea eliminada.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/tasks/:id/clone — PROTOTYPE: Clonar tarea
const cloneTask = async (req, res) => {
  try {
    const original = await Task.findById(req.params.id);
    if (!original) return res.status(404).json({ message: 'Tarea no encontrada.' });

    const prototype = new TaskPrototype(original);
    const clonedData = prototype.clone({
      title: req.body.title,
      boardId: req.body.boardId || original.boardId,
      projectId: req.body.projectId || original.projectId,
      createdBy: req.user._id,
    });

    const newTask = await Task.create(clonedData);
    await newTask.populate('createdBy', 'name email avatar');

    res.status(201).json({
      task: newTask,
      pattern: 'Prototype',
      message: `Tarea clonada desde "${original.title}"`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/tasks/:id/subtasks
const addSubtask = async (req, res) => {
  try {
    const { title } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $push: { subtasks: { title, completed: false } } },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada.' });
    res.json({ task });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/tasks/:id/subtasks/:subtaskId
const toggleSubtask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada.' });

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) return res.status(404).json({ message: 'Subtarea no encontrada.' });

    subtask.completed = !subtask.completed;
    subtask.completedAt = subtask.completed ? new Date() : null;
    await task.save();

    res.json({ task });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST /api/tasks/:id/comments
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { text, author: req.user._id } } },
      { new: true }
    ).populate('comments.author', 'name email avatar');

    if (!task) return res.status(404).json({ message: 'Tarea no encontrada.' });
    res.json({ task });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasksByBoard,
  getTask,
  updateTask,
  moveTask,
  deleteTask,
  cloneTask,
  addSubtask,
  toggleSubtask,
  addComment,
};
