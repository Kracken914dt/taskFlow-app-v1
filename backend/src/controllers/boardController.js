const Board = require('../models/Board');
const Task = require('../models/Task');
const { BoardPrototype } = require('../patterns/Prototype');

// GET /api/boards/project/:projectId
const getBoardsByProject = async (req, res) => {
  try {
    const boards = await Board.find({ projectId: req.params.projectId });
    res.json({ boards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/boards
const createBoard = async (req, res) => {
  try {
    const { name, description, projectId, columns } = req.body;

    const columnData = (columns || ['TODO', 'EN PROGRESO', 'HECHO']).map((col, index) => ({
      name: typeof col === 'string' ? col : col.name,
      order: index,
      color: '#6366F1',
    }));

    const board = await Board.create({
      name,
      description,
      projectId,
      columns: columnData,
      createdBy: req.user._id,
    });

    res.status(201).json({ board });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/boards/:id — Tablero con tareas agrupadas por columna
const getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('createdBy', 'name email avatar');

    if (!board) return res.status(404).json({ message: 'Tablero no encontrado.' });

    const tasks = await Task.find({ boardId: board._id })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ order: 1, createdAt: -1 });

    // Agrupar tareas por columna
    const tasksByColumn = {};
    board.columns.forEach(col => {
      tasksByColumn[col.name] = [];
    });
    tasks.forEach(task => {
      if (tasksByColumn[task.column] !== undefined) {
        tasksByColumn[task.column].push(task);
      }
    });

    res.json({ board, tasksByColumn });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/boards/:id
const updateBoard = async (req, res) => {
  try {
    const board = await Board.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!board) return res.status(404).json({ message: 'Tablero no encontrado.' });
    res.json({ board });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/boards/:id
const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Tablero no encontrado.' });

    await Task.deleteMany({ boardId: board._id });
    await board.deleteOne();

    res.json({ message: 'Tablero eliminado.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/boards/:id/clone — PROTOTYPE: Clonar tablero
const cloneBoard = async (req, res) => {
  try {
    const original = await Board.findById(req.params.id);
    if (!original) return res.status(404).json({ message: 'Tablero no encontrado.' });

    const prototype = new BoardPrototype(original);
    const clonedData = prototype.clone({
      name: req.body.name,
      projectId: req.body.projectId || original.projectId,
      createdBy: req.user._id,
    });

    const newBoard = await Board.create(clonedData);
    res.status(201).json({
      board: newBoard,
      message: `Tablero clonado exitosamente desde "${original.name}"`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/boards/:id/columns
const addColumn = async (req, res) => {
  try {
    const { name, color } = req.body;
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Tablero no encontrado.' });

    board.columns.push({ name, order: board.columns.length, color: color || '#6366F1' });
    await board.save();

    res.json({ board });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/boards/:id/columns/:columnId
const deleteColumn = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Tablero no encontrado.' });

    const col = board.columns.id(req.params.columnId);
    if (!col) return res.status(404).json({ message: 'Columna no encontrada.' });

    const tasksInCol = await Task.countDocuments({ boardId: board._id, column: col.name });
    if (tasksInCol > 0) {
      return res.status(400).json({ message: `No se puede eliminar. La columna tiene ${tasksInCol} tarea(s).` });
    }

    col.deleteOne();
    await board.save();
    res.json({ board });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getBoardsByProject,
  createBoard,
  getBoard,
  updateBoard,
  deleteBoard,
  cloneBoard,
  addColumn,
  deleteColumn,
};
