import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api.js'
import NewProjectModal from '../projects/NewProjectModal.jsx'
import EditProjectModal from '../projects/EditProjectModal.jsx'

const STATUS_COLOR = { ACTIVO:'var(--success)', PAUSADO:'var(--warning)', COMPLETADO:'var(--info)', ARCHIVADO:'var(--text-muted)' }
const STATUS_BG    = { ACTIVO:'var(--success-light)', PAUSADO:'var(--warning-light)', COMPLETADO:'var(--info-light)', ARCHIVADO:'var(--bg-tertiary)' }

const ICON_MAP = {
  board:  'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  rocket: 'M4.5 16.5c-1.5 1.5-1.5 4 0 4s2.5-1.5 4-3L4.5 16.5zM19 3s-4 0-7 3L5 14l5 5 8-7c3-3 3-7 3-7zM12 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4z',
  bulb:   'M9 21h6M12 3a6 6 0 0 1 6 6c0 2.2-1.2 4.1-3 5.2V17H9v-2.8C7.2 13.1 6 11.2 6 9a6 6 0 0 1 6-6z',
  target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  wrench: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  brush:  'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L3 14.67V21h6.33l10.06-10.06a5.5 5.5 0 0 0 0-7.78zM9 21H5v-4l.88-.88M18 9l-3-3',
  chart:  'M18 20V10M12 20V4M6 20v-6',
  trophy: 'M6 9H4a2 2 0 0 1-2-2V5h4M18 9h2a2 2 0 0 0 2-2V5h-4M12 17v4M8 21h8M7 4h10v5a5 5 0 0 1-10 0V4z',
  zap:    'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
  star:   'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
}

