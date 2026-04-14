import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api.js'
import TaskCard  from '../tasks/TaskCard.jsx'
import TaskModal from '../tasks/TaskModal.jsx'

const Ico = ({ d, s = 15 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const BACK   = 'M19 12H5M12 5l-7 7 7 7'
const SEARCH = 'M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z'
const PLUS   = 'M12 5v14M5 12h14'
const BOARD  = 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z'
const EMPTY  = 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2'
const FILTER = 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z'

export default function BoardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [board, setBoard]               = useState(null)
  const [tasksByColumn, setTasksByColumn] = useState({})
  const [loading, setLoading]           = useState(true)
  const [showNewTask, setShowNewTask]   = useState(false)
  const [activeColumn, setActiveColumn] = useState(null)
  const [editTask, setEditTask]         = useState(null)
  const [filter, setFilter]             = useState({ priority:'', type:'', search:'' })
  const [showFilters, setShowFilters]   = useState(false)

  const load = async () => {
    try {
      const { data } = await api.get(`/boards/${id}`)
      setBoard(data.board)
      setTasksByColumn(data.tasksByColumn)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  const handleTaskCreated = async (task) => {
  setShowNewTask(false)
  await load()
}
  const handleTaskDeleted = (taskId, column) => {
    setTasksByColumn(prev => ({
      ...prev,
      [column]: prev[column]?.filter(t => t._id !== taskId) || []
    }))
  }

  const handleTaskMoved = async (taskId, fromCol, toCol) => {
  // 🚫 evitar mover en la misma columna
  if (fromCol === toCol) return

  try {
    await api.put(`/tasks/${taskId}`, { column: toCol })

    setTasksByColumn(prev => {
      const from = prev[fromCol]?.filter(t => t._id !== taskId) || []
      const task = prev[fromCol]?.find(t => t._id === taskId)

      const to = task
        ? [{ ...task, column: toCol }, ...(prev[toCol] || [])]
        : (prev[toCol] || [])

      return {
        ...prev,
        [fromCol]: from,
        [toCol]: to
      }
    })

  } catch (e) {
    console.error(e)
  }
}

const handleCloneTask = async (task) => {
  const title = prompt('Nombre de la tarea clonada:', `Copia de ${task.title}`)
  if (!title) return

  try {
    const clonedTask = {
      title,
      description: task.description || '',
      column: task.column,
      priority: task.priority,
      boardId: task.boardId, 
      assignedTo: task.assignedTo?._id || task.assignedTo || null,
      dueDate: task.dueDate || null,
      labels: task.labels || [],
      subtasks: task.subtasks || [],
      estimation: task.estimation || null,
    }

    console.log("ENVIANDO:", clonedTask)

    const { data } = await api.post('/tasks', clonedTask)
    setShowNewTask(false)
    await load()
    alert(`✅ ${data.message || 'Tarea clonada'}`)
  } catch (e) {
    console.error("ERROR COMPLETO:", e.response?.data || e)
    alert(e.response?.data?.message || 'Error al clonar')
  }
}

  const getFilteredTasks = (tasks) => tasks?.filter(t => {
    if (filter.priority && t.priority !== filter.priority) return false
    if (filter.type     && t.type     !== filter.type)     return false
    if (filter.search   && !t.title.toLowerCase().includes(filter.search.toLowerCase())) return false
    return true
  }) || []

  const hasFilters = filter.priority || filter.type || filter.search

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', gap:10, color:'var(--text-muted)', fontSize:13 }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" style={{ animation:'spin .8s linear infinite' }}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      Cargando tablero...
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!board) return (
    <div style={{ padding:24, color:'var(--text-muted)', fontSize:14 }}>Tablero no encontrado</div>
  )

  const projectId = board.projectId
  const totalTasks = Object.values(tasksByColumn).reduce((acc, t) => acc + (t?.length || 0), 0)

  return (
    <>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes fadein { from { opacity:0;transform:translateY(6px) } to { opacity:1;transform:translateY(0) } }
        .board-input {
          height:34px; padding:0 12px 0 34px; border-radius:8px; font-size:13px;
          background:var(--bg-primary); border:1px solid var(--border);
          color:var(--text-primary); outline:none; width:200px; transition:border-color .15s, box-shadow .15s;
        }
        .board-input:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-light); }
        .board-input::placeholder { color:var(--text-muted); }
        .board-select {
          height:34px; padding:0 10px; border-radius:8px; font-size:13px;
          background:var(--bg-primary); border:1px solid var(--border);
          color:var(--text-primary); outline:none; cursor:pointer; transition:border-color .15s;
        }
        .board-select:focus { border-color:var(--accent); }
        .col-wrap {
          min-width:272px; width:272px; display:flex; flex-direction:column;
          max-height:calc(100vh - 130px); background:var(--bg-secondary);
          border:1px solid var(--border); border-radius:13px; overflow:hidden;
          animation:fadein .2s ease both;
        }
        .col-add {
          width:28px; height:28px; border-radius:7px; display:flex; align-items:center;
          justify-content:center; background:none; border:1px solid transparent;
          color:var(--text-muted); cursor:pointer; transition:all .12s; flex-shrink:0;
        }
        .col-add:hover { background:var(--bg-tertiary); border-color:var(--border); color:var(--accent); }
        .back-btn {
          display:inline-flex; align-items:center; gap:6px; font-size:12.5px;
          color:var(--text-muted); background:none; border:none; cursor:pointer;
          padding:0; transition:color .12s;
        }
        .back-btn:hover { color:var(--accent); }
        .new-task-btn {
          display:flex; align-items:center; gap:6px; padding:8px 16px; border-radius:8px;
          font-size:13px; font-weight:600; background:var(--accent); color:#fff;
          border:none; cursor:pointer; transition:background .15s, transform .1s; flex-shrink:0;
        }
        .new-task-btn:hover { background:var(--accent-hover); }
        .new-task-btn:active { transform:scale(.97); }
        .filter-btn {
          display:flex; align-items:center; gap:6px; height:34px; padding:0 12px;
          border-radius:8px; font-size:13px; background:none; cursor:pointer; transition:all .12s;
          border:1px solid var(--border); color:var(--text-muted);
        }
        .filter-btn:hover { border-color:var(--accent); color:var(--accent); }
        .filter-btn.active { border-color:var(--accent); color:var(--accent); background:var(--accent-light); }
      `}</style>

      <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 56px)', background:'var(--bg-primary)' }}>

        {/* Header */}
        <div style={{ padding:'14px 24px', background:'var(--bg-secondary)', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>

            {/* Left: back + title */}
            <div>
              <button className="back-btn" onClick={() => navigate(`/projects/${projectId}`)}>
                <Ico d={BACK} s={12} /> Volver al proyecto
              </button>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:6 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:'var(--accent-light)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)', flexShrink:0 }}>
                  <Ico d={BOARD} s={15} />
                </div>
                <div>
                  <h1 style={{ margin:0, fontSize:16, fontWeight:700, color:'var(--text-primary)', letterSpacing:'-.3px' }}>
                    {board.name}
                  </h1>
                  <p style={{ margin:0, fontSize:11.5, color:'var(--text-muted)' }}>
                    {board.columns?.length} columnas · {totalTasks} tareas
                  </p>
                </div>
              </div>
            </div>

            {/* Right: filters + button */}
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              <button className={`filter-btn${hasFilters ? ' active' : ''}`} onClick={() => setShowFilters(v => !v)}>
                <Ico d={FILTER} s={13} />
                Filtros
                {hasFilters && (
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', display:'inline-block' }} />
                )}
              </button>
              <button className="new-task-btn" onClick={() => { setActiveColumn(board.columns[0]?.name); setShowNewTask(true) }}>
                <Ico d={PLUS} s={13} /> Nueva tarea
              </button>
            </div>
          </div>

          {/* Filter bar */}
          {showFilters && (
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:12, paddingTop:12, borderTop:'1px solid var(--border)', animation:'fadein .15s ease' }}>
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none' }}>
                  <Ico d={SEARCH} s={13} />
                </div>
                <input className="board-input" placeholder="Buscar tarea..."
                  value={filter.search} onChange={e => setFilter(p => ({...p, search:e.target.value}))} />
              </div>
              <select className="board-select" value={filter.priority} onChange={e => setFilter(p => ({...p, priority:e.target.value}))}>
                <option value="">Prioridad</option>
                {['URGENTE','ALTA','MEDIA','BAJA'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <select className="board-select" value={filter.type} onChange={e => setFilter(p => ({...p, type:e.target.value}))}>
                <option value="">Tipo</option>
                {['BUG','FEATURE','STORY','TASK'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              {hasFilters && (
                <button onClick={() => setFilter({ priority:'', type:'', search:'' })}
                  style={{ height:34, padding:'0 12px', borderRadius:8, fontSize:12.5, border:'1px solid var(--border)', background:'none', color:'var(--error)', cursor:'pointer' }}>
                  Limpiar
                </button>
              )}
            </div>
          )}
        </div>

        {/* Kanban */}
        <div style={{ flex:1, overflowX:'auto', padding:'20px 24px', display:'flex', gap:12, alignItems:'flex-start' }}>
          {board.columns?.map((col, ci) => {
            const colTasks = getFilteredTasks(tasksByColumn[col.name])
            return (
              <div key={col._id} className="col-wrap" style={{ animationDelay:`${ci * 50}ms` }}>

                {/* Column header */}
                <div style={{ padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background: col.color || 'var(--accent)', flexShrink:0 }} />
                    <span style={{ fontWeight:650, fontSize:13, color:'var(--text-primary)' }}>{col.name}</span>
                    <span style={{
                      fontSize:11, fontWeight:600, color:'var(--text-muted)',
                      background:'var(--bg-tertiary)', border:'1px solid var(--border)',
                      borderRadius:20, padding:'1px 8px', minWidth:20, textAlign:'center'
                    }}>
                      {colTasks.length}
                    </span>
                  </div>
                  <button className="col-add" onClick={() => { setActiveColumn(col.name); setShowNewTask(true) }}>
                    <Ico d={PLUS} s={14} />
                  </button>
                </div>

                {/* Tasks */}
               <div 
              style={{ flex:1, overflowY:'auto', padding:'10px', display:'flex', flexDirection:'column', gap:8 }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const data = JSON.parse(e.dataTransfer.getData('application/json'))
                handleTaskMoved(data.taskId, data.fromColumn, col.name)
                  }}
                >
                  {colTasks.length === 0 ? (
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 0', color:'var(--text-muted)', gap:8 }}>
                      <Ico d={EMPTY} s={20} />
                      <span style={{ fontSize:12 }}>Sin tareas</span>
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        columns={board.columns}
                        onMove={handleTaskMoved}
                        onDelete={handleTaskDeleted}
                        onClone={handleCloneTask}
                        onClick={() => setEditTask(task)}
                      />
                    ))
                  )}
                </div>

              </div>
            )
          })}
        </div>
      </div>

      {showNewTask && (
        <TaskModal
          boardId={id} projectId={projectId}
          defaultColumn={activeColumn} columns={board.columns}
          onClose={() => setShowNewTask(false)} onSaved={handleTaskCreated}
        />
      )}

      {editTask && (
        <TaskModal
          task={editTask} boardId={id} projectId={projectId} columns={board.columns}
          onClose={() => setEditTask(null)}
          onSaved={async (updated) => {
          setEditTask(null)
          await load()
        }}
        />
      )}
    </>
  )
}