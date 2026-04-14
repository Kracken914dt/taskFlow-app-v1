import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const ROLES = ['DEVELOPER','DESIGNER','MANAGER','TESTER','ADMIN']

export default function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm]     = useState({ name:'', email:'', password:'', role:'DEVELOPER' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.role)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg-primary)', padding:16
    }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>⚡</div>
          <h1 style={{ fontSize:26, fontWeight:700, color:'var(--text-primary)' }}>Crear cuenta</h1>
          <p style={{ color:'var(--text-secondary)', marginTop:4, fontSize:14 }}>
            Únete a TaskFlow y gestiona tus proyectos
          </p>
        </div>

        <div className="card" style={{ padding:28 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre completo</label>
              <input className="input" name="name" placeholder="Juan Pérez" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Correo electrónico</label>
              <input className="input" type="email" name="email" placeholder="tu@email.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Contraseña</label>
                <input className="input" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select className="select" name="role" value={form.role} onChange={handleChange}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {error && <p className="error-msg" style={{ marginBottom:12 }}>{error}</p>}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width:'100%', justifyContent:'center', padding:'10px' }}>
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--text-secondary)' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color:'var(--accent)', fontWeight:600 }}>Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
