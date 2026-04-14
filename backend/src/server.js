require('dotenv').config();
const express = require('express');
const cors = require('cors');
const DatabaseConnection = require('./config/database');
const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'TaskFlow API',
    timestamp: new Date().toISOString(),
    patterns: ['Singleton', 'Factory Method', 'Builder', 'Prototype', 'Abstract Factory'],
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ message: `Ruta no encontrada: ${req.originalUrl}` });
});

// ── Error handler ──────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor' });
});

// ── Inicialización con Singleton ──────────────────────────────────────────────
const start = async () => {
  try {
    // PATRÓN SINGLETON — Una sola conexión a MongoDB durante todo el ciclo de vida
    const db = DatabaseConnection.getInstance();
    await db.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/taskflow');

    // Verificar que es la misma instancia
    const db2 = DatabaseConnection.getInstance();
    console.log(`🔍 [Singleton] ¿Misma instancia? ${db === db2}`);

    app.listen(PORT, () => {
      console.log(`🚀 TaskFlow API corriendo en http://localhost:${PORT}`);
      console.log(`📋 Patrones activos: Singleton ✅ | Factory Method ✅ | Builder ✅ | Prototype ✅`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

start();
