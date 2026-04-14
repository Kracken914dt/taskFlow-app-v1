import { useState, useEffect } from 'react'
import api from '../../services/api.js'

const TYPES = ['TASK','BUG','FEATURE','STORY']
const PRIOS  = ['BAJA','MEDIA','ALTA','URGENTE']

const TYPE_META = {
  TASK:    { d:'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12h6M9 16h4', color:'#3B82F6', desc:'Tarea general' },
  BUG:     { d:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4M12 16h.01',                                                                                                      color:'#EF4444', desc:'Defecto o error' },
  FEATURE: { d:'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',                                                                  color:'#8B5CF6', desc:'Nueva funcionalidad' },
  STORY:   { d:'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',                                                                           color:'#F59E0B', desc:'Historia de usuario' },
}

const PRIO_META = {
  BAJA:    { color:'#10B981', bg:'#D1FAE5' },
  MEDIA:   { color:'#3B82F6', bg:'#DBEAFE' },
  ALTA:    { color:'#F59E0B', bg:'#FEF3C7' },
  URGENTE: { color:'#EF4444', bg:'#FEE2E2' },
}

const Ico = ({ d, s = 15 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const CLOSE   = 'M18 6 6 18M6 6l12 12'
const SAVE    = 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v14a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8'
const SPIN    = 'M21 12a9 9 0 1 1-6.219-8.56'
const PLUS    = 'M12 5v14M5 12h14'
const MINUS   = 'M5 12h14'
const DETAILS = 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 12h6M9 16h4'
const SUBTASK = 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01'
const WARN    = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4M12 16h.01'
const USER    = 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
const CAL     = 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z'
const CLOCK   = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2'
const COL     = 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3H3V5zM3 10h4v9H5a2 2 0 0 1-2-2v-7zM9 10h6v9H9zM17 10h4v7a2 2 0 0 1-2 2h-2v-9z'
const FACTORY = 'M13 2 3 14h9l-1 8 10-12h-9l1-8z'

export default function TaskModal({ task, boardId, projectId, defaultColumn, columns, onClose, onSaved }) {
  const isEdit = !!task

  const [form, setForm] = useState({
    title:          task?.title || '',
    description:    task?.description || '',
    type:           task?.type || 'TASK',
    priority:       task?.priority || 'MEDIA',
    column:         task?.column || defaultColumn || columns?.[0]?.name || 'TODO',
    dueDate:        task?.dueDate ? task.dueDate.split('T')[0] : '',
    estimatedHours: task?.estimatedHours || 0,
  })
  const [subtasks, setSubtasks]   = useState(task?.subtasks?.map(s => s.title) || [''])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [users, setUsers]         = useState([])
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo?._id || '')
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    api.get('/auth/users').then(({ data }) => setUsers(data.users)).catch(() => {})
  }, [])

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubtaskChange = (i, val) => setSubtasks(p => p.map((s, idx) => idx === i ? val : s))
  const addSubtask    = () => setSubtasks(p => [...p, ''])
  const removeSubtask = i  => setSubtasks(p => p.filter((_, idx) => idx !== i))

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const payload = {
        ...form, boardId, projectId,
        assignedTo: assignedTo || null,
        subtasks: subtasks.filter(s => s.trim()).map(title => ({ title })),
        dueDate: form.dueDate || null,
      }
      let saved
      if (isEdit) {
        const { data } = await api.put(`/tasks/${task._id}`, payload)
        saved = data.task
      } else {
        const { data } = await api.post('/tasks', payload)
        saved = data.task
      }
      onSaved(saved)
    } catch(err) {
      setError(err.response?.data?.message || 'Error al guardar la tarea')
    } finally { setLoading(false) }
  }

  const meta     = TYPE_META[form.type] || TYPE_META.TASK
  const prioMeta = PRIO_META[form.priority] || PRIO_META.MEDIA
  const doneSubtasks = subtasks.filter(s => s.trim()).length

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background:'var(--bg-secondary)', borderRadius:16, width:'100%', maxWidth:560,
        border:'1px solid var(--border)', overflow:'hidden', boxShadow:'var(--shadow-lg)'
      }}>
        <style>{`
          @keyframes spin { to { transform:rotate(360deg) } }
          @keyframes fadein { from { opacity:0;transform:translateY(4px) } to { opacity:1;transform:translateY(0) } }
          .tmi { width:100%; padding:10px 14px; border-radius:9px; font-size:13.5px;
            background:var(--bg-primary); border:1px solid var(--border);
            color:var(--text-primary); outline:none; transition:border-color .15s, box-shadow .15s; }
          .tmi:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-light); }
          .tmi::placeholder { color:var(--text-muted); }
          .tml { font-size:11px; font-weight:600; color:var(--text-muted);
            text-transform:uppercase; letter-spacing:.07em; margin-bottom:6px; display:flex; align-items:center; gap:5px; }
          .tmg { margin-bottom:16px; }
          .tab-btn { padding:9px 4px; background:transparent; border:none; cursor:pointer; font-size:13px;
            font-weight:500; display:flex; align-items:center; gap:6px; transition:color .15s;
            border-bottom:2px solid transparent; margin-bottom:-1px; }
        `}</style>

        {/* Header */}
        <div style={{ padding:'20px 24px 0' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {/* Type badge */}
              <div style={{ width:36, height:36, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', background:`${meta.color}18`, color:meta.color, flexShrink:0 }}>
                <Ico d={meta.d} s={17} />
              </div>
              <div>
                <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:'var(--text-primary)' }}>
                  {isEdit ? 'Editar tarea' : 'Nueva tarea'}
                </h2>
                <p style={{ margin:'2px 0 0', fontSize:11.5, color:'var(--text-muted)' }}>{meta.desc}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background:'none', border:'1px solid var(--border)', borderRadius:8, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)' }}>
              <Ico d={CLOSE} s={14} />
            </button>
          </div>

          {/* Type selector */}
          <div style={{ display:'flex', gap:6, marginBottom:14 }}>
            {TYPES.map(t => {
              const m = TYPE_META[t]
              const active = form.type === t
              return (
                <button key={t} type="button" onClick={() => setForm(p => ({...p, type:t}))}
                  style={{
                    display:'flex', alignItems:'center', gap:5, padding:'5px 11px', borderRadius:7,
                    border: active ? `1.5px solid ${m.color}` : '1px solid var(--border)',
                    background: active ? `${m.color}15` : 'var(--bg-primary)',
                    color: active ? m.color : 'var(--text-muted)',
                    cursor:'pointer', fontSize:12, fontWeight:600, transition:'all .15s',
                  }}>
                  <Ico d={m.d} s={12} /> {t}
                </button>
              )
            })}
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:20, borderBottom:'1px solid var(--border)' }}>
            {[
              { id:'details',  label:'Detalles',  icon:DETAILS },
              { id:'subtasks', label:`Subtareas${doneSubtasks ? ` (${doneSubtasks})` : ''}`, icon:SUBTASK },
            ].map(tab => (
              <button key={tab.id} className="tab-btn" onClick={() => setActiveTab(tab.id)}
                style={{
                  color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
                  borderBottomColor: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                }}>
                <Ico d={tab.icon} s={13} /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding:'20px 24px', maxHeight:'55vh', overflowY:'auto' }}>

            {/* Details tab */}
            {activeTab === 'details' && (
              <div style={{ animation:'fadein .15s ease' }}>
                <div className="tmg">
                  <label className="tml">Título</label>
                  <input className="tmi" name="title" value={form.title} onChange={handleChange}
                    required autoFocus placeholder="Describe la tarea..." />
                </div>

                <div className="tmg">
                  <label className="tml">Descripción</label>
                  <textarea className="tmi" name="description" value={form.description} onChange={handleChange}
                    placeholder="Más detalles..." style={{ minHeight:80, resize:'none', lineHeight:1.55 }} />
                </div>

                {/* Priority selector visual */}
                <div className="tmg">
                  <label className="tml">Prioridad</label>
                  <div style={{ display:'flex', gap:7 }}>
                    {PRIOS.map(p => {
                      const pm = PRIO_META[p]
                      const active = form.priority === p
                      return (
                        <button key={p} type="button" onClick={() => setForm(prev => ({...prev, priority:p}))}
                          style={{
                            flex:1, padding:'7px 0', borderRadius:8, border: active ? `1.5px solid ${pm.color}` : '1px solid var(--border)',
                            background: active ? `${pm.color}15` : 'var(--bg-primary)',
                            color: active ? pm.color : 'var(--text-muted)',
                            fontSize:11.5, fontWeight:600, cursor:'pointer', transition:'all .15s',
                          }}>
                          {p}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
                  <div>
                    <label className="tml"><Ico d={COL} s={11} /> Columna</label>
                    <select className="tmi" name="column" value={form.column} onChange={handleChange}>
                      {columns?.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="tml"><Ico d={USER} s={11} /> Asignar a</label>
                    <select className="tmi" value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
                      <option value="">Sin asignar</option>
                      {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div>
                    <label className="tml"><Ico d={CAL} s={11} /> Fecha límite</label>
                    <input className="tmi" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="tml"><Ico d={CLOCK} s={11} /> Estimación (h)</label>
                    <input className="tmi" type="number" name="estimatedHours" value={form.estimatedHours}
                      onChange={handleChange} min={0} />
                  </div>
                </div>
              </div>
            )}

            {/* Subtasks tab */}
            {activeTab === 'subtasks' && (
              <div style={{ animation:'fadein .15s ease' }}>
                <p style={{ fontSize:13, color:'var(--text-muted)', margin:'0 0 16px' }}>
                  Divide la tarea en pasos más pequeños.
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {subtasks.map((s, i) => (
                    <div key={i} style={{ display:'flex', gap:7, alignItems:'center' }}>
                      <div style={{ width:20, height:20, borderRadius:5, border:'1.5px solid var(--border)', flexShrink:0, background:'var(--bg-tertiary)' }} />
                      <input className="tmi" value={s} onChange={e => handleSubtaskChange(i, e.target.value)}
                        placeholder={`Subtarea ${i + 1}`} style={{ flex:1 }} />
                      <button type="button" onClick={() => removeSubtask(i)}
                        style={{ width:28, height:28, borderRadius:7, border:'1px solid var(--border)', background:'none', color:'var(--text-muted)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Ico d={MINUS} s={13} />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addSubtask}
                  style={{ display:'flex', alignItems:'center', gap:6, marginTop:12, padding:'7px 14px', borderRadius:8, border:'1px dashed var(--border)', background:'none', color:'var(--text-muted)', fontSize:13, cursor:'pointer', transition:'all .15s', width:'100%', justifyContent:'center' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-muted)' }}>
                  <Ico d={PLUS} s={13} /> Agregar subtarea
                </button>
              </div>
            )}

            {error && (
              <div style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 13px', borderRadius:8,
                background:'var(--error-light)', color:'var(--error)', fontSize:12.5, marginTop:14 }}>
                <Ico d={WARN} s={14} /> {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, padding:'14px 24px',
            borderTop:'1px solid var(--border)', background:'var(--bg-primary)' }}>
            <button type="button" onClick={onClose}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:8,
                fontSize:13, background:'none', border:'1px solid var(--border)',
                color:'var(--text-secondary)', cursor:'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 20px', borderRadius:8,
                fontSize:13, fontWeight:600, background:'var(--accent)', color:'#fff',
                border:'none', cursor:'pointer', opacity: loading ? .7 : 1 }}>
              {loading
                ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation:'spin .8s linear infinite' }}><path d={SPIN}/></svg> Guardando...</>
                : <><Ico d={SAVE} s={13} /> {isEdit ? 'Guardar cambios' : 'Crear tarea'}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}