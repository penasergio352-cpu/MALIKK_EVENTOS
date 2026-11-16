import { HttpError } from '../errors.js';

const numeric = (payload, keys) => {
  for (const key of keys) {
    const value = payload[key];
    if (value !== undefined
      && ((typeof value !== 'number' && typeof value !== 'string')
        || (typeof value === 'string' && !value.trim())
        || !Number.isFinite(Number(value)))) {
      throw new HttpError(400, `${key} debe ser numérico.`);
    }
  }
};

const positiveIds = (payload, keys) => {
  for (const key of keys) {
    if (payload[key] !== undefined && (!Number.isInteger(Number(payload[key])) || Number(payload[key]) < 1)) {
      throw new HttpError(400, `${key} debe ser un identificador entero positivo.`);
    }
  }
};

const validateName = (payload) => {
  if (payload.nombre !== undefined && (typeof payload.nombre !== 'string' || !payload.nombre.trim() || payload.nombre.length > 100)) {
    throw new HttpError(400, 'nombre debe tener entre 1 y 100 caracteres.');
  }
};

const validateText = (payload, key, maxLength) => {
  const value = payload[key];
  if (value !== undefined && value !== null
    && (typeof value !== 'string' || value.length > maxLength || (key !== 'observaciones' && !value.trim()))) {
    throw new HttpError(400, `${key} debe contener entre 1 y ${maxLength} caracteres.`);
  }
};

