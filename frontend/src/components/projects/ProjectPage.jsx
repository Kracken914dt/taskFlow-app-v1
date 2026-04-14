import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api.js'
import EditProjectModal from './EditProjectModal.jsx'

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

const ProjectIcon = ({ icon, color, size = 48 }) => {
  const d = ICON_MAP[icon]
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.25,
      background: color ? `${color}22` : 'var(--accent-light)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: color || 'var(--accent)', flexShrink: 0,
      border: `1px solid ${color ? `${color}33` : 'var(--accent-light)'}`,
    }}>
      {d
        ? <Ico d={d} s={size * 0.42} />
        : <span style={{ fontSize: size * 0.45, lineHeight: 1 }}>{icon}</span>
      }
    </div>
  )
}

const BACK   = 'M19 12H5M12 5l-7 7 7 7'
const EDIT   = 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z'
const TRASH  = 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6'
const PLUS   = 'M12 5v14M5 12h14'
const CLONE  = 'M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z'
const OPEN   = 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3'
const KBOARD = 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3H3V5zM3 10h4v9H5a2 2 0 0 1-2-2v-7zM9 10h6v9H9zM17 10h4v7a2 2 0 0 1-2 2h-2v-9z'
const CHECK  = 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3'
const CAL    = 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z'
const CLOSE  = 'M18 6 6 18M6 6l12 12'
const EMPTY  = 'M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5M13 21l2-2m0 0 4-4m-4 4H9m4 0v-5'

