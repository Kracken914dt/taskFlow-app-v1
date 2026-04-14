import { useState } from 'react'
import api from '../../services/api.js'

// Drag Handle Icon
const DragIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
    <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
  </svg>
)

const PRIORITY_COLOR = {
  URGENTE: { bg:'#FEE2E2', color:'#991B1B', dot:'#EF4444', gradient:'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)' },
  ALTA:    { bg:'#FFEDD5', color:'#9A3412', dot:'#F97316', gradient:'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)' },
  MEDIA:   { bg:'#FEF3C7', color:'#92400E', dot:'#F59E0B', gradient:'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' },
  BAJA:    { bg:'#DBEAFE', color:'#1E40AF', dot:'#3B82F6', gradient:'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)' },
}

const TYPE_COLOR = {
  TASK:    '#3B82F6',
  BUG:     '#EF4444',
  FEATURE: '#8B5CF6',
  STORY:   '#F59E0B',
}

// SVG Icons for better visual quality
const TypeIcons = {
  BUG: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2l1.88 1.88M14.12 3.88L16 2M9 7.13v-1a3.003 3.003 0 116 0v1"/>
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 014-4h4a4 4 0 014 4v3c0 3.3-2.7 6-6 6"/>
      <path d="M12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M3 21c0-2.1 1.7-3.9 3.8-4M20.97 5c0 2.1-1.6 3.8-3.5 4M22 13h-4M17.2 17c2.1.1 3.8 1.9 3.8 4"/>
    </svg>
  ),
  FEATURE: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
    </svg>
  ),
  STORY: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 010-5H20"/>
    </svg>
  ),
  TASK: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  )
}

const MenuIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
  </svg>
)

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const CloneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
)

const DeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
)



const CalendarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const AlertIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

const ChecklistIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
  </svg>
)

