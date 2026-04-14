# ⚡ TaskFlow — Gestión de Tareas

Plataforma web de gestión colaborativa de tareas y proyectos con tableros Kanban, desarrollada con **React + Vite**, **Express.js** y **MongoDB**, dockerizada con Docker Compose e implementando los **5 patrones de diseño creacionales** del GoF.

---

## 🏗️ Arquitectura

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│      Frontend        │     │       Backend        │     │     Base de Datos    │
│   React + Vite 5     │────▶│    Express.js 4      │────▶│     MongoDB 7.0      │
│   Puerto: 80 (Nginx) │     │    Puerto: 3000       │     │    Puerto: 27017     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
         Docker                     Docker                       Docker
```

**Stack tecnológico:**
- Frontend: React 18, React Router 6, Axios, Vite 5 (servido con Nginx)
- Backend: Node.js 20, Express 4, Mongoose 8, JWT, bcryptjs
- Base de datos: MongoDB 7.0
- Infraestructura: Docker + Docker Compose

---

## 🎨 Patrones de Diseño Creacionales

### 1. 🔷 Singleton — Conexión a MongoDB

**Archivo:** `backend/src/config/database.js`

**Problema:** Si cada módulo creara su propia conexión a MongoDB, se abrirían múltiples conexiones, desperdiciando recursos del servidor y generando inconsistencias.

**Solución:** La clase `DatabaseConnection` tiene un constructor privado que lanza error si se intenta instanciar directamente. El único punto de acceso es `DatabaseConnection.getInstance()`, que crea la instancia la primera vez y la reutiliza en todas las llamadas siguientes.

```javascript
class DatabaseConnection {
  static getInstance() {
    if (!DatabaseConnection._instance) {
      DatabaseConnection._instance = new DatabaseConnection();
    }
    return DatabaseConnection._instance;
  }

  async connect(uri) {
    if (this._isConnected) return this._connection; // Reutiliza
    this._connection = await mongoose.connect(uri);
    this._isConnected = true;
    return this._connection;
  }
}
```

**Uso en `server.js`:**
```javascript
const db  = DatabaseConnection.getInstance(); // Crea instancia
await db.connect(process.env.MONGO_URI);
const db2 = DatabaseConnection.getInstance(); // Reutiliza
console.log(db === db2); // → true ✅
```

**Verificación en consola al iniciar:**
```
🔧 [Singleton] Nueva instancia de DatabaseConnection creada
✅ [Singleton] MongoDB conectado: mongo
♻️  [Singleton] Reutilizando instancia existente de DatabaseConnection
🔍 [Singleton] ¿Misma instancia? true
```

---

### 2. 🏭 Factory Method — Creación de Tareas por Tipo

**Archivo:** `backend/src/patterns/TaskFactory.js`

**Problema:** Crear tareas de distintos tipos (BUG, FEATURE, STORY, TASK) implica valores por defecto diferentes: prioridad inicial, etiquetas, colores. Manejar esto con condicionales ensucia el código.

**Solución:** Se define una clase abstracta `TaskCreator` con el factory method `createTask()`. Cada subclase concreta lo implementa con los valores predeterminados de su tipo. El método `create()` actúa como Template Method que orquesta el proceso.

```
TaskCreator (abstracta)
    ├── BugTaskCreator      → type: BUG,     prioridad ALTA,  etiqueta roja
    ├── FeatureTaskCreator  → type: FEATURE,  prioridad MEDIA, etiqueta morada
    ├── StoryTaskCreator    → type: STORY,    prioridad MEDIA, etiqueta naranja
    └── GeneralTaskCreator  → type: TASK,     prioridad BAJA,  etiqueta azul
```

```javascript
class BugTaskCreator extends TaskCreator {
  createTask(data) {
    return {
      ...data,
      type: 'BUG',
      priority: data.priority || 'ALTA',
      labels: [{ name: 'Bug', color: '#EF4444' }, ...data.labels || []]
    };
  }
}

// Uso en el endpoint POST /api/tasks:
const creator = getTaskCreator('BUG'); // → BugTaskCreator
const task    = creator.create(data);  // → tarea con defaults de Bug
```

**Endpoint:** `POST /api/tasks` con campo `type` en el body.

---

### 3. 🔨 Builder — Creación Avanzada de Proyectos

**Archivo:** `backend/src/patterns/ProjectBuilder.js`

**Problema:** Un proyecto tiene muchos campos opcionales: color, ícono, visibilidad, miembros, columnas iniciales, fechas, tags. Un constructor con todos esos parámetros es confuso y propenso a errores de orden.

**Solución:** La clase `ProjectBuilder` expone métodos encadenables (`setName()`, `setColor()`, `addTag()`, etc.). El método `build()` valida y retorna el objeto final. El `ProjectDirector` encapsula configuraciones predefinidas (Scrum, Marketing, Personal).

```javascript
// Uso directo del Builder (proyecto personalizado):
const project = new ProjectBuilder()
  .setName('Mi App')
  .setDescription('Descripción del proyecto')
  .setColor('#6366F1')
  .setVisibility('EQUIPO')
  .addTag('backend')
  .addTag('api')
  .setEndDate('2025-12-31')
  .setCreatedBy(userId)
  .build();