const validateDate = (payload, key) => {
  const value = payload[key];
  if (value === undefined) return;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z)?$/.test(value)) {
    throw new HttpError(400, `${key} debe tener una fecha válida.`);
  }
  const date = typeof value === 'string' ? value.slice(0, 10) : '';
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00.000Z`) : undefined;
  if (!parsed || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new HttpError(400, `${key} debe tener una fecha válida.`);
  }
};

export const resources = {
  paises: {
    table: 'paises',
    idColumn: 'id_pais',
    orderBy: 'nombre',
    projection: 'id_pais AS "ID_pais", nombre',
    fields: { nombre: 'nombre' },
    required: ['nombre'],
    validate: validateName,
  },
  departamentos: {
    table: 'departamentos',
    idColumn: 'id_departamento',
    orderBy: 'nombre',
    projection: 'id_departamento AS "ID_departamento", nombre, id_pais AS "ID_pais"',
    fields: { nombre: 'nombre', ID_pais: 'id_pais' },
    required: ['nombre', 'ID_pais'],
    validate: (payload) => {
      validateName(payload);
      positiveIds(payload, ['ID_pais']);
    },
  },
  ciudades: {
    table: 'ciudades',
    idColumn: 'id_ciudad',
    orderBy: 'nombre',
    projection: 'id_ciudad AS "ID_ciudad", nombre, id_departamento AS "ID_departamento"',
    fields: { nombre: 'nombre', ID_departamento: 'id_departamento' },
    required: ['nombre', 'ID_departamento'],
    validate: (payload) => {
      validateName(payload);
      positiveIds(payload, ['ID_departamento']);
    },
  },
  estadosReserva: {
    table: 'estados_reserva',
    idColumn: 'id_estado_reserva',
    orderBy: 'id_estado_reserva',
    projection: 'id_estado_reserva AS "ID_estado_reserva", nombre_estado_reserva',
    fields: { nombre_estado_reserva: 'nombre_estado_reserva' },
    required: ['nombre_estado_reserva'],
    lockedIds: [1, 2, 3, 4],
    validate: (payload) => validateText(payload, 'nombre_estado_reserva', 40),
  },
  estadosEvento: {
    table: 'estados_evento',
    idColumn: 'id_estado_evento',
    orderBy: 'id_estado_evento',
    projection: 'id_estado_evento AS "ID_estado_evento", nombre_estado_evento',
    fields: { nombre_estado_evento: 'nombre_estado_evento' },
    required: ['nombre_estado_evento'],
    lockedIds: [1, 2, 3],
    validate: (payload) => validateText(payload, 'nombre_estado_evento', 40),
  },
  eventos: {
    table: 'eventos',
    idColumn: 'id_evento',
    orderBy: 'fecha_inicio, nombre',
    projection: `id_evento AS "ID_evento", nombre, teatro, imagen_url AS "imagenUrl",
      fecha_inicio, fecha_fin, hora_inicio, hora_fin, descripcion,
      precio_base_entrada, precio_base, capacidad_total, observaciones,
      id_ciudad AS "ID_ciudad", id_estado_evento AS "ID_estado_evento",
      causa_cancelacion`,
    fields: {
      nombre: 'nombre',
      teatro: 'teatro',
      imagenUrl: 'imagen_url',
      fecha_inicio: 'fecha_inicio',
      fecha_fin: 'fecha_fin',
      hora_inicio: 'hora_inicio',
      hora_fin: 'hora_fin',
      descripcion: 'descripcion',
      precio_base_entrada: 'precio_base_entrada',
      precio_base: 'precio_base',
      capacidad_total: 'capacidad_total',
      observaciones: 'observaciones',
      ID_ciudad: 'id_ciudad',
      ID_estado_evento: 'id_estado_evento',
      causa_cancelacion: 'causa_cancelacion',
      creado_por: 'id_agente',
    },
    required: [
      'nombre', 'teatro', 'fecha_inicio', 'fecha_fin', 'hora_inicio', 'hora_fin',
      'descripcion', 'precio_base_entrada', 'precio_base', 'capacidad_total', 'ID_ciudad',
    ],
    createdBy: 'creado_por',
    publicWhere: 'id_estado_evento <> 2',
    softDelete: {
      stateColumn: 'id_estado_evento',
      stateId: 2,
      causeField: 'causa_cancelacion',
    },
    nullable: ['imagenUrl', 'causa_cancelacion'],
    validate: (payload) => {
      numeric(payload, ['hora_inicio', 'hora_fin', 'precio_base_entrada', 'precio_base', 'capacidad_total']);
      positiveIds(payload, ['ID_ciudad', 'ID_estado_evento']);
      validateName(payload);
      validateText(payload, 'teatro', 100);
      validateText(payload, 'descripcion', 500);
      validateText(payload, 'observaciones', 500);
      validateDate(payload, 'fecha_inicio');
      validateDate(payload, 'fecha_fin');
      for (const key of ['hora_inicio', 'hora_fin', 'capacidad_total']) {
        if (payload[key] !== undefined && !Number.isInteger(Number(payload[key]))) {
          throw new HttpError(400, `${key} debe ser un entero.`);
        }
      }
      for (const key of ['hora_inicio', 'hora_fin']) {
        if (payload[key] !== undefined && (Number(payload[key]) < 0 || Number(payload[key]) > 23)) {
          throw new HttpError(400, `${key} debe estar entre 0 y 23.`);
        }
      }
      if (payload.capacidad_total !== undefined && Number(payload.capacidad_total) < 1) {
        throw new HttpError(400, 'capacidad_total debe ser mayor que cero.');
      }
      if (payload.precio_base_entrada !== undefined && Number(payload.precio_base_entrada) < 0) {
        throw new HttpError(400, 'precio_base_entrada no puede ser negativo.');
      }
      if (payload.precio_base !== undefined && Number(payload.precio_base) < 0) {
        throw new HttpError(400, 'precio_base no puede ser negativo.');
      }
      if (payload.fecha_inicio && payload.fecha_fin && payload.fecha_fin < payload.fecha_inicio) {
        throw new HttpError(400, 'fecha_fin debe ser igual o posterior a fecha_inicio.');
      }
    },
    beforeUpdate: async (db, id, payload) => {
      if (payload.capacidad_total === undefined) return;
      const { rows } = await db.query(
        `        SELECT COALESCE(SUM(r.cantidad_entradas), 0)::integer AS ocupadas
        FROM reservas r
        WHERE r.id_evento = $1 AND r.id_estado_reserva IN (1, 2)`,
        [id],
      );
      if (Number(payload.capacidad_total) < rows[0].ocupadas) {
        throw new HttpError(409, 'La capacidad no puede quedar por debajo de las entradas reservadas.');
      }
    },
  },
};