const Ico = ({ d, s = 15 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const ProjectIcon = ({ icon, color }) => {
  const d = ICON_MAP[icon]
  return (
    <div style={{
      width: 48, height: 48, borderRadius: 14, flexShrink: 0,
      background: color ? `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)` : 'linear-gradient(135deg, var(--accent-light) 0%, rgba(var(--accent-rgb), 0.05) 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: color || 'var(--accent)',
      border: `1px solid ${color ? `${color}30` : 'var(--accent-light)'}`,
      boxShadow: `0 4px 12px ${color ? `${color}15` : 'rgba(var(--accent-rgb), 0.08)'}`,
    }}>
      {d
        ? <Ico d={d} s={22} />
        : <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
      }
    </div>
  )
}

const DOTS  = 'M5 12h.01M12 12h.01M19 12h.01'
const EDIT  = 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z'
const CLONE = 'M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z'
const TRASH = 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6'
const USER  = 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
const CAL   = 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z'
const PLUS  = 'M12 5v14M5 12h14'
const EMPTY = 'M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zM8 11h8M8 15h5'
const FOLDER = 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z'
const GRID = 'M10 3H3v7h7V3zM21 3h-7v7h7V3zM21 14h-7v7h7v-7zM10 14H3v7h7v-7z'

export default function DashboardPage() {
  const [projects, setProjects]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [showModal, setShowModal]       = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [showMenu, setShowMenu]         = useState(null)
  const navigate = useNavigate()

  const load = async () => {
    try {
      const { data } = await api.get('/projects')
      setProjects(data.projects)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCreated = (project) => { setProjects(p => [project, ...p]); setShowModal(false) }

  const handleUpdated = (updatedProject) => {
    setProjects(p => p.map(proj => proj._id === updatedProject._id ? updatedProject : proj))
    setEditingProject(null)
  }

  const handleDelete = async (projectId, e) => {
    e.stopPropagation()
    if (!confirm('¿Eliminar este proyecto? Se eliminarán todos sus tableros y tareas.')) return
    try {
      await api.delete(`/projects/${projectId}`)
      setProjects(p => p.filter(proj => proj._id !== projectId))
      setShowMenu(null)
    } catch(err) { alert('Error al eliminar el proyecto') }
  }

  const handleClone = async (project, e) => {
    e.stopPropagation()
    try {
      const { data } = await api.get(`/projects/${project._id}`)
      const boards = data.boards
      const clonedName = `Copia de ${project.name}`
      const newProject = await api.post('/projects', {
        name: clonedName, description: project.description,
        color: project.color, icon: project.icon,
        visibility: project.visibility, endDate: project.endDate, tags: project.tags,
      })
      for (const board of boards) {
        await api.post(`/boards/${board._id}/clone`, { name: board.name })
      }
      setProjects(p => [newProject.data.project, ...p])
      setShowMenu(null)
      alert('✅ Proyecto clonado exitosamente con todos sus tableros')
    } catch(err) { alert('Error al clonar el proyecto') }
  }

  if (loading) return (
    <div style={{ 
      display:'flex', 
      flexDirection: 'column',
      alignItems:'center', 
      justifyContent:'center', 
      height:'70vh', 
      gap: 16, 
      color:'var(--text-muted)', 
    }}>
      <div style={{
        width: 56,
        height: 56,
        borderRadius: 16,
        background: 'linear-gradient(135deg, var(--accent-light) 0%, rgba(var(--accent-rgb), 0.05) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(var(--accent-rgb), 0.15)',
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"
          strokeLinecap="round" style={{ animation:'spin .9s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Cargando proyectos</p>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Por favor espera un momento...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeup { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.7 } }
        
        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
        }
        
        .header-section {
          background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
          border-bottom: 1px solid var(--border);
          padding: 48px 32px 40px;
          margin-bottom: 8px;
        }
        
        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }
        
        .header-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 8px 24px rgba(var(--accent-rgb), 0.3), 0 0 0 1px rgba(255,255,255,0.1) inset;
          margin-bottom: 16px;
        }
        
        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--accent-light);
          color: var(--accent);
          font-size: 12px;
          font-weight: 600;
          border-radius: 20px;
          letter-spacing: 0.02em;
          margin-bottom: 12px;
        }
        
        .header-title {
          margin: 0;
          font-size: 32px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.5px;
          line-height: 1.2;
        }
        
        .header-subtitle {
          margin: 8px 0 0;
          font-size: 15px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .stat-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: var(--bg-tertiary);
          border-radius: 8px;
          font-size: 13px;
          color: var(--text-secondary);
        }
        
        .stat-chip strong {
          color: var(--text-primary);
          font-weight: 600;
        }
        
        .pcard {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 20px;
          cursor: pointer;
          transition: all .25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: fadeup .4s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .pcard::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.03) 0%, transparent 60%);
          opacity: 0;
          transition: opacity .25s;
        }
        .pcard:hover {
          border-color: var(--accent);
          box-shadow: 0 0 0 4px var(--accent-light), 0 20px 40px rgba(0,0,0,0.08);
          transform: translateY(-4px);
        }
        .pcard:hover::before {
          opacity: 1;
        }
        .pcard:active {
          transform: translateY(-2px);
        }
        
        .card-accent-bar {
          height: 4px;
          background: linear-gradient(90deg, var(--accent), var(--accent-hover));
          border-radius: 20px 20px 0 0;
          position: relative;
          overflow: hidden;
        }
        .card-accent-bar::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
        
        .mi {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px 12px; border-radius: 10px;
          font-size: 13px; color: var(--text-primary);
          background: none; border: none; cursor: pointer; text-align: left;
          transition: all .15s;
          font-weight: 500;
        }
        .mi:hover { 
          background: var(--bg-tertiary);
          transform: translateX(2px);
        }
        .mi.del { color: var(--error); }
        .mi.del:hover { background: rgba(var(--error-rgb), 0.1); }
        
        .tag {
          font-size: 11px; 
          padding: 4px 10px; 
          border-radius: 6px;
          background: var(--accent-light); 
          color: var(--accent); 
          font-weight: 600;
          letter-spacing: 0.02em;
          border: 1px solid rgba(var(--accent-rgb), 0.1);
        }
        
        .new-btn {
          display: inline-flex; 
          align-items: center; 
          gap: 8px;
          padding: 12px 24px; 
          border-radius: 12px; 
          font-size: 14px; 
          font-weight: 600;
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
          color: #fff; 
          border: none; 
          cursor: pointer;
          transition: all .2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 16px rgba(var(--accent-rgb), 0.3), 0 0 0 1px rgba(255,255,255,0.1) inset;
          letter-spacing: 0.01em;
        }
        .new-btn:hover { 
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(var(--accent-rgb), 0.4), 0 0 0 1px rgba(255,255,255,0.15) inset;
        }
        .new-btn:active { 
          transform: translateY(0) scale(.98);
        }
        
        .dots-btn {
          width: 34px; 
          height: 34px; 
          border-radius: 10px; 
          display: flex;
          align-items: center; 
          justify-content: center; 
          background: var(--bg-tertiary);
          border: 1px solid transparent; 
          color: var(--text-muted); 
          cursor: pointer;
          transition: all .15s;
        }
        .dots-btn:hover { 
          background: var(--bg-primary); 
          border-color: var(--border);
          color: var(--text-primary);
          transform: scale(1.05);
        }
        
        .dropdown-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          z-index: 300;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 6px;
          min-width: 180px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.05) inset;
          animation: fadeup .2s ease;
        }
        
        .card-footer {
          margin-top: auto;
          padding: 14px 20px;
          background: var(--bg-tertiary);
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 0 0 20px 20px;
        }
        
        .footer-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-muted);
        }
        
        .footer-item svg {
          opacity: 0.7;
        }
        
        .empty-state {
          text-align: center;
          padding: 100px 24px;
          max-width: 400px;
          margin: 0 auto;
        }
        
        .empty-icon {
          width: 80px;
          height: 80px;
          border-radius: 24px;
          background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
          border: 2px dashed var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: var(--text-muted);
        }
        
        .empty-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 8px;
        }
        
        .empty-desc {
          font-size: 14px;
          color: var(--text-muted);
          margin: 0 0 28px;
          line-height: 1.6;
        }
        
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px;
        }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        @media (max-width: 768px) {
          .header-section {
            padding: 32px 20px;
          }
          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }
          .header-title {
            font-size: 26px;
          }
          .projects-grid {
            padding: 20px;
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="dashboard-container">
        {/* Header Section */}
        <div className="header-section">
          <div className="header-content">
            <div>
              <div className="header-icon">
                <Ico d={FOLDER} s={26} />
              </div>
              <div className="header-badge">
                <Ico d={GRID} s={12} />
                Workspace
              </div>
              <h1 className="header-title">Mis Proyectos</h1>
              <div className="header-subtitle">
                <span className="stat-chip">
                  <strong>{projects.length}</strong> proyecto{projects.length !== 1 ? 's' : ''} en total
                </span>
                <span className="stat-chip">
                  <strong>{projects.filter(p => p.status === 'ACTIVO').length}</strong> activo{projects.filter(p => p.status === 'ACTIVO').length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <button className="new-btn" onClick={() => setShowModal(true)}>
              <Ico d={PLUS} s={16} /> Nuevo proyecto
            </button>
          </div>
        </div>

        {/* Empty State */}
        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Ico d={EMPTY} s={36} />
            </div>
            <p className="empty-title">Sin proyectos aún</p>
            <p className="empty-desc">
              Crea tu primer proyecto para empezar a organizar tus tareas y colaborar con tu equipo de manera eficiente.
            </p>
            <button className="new-btn" onClick={() => setShowModal(true)}>
              <Ico d={PLUS} s={16} /> Crear mi primer proyecto
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((p, i) => (
              <div
                key={p._id}
                className="pcard"
                style={{ animationDelay:`${i * 50}ms` }}
                onClick={() => navigate(`/projects/${p._id}`)}
              >
                {/* Accent bar with project color */}
                <div 
                  className="card-accent-bar" 
                  style={{ 
                    background: p.color 
                      ? `linear-gradient(90deg, ${p.color}, ${p.color}dd)` 
                      : undefined 
                  }} 
                />

                <div style={{ padding: '24px 24px 20px', display:'flex', flexDirection:'column', flex:1, position: 'relative', zIndex: 1 }}>

                  {/* Top row */}
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom: 18 }}>
                    <div style={{ display:'flex', alignItems:'center', gap: 14 }}>
                      <ProjectIcon icon={p.icon} color={p.color} />
                      <div>
                        <h3 style={{ 
                          margin: 0, 
                          fontSize: 17, 
                          fontWeight: 700, 
                          color: 'var(--text-primary)', 
                          letterSpacing: '-0.3px',
                          lineHeight: 1.3,
                        }}>
                          {p.name}
                        </h3>
                        <div 
                          className="status-badge"
                          style={{
                            marginTop: 8,
                            color: STATUS_COLOR[p.status] || 'var(--text-muted)',
                            background: STATUS_BG[p.status] || 'var(--bg-tertiary)',
                          }}
                        >
                          <span 
                            className="status-dot" 
                            style={{ background: STATUS_COLOR[p.status] || 'var(--text-muted)' }}
                          />
                          {p.status}
                        </div>
                      </div>
                    </div>

                    {/* Context menu */}
                    <div style={{ position:'relative', flexShrink:0 }} onClick={e => e.stopPropagation()}>
                      <button className="dots-btn" onClick={() => setShowMenu(showMenu === p._id ? null : p._id)}>
                        <Ico d={DOTS} s={16} />
                      </button>
                      {showMenu === p._id && (
                        <div
                          className="dropdown-menu"
                          onMouseLeave={() => setShowMenu(null)}
                        >
                          <button className="mi" onClick={e => { e.stopPropagation(); setEditingProject(p); setShowMenu(null) }}>
                            <Ico d={EDIT} s={14} /> Editar proyecto
                          </button>
                          <button className="mi" onClick={e => handleClone(p, e)}>
                            <Ico d={CLONE} s={14} /> Clonar
                          </button>
                          <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />
                          <button className="mi del" onClick={e => handleDelete(p._id, e)}>
                            <Ico d={TRASH} s={14} /> Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {p.description && (
                    <p style={{ 
                      fontSize: 13.5, 
                      color: 'var(--text-secondary)', 
                      lineHeight: 1.65, 
                      margin: '0 0 16px',
                      display: '-webkit-box', 
                      WebkitLineClamp: 2, 
                      WebkitBoxOrient: 'vertical', 
                      overflow: 'hidden' 
                    }}>
                      {p.description}
                    </p>
                  )}

                  {/* Tags */}
                  {p.tags?.length > 0 && (
                    <div style={{ display:'flex', flexWrap:'wrap', gap: 8, marginBottom: 8 }}>
                      {p.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                      {p.tags.length > 4 && (
                        <span className="tag" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                          +{p.tags.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="card-footer">
                  <span className="footer-item">
                    <Ico d={USER} s={13} />
                    {p.createdBy?.name || 'Sin asignar'}
                  </span>
                  {p.endDate && (
                    <span className="footer-item">
                      <Ico d={CAL} s={13} />
                      {new Date(p.endDate).toLocaleDateString('es-CO', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <NewProjectModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}
      {editingProject && <EditProjectModal project={editingProject} onClose={() => setEditingProject(null)} onUpdated={handleUpdated} />}
    </>
  )
}
