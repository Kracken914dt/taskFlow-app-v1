import { useState } from 'react'
import api from '../../services/api.js'

const COLORS = ['#2563EB','#EF4444','#F59E0B','#10B981','#8B5CF6','#EC4899','#14B8A6','#F97316']

const ICONS = [
  { id:'board',   d:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
  { id:'rocket',  d:'M4.5 16.5c-1.5 1.5-1.5 4 0 4s2.5-1.5 4-3L4.5 16.5zM19 3s-4 0-7 3L5 14l5 5 8-7c3-3 3-7 3-7zM12 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4z' },
  { id:'bulb',    d:'M9 21h6M12 3a6 6 0 0 1 6 6c0 2.2-1.2 4.1-3 5.2V17H9v-2.8C7.2 13.1 6 11.2 6 9a6 6 0 0 1 6-6z' },
  { id:'target',  d:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
  { id:'wrench',  d:'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' },
  { id:'brush',   d:'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L3 14.67V21h6.33l10.06-10.06a5.5 5.5 0 0 0 0-7.78zM9 21H5v-4l.88-.88M18 9l-3-3' },
  { id:'chart',   d:'M18 20V10M12 20V4M6 20v-6' },
  { id:'trophy',  d:'M6 9H4a2 2 0 0 1-2-2V5h4M18 9h2a2 2 0 0 0 2-2V5h-4M12 17v4M8 21h8M7 4h10v5a5 5 0 0 1-10 0V4z' },
  { id:'zap',     d:'M13 2 3 14h9l-1 8 10-12h-9l1-8z' },
  { id:'star',    d:'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
]

const TEMPLATES = [
  { id:'custom',    label:'Personalizado', icon:'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z', desc:'Configura desde cero' },
  { id:'scrum',     label:'Scrum',         icon:'M13 2 3 14h9l-1 8 10-12h-9l1-8z',                                  desc:'Columnas Scrum estándar' },
  { id:'marketing', label:'Marketing',     icon:'M22 12h-4l-3 9L9 3l-3 9H2',                                        desc:'Flujo de campaña' },
  { id:'personal',  label:'Personal',      icon:'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', desc:'Proyecto simple' },
]

const SvgIcon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

export default function NewProjectModal({ onClose, onCreated }) {
  const [step, setStep]             = useState('template')
  const [template, setTemplate]     = useState(null)
  const [form, setForm]             = useState({ name:'', description:'', color:'#2563EB', icon:'board', visibility:'PRIVADO', endDate:'' })
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      let data
      if (template && template !== 'custom') {
        const res = await api.post(`/projects/template/${template}`, { name:form.name, description:form.description, endDate:form.endDate||undefined })
        data = res.data
      } else {
        const res = await api.post('/projects', form)
        data = res.data
      }
      onCreated(data.project)
    } catch(err) {
      setError(err.response?.data?.message || 'Error al crear el proyecto')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background:'var(--bg-secondary)', borderRadius:16, width:'100%', maxWidth:500,
        border:'1px solid var(--border)', overflow:'hidden', boxShadow:'var(--shadow-lg)'
      }}>
        <style>{`
          .nfi { width:100%; padding:10px 14px; border-radius:9px; font-size:13.5px;
            background:var(--bg-primary); border:1px solid var(--border);
            color:var(--text-primary); outline:none; transition:border-color .15s, box-shadow .15s; }
          .nfi:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-light); }
          .nfi::placeholder { color:var(--text-muted); }
          .nfl { font-size:12px; font-weight:600; color:var(--text-muted);
            text-transform:uppercase; letter-spacing:.06em; margin-bottom:6px; display:block; }
          .nfg { margin-bottom:16px; }
          .tpl-card { padding:14px; border-radius:10px; cursor:pointer; transition:all .15s;
            border:1px solid var(--border); background:var(--bg-primary); }
          .tpl-card:hover { border-color:var(--accent); background:var(--accent-light); }
          .tpl-card.active { border-color:var(--accent); background:var(--accent-light); }
        `}</style>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px 0' }}>
          <div>
            <h2 style={{ fontSize:17, fontWeight:700, color:'var(--text-primary)', margin:0 }}>
              {step === 'template' ? 'Nuevo proyecto' : 'Configurar proyecto'}
            </h2>
            <p style={{ fontSize:12, color:'var(--text-muted)', margin:'3px 0 0' }}>
              {step === 'template' ? 'Elige una plantilla para comenzar' : `Plantilla: ${TEMPLATES.find(t=>t.id===template)?.label}`}
            </p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'1px solid var(--border)', borderRadius:8, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)' }}>
            <SvgIcon d="M18 6 6 18M6 6l12 12" />
          </button>
        </div>

        <div style={{ width:'calc(100% - 48px)', height:1, background:'var(--border)', margin:'16px 24px 0' }} />

        {/* Step: template */}
        {step === 'template' ? (
          <div style={{ padding:'20px 24px 24px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {TEMPLATES.map(t => (
                <div key={t.id} className={`tpl-card${template===t.id?' active':''}`}
                  onClick={() => { setTemplate(t.id); setStep('form') }}>
                  <div style={{ width:34, height:34, borderRadius:8, background: template===t.id ? 'var(--accent)' : 'var(--bg-tertiary)',
                    display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10,
                    color: template===t.id ? '#fff' : 'var(--text-muted)', transition:'all .15s' }}>
                    <SvgIcon d={t.icon} size={16} />
                  </div>
                  <p style={{ margin:0, fontSize:13.5, fontWeight:600, color:'var(--text-primary)' }}>{t.label}</p>
                  <p style={{ margin:'3px 0 0', fontSize:11.5, color:'var(--text-muted)' }}>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ padding:'20px 24px' }}>
              <div className="nfg">
                <label className="nfl">Nombre del proyecto</label>
                <input className="nfi" name="name" value={form.name} onChange={handleChange}
                  required placeholder="Mi proyecto" autoFocus />
              </div>

              <div className="nfg">
                <label className="nfl">Descripción</label>
                <textarea className="nfi" name="description" value={form.description} onChange={handleChange}
                  placeholder="¿De qué trata este proyecto?" style={{ minHeight:76, resize:'none', lineHeight:1.5 }} />
              </div>

              {template === 'custom' && (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
                    <div>
                      <label className="nfl">Visibilidad</label>
                      <select className="nfi" name="visibility" value={form.visibility} onChange={handleChange}>
                        <option value="PRIVADO">Privado</option>
                        <option value="EQUIPO">Equipo</option>
                        <option value="PUBLICO">Público</option>
                      </select>
                    </div>
                    <div>
                      <label className="nfl">Fecha límite</label>
                      <input className="nfi" type="date" name="endDate" value={form.endDate} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="nfg">
                    <label className="nfl">Color</label>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {COLORS.map(c => (
                        <div key={c} onClick={() => setForm(p => ({...p, color:c}))}
                          style={{ width:26, height:26, borderRadius:'50%', background:c, cursor:'pointer',
                            outline: form.color===c ? `3px solid ${c}` : '3px solid transparent',
                            outlineOffset:2, transition:'all .15s' }} />
                      ))}
                    </div>
                  </div>

                  <div className="nfg">
                    <label className="nfl">Ícono</label>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {ICONS.map(ic => (
                        <div key={ic.id} onClick={() => setForm(p => ({...p, icon:ic.id}))}
                          style={{ width:36, height:36, borderRadius:8, display:'flex', alignItems:'center',
                            justifyContent:'center', cursor:'pointer', transition:'all .15s',
                            color: form.icon===ic.id ? 'var(--accent)' : 'var(--text-muted)',
                            background: form.icon===ic.id ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                            border: form.icon===ic.id ? '1.5px solid var(--accent)' : '1px solid var(--border)' }}>
                          <SvgIcon d={ic.d} size={16} />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {template !== 'custom' && (
                <div className="nfg">
                  <label className="nfl">Fecha límite (opcional)</label>
                  <input className="nfi" type="date" name="endDate" value={form.endDate} onChange={handleChange} />
                </div>
              )}

              {error && (
                <div style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 13px', borderRadius:8,
                  background:'var(--error-light)', color:'var(--error)', fontSize:12.5, marginBottom:4 }}>
                  <SvgIcon d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4M12 16h.01" size={14} />
                  {error}
                </div>
              )}
            </div>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'14px 24px', borderTop:'1px solid var(--border)', background:'var(--bg-primary)' }}>
              <button type="button" onClick={() => setStep('template')}
                style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'1px solid var(--border)',
                  borderRadius:8, padding:'8px 14px', fontSize:13, color:'var(--text-secondary)', cursor:'pointer' }}>
                <SvgIcon d="M19 12H5M12 5l-7 7 7 7" size={13} /> Atrás
              </button>
              <button type="submit" disabled={loading}
                style={{ display:'flex', alignItems:'center', gap:6, background:'var(--accent)', border:'none',
                  borderRadius:8, padding:'8px 20px', fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer', opacity: loading ? .7 : 1 }}>
                {loading
                  ? <><SvgIcon d="M21 12a9 9 0 1 1-6.219-8.56" size={13} /> Creando...</>
                  : <><SvgIcon d="M20 6 9 17l-5-5" size={13} /> Crear proyecto</>
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}