export default function TaskCard({ task, columns, onMove, onDelete, onClone, onClick }) {
  const [showMenu, setShowMenu] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Drag and Drop handlers
  const handleDragStart = (e) => {
    setIsDragging(true)
    e.dataTransfer.setData('application/json', JSON.stringify({
      taskId: task._id,
      fromColumn: task.column
    }))
    e.dataTransfer.effectAllowed = 'move'
    // Add drag ghost image with slight transparency
    e.currentTarget.style.opacity = '0.5'
  }

  const handleDragEnd = (e) => {
    setIsDragging(false)
    e.currentTarget.style.opacity = '1'
  }

  const pStyle = PRIORITY_COLOR[task.priority] || PRIORITY_COLOR.MEDIA

  const subtaskDone  = task.subtasks?.filter(s => s.completed).length || 0
  const subtaskTotal = task.subtasks?.length || 0
  const progress     = subtaskTotal ? Math.round(subtaskDone / subtaskTotal * 100) : 0

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'

  const handleDelete = async e => {
    e.stopPropagation()
    if (!confirm('¿Eliminar esta tarea?')) return
    setDeleting(true)
    try {
      await api.delete(`/tasks/${task._id}`)
      onDelete(task._id, task.column)
    } catch(e) { console.error(e) }
    finally { setDeleting(false) }
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
     onClick={(e) => {
      if (isDragging) return
      onClick(task)
    }}
      style={{
        background:'var(--card-bg)',
        border: isOverdue ? '2px solid var(--error)' : '1px solid var(--border)',
        borderRadius:14,
        padding:0,
        cursor: isDragging ? 'grabbing' : 'grab',
        position:'relative',
        transition: isDragging ? 'none' : 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isDragging 
          ? '0 20px 40px rgba(0,0,0,0.2)' 
          : isOverdue 
            ? '0 0 0 3px rgba(239, 68, 68, 0.1), var(--shadow-sm)' 
            : 'var(--shadow-sm)',
        overflow:'hidden',
        opacity: isDragging ? 0.8 : 1,
        transform: isDragging ? 'scale(1.02) rotate(1deg)' : 'none',
      }}
      onMouseEnter={e => { 
        if (!isDragging) {
          e.currentTarget.style.boxShadow='0 8px 25px -5px rgba(0,0,0,0.1), 0 4px 10px -5px rgba(0,0,0,0.04)'; 
          e.currentTarget.style.transform='translateY(-3px)';
          e.currentTarget.style.borderColor = isOverdue ? 'var(--error)' : 'var(--primary)';
        }
      }}
      onMouseLeave={e => { 
        if (!isDragging) {
          e.currentTarget.style.boxShadow= isOverdue ? '0 0 0 3px rgba(239, 68, 68, 0.1), var(--shadow-sm)' : 'var(--shadow-sm)'; 
          e.currentTarget.style.transform='';
          e.currentTarget.style.borderColor = isOverdue ? 'var(--error)' : 'var(--border)';
        }
      }}
    >
      {/* Priority accent bar with drag indicator */}
      <div style={{
        height:4,
        background: pStyle.gradient,
        borderRadius:'14px 14px 0 0',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Drag indicator that shows on hover */}
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--bg-tertiary)',
          borderRadius: '0 0 6px 6px',
          padding: '2px 8px 4px',
          opacity: 0.7,
          transition: 'opacity 0.2s',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <DragIcon />
        </div>
      </div>

      <div style={{ padding:'12px 14px 14px' }}>
        {/* Type + Priority row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {/* Type Icon with background */}
            <div style={{
              width:28,
              height:28,
              borderRadius:8,
              background:'var(--bg-tertiary)',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              flexShrink:0,
            }}>
              {TypeIcons[task.type] || TypeIcons.TASK}
            </div>
            {/* Priority Badge */}
            <span style={{ 
              fontSize:10, 
              fontWeight:700, 
              background:pStyle.gradient, 
              color:pStyle.color,
              padding:'4px 10px', 
              borderRadius:6, 
              letterSpacing:'0.04em',
              textTransform:'uppercase',
              display:'flex',
              alignItems:'center',
              gap:5,
            }}>
              <span style={{
                width:6,
                height:6,
                borderRadius:'50%',
                background:pStyle.dot,
                boxShadow:`0 0 6px ${pStyle.dot}`,
              }} />
              {task.priority}
            </span>
          </div>
          {/* Actions menu */}
          <div style={{ position:'relative' }} onClick={e => e.stopPropagation()}>
            <button 
              style={{ 
                padding:'6px', 
                borderRadius:8,
                background: showMenu ? 'var(--bg-tertiary)' : 'transparent',
                border:'none',
                cursor:'pointer',
                color:'var(--text-muted)',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                transition:'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background='var(--bg-tertiary)'}
              onMouseLeave={e => e.currentTarget.style.background= showMenu ? 'var(--bg-tertiary)' : 'transparent'}
              onClick={() => setShowMenu(v => !v)}
            >
              <MenuIcon />
            </button>
            {showMenu && (
              <div style={{
                position:'absolute', 
                right:0, 
                top:'calc(100% + 4px)', 
                zIndex:200,
                background:'var(--card-bg)', 
                border:'1px solid var(--border)',
                borderRadius:12, 
                padding:6, 
                minWidth:180, 
                boxShadow:'0 10px 40px -10px rgba(0,0,0,0.2)',
                animation:'fadeIn 0.15s ease-out',
              }} onMouseLeave={() => setShowMenu(false)}>
                <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }`}</style>
                <button 
                  style={{ 
                    width:'100%', 
                    padding:'8px 12px',
                    borderRadius:8,
                    border:'none',
                    background:'transparent',
                    cursor:'pointer',
                    display:'flex',
                    alignItems:'center',
                    gap:10,
                    fontSize:13,
                    color:'var(--text-primary)',
                    transition:'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--bg-tertiary)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  onClick={() => { onClick(task); setShowMenu(false) }}
                >
                  <EditIcon /> Editar
                </button>
                
                <div style={{ height:1, background:'var(--border)', margin:'6px 0' }} />
                <button 
                  style={{ 
                    width:'100%', 
                    padding:'8px 12px',
                    borderRadius:8,
                    border:'none',
                    background:'transparent',
                    cursor:'pointer',
                    display:'flex',
                    alignItems:'center',
                    gap:10,
                    fontSize:13,
                    color:'var(--text-primary)',
                    transition:'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--bg-tertiary)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  onClick={() => { onClone(task); setShowMenu(false) }}
                >
                  <CloneIcon /> Clonar
                </button>
                <button 
                  style={{ 
                    width:'100%', 
                    padding:'8px 12px',
                    borderRadius:8,
                    border:'none',
                    background:'transparent',
                    cursor:'pointer',
                    display:'flex',
                    alignItems:'center',
                    gap:10,
                    fontSize:13,
                    color:'var(--error)',
                    transition:'background 0.15s',
                    opacity: deleting ? 0.5 : 1,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(239, 68, 68, 0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  onClick={handleDelete} 
                  disabled={deleting}
                >
                  <DeleteIcon /> {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <p style={{ 
          fontSize:14, 
          fontWeight:600, 
          color:'var(--text-primary)', 
          marginBottom:10, 
          lineHeight:1.5,
          overflow:'hidden', 
          display:'-webkit-box', 
          WebkitLineClamp:2, 
          WebkitBoxOrient:'vertical',
          letterSpacing:'-0.01em',
        }}>
          {task.title.replace(/^(TASK|BUG|FEATURE|STORY|TAREA|ERROR|HISTORIA|FUNCIONALIDAD)\s+/i, '')}
        </p>
          {/* Type badge */}
          <span style={{
          fontSize:10,
          fontWeight:600,
          padding:'4px 8px',
          borderRadius:6,
          background: `${TYPE_COLOR[task.type] || '#3B82F6'}15`,
          color: TYPE_COLOR[task.type] || '#3B82F6',
          border: `1px solid ${TYPE_COLOR[task.type] || '#3B82F6'}30`,
        }}>
          {task.type}
        </span>

        {/* Labels */}
        {task.labels?.filter(l => !['TASK','BUG','FEATURE','STORY','Tarea','Tarea'].includes(l.name)).length > 0 && (
  <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
    {task.labels.filter(l => !['TASK','BUG','FEATURE','STORY','Tarea','Error','Historia','Funcionalidad'].includes(l.name)).slice(0,3).map((l, i) => (
              <span key={i} style={{ 
                fontSize:10, 
                padding:'3px 8px', 
                borderRadius:6, 
                fontWeight:600,
                background:`${l.color}18`, 
                color:l.color, 
                border:`1px solid ${l.color}30`,
                letterSpacing:'0.02em',
              }}>
                {l.name}
              </span>
            ))}
            {task.labels.length > 3 && (
              <span style={{
                fontSize:10,
                padding:'3px 8px',
                borderRadius:6,
                fontWeight:600,
                background:'var(--bg-tertiary)',
                color:'var(--text-muted)',
              }}>
                +{task.labels.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Subtask progress */}
        {subtaskTotal > 0 && (
          <div style={{ 
            marginBottom:12,
            padding:'8px 10px',
            background:'var(--bg-secondary)',
            borderRadius:8,
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:11, color:'var(--text-muted)', marginBottom:6 }}>
              <span style={{ display:'flex', alignItems:'center', gap:5, fontWeight:500 }}>
                <ChecklistIcon />
                Subtareas
              </span>
              <span style={{ 
                fontWeight:700, 
                color: progress === 100 ? 'var(--success)' : 'var(--text-secondary)',
                fontSize:12,
              }}>
                {subtaskDone}/{subtaskTotal}
              </span>
            </div>
            <div style={{ height:5, borderRadius:3, background:'var(--bg-tertiary)', overflow:'hidden' }}>
              <div style={{ 
                width:`${progress}%`, 
                height:'100%', 
                borderRadius:3, 
                background: progress === 100 
                  ? 'linear-gradient(90deg, #10B981 0%, #34D399 100%)' 
                  : 'linear-gradient(90deg, var(--primary) 0%, var(--primary-light, var(--primary)) 100%)', 
                transition:'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: progress > 0 ? '0 0 8px rgba(16, 185, 129, 0.3)' : 'none',
              }} />
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ 
          display:'flex', 
          alignItems:'center', 
          justifyContent:'space-between', 
          fontSize:12, 
          color:'var(--text-muted)',
          paddingTop: subtaskTotal > 0 ? 0 : 4,
          borderTop: subtaskTotal > 0 ? 'none' : '1px solid var(--border)',
          marginTop: subtaskTotal > 0 ? 0 : 10,
          paddingTop: subtaskTotal > 0 ? 0 : 10,
        }}>
          {task.assignedTo ? (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ 
                width:24, 
                height:24, 
                borderRadius:8,
                background:'linear-gradient(135deg, var(--primary) 0%, #6366F1 100%)',
                color:'white',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                fontSize:11,
                fontWeight:700,
                textTransform:'uppercase',
                boxShadow:'0 2px 4px rgba(99, 102, 241, 0.3)',
              }}>
                {task.assignedTo.name?.[0]}
              </div>
              <span style={{ fontSize:12, fontWeight:500, color:'var(--text-secondary)' }}>
                {task.assignedTo.name?.split(' ')[0]}
              </span>
            </div>
          ) : <span />}

          {task.dueDate && (
            <span style={{ 
              display:'flex',
              alignItems:'center',
              gap:5,
              padding:'4px 8px',
              borderRadius:6,
              fontSize:11,
              fontWeight:500,
              background: isOverdue ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-tertiary)',
              color: isOverdue ? 'var(--error)' : 'var(--text-secondary)',
            }}>
              {isOverdue ? <AlertIcon /> : <CalendarIcon />}
              {new Date(task.dueDate).toLocaleDateString('es-CO', { month:'short', day:'numeric' })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
