import { useState } from 'react'
import api from '../../services/api.js'

const COLORS = ['#2563EB','#EF4444','#F59E0B','#10B981','#8B5CF6','#EC4899','#14B8A6','#F97316']

const ICONS = [
  { id:'board',  d:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
  { id:'rocket', d:'M4.5 16.5c-1.5 1.5-1.5 4 0 4s2.5-1.5 4-3L4.5 16.5zM19 3s-4 0-7 3L5 14l5 5 8-7c3-3 3-7 3-7zM12 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4z' },
  { id:'bulb',   d:'M9 21h6M12 3a6 6 0 0 1 6 6c0 2.2-1.2 4.1-3 5.2V17H9v-2.8C7.2 13.1 6 11.2 6 9a6 6 0 0 1 6-6z' },
  { id:'target', d:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
  { id:'wrench', d:'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' },
  { id:'brush',  d:'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L3 14.67V21h6.33l10.06-10.06a5.5 5.5 0 0 0 0-7.78zM9 21H5v-4l.88-.88M18 9l-3-3' },
  { id:'chart',  d:'M18 20V10M12 20V4M6 20v-6' },
  { id:'trophy', d:'M6 9H4a2 2 0 0 1-2-2V5h4M18 9h2a2 2 0 0 0 2-2V5h-4M12 17v4M8 21h8M7 4h10v5a5 5 0 0 1-10 0V4z' },
  { id:'zap',    d:'M13 2 3 14h9l-1 8 10-12h-9l1-8z' },
  { id:'star',   d:'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
]

const Ico = ({ d, s = 15 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const CLOSE  = 'M18 6 6 18M6 6l12 12'
const SAVE   = 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v14a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8'
const SPIN   = 'M21 12a9 9 0 1 1-6.219-8.56'
const WARN   = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4M12 16h.01'

export default function EditProjectModal({ project, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name:        project.name,
    description: project.description || '',
    color:       project.color || '#2563EB',
    icon:        project.icon || 'board',
    visibility:  project.visibility || 'PRIVADO',
    status:      project.status || 'ACTIVO',
    endDate:     project.endDate ? project.endDate.split('T')[0] : '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const { data } = await api.put(`/projects/${project._id}`, form)
      onUpdated(data.project)
    } catch(err) {
      setError(err.response?.data?.message || 'Error al actualizar el proyecto')
    } finally { setLoading(false) }
  }

  const currentIcon = ICONS.find(i => i.id === form.icon)

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background:'var(--bg-secondary)', borderRadius:16, width:'100%', maxWidth:500,
        border:'1px solid var(--border)', overflow:'hidden', boxShadow:'var(--shadow-lg)'
      }}>
        <style>{`
          @keyframes spin { to { transform:rotate(360deg) } }
          .efi {
            width:100%; padding:10px 14px; border-radius:9px; font-size:13.5px;
            background:var(--bg-primary); border:1px solid var(--border);
            color:var(--text-primary); outline:none; transition:border-color .15s, box-shadow .15s;
          }
          .efi:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-light); }
          .efi::placeholder { color:var(--text-muted); }
          .efl { font-size:11.5px; font-weight:600; color:var(--text-muted);
            text-transform:uppercase; letter-spacing:.07em; margin-bottom:6px; display:block; }
          .efg { margin-bottom:18px; }
          .ef-cancel {
            display:flex; align-items:center; gap:6px; padding:8px 16px; border-radius:8px;
            font-size:13px; background:none; border:1px solid var(--border);
            color:var(--text-secondary); cursor:pointer; transition:all .15s;
          }
          .ef-cancel:hover { background:var(--bg-tertiary); }
          .ef-save {
            display:flex; align-items:center; gap:6px; padding:8px 20px; border-radius:8px;
            font-size:13px; font-weight:600; background:var(--accent); color:#fff;
            border:none; cursor:pointer; transition:background .15s; opacity:1;
          }
          .ef-save:hover { background:var(--accent-hover); }
          .ef-save:disabled { opacity:.65; cursor:not-allowed; }
        `}</style>

        {/* Header */}
        <div style={{ padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {/* Live icon preview */}
            <div style={{
              width:40, height:40, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center',
              background: form.color ? `${form.color}20` : 'var(--accent-light)',
              color: form.color || 'var(--accent)',
              border: `1px solid ${form.color ? `${form.color}30` : 'var(--border)'}`,
              transition:'all .2s',
            }}>
              {currentIcon
                ? <Ico d={currentIcon.d} s={18} />
                : <span style={{ fontSize:18 }}>{form.icon}</span>
              }
            </div>
            <div>
              <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:'var(--text-primary)' }}>Editar proyecto</h2>
              <p style={{ margin:'2px 0 0', fontSize:12, color:'var(--text-muted)' }}>{project.name}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'1px solid var(--border)', borderRadius:8, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)' }}>
            <Ico d={CLOSE} s={14} />
          </button>
        </div>

        <div style={{ height:1, background:'var(--border)', margin:'0 24px' }} />

        <form onSubmit={handleSubmit}>
          <div style={{ padding:'20px 24px' }}>

            <div className="efg">
              <label className="efl">Nombre del proyecto</label>
              <input className="efi" name="name" value={form.name} onChange={handleChange} required placeholder="Mi proyecto" autoFocus />
            </div>

            <div className="efg">
              <label className="efl">Descripción</label>
              <textarea className="efi" name="description" value={form.description} onChange={handleChange}
                placeholder="¿De qué trata este proyecto?" style={{ minHeight:76, resize:'none', lineHeight:1.55 }} />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:18 }}>
              <div>
                <label className="efl">Visibilidad</label>
                <select className="efi" name="visibility" value={form.visibility} onChange={handleChange}>
                  <option value="PRIVADO">Privado</option>
                  <option value="EQUIPO">Equipo</option>
                  <option value="PUBLICO">Público</option>
                </select>
              </div>
              <div>
                <label className="efl">Estado</label>
                <select className="efi" name="status" value={form.status} onChange={handleChange}>
                  <option value="ACTIVO">Activo</option>
                  <option value="PAUSADO">Pausado</option>
                  <option value="COMPLETADO">Completado</option>
                  <option value="ARCHIVADO">Archivado</option>
                </select>
              </div>
              <div>
                <label className="efl">Fecha límite</label>
                <input className="efi" type="date" name="endDate" value={form.endDate} onChange={handleChange} />
              </div>
            </div>

            <div className="efg">
              <label className="efl">Color</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {COLORS.map(c => (
                  <div key={c} onClick={() => setForm(p => ({...p, color:c}))}
                    style={{
                      width:26, height:26, borderRadius:'50%', background:c, cursor:'pointer',
                      outline: form.color === c ? `3px solid ${c}` : '3px solid transparent',
                      outlineOffset:2, transition:'all .15s',
                    }} />
                ))}
              </div>
            </div>

            <div className="efg" style={{ marginBottom:0 }}>
              <label className="efl">Ícono</label>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {ICONS.map(ic => (
                  <div key={ic.id} onClick={() => setForm(p => ({...p, icon:ic.id}))}
                    style={{
                      width:36, height:36, borderRadius:8, display:'flex', alignItems:'center',
                      justifyContent:'center', cursor:'pointer', transition:'all .15s',
                      color: form.icon === ic.id ? 'var(--accent)' : 'var(--text-muted)',
                      background: form.icon === ic.id ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                      border: form.icon === ic.id ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                    }}>
                    <Ico d={ic.d} s={16} />
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 13px', borderRadius:8,
                background:'var(--error-light)', color:'var(--error)', fontSize:12.5, marginTop:16 }}>
                <Ico d={WARN} s={14} /> {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, padding:'14px 24px',
            borderTop:'1px solid var(--border)', background:'var(--bg-primary)' }}>
            <button type="button" className="ef-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="ef-save" disabled={loading}>
              {loading
                ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation:'spin .8s linear infinite' }}><path d={SPIN}/></svg> Guardando...</>
                : <><Ico d={SAVE} s={13} /> Guardar cambios</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}