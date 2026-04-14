/**
 * PATRÓN FACTORY METHOD — Creación de Tareas por Tipo
 *
 * Problema: Crear tareas de diferentes tipos (BUG, FEATURE, STORY, TASK)
 * implica lógica distinta para cada uno: prioridades por defecto,
 * etiquetas, colores y campos obligatorios varían entre tipos.
 *
 * Solución: Definir una interfaz común (TaskCreator) con un método
 * abstracto createTask(). Cada subclase concreta implementa la
 * creación específica de su tipo de tarea.
 *
 * Estructura:
 *   TaskCreator (abstracta)
 *       ├── BugTaskCreator      → type: BUG,     prioridad ALTA
 *       ├── FeatureTaskCreator  → type: FEATURE,  prioridad MEDIA
 *       ├── StoryTaskCreator    → type: STORY,    prioridad MEDIA
 *       └── GeneralTaskCreator  → type: TASK,     prioridad BAJA
 */

// ─── Clase base abstracta ───────────────────────────────────────────────────
class TaskCreator {
  /**
   * Factory Method — debe ser implementado por cada subclase.
   * Define los valores por defecto específicos de cada tipo.
   */
  createTask(data) {
    throw new Error(`[Factory Method] createTask() debe ser implementado por ${this.constructor.name}`);
  }

  /**
   * Template Method — orquesta el proceso de creación.
   * Llama al factory method y luego aplica validaciones comunes.
   */
  create(data) {
    console.log(`🏭 [Factory Method] Usando ${this.constructor.name} para crear tarea tipo: ${this.getType()}`);
    const taskData = this.createTask(data);
    this._validate(taskData);
    return taskData;
  }

  getType() {
    throw new Error('getType() debe ser implementado por la subclase');
  }

  _validate(taskData) {
    if (!taskData.title || taskData.title.trim() === '') {
      throw new Error('[Factory Method] El título de la tarea es obligatorio');
    }
    if (!taskData.boardId) {
      throw new Error('[Factory Method] El boardId es obligatorio');
    }
  }
}

// ─── Creadores concretos ─────────────────────────────────────────────────────
class BugTaskCreator extends TaskCreator {
  getType() { return 'BUG'; }

  createTask(data) {
    return {
      title: data.title,
      description: data.description || '',
      type: 'BUG',
      priority: data.priority || 'ALTA',
      status: data.status || 'TODO',
      boardId: data.boardId,
      projectId: data.projectId,
      assignedTo: data.assignedTo || null,
      dueDate: data.dueDate || null,
      labels: [
        { name: 'Bug', color: '#EF4444' },
        ...(data.labels || [])
      ],
      subtasks: data.subtasks || [],
      estimatedHours: data.estimatedHours || 0,
      createdBy: data.createdBy,
      column: data.column || 'TODO',
    };
  }
}

class FeatureTaskCreator extends TaskCreator {
  getType() { return 'FEATURE'; }

  createTask(data) {
    return {
      title: data.title,
      description: data.description || '',
      type: 'FEATURE',
      priority: data.priority || 'MEDIA',
      status: data.status || 'TODO',
      boardId: data.boardId,
      projectId: data.projectId,
      assignedTo: data.assignedTo || null,
      dueDate: data.dueDate || null,
      labels: [
        { name: 'Feature', color: '#8B5CF6' },
        ...(data.labels || [])
      ],
      subtasks: data.subtasks || [],
      estimatedHours: data.estimatedHours || 0,
      createdBy: data.createdBy,
      column: data.column || 'TODO',
    };
  }
}

class StoryTaskCreator extends TaskCreator {
  getType() { return 'STORY'; }

  createTask(data) {
    return {
      title: data.title,
      description: data.description || '',
      type: 'STORY',
      priority: data.priority || 'MEDIA',
      status: data.status || 'TODO',
      boardId: data.boardId,
      projectId: data.projectId,
      assignedTo: data.assignedTo || null,
      dueDate: data.dueDate || null,
      labels: [
        { name: 'Historia', color: '#F59E0B' },
        ...(data.labels || [])
      ],
      subtasks: data.subtasks || [],
      estimatedHours: data.estimatedHours || 8,
      createdBy: data.createdBy,
      column: data.column || 'TODO',
    };
  }
}

class GeneralTaskCreator extends TaskCreator {
  getType() { return 'TASK'; }

  createTask(data) {
    return {
      title: data.title,
      description: data.description || '',
      type: 'TASK',
      priority: data.priority || 'BAJA',
      status: data.status || 'TODO',
      boardId: data.boardId,
      projectId: data.projectId,
      assignedTo: data.assignedTo || null,
      dueDate: data.dueDate || null,
      labels: [
        { name: 'Tarea', color: '#3B82F6' },
        ...(data.labels || [])
      ],
      subtasks: data.subtasks || [],
      estimatedHours: data.estimatedHours || 0,
      createdBy: data.createdBy,
      column: data.column || 'TODO',
    };
  }
}

// ─── Registro de creators y función de acceso ─────────────────────────────────
const creators = {
  BUG: BugTaskCreator,
  FEATURE: FeatureTaskCreator,
  STORY: StoryTaskCreator,
  TASK: GeneralTaskCreator,
};

/**
 * Retorna el creator correspondiente al tipo solicitado.
 * Si el tipo no existe, usa GeneralTaskCreator por defecto.
 */
function getTaskCreator(type) {
  const CreatorClass = creators[type?.toUpperCase()] || GeneralTaskCreator;
  return new CreatorClass();
}

const TASK_TYPES = Object.keys(creators);
const TASK_TYPE_META = {
  BUG:     { label: 'Bug',         color: '#EF4444', icon: '🐛' },
  FEATURE: { label: 'Feature',     color: '#8B5CF6', icon: '✨' },
  STORY:   { label: 'Historia',    color: '#F59E0B', icon: '📖' },
  TASK:    { label: 'Tarea',       color: '#3B82F6', icon: '📌' },
};

module.exports = { getTaskCreator, TASK_TYPES, TASK_TYPE_META };
