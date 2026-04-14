const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del proyecto es obligatorio'],
    trim: true,
    maxlength: [120, 'El nombre no puede superar 120 caracteres'],
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'La descripción no puede superar 500 caracteres'],
  },
  color: {
    type: String,
    default: '#6366F1',
  },
  icon: {
    type: String,
    default: '📋',
  },
  status: {
    type: String,
    enum: ['ACTIVO', 'PAUSADO', 'COMPLETADO', 'ARCHIVADO'],
    default: 'ACTIVO',
  },
  visibility: {
    type: String,
    enum: ['PUBLICO', 'PRIVADO', 'EQUIPO'],
    default: 'PRIVADO',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  tags: [{ type: String }],
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  isArchived: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual: tableros del proyecto
projectSchema.virtual('boards', {
  ref: 'Board',
  localField: '_id',
  foreignField: 'projectId',
});

module.exports = mongoose.model('Project', projectSchema);
