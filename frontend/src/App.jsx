import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import LoginPage     from './components/auth/LoginPage.jsx'
import RegisterPage  from './components/auth/RegisterPage.jsx'
import DashboardPage from './components/dashboard/DashboardPage.jsx'
import ProjectPage   from './components/projects/ProjectPage.jsx'
import BoardPage     from './components/boards/BoardPage.jsx'
import Navbar        from './components/shared/Navbar.jsx'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--text-muted)', fontSize:14 }}>
      Cargando...
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { user } = useAuth()

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login"    element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />

        <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/projects/:id" element={<PrivateRoute><ProjectPage /></PrivateRoute>} />
        <Route path="/boards/:id"   element={<PrivateRoute><BoardPage /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
