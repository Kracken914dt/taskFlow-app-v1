const Project = require('../models/Project');
const Board = require('../models/Board');
const Task = require('../models/Task');
const { ProjectBuilder, ProjectDirector } = require('../patterns/ProjectBuilder');

// GET /api/projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id },
      ],
      isArchived: false,
    })
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ updatedAt: -1 });

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/projects — Crea proyecto estándar con Builder
const createProject = async (req, res) => {
  try {
    const { name, description, color, icon, visibility, endDate, tags } = req.body;

    const builder = new ProjectBuilder();
    let projectData = builder
      .setName(name)
      .setDescription(description)
      .setColor(color)
      .setIcon(icon || '📋')
      .setVisibility(visibility || 'PRIVADO')
      .setCreatedBy(req.user._id)
      .setEndDate(endDate);

    if (tags && Array.isArray(tags)) {
      tags.forEach(tag => builder.addTag(tag));
    }

    projectData = builder.build();

    const { initialColumns, ...projectFields } = projectData;

    const project = await Project.create(projectFields);

    // Crear el tablero inicial con las columnas configuradas
    const columns = initialColumns.map((name, index) => ({
      name,
      order: index,
      color: '#6366F1',
    }));

    await Board.create({
      name: 'Tablero Principal',
      projectId: project._id,
      columns,
      createdBy: req.user._id,
    });

    await project.populate('createdBy', 'name email avatar');
    res.status(201).json({ project });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST /api/projects/template/:type — Crea proyecto con Director (plantilla)
const createProjectFromTemplate = async (req, res) => {
  try {
    const { type } = req.params;
    const { name, description, endDate } = req.body;

    const builder = new ProjectBuilder();
    let projectData;

    const args = { name, description, createdBy: req.user._id, endDate };

    if (type === 'scrum') {
      projectData = ProjectDirector.buildScrumProject(builder, args);
    } else if (type === 'marketing') {
      projectData = ProjectDirector.buildMarketingProject(builder, args);
    } else if (type === 'personal') {
      projectData = ProjectDirector.buildPersonalProject(builder, args);
    } else {
      return res.status(400).json({ message: `Tipo de plantilla desconocido: ${type}` });
    }

    const { initialColumns, ...projectFields } = projectData;

    const project = await Project.create(projectFields);

    const columns = initialColumns.map((name, index) => ({
      name,
      order: index,
      color: '#6366F1',
    }));

    await Board.create({
      name: 'Tablero Principal',
      projectId: project._id,
      columns,
      createdBy: req.user._id,
    });

    await project.populate('createdBy', 'name email avatar');
    res.status(201).json({ project, template: type });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/projects/:id
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar role');

    if (!project) return res.status(404).json({ message: 'Proyecto no encontrado.' });

    const boards = await Board.find({ projectId: project._id });
    const totalTasks = await Task.countDocuments({ projectId: project._id });
    const doneTasks = await Task.countDocuments({ projectId: project._id, status: 'DONE' });

    res.json({
      project,
      boards,
      stats: {
        totalTasks,
        doneTasks,
        progress: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/projects/:id
const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name email avatar');

    if (!project) return res.status(404).json({ message: 'Proyecto no encontrado.' });
    res.json({ project });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Proyecto no encontrado.' });

    await Board.deleteMany({ projectId: project._id });
    await Task.deleteMany({ projectId: project._id });
    await project.deleteOne();

    res.json({ message: 'Proyecto eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/projects/:id/members
const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate('members', 'name email avatar');

    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjects,
  createProject,
  createProjectFromTemplate,
  getProject,
  updateProject,
  deleteProject,
  addMember,
};
