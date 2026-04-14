const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
}, { _id: true });

const labelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#6366F1' },
}, { _id: false });

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título de la tarea es obligatorio'],
    trim: true,
    maxlength: [200, 'El título no puede superar 200 caracteres'],
  },
  description: {
    type: String,
    default: '',
    maxlength: [2000, 'La descripción no puede superar 2000 caracteres'],
  },
  type: {
    type: String,
    enum: ['BUG', 'FEATURE', 'STORY', 'TASK'],
    default: 'TASK',
  },
  priority: {
    type: String,
    enum: ['URGENTE', 'ALTA', 'MEDIA', 'BAJA'],
    default: 'MEDIA',
  },
  status: {
    type: String,
    default: 'TODO',
  },
  column: {
    type: String,
    default: 'TODO',
  },
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  labels: [labelSchema],
  subtasks: [subtaskSchema],
  comments: [commentSchema],
  estimatedHours: { type: Number, default: 0 },
  loggedHours: { type: Number, default: 0 },
  dueDate: { type: Date, default: null },
  order: { type: Number, default: 0 },
}, {
  timestamps: true,
});

// Virtual: progreso de subtareas
taskSchema.virtual('subtaskProgress').get(function () {
  if (!this.subtasks.length) return 0;
  const done = this.subtasks.filter(s => s.completed).length;
  return Math.round((done / this.subtasks.length) * 100);
});

module.exports = mongoose.model('Task', taskSchema);
