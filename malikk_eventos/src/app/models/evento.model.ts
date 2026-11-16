export interface Evento {
  ID_evento: number;
  nombre: string;
  teatro: string;
  imagenUrl?: string;
  fecha_inicio: Date;
  descripcion: string;
  precio_base_entrada: number;
  capacidad_total: number;
  precio_base: number;
  hora_fin: number;
  observaciones: string;
  fecha_fin: Date;
  hora_inicio: number;
  ID_ciudad?: number | null;
  ID_estado_evento?: number;
  causa_cancelacion?: string | null;
}