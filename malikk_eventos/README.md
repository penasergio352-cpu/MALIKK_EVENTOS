# Malikk Eventos

Aplicación para consultar y administrar eventos de musica electornica y sus reservas. El frontend está hecho en Angular y consume una API REST en Node.js; la API utiliza PostgreSQL.

## Requisitos
- angular cli
- Node.js 20 o superior y npm.
- PostgreSQL local o remoto.
- 

## Configuración inicial

Desde la carpeta del proyecto instala las dependencias de ambos proyectos:

```powershell
npm install
npm --prefix backend install
```

## Ejecutar

Inicia la API y Angular en terminales separadas:
s
```powershell
npm run dev:backend
```

```powershell
ng serve
```

Abre `http://localhost:4200`. El estado de la API y la conexión a la base se puede revisar en `http://localhost:3000/api/health`.
