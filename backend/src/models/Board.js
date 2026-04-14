const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  order: { type: Number, default: 0 },
  color: { type: String, default: '#6366F1' },
  wipLimit: { type: Number, default: 0 }, // 0 = sin límite
}, { _id: true });

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del tablero es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede superar 100 caracteres'],
  },
  description: {
    type: String,
    default: '',
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  columns: [columnSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isTemplate: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual: tareas del tablero
boardSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'boardId',
});

module.exports = mongoose.model('Board', boardSchema);