// Uso con Director (plantillas predefinidas):
// POST /api/projects/template/scrum
ProjectDirector.buildScrumProject(builder, { name, description, createdBy });
// → Columnas: BACKLOG, EN PROGRESO, EN REVISIÓN, TESTING, HECHO
```

**Endpoints:**
- `POST /api/projects` → Builder fluido (proyecto personalizado)
- `POST /api/projects/template/:type` → Builder + Director (`scrum`, `marketing`, `personal`)

---

### 4. 📋 Prototype — Clonación de Tableros y Tareas

**Archivo:** `backend/src/patterns/Prototype.js`

**Problema:** Copiar un tablero o una tarea existente requiere conocer todos sus campos y replicarlos manualmente. Si el modelo cambia, hay que actualizar la lógica de copia en múltiples lugares.

**Solución:** Cada entidad clonable implementa el método `clone()` que sabe exactamente cómo copiarse a sí misma, reseteando los campos que no deben heredarse (IDs, fechas, asignaciones, comentarios).

```
Cloneable (abstracta)
    ├── BoardPrototype  → Clona tablero con sus columnas (sin tareas)
    └── TaskPrototype   → Clona tarea con subtareas (sin comentarios ni asignación)
```

```javascript
// Clonar tablero (POST /api/boards/:id/clone):
const prototype = new BoardPrototype(originalBoard);
const cloned    = prototype.clone({ name: 'Nuevo nombre', createdBy: userId });
// → Nuevo tablero con mismas columnas, sin tareas

// Clonar tarea (POST /api/tasks/:id/clone):
const prototype = new TaskPrototype(originalTask);
const cloned    = prototype.clone({ title: 'Copia de...', createdBy: userId });
// → Nueva tarea, status reseteado a TODO, sin comentarios
```

**Botones en la UI:** "📋 Clonar" disponible en cada tablero y en el menú contextual de cada tarjeta.

---

### 5. 🏢 Abstract Factory — Temas Visuales (Light / Dark)

**Archivo:** `frontend/src/patterns/ThemeFactory.js`

**Problema:** La aplicación soporta tema claro y oscuro. Cada tema necesita una familia coherente de colores, sombras y estilos de componentes. Cambiar el tema implica reemplazar toda esa familia de forma consistente.

**Solución:** Se define una fábrica abstracta `ThemeFactory` con métodos `createColors()`, `createShadows()` y `createComponents()`. Dos fábricas concretas (`LightThemeFactory` y `DarkThemeFactory`) producen familias compatibles. El `ThemeContext` consume la fábrica sin conocer su implementación.

```
ThemeFactory (abstracta)
    ├── LightThemeFactory  → Fondos blancos, sombras suaves, textos oscuros
    └── DarkThemeFactory   → Fondos #0F172A, sombras profundas, textos claros

Cada factory produce:
    createColors()     → paleta completa (bgPrimary, textPrimary, accent, etc.)
    createShadows()    → sm, md, lg, xl
    createComponents() → navbar, sidebar, card, input, button
```

```javascript
// ThemeContext.jsx:
const factory = getThemeFactory('dark');  // DarkThemeFactory
const theme   = factory.buildTheme();     // Ensambla colors + shadows + components

// Aplica como variables CSS en :root → todos los componentes las usan automáticamente
root.style.setProperty('--bg-primary', theme.colors.bgPrimary);
```

**Toggle en Navbar:** El botón 🌙/☀️ llama a `toggleTheme()`, que cambia la fábrica activa y re-aplica todas las variables CSS instantáneamente.

---

## 📂 Estructura del Proyecto

```
taskflow/
├── docker-compose.yml
├── .gitignore
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── server.js                    # Entrada, inicializa Singleton
│       ├── config/
│       │   └── database.js              # 🔷 PATRÓN SINGLETON
│       ├── patterns/
│       │   ├── TaskFactory.js           # 🏭 PATRÓN FACTORY METHOD
│       │   ├── ProjectBuilder.js        # 🔨 PATRÓN BUILDER
│       │   └── Prototype.js             # 📋 PATRÓN PROTOTYPE
│       ├── models/
│       │   ├── User.js
│       │   ├── Project.js
│       │   ├── Board.js
│       │   └── Task.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── projectController.js     # Usa Builder + Director
│       │   ├── boardController.js       # Usa Prototype (clonar tablero)
│       │   └── taskController.js        # Usa Factory Method + Prototype
│       ├── middleware/
│       │   └── auth.js                  # JWT middleware
│       └── routes/
│           └── index.js
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── patterns/
        │   └── ThemeFactory.js          # 🏢 PATRÓN ABSTRACT FACTORY
        ├── context/
        │   ├── ThemeContext.jsx          # Consume Abstract Factory
        │   └── AuthContext.jsx
        ├── services/
        │   └── api.js
        └── components/
            ├── shared/Navbar.jsx         # Toggle de tema
            ├── auth/
            │   ├── LoginPage.jsx
            │   └── RegisterPage.jsx
            ├── dashboard/DashboardPage.jsx
            ├── projects/
            │   ├── ProjectPage.jsx
            │   └── NewProjectModal.jsx   # UI del Builder + Director
            ├── boards/BoardPage.jsx      # Vista Kanban + clonar tablero
            └── tasks/
                ├── TaskCard.jsx          # Tarjeta Kanban + clonar tarea
                └── TaskModal.jsx         # UI del Factory Method
