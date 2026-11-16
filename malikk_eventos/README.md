# Malikk Eventos

Aplicación para consultar y administrar eventos y sus reservas. El frontend está hecho en Angular y consume una API REST en Node.js; la API utiliza PostgreSQL.

## Requisitos

- Node.js 20 o superior y npm.
- PostgreSQL local o remoto.
- Una base de datos vacía llamada `malikk_eventos` (o el nombre que definas en la conexión).

## Configuración inicial

Desde la carpeta del proyecto instala las dependencias de ambos proyectos:

```powershell
npm install
npm --prefix backend install
```

Configura el backend sin publicar credenciales:

1. Copia `backend/.env.example` como `backend/.env`.
2. Cambia `DATABASE_URL` por la conexión de tu PostgreSQL.
3. Define un valor largo y privado para `JWT_SECRET`.
4. Define `ADMIN_EMAIL` y `ADMIN_PASSWORD` para crear la cuenta administradora.

Por ejemplo, crea primero la base en PostgreSQL:

```sql
CREATE DATABASE malikk_eventos;
```

Luego crea las tablas y la cuenta inicial:

```powershell
npm --prefix backend run db:schema
npm --prefix backend run db:seed-admin
```

El esquema está en `backend/sql/schema.sql` y está pensado para una base vacía; no es una migración automática para una base con tablas previas. Si ya creaste tablas, haz una copia de seguridad y alinea el esquema antes de ejecutarlo. La API utiliza `personas`, `clientes`, `agentes`, `administradores`, `persona_telefonos`, `paises`, `departamentos`, `ciudades`, `estados_reserva`, `estados_evento`, `eventos` y `reservas`.

La aplicación Angular apunta por defecto a `http://localhost:3000/api`, definido en `src/environments/environment.ts`. Para usar otro host cambia esa URL y `CLIENT_ORIGIN` en `backend/.env`.

El esquema crea `personas` y sus subtipos `clientes`, `agentes` y `administradores`, además de teléfonos, localización, estados, eventos y reservas. Una persona cliente puede tener muchas reservas; la FK va desde `reservas` hacia `clientes`, no desde `clientes` hacia una reserva. La ciudad es obligatoria para clientes y agentes; se permite que el administrador inicial no tenga ciudad para poder configurar primero el catálogo de localización.

La creación de clientes y agentes en la aplicación requiere seleccionar una ciudad existente. Por eso, después de sembrar el administrador, crea primero países, departamentos y ciudades desde el panel de administración.

## Ejecutar

Inicia la API y Angular en terminales separadas:

```powershell
npm run dev:backend
```

```powershell
npm start
```

Abre `http://localhost:4200`. El estado de la API y la conexión a la base se puede revisar en `http://localhost:3000/api/health`.

## Módulos de la API

La API está en `backend/src` y separa rutas, controladores, servicios, middleware y configuración de base de datos.

| Módulo | Ruta base | Acceso |
| --- | --- | --- |
| Autenticación | `/api/auth` | Registro de clientes e inicio de sesión |
| Usuarios | `/api/usuarios` | CRUD para administradores |
| Países | `/api/paises` | CRUD para administradores; lectura pública para formularios |
| Departamentos | `/api/departamentos` | CRUD para administradores; lectura pública para formularios |
| Ciudades | `/api/ciudades` | CRUD para administradores; lectura pública para formularios |
| Estados de reserva | `/api/estados-reserva` | CRUD para administradores; estados del sistema protegidos |
| Estados de evento | `/api/estados-evento` | CRUD para administradores; estados del sistema protegidos |
| Eventos | `/api/eventos` | Lectura pública; CRUD para agentes y administradores |
| Reservas | `/api/reservas` | CRUD según perfil y propietario |
| Reportes | `/api/admin/reportes` | Resumen para administradores |

Las rutas de recursos usan `GET /`, `GET /:id`, `POST /`, `PUT /:id` y `DELETE /:id`. Las rutas protegidas requieren el token `Bearer` devuelto por inicio de sesión. La baja de eventos y reservas conserva el registro como cancelado y exige una causa. El backend valida roles, datos y capacidad de eventos, y responde con códigos HTTP y errores JSON.

Los scripts `backend/sql/operaciones-crud.sql` y `backend/sql/reportes.sql` contienen plantillas CRUD y consultas del trabajo. Los reportes cubren ubicación, conteos, ventas mensuales de eventos en 2026, reservas por evento y mes, eventos por agente/ciudad, historial y cancelaciones. Los promedios de ingresos por agente y cliente quedan pendientes de la fórmula que confirme el docente para la comisión y los estados que cuentan como ingreso.

## Pruebas y compilación

```powershell
npm test -- --watch=false
npm run build
npm --prefix backend test
```

Si Chrome no está instalado, se puede ejecutar Karma usando Microsoft Edge desde PowerShell:

```powershell
$env:CHROME_BIN = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
npm test -- --watch=false
```

## Entrega del proyecto

Antes de entregar, completa el PDF solicitado por el curso con los nombres de los integrantes, enlace al repositorio, descripción de la solución e instrucciones para ejecutar frontend y backend. El esquema de base de datos incluido aquí es una propuesta coherente con los campos que consume Angular; si el modelo aprobado por el equipo tiene diferencias, deben alinearse antes de conectar la base.
