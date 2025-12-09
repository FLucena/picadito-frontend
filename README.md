# ⚽ Picadito Frontend

Frontend moderno desarrollado con React y TypeScript para el sistema de gestión de partidos de fútbol. Interfaz intuitiva y responsive para organizar partidos, gestionar inscripciones y ver historial.

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Arquitectura](#-arquitectura)
- [Páginas Principales](#-páginas-principales)
- [Componentes](#-componentes)
- [Hooks Personalizados](#-hooks-personalizados)
- [Prácticas de Desarrollo](#-prácticas-de-desarrollo)
- [Testing](#-testing)
- [Configuración](#-configuración)

## 🚀 Características Principales

### Funcionalidades Principales

- ✅ **Listado de Partidos**: Ver todos los partidos o solo disponibles
- ✅ **Búsqueda Avanzada**: Filtrar por título, ubicación, fecha, estado, jugadores
- ✅ **Gestión de Partidos**: Crear, editar y eliminar partidos
- ✅ **Múltiples Categorías**: Asignar múltiples categorías a cada partido
- ✅ **Validación de Jugadores**: Solo se permiten partidos con número par de jugadores (10, 12, 14, 16, 18, 20, 22)
- ✅ **Gestión de Sedes**: Crear, editar y eliminar sedes (lugares donde se juegan los partidos)
- ✅ **Detalles de Partido**: Ver información completa, participantes y visualización de cancha
- ✅ **Formaciones Dinámicas**: Las formaciones se generan automáticamente según el número de jugadores
- ✅ **Sistema de Partidos Seleccionados**: Agregar partidos a una lista temporal antes de confirmar
- ✅ **Selección Múltiple**: Seleccionar uno o más partidos para confirmar
- ✅ **Validación de Partidos Completos**: Solo se pueden confirmar partidos que tengan todos los jugadores necesarios
- ✅ **Reservas**: Confirmar múltiples reservas a partidos a la vez
- ✅ **Historial de Reservas**: Ver todas las reservas confirmadas con detalles
- ✅ **Gestión de Participantes**: Inscribirse y desinscribirse de partidos
- ✅ **Precios y Costos**: Visualización de precios por partido y cálculo de costo por jugador
- ✅ **Validación de Formularios**: Validación en tiempo real con Zod
- ✅ **Notificaciones Toast**: Feedback visual para todas las acciones
- ✅ **Estados de Carga**: Skeletons y spinners durante las peticiones
- ✅ **Manejo de Errores**: Mensajes claros y acciones sugeridas

### Mejoras de UX

- ✅ **Breadcrumbs**: Navegación contextual en páginas de detalle
- ✅ **Estados Vacíos**: Mensajes informativos con acciones sugeridas
- ✅ **Confirmaciones**: Modales profesionales para acciones destructivas
- ✅ **Indicadores Visuales**: Badges, contadores y alertas
- ✅ **Tiempo Relativo**: Muestra "en 3 días" junto a las fechas
- ✅ **Indicadores de Urgencia**: Alerta cuando quedan pocos cupos
- ✅ **Atajos de Teclado**: ESC para cerrar modales
- ✅ **Diseño Responsive**: Mobile-first, adaptable a todos los dispositivos

## 🔧 Tecnologías Utilizadas

- **React 19** con TypeScript - Biblioteca UI y tipado estático
- **Vite** - Build tool rápido y moderno
- **Tailwind CSS** - Framework de estilos utility-first
- **React Query** - Gestión de estado del servidor y cache
- **React Hook Form** - Manejo de formularios performante
- **Zod** - Validación de esquemas type-safe
- **Axios** - Cliente HTTP para peticiones API
- **date-fns** - Utilidades para formateo de fechas
- **Lucide React** - Iconos modernos y ligeros
- **Vitest** - Framework de testing rápido
- **React Testing Library** - Testing de componentes

## 📋 Requisitos

- **Node.js 18+**
- **npm** o **yarn**

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install
```

## ⚙️ Configuración

### Desarrollo

El frontend está configurado para conectarse automáticamente al backend en `http://localhost:8080` mediante un proxy de Vite.

El archivo `vite.config.ts` ya está configurado con un proxy para `/api` que redirige a `http://localhost:8080` en modo desarrollo.

### Producción

Para producción, es **necesario** configurar la variable de entorno `VITE_API_URL` con la URL completa del backend.

#### Opción 1: Archivo `.env.production`

Crea un archivo `.env.production` en la raíz del proyecto:

```env
VITE_API_URL=https://api.tudominio.com/api
```

#### Opción 2: Variable de entorno del sistema

Configura la variable de entorno antes del build:

```bash
# Linux/Mac
export VITE_API_URL=https://api.tudominio.com/api
npm run build

# Windows (CMD)
set VITE_API_URL=https://api.tudominio.com/api
npm run build

# Windows (PowerShell)
$env:VITE_API_URL="https://api.tudominio.com/api"
npm run build
```

#### Opción 3: Sin configuración (mismo dominio)

Si el frontend y backend están en el mismo dominio, el frontend usará `/api` como ruta relativa.

**Nota importante**: Si no configuras `VITE_API_URL` en producción, el frontend intentará usar `/api` como ruta relativa, lo que solo funcionará si el backend está en el mismo dominio.

## 🚀 Ejecución

### Modo Desarrollo

```bash
npm run dev
```

La aplicación se ejecutará en `http://localhost:5173` (o el puerto disponible)

### Build para Producción

```bash
# Asegúrate de configurar VITE_API_URL antes del build (ver sección Configuración)
npm run build
```

El build generará los archivos optimizados en la carpeta `dist/`, listos para desplegar en cualquier servidor web estático (Nginx, Apache, Vercel, Netlify, etc.).

**Archivos generados:**
- `dist/index.html` - Punto de entrada
- `dist/assets/` - JavaScript, CSS y otros recursos optimizados

### Preview del Build

Para probar el build localmente antes de desplegar:

```bash
npm run preview
```

Esto iniciará un servidor local que sirve los archivos de `dist/` en `http://localhost:4173`.

## 🚀 Despliegue en Producción

### Requisitos Previos

1. **Backend configurado**: El backend debe estar desplegado y accesible
2. **CORS configurado**: El backend debe permitir peticiones desde el dominio del frontend
3. **Variable de entorno**: Configurar `VITE_API_URL` con la URL del backend

### Pasos para Desplegar

1. **Configurar la URL del backend**:
   ```bash
   # Crear archivo .env.production
   echo "VITE_API_URL=https://api.tudominio.com/api" > .env.production
   ```

2. **Generar el build**:
   ```bash
   npm run build
   ```

3. **Desplegar la carpeta `dist/`**:
   - **Vercel/Netlify**: Conecta tu repositorio y configura el build command como `npm run build` y el output directory como `dist`
   - **Servidor propio**: Sube el contenido de `dist/` a tu servidor web (Nginx, Apache, etc.)
   - **CDN**: Sube los archivos a tu CDN (Cloudflare, AWS CloudFront, etc.)

### Configuración del Servidor Web

#### Nginx

```nginx
server {
    listen 80;
    server_name tudominio.com;
    root /ruta/a/dist;
    index index.html;

    # SPA routing - redirigir todas las rutas a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets estáticos
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Apache (.htaccess)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Verificación Post-Despliegue

1. Abre la aplicación en el navegador
2. Abre las herramientas de desarrollador (F12)
3. Verifica en la consola que no haya errores de conexión
4. Verifica en la pestaña Network que las peticiones al backend se realicen correctamente

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes UI base
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── ConfirmModal.tsx
│   │   ├── Breadcrumbs.tsx
│   │   ├── EmptyState.tsx
│   │   └── LoadingSkeleton.tsx
│   ├── PartidoCard.tsx
│   ├── PartidoForm.tsx
│   ├── ParticipanteForm.tsx
│   ├── ParticipanteList.tsx
│   ├── CanchaVisualization.tsx
│   └── BusquedaPartidos.tsx
├── pages/              # Páginas principales
│   ├── MenuPrincipalPage.tsx
│   ├── VerPartidosPage.tsx
│   ├── CreatePartidoPage.tsx
│   ├── PartidoDetailPage.tsx
│   ├── MisPartidosPage.tsx
│   ├── HistorialInscripcionesPage.tsx
│   └── GestionarSedesPage.tsx
├── hooks/              # Custom hooks
│   ├── usePartidos.ts
│   ├── useParticipantes.ts
│   ├── usePartidosGuardados.ts
│   ├── useInscripciones.ts
│   └── useSedes.ts
├── services/           # Servicios API
│   └── api.ts
├── types/              # Definiciones TypeScript
│   └── index.ts
├── utils/              # Utilidades
│   ├── formatters.ts
│   ├── validators.ts
│   ├── toast.ts
│   └── generateRandomPartidos.ts
├── test/               # Utilidades de testing
│   ├── setup.ts
│   └── testUtils.tsx
├── App.tsx             # Componente principal
└── main.tsx            # Punto de entrada
```

## 🏗️ Arquitectura

### Patrón de Arquitectura

El proyecto sigue una **arquitectura modular** con separación clara de responsabilidades:

1. **Presentation Layer** (`pages/`, `components/`)
   - Componentes React que renderizan la UI
   - Páginas que componen la aplicación
   - Componentes reutilizables

2. **Business Logic Layer** (`hooks/`)
   - Custom hooks que encapsulan lógica de negocio
   - Integración con React Query para estado del servidor
   - Lógica de estado local compleja

3. **Data Access Layer** (`services/`)
   - Cliente HTTP (Axios)
   - Configuración de interceptores
   - Mapeo de respuestas API

4. **Domain Layer** (`types/`)
   - Definiciones TypeScript
   - Tipos de datos compartidos
   - Interfaces y tipos

5. **Utility Layer** (`utils/`)
   - Funciones de formateo
   - Validadores
   - Utilidades generales

### Principios de Diseño Aplicados

- **Component-Based Architecture**: Componentes reutilizables y modulares
- **Custom Hooks Pattern**: Lógica reutilizable encapsulada en hooks
- **Separation of Concerns**: Separación clara entre UI, lógica y datos
- **Type Safety**: TypeScript para prevenir errores en tiempo de compilación
- **Single Responsibility**: Cada componente/hook tiene una responsabilidad única

## 📄 Páginas Principales

### 1. Menú Principal (`MenuPrincipalPage.tsx`)
- Punto de entrada de la aplicación
- Navegación a todas las secciones
- Badge contador en "Mis Eventos"
- Botón temporal para crear partidos aleatorios

### 2. Ver Partidos (`VerPartidosPage.tsx`)
- Listado de partidos disponibles
- Búsqueda avanzada con múltiples filtros
- Agregar partidos a la selección
- Ver detalles de partidos
- Visualización de precios

### 3. Crear Partido (`CreatePartidoPage.tsx`)
- Formulario completo para crear partidos
- Selección múltiple de categorías (checkboxes)
- Asociación con sedes
- Definición de precio opcional
- Validación en tiempo real
- Validación de número par de jugadores (10-22)
- Integración con inscripción automática

### 4. Detalles de Partido (`PartidoDetailPage.tsx`)
- Información completa del partido
- Información de la sede asociada
- Lista de participantes
- Visualización de cancha
- Precio y costo por jugador
- Editar y eliminar partido
- Inscribirse al partido

### 5. Mis Partidos (`MisPartidosPage.tsx`)
- Lista de partidos seleccionados antes de confirmar
- Selección múltiple con checkboxes
- Validación: solo confirmar partidos completos
- Visualización de precios por partido
- Confirmar reservas de partidos seleccionados
- Eliminar partidos individuales
- Vaciar todos los partidos seleccionados

### 6. Historial de Inscripciones (`HistorialInscripcionesPage.tsx`)
- Ver todas las reservas confirmadas
- Detalles de cada reserva con precios
- Total gastado por usuario
- Cancelar reservas

### 7. Gestión de Sedes (`GestionarSedesPage.tsx`)
- Crear, editar y eliminar sedes
- Migración automática de ubicaciones a sedes
- Información completa: nombre, dirección, teléfono, coordenadas

## 🧩 Componentes

### Componentes UI Base (`components/ui/`)

- **Button**: Botón con variantes (primary, outline, danger)
- **Card**: Contenedor con sombra y bordes redondeados
- **Modal**: Modal reutilizable con soporte para footer personalizado
- **ConfirmModal**: Modal de confirmación con variantes (danger, warning, info)
- **Breadcrumbs**: Navegación contextual con enlaces clicables
- **EmptyState**: Estado vacío con icono, título, descripción y acciones
- **LoadingSkeleton**: Skeleton de carga para mejorar la percepción de rendimiento
- **Input**: Input con soporte para iconos y validación
- **Badge**: Badge para mostrar estados y etiquetas
- **Drawer**: Drawer para móviles
- **Tabs**: Sistema de pestañas
- **Toast**: Sistema de notificaciones

### Componentes de Dominio

- **PartidoCard**: Card para mostrar información de un partido
- **PartidoForm**: Formulario para crear/editar partidos con selección múltiple de categorías
- **ParticipanteForm**: Formulario para inscribirse a un partido
- **ParticipanteList**: Lista de participantes de un partido
- **CanchaVisualization**: Visualización interactiva de la cancha con jugadores y formaciones dinámicas
- **BusquedaPartidos**: Componente de búsqueda avanzada con filtros (incluye filtro por múltiples categorías)

## 🎣 Hooks Personalizados

### usePartidos
- `usePartidos()` - Obtener todos los partidos
- `usePartidosDisponibles()` - Obtener partidos disponibles
- `usePartido(id)` - Obtener un partido por ID
- `useCreatePartido()` - Crear partido
- `useUpdatePartido()` - Actualizar partido
- `useDeletePartido()` - Eliminar partido
- `useBuscarPartidos(busqueda)` - Buscar partidos

### useParticipantes
- `useParticipantes(partidoId)` - Obtener participantes
- `useInscribirse()` - Inscribirse a partido
- `useDesinscribirse()` - Desinscribirse de partido

### usePartidosGuardados
- `usePartidosSeleccionados(usuarioId)` - Obtener partidos seleccionados del usuario
- `useAgregarPartidoSeleccionado()` - Agregar partido a la selección
- `useEliminarPartidoSeleccionado()` - Eliminar partido de la selección
- `useActualizarCantidadPartidoSeleccionado()` - Actualizar cantidad
- `useVaciarPartidosSeleccionados()` - Vaciar todos los partidos seleccionados
- `useCostoPorJugador(partidoId)` - Obtener costo por jugador de un partido

### useInscripciones
- `useReservasPorUsuario(usuarioId)` - Obtener reservas del usuario
- `useReserva(id)` - Obtener una reserva por ID
- `useCrearReservaDesdePartidosSeleccionados()` - Crear reserva desde partidos seleccionados
- `useTotalGastado(usuarioId)` - Obtener total gastado por usuario
- `useCancelarReserva()` - Cancelar reserva

### useSedes
- `useSedes()` - Obtener todas las sedes
- `useSede(id)` - Obtener una sede por ID
- `useCreateSede()` - Crear sede
- `useUpdateSede()` - Actualizar sede
- `useDeleteSede()` - Eliminar sede
- `useMigrarSedes()` - Migrar ubicaciones a sedes

## 💻 Prácticas de Desarrollo

### Convenciones de Código

- **Nombres en español**: Componentes, funciones y variables usan nombres descriptivos en español
- **Comentarios en español**: Todos los comentarios están en español
- **PascalCase**: Para componentes React
- **camelCase**: Para funciones y variables
- **UPPER_SNAKE_CASE**: Para constantes

### Patrones Utilizados

1. **Custom Hooks Pattern**: Lógica reutilizable encapsulada
2. **Container/Presentational Pattern**: Separación entre lógica y presentación
3. **Compound Components**: Componentes que trabajan juntos (Modal + ConfirmModal)
4. **Render Props Pattern**: Para compartir lógica entre componentes
5. **Higher-Order Components**: Para funcionalidad compartida

### Mejores Prácticas

- ✅ Componentes funcionales con hooks
- ✅ TypeScript para type safety
- ✅ Validación de formularios con Zod
- ✅ Manejo de estado con React Query
- ✅ Código limpio y mantenible
- ✅ Componentes reutilizables
- ✅ Separación de responsabilidades
- ✅ Testing de componentes críticos

## 🧪 Testing

El proyecto incluye tests unitarios y de componentes:

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Modo watch
npm test -- --watch

# Con UI
npm run test:ui

# Con coverage
npm run test:coverage
```

### Estructura de Tests

Los tests están organizados junto a los archivos que prueban:
- `Component.test.tsx` - Tests de componentes
- `hook.test.tsx` - Tests de hooks
- `util.test.ts` - Tests de utilidades

### Tipos de Tests

- **Component Tests**: Usan React Testing Library para probar componentes
- **Hook Tests**: Tests de custom hooks con `renderHook`
- **Utility Tests**: Tests unitarios de funciones puras

## 🔗 Integración con Backend

El frontend consume la API REST del backend Java Spring Boot.

**Requisito**: El backend debe estar ejecutándose en `http://localhost:8080` antes de iniciar el frontend.

### Endpoints Utilizados

- `/api/partidos` - Gestión de partidos
- `/api/partidos/buscar` - Búsqueda avanzada
- `/api/partidos/{id}/participantes` - Gestión de participantes
- `/api/partidos/{id}/costo-por-jugador` - Obtener costo por jugador
- `/api/partidos-seleccionados` - Sistema de partidos seleccionados
- `/api/reservas` - Sistema de reservas
- `/api/sedes` - Gestión de sedes

## 🎨 Diseño

- **Tema**: Diseño moderno con paleta de colores verde/futbolística
- **Responsive**: Mobile-first, adaptable a tablet y desktop
- **UX**: Interacciones fluidas, feedback visual claro, estados de carga
- **Accesibilidad**: Navegación por teclado, ARIA labels, contraste adecuado

## ⚙️ Reglas de Negocio

### Partidos

- **Número de Jugadores**: Solo se permiten partidos con número par de jugadores entre 10 y 22 (10, 12, 14, 16, 18, 20, 22)
- **Múltiples Categorías**: Cada partido puede tener múltiples categorías asociadas
- **Formaciones**: Las formaciones se generan automáticamente según el número de jugadores por equipo, distribuyendo jugadores entre defensa, mediocampo y delantera

### Validaciones

- **Formularios**: Validación en tiempo real con Zod
- **Jugadores**: Validación de que el número sea par y esté en el rango permitido
- **Categorías**: Al menos una categoría debe ser seleccionada (opcional)
- **Fechas**: Las fechas deben ser en el futuro

## 🔄 Flujo de Usuario

1. **Explorar Partidos**: Ver partidos disponibles o buscar con filtros
2. **Agregar a Selección**: Agregar partidos de interés a "Mis Partidos"
3. **Seleccionar Partidos**: Marcar con checkboxes los partidos que se desean confirmar
4. **Validar Partidos**: El sistema valida que solo se confirmen partidos completos
5. **Confirmar Reservas**: Confirmar las reservas de los partidos seleccionados
6. **Ver Historial**: Revisar reservas confirmadas, ver total gastado y cancelar si es necesario

## 📱 Responsive Design

La aplicación está diseñada con un enfoque mobile-first:

- **Mobile**: Navegación vertical, cards apiladas, botones de ancho completo
- **Tablet**: Grid de 2 columnas, navegación mejorada
- **Desktop**: Grid de 3 columnas, navegación horizontal, más espacio

## 🐛 Solución de Problemas

### Error de conexión con el backend

**En desarrollo:**
- Verifica que el backend esté ejecutándose en `http://localhost:8080`
- Revisa la consola del navegador (F12) para ver errores
- Verifica que CORS esté configurado correctamente en el backend
- Revisa la configuración del proxy en `vite.config.ts`

**En producción:**
- Verifica que `VITE_API_URL` esté configurada correctamente antes del build
- Verifica que el backend esté accesible desde el dominio del frontend
- Revisa la consola del navegador (F12) para ver errores de CORS o conexión
- Verifica que el backend tenga configurado CORS para permitir peticiones desde el dominio del frontend
- Si usas rutas relativas (`/api`), verifica que el backend esté en el mismo dominio o configurado como proxy

### Errores de compilación

```bash
# Limpia node_modules y reinstala
rm -rf node_modules package-lock.json
npm install
```

### Puerto 5173 en uso

El frontend automáticamente usará el siguiente puerto disponible (5174, 5175, etc.)

### Error de TypeScript

- Verifica que todos los archivos estén guardados
- Revisa los errores en la terminal
- Ejecuta `npm run build` para ver errores de compilación

### Error de dependencias

```bash
# Limpia cache de npm
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

**¡Disfruta organizando tus partidos de fútbol! ⚽**