```

---

## 🔌 API REST — Endpoints

### Autenticación (`/api/auth`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/register` | Registrar usuario |
| POST | `/login` | Iniciar sesión (retorna JWT) |
| GET  | `/me` | Perfil del usuario autenticado |
| PUT  | `/profile` | Actualizar perfil |
| GET  | `/users` | Listar usuarios activos |

### Proyectos (`/api/projects`)
| Método | Ruta | Descripción | Patrón |
|--------|------|-------------|--------|
| GET  | `/` | Listar proyectos del usuario | |
| POST | `/` | Crear proyecto personalizado | **Builder** |
| POST | `/template/:type` | Crear desde plantilla | **Builder + Director** |
| GET  | `/:id` | Detalle + tableros + stats | |
| PUT  | `/:id` | Actualizar proyecto | |
| DELETE | `/:id` | Eliminar proyecto | |
| POST | `/:id/members` | Agregar miembro | |

### Tableros (`/api/boards`)
| Método | Ruta | Descripción | Patrón |
|--------|------|-------------|--------|
| GET  | `/project/:projectId` | Tableros del proyecto | |
| POST | `/` | Crear tablero | |
| GET  | `/:id` | Tablero con tareas agrupadas | |
| PUT  | `/:id` | Actualizar tablero | |
| DELETE | `/:id` | Eliminar tablero | |
| POST | `/:id/clone` | Clonar tablero con columnas | **Prototype** |
| POST | `/:id/columns` | Agregar columna | |
| DELETE | `/:id/columns/:columnId` | Eliminar columna | |

### Tareas (`/api/tasks`)
| Método | Ruta | Descripción | Patrón |
|--------|------|-------------|--------|
| POST | `/` | Crear tarea según tipo | **Factory Method** |
| GET  | `/board/:boardId` | Tareas con filtros | |
| GET  | `/:id` | Detalle de tarea | |
| PUT  | `/:id` | Actualizar tarea | |
| PUT  | `/:id/move` | Mover entre columnas | |
| DELETE | `/:id` | Eliminar tarea | |
| POST | `/:id/clone` | Clonar tarea | **Prototype** |
| POST | `/:id/subtasks` | Agregar subtarea | |
| PUT  | `/:id/subtasks/:subtaskId` | Completar/reabrir subtarea | |
| POST | `/:id/comments` | Agregar comentario | |

---

## 🐳 Instalación y Ejecución

### Requisitos previos
- Docker Desktop instalado y corriendo
- Git

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd taskflow

# 2. Construir y levantar los contenedores
docker-compose up --build

# 3. Abrir la aplicación
# Frontend: http://localhost
# API:      http://localhost:3000/api/health
```

### Desarrollo local (sin Docker)

```bash
# Backend
cd backend
cp .env.example .env      # Ajustar MONGO_URI a localhost
npm install
npm run dev               # Puerto 3000

# Frontend (nueva terminal)
cd frontend
npm install
npm run dev               # Puerto 5173
```

---

## 📊 Resumen de Patrones Creacionales

| Patrón | Archivo | Aplicación en TaskFlow |
|--------|---------|----------------------|
| **Singleton** | `backend/config/database.js` | Una sola conexión a MongoDB en toda la app |
| **Factory Method** | `backend/patterns/TaskFactory.js` | Crea tareas con valores por defecto según tipo (BUG, FEATURE, STORY, TASK) |
| **Builder** | `backend/patterns/ProjectBuilder.js` | Construye proyectos complejos paso a paso; Director para plantillas Scrum/Marketing/Personal |
| **Prototype** | `backend/patterns/Prototype.js` | Clona tableros (con columnas) y tareas (con subtareas), reseteando campos no heredables |
| **Abstract Factory** | `frontend/patterns/ThemeFactory.js` | Produce familias coherentes de colores, sombras y estilos para temas claro y oscuro |

---

*Proyecto desarrollado para la asignatura **Patrones de Diseño de Software** — Especialización en Ingeniería de Software, Universidad Popular del Cesar.*