export default function ProjectPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject]           = useState(null)
  const [boards, setBoards]             = useState([])
  const [stats, setStats]               = useState({})
  const [loading, setLoading]           = useState(true)
  const [showNewBoard, setShowNewBoard] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [creating, setCreating]         = useState(false)
  const [editingProject, setEditingProject]   = useState(false)
  const [deletingProject, setDeletingProject] = useState(false)

  const load = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`)
      setProject(data.project)
      setBoards(data.boards)
      setStats(data.stats)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  const handleCreateBoard = async e => {
    e.preventDefault()
    if (!newBoardName.trim()) return
    setCreating(true)
    try {
      const { data } = await api.post('/boards', {
        name: newBoardName, projectId: id,
        columns: ['TODO', 'EN PROGRESO', 'EN REVISIÓN', 'HECHO'],
      })
      setBoards(p => [...p, data.board])
      setNewBoardName('')
      setShowNewBoard(false)
    } catch(e) { console.error(e) }
    finally { setCreating(false) }
  }

  const handleCloneBoard = async (boardId, boardName) => {
    const name = prompt('Nombre del tablero clonado:', `Copia de ${boardName}`)
    if (!name) return
    try {
      const { data } = await api.post(`/boards/${boardId}/clone`, { name })
      setBoards(p => [...p, data.board])
      alert(`✅ ${data.message}`)
    } catch(e) { alert('Error al clonar') }
  }

  const handleDeleteProject = async () => {
    if (!confirm('¿Eliminar este proyecto? Se eliminarán todos sus tableros y tareas.')) return
    setDeletingProject(true)
    try {
      await api.delete(`/projects/${id}`)
      alert('✅ Proyecto eliminado')
      navigate('/')
    } catch(err) {
      alert('Error al eliminar el proyecto')
      setDeletingProject(false)
    }
  }

  const handleProjectUpdated = (updatedProject) => {
    setProject(updatedProject)
    setEditingProject(false)
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', gap:10, color:'var(--text-muted)', fontSize:13 }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" style={{ animation:'spin .8s linear infinite' }}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      Cargando proyecto...
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!project) return (
    <div style={{ padding:24, color:'var(--text-muted)', fontSize:14 }}>Proyecto no encontrado</div>
  )

  const progress = stats.progress || 0

  return (
    <>
      <style>{`
        @keyframes spin    { to { transform:rotate(360deg) } }
        @keyframes fadeup  { from { opacity:0;transform:translateY(8px) } to { opacity:1;transform:translateY(0) } }
        .pp-wrap { max-width:1080px; margin:0 auto; padding:40px 28px; }
        .stat-pill { display:flex; align-items:center; gap:6px; font-size:12.5px; color:var(--text-muted); }
        .icon-btn {
          display:flex; align-items:center; gap:6px; padding:7px 14px; border-radius:8px;
          font-size:12.5px; font-weight:500; cursor:pointer; transition:all .15s;
          border:1px solid var(--border); background:none; color:var(--text-secondary);
        }
        .icon-btn:hover { background:var(--bg-tertiary); color:var(--text-primary); }
        .icon-btn.danger:hover { border-color:var(--error); color:var(--error); background:var(--error-light); }
        .primary-btn {
          display:flex; align-items:center; gap:6px; padding:8px 16px; border-radius:8px;
          font-size:13px; font-weight:600; cursor:pointer; transition:all .15s;
          background:var(--accent); color:#fff; border:none;
        }
        .primary-btn:hover { background:var(--accent-hover); }
        .primary-btn:active { transform:scale(.97); }
        .board-card {
          background:var(--bg-secondary); border:1px solid var(--border); border-radius:13px;
          overflow:hidden; cursor:default; transition:border-color .15s, box-shadow .15s;
          animation:fadeup .2s ease both;
        }
        .board-card:hover { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-light); }
        .new-board-input {
          width:100%; padding:9px 13px; border-radius:8px; font-size:13px;
          background:var(--bg-primary); border:1px solid var(--border);
          color:var(--text-primary); outline:none; transition:border-color .15s, box-shadow .15s;
        }
        .new-board-input:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-light); }
        .new-board-input::placeholder { color:var(--text-muted); }
        .back-btn {
          display:inline-flex; align-items:center; gap:6px; font-size:12.5px;
          color:var(--text-muted); background:none; border:none; cursor:pointer;
          padding:0; margin-bottom:20px; transition:color .12s;
        }
        .back-btn:hover { color:var(--accent); }
      `}</style>

      <div className="pp-wrap">

        {/* Back */}
        <button className="back-btn" onClick={() => navigate('/')}>
          <Ico d={BACK} s={13} /> Mis Proyectos
        </button>

        {/* Project header card */}
        <div style={{ background:'var(--bg-secondary)', border:'1px solid var(--border)', borderRadius:16, padding:28, marginBottom:28, animation:'fadeup .2s ease' }}>

          {/* Top row */}
          <div style={{ display:'flex', alignItems:'flex-start', gap:18, marginBottom:20 }}>
            <ProjectIcon icon={project.icon} color={project.color} size={52} />

            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:6 }}>
                <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:'var(--text-primary)', letterSpacing:'-.4px' }}>
                  {project.name}
                </h1>
                <span style={{ fontSize:10.5, fontWeight:600, padding:'3px 10px', borderRadius:20,
                  background:'var(--success-light)', color:'var(--success)', letterSpacing:'.03em' }}>
                  {project.status}
                </span>
              </div>
              {project.description && (
                <p style={{ margin:0, fontSize:13.5, color:'var(--text-secondary)', lineHeight:1.6 }}>
                  {project.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div style={{ display:'flex', gap:7, flexShrink:0 }}>
              <button className="icon-btn" onClick={() => setEditingProject(true)}>
                <Ico d={EDIT} s={13} /> Editar
              </button>
              <button className="icon-btn danger" onClick={handleDeleteProject} disabled={deletingProject}>
                <Ico d={TRASH} s={13} /> {deletingProject ? '...' : 'Eliminar'}
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display:'flex', alignItems:'center', gap:24, flexWrap:'wrap', paddingTop:18, borderTop:'1px solid var(--border)' }}>
            <div className="stat-pill">
              <Ico d={KBOARD} s={13} /> {boards.length} tablero{boards.length !== 1 ? 's' : ''}
            </div>
            <div className="stat-pill">
              <Ico d={CHECK} s={13} /> {stats.doneTasks ?? 0}/{stats.totalTasks ?? 0} tareas
            </div>
            {project.endDate && (
              <div className="stat-pill">
                <Ico d={CAL} s={13} /> {new Date(project.endDate).toLocaleDateString('es-CO')}
              </div>
            )}

            {/* Progress */}
            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:120, height:5, borderRadius:20, background:'var(--bg-tertiary)', overflow:'hidden' }}>
                <div style={{ width:`${progress}%`, height:'100%', borderRadius:20, background:'var(--accent)', transition:'width .4s ease' }} />
              </div>
              <span style={{ fontSize:13, fontWeight:700, color:'var(--accent)', minWidth:36 }}>{progress}%</span>
              <span style={{ fontSize:12, color:'var(--text-muted)' }}>completado</span>
            </div>
          </div>
        </div>

        {/* Boards section header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:'var(--text-primary)', letterSpacing:'-.3px' }}>Tableros</h2>
            <p style={{ margin:'3px 0 0', fontSize:12, color:'var(--text-muted)' }}>{boards.length} tablero{boards.length !== 1 ? 's' : ''} kanban</p>
          </div>
          <button className="primary-btn" onClick={() => setShowNewBoard(true)}>
            <Ico d={PLUS} s={13} /> Nuevo tablero
          </button>
        </div>

        {/* Boards grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:14 }}>

          {boards.map((b, i) => (
            <div key={b._id} className="board-card" style={{ animationDelay:`${i * 40}ms` }}>
              <div style={{ height:3, background:'var(--accent)', borderRadius:'13px 13px 0 0' }} />
              <div style={{ padding:'16px 18px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <div style={{ width:34, height:34, borderRadius:9, background:'var(--accent-light)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)', flexShrink:0 }}>
                    <Ico d={KBOARD} s={15} />
                  </div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ margin:0, fontSize:14, fontWeight:650, color:'var(--text-primary)', letterSpacing:'-.2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {b.name}
                    </p>
                    <p style={{ margin:0, fontSize:11.5, color:'var(--text-muted)' }}>
                      {b.columns?.length || 0} columnas
                    </p>
                  </div>
                </div>
                <div style={{ display:'flex', gap:7 }}>
                  <button
                    onClick={() => navigate(`/boards/${b._id}`)}
                    style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                      padding:'7px 0', borderRadius:8, fontSize:12.5, fontWeight:600,
                      background:'var(--accent)', color:'#fff', border:'none', cursor:'pointer', transition:'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--accent-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background='var(--accent)'}
                  >
                    <Ico d={OPEN} s={12} /> Abrir
                  </button>
                  <button
                    onClick={() => handleCloneBoard(b._id, b.name)}
                    className="icon-btn"
                    style={{ padding:'7px 12px' }}
                    title="Clonar tablero"
                  >
                    <Ico d={CLONE} s={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* New board inline form */}
          {showNewBoard && (
            <div style={{ background:'var(--bg-secondary)', border:'1px solid var(--accent)', borderRadius:13, padding:18, animation:'fadeup .15s ease' }}>
              <p style={{ margin:'0 0 12px', fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>Nuevo tablero</p>
              <form onSubmit={handleCreateBoard}>
                <input
                  className="new-board-input"
                  value={newBoardName}
                  onChange={e => setNewBoardName(e.target.value)}
                  placeholder="Nombre del tablero"
                  autoFocus
                  style={{ marginBottom:10 }}
                />
                <div style={{ display:'flex', gap:7 }}>
                  <button type="submit" className="primary-btn" disabled={creating} style={{ flex:1, justifyContent:'center' }}>
                    {creating
                      ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation:'spin .8s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Creando...</>
                      : <><Ico d={CHECK} s={13} /> Crear</>
                    }
                  </button>
                  <button type="button" className="icon-btn" style={{ padding:'7px 12px' }}
                    onClick={() => { setShowNewBoard(false); setNewBoardName('') }}>
                    <Ico d={CLOSE} s={13} />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Empty state */}
        {boards.length === 0 && !showNewBoard && (
          <div style={{ textAlign:'center', padding:'64px 20px', color:'var(--text-muted)', animation:'fadeup .2s ease' }}>
            <div style={{ width:52, height:52, borderRadius:13, background:'var(--bg-secondary)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', color:'var(--text-muted)' }}>
              <Ico d={EMPTY} s={22} />
            </div>
            <p style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', margin:'0 0 6px' }}>Sin tableros aún</p>
            <p style={{ fontSize:13, margin:'0 0 20px' }}>Crea un tablero Kanban para empezar a gestionar tareas</p>
            <button className="primary-btn" style={{ margin:'0 auto' }} onClick={() => setShowNewBoard(true)}>
              <Ico d={PLUS} s={13} /> Crear tablero
            </button>
          </div>
        )}
      </div>

      {editingProject && project && (
        <EditProjectModal
          project={project}
          onClose={() => setEditingProject(false)}
          onUpdated={handleProjectUpdated}
        />
      )}
    </>
  )
}