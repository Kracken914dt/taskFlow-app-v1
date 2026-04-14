/**
 * PATRÓN BUILDER — Creación Avanzada de Proyectos
 *
 * Problema: Un proyecto puede tener muchos campos opcionales:
 * descripción, color, ícono, miembros, tableros iniciales, fechas,
 * y configuraciones. Usar un constructor con tantos parámetros es
 * confuso y propenso a errores.
 *
 * Solución: Separar la construcción del objeto en pasos encadenados
 * (method chaining / API fluida). Cada método setter retorna `this`
 * para permitir el encadenamiento. El método `build()` valida y
 * retorna el objeto final.
 *
 * También se incluye un Director con configuraciones predefinidas
 * que reutiliza el Builder para construir proyectos estándar.
 */
class ProjectBuilder {
  constructor() {
    this._reset();
  }

  _reset() {
    this._project = {
      name: '',
      description: '',
      color: '#6366F1',
      icon: '📋',
      status: 'ACTIVO',
      visibility: 'PRIVADO',
      members: [],
      tags: [],
      startDate: null,
      endDate: null,
      initialColumns: ['TODO', 'EN PROGRESO', 'REVISIÓN', 'HECHO'],
      createdBy: null,
    };
    return this;
  }

  // ── Setters encadenables ─────────────────────────────────────────────────

  setName(name) {
    this._project.name = name;
    return this;
  }

  setDescription(description) {
    this._project.description = description;
    return this;
  }

  setColor(color) {
    const validColors = ['#6366F1', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];
    this._project.color = validColors.includes(color) ? color : '#6366F1';
    return this;
  }

  setIcon(icon) {
    this._project.icon = icon;
    return this;
  }

  setStatus(status) {
    const valid = ['ACTIVO', 'PAUSADO', 'COMPLETADO', 'ARCHIVADO'];
    if (!valid.includes(status)) throw new Error(`[Builder] Estado inválido: ${status}`);
    this._project.status = status;
    return this;
  }

  setVisibility(visibility) {
    const valid = ['PUBLICO', 'PRIVADO', 'EQUIPO'];
    if (!valid.includes(visibility)) throw new Error(`[Builder] Visibilidad inválida: ${visibility}`);
    this._project.visibility = visibility;
    return this;
  }

  addMember(userId) {
    if (userId && !this._project.members.includes(userId)) {
      this._project.members.push(userId);
    }
    return this;
  }

  addTag(tag) {
    if (tag && !this._project.tags.includes(tag)) {
      this._project.tags.push(tag);
    }
    return this;
  }

  setStartDate(date) {
    this._project.startDate = date ? new Date(date) : null;
    return this;
  }

  setEndDate(date) {
    this._project.endDate = date ? new Date(date) : null;
    return this;
  }

  setColumns(columns) {
    if (!Array.isArray(columns) || columns.length === 0) {
      throw new Error('[Builder] Las columnas deben ser un arreglo no vacío');
    }
    this._project.initialColumns = columns;
    return this;
  }

  setCreatedBy(userId) {
    this._project.createdBy = userId;
    return this;
  }

  /**
   * Valida y retorna el objeto final del proyecto.
   * Después de build(), el builder se resetea para poder reutilizarse.
   */
  build() {
    // Validaciones obligatorias
    if (!this._project.name || this._project.name.trim() === '') {
      throw new Error('[Builder] El nombre del proyecto es obligatorio');
    }
    if (!this._project.createdBy) {
      throw new Error('[Builder] El creador del proyecto es obligatorio');
    }
    if (this._project.startDate && this._project.endDate) {
      if (this._project.startDate > this._project.endDate) {
        throw new Error('[Builder] La fecha de inicio no puede ser mayor a la fecha fin');
      }
    }

    console.log(`🔨 [Builder] Proyecto construido: "${this._project.name}" con ${this._project.initialColumns.length} columnas`);

    const result = { ...this._project };
    this._reset(); // Permite reutilizar el builder
    return result;
  }
}

// ─── Director ───────────────────────────────────────────────────────────────
/**
 * El Director conoce el orden correcto de los pasos para
 * construir configuraciones de proyecto predefinidas.
 * No es obligatorio, pero simplifica la creación de proyectos comunes.
 */
class ProjectDirector {
  /**
   * Proyecto de desarrollo de software estándar con columnas Scrum
   */
  static buildScrumProject(builder, { name, description, createdBy, endDate } = {}) {
    console.log('🎯 [Builder Director] Construyendo proyecto Scrum estándar...');
    return builder
      .setName(name)
      .setDescription(description || 'Proyecto de desarrollo ágil con metodología Scrum')
      .setColor('#6366F1')
      .setIcon('🚀')
      .setStatus('ACTIVO')
      .setVisibility('EQUIPO')
      .setColumns(['BACKLOG', 'EN PROGRESO', 'EN REVISIÓN', 'TESTING', 'HECHO'])
      .addTag('scrum')
      .addTag('agile')
      .setCreatedBy(createdBy)
      .setEndDate(endDate)
      .build();
  }

  /**
   * Proyecto de marketing simple con columnas básicas
   */
  static buildMarketingProject(builder, { name, description, createdBy } = {}) {
    console.log('🎯 [Builder Director] Construyendo proyecto Marketing...');
    return builder
      .setName(name)
      .setDescription(description || 'Gestión de campañas y contenido de marketing')
      .setColor('#EC4899')
      .setIcon('📣')
      .setStatus('ACTIVO')
      .setVisibility('EQUIPO')
      .setColumns(['IDEAS', 'EN DISEÑO', 'EN REVISIÓN', 'PUBLICADO'])
      .addTag('marketing')
      .addTag('contenido')
      .setCreatedBy(createdBy)
      .build();
  }

  /**
   * Proyecto personal simple
   */
  static buildPersonalProject(builder, { name, description, createdBy } = {}) {
    console.log('🎯 [Builder Director] Construyendo proyecto Personal...');
    return builder
      .setName(name)
      .setDescription(description || 'Proyecto personal')
      .setColor('#10B981')
      .setIcon('⭐')
      .setStatus('ACTIVO')
      .setVisibility('PRIVADO')
      .setColumns(['POR HACER', 'HACIENDO', 'HECHO'])
      .setCreatedBy(createdBy)
      .build();
  }
}

module.exports = { ProjectBuilder, ProjectDirector };
