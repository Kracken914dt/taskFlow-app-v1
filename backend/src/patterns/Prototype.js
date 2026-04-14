/**
 * PATRÓN PROTOTYPE — Clonación de Tableros
 *
 * Problema: Crear un nuevo tablero con la misma estructura de columnas
 * que uno existente implica copiar manualmente todos los campos.
 * Si la estructura cambia, hay que actualizar múltiples lugares.
 *
 * Solución: Cada objeto "clonable" implementa un método clone()
 * que sabe cómo copiarse a sí mismo, generando nuevos IDs y
 * ajustando los campos necesarios (como el nombre y fechas).
 *
 * Estructura:
 *   Cloneable (interfaz abstracta)
 *       ├── BoardPrototype   → Clona un tablero con sus columnas (sin tareas)
 *       └── TaskPrototype    → Clona una tarea con sus subtareas (sin comentarios)
 */

// ─── Interfaz abstracta ───────────────────────────────────────────────────────
class Cloneable {
  clone() {
    throw new Error(`[Prototype] clone() debe ser implementado por ${this.constructor.name}`);
  }
}

// ─── Prototype concreto: Tablero ─────────────────────────────────────────────
class BoardPrototype extends Cloneable {
  /**
   * @param {Object} boardData - Datos del tablero original (del modelo Mongoose)
   */
  constructor(boardData) {
    super();
    this._data = boardData;
  }

  /**
   * Crea una copia profunda del tablero.
   * - Genera nuevas columnas con el mismo nombre pero sin tareas
   * - El nuevo tablero pertenece al mismo proyecto por defecto
   * - Las fechas se actualizan al momento del clonado
   */
  clone(overrides = {}) {
    console.log(`📋 [Prototype] Clonando tablero: "${this._data.name}"`);

    const clonedColumns = this._data.columns.map(col => ({
      name: col.name,
      order: col.order,
      color: col.color || '#6366F1',
      wipLimit: col.wipLimit || 0,
    }));

    const cloned = {
      name: overrides.name || `Copia de ${this._data.name}`,
      description: overrides.description || this._data.description || '',
      projectId: overrides.projectId || this._data.projectId,
      columns: clonedColumns,
      createdBy: overrides.createdBy || this._data.createdBy,
      createdAt: new Date(),
      isTemplate: false,
    };

    console.log(`✅ [Prototype] Tablero clonado con ${clonedColumns.length} columnas (sin tareas)`);
    return cloned;
  }
}

// ─── Prototype concreto: Tarea ────────────────────────────────────────────────
class TaskPrototype extends Cloneable {
  /**
   * @param {Object} taskData - Datos de la tarea original
   */
  constructor(taskData) {
    super();
    this._data = taskData;
  }

  /**
   * Crea una copia de la tarea.
   * - Copia título, descripción, tipo, prioridad, etiquetas y subtareas
   * - Resetea el estado a TODO y elimina asignaciones y comentarios
   * - Las subtareas se copian como no completadas
   */
  clone(overrides = {}) {
    console.log(`📌 [Prototype] Clonando tarea: "${this._data.title}"`);

    const clonedSubtasks = (this._data.subtasks || []).map(st => ({
      title: st.title,
      completed: false, // Siempre se resetea
    }));

    const cloned = {
      title: overrides.title || `Copia de ${this._data.title}`,
      description: this._data.description || '',
      type: this._data.type,
      priority: this._data.priority,
      status: 'TODO', // Siempre empieza en TODO
      boardId: overrides.boardId || this._data.boardId,
      projectId: overrides.projectId || this._data.projectId,
      column: overrides.column || 'TODO',
      labels: [...(this._data.labels || [])],
      subtasks: clonedSubtasks,
      estimatedHours: this._data.estimatedHours || 0,
      assignedTo: null, // No se copian asignaciones
      dueDate: null,    // No se copia fecha de vencimiento
      createdBy: overrides.createdBy || this._data.createdBy,
      comments: [],     // No se copian comentarios
      createdAt: new Date(),
    };

    console.log(`✅ [Prototype] Tarea clonada con ${clonedSubtasks.length} subtareas`);
    return cloned;
  }
}

module.exports = { BoardPrototype, TaskPrototype };
