export type TipoPerfil = 'Cliente' | 'Agente' | 'Administrador';

export interface Usuario {
  ID_usuario: number;
  ID_ciudad: number | null;
  nombre: string;
  email: string;
  telefono: string;
  tipo_usuario: TipoPerfil;
}

export interface DatosRegistro {
  nombre: string;
  email: string;
  telefono: string;
  ID_ciudad: number;
  password: string;
}

export interface UsuarioPayload extends DatosRegistro {
  tipo_usuario: 'Cliente' | 'Agente';
}

export interface RespuestaSesion {
  usuario: Usuario;
  token: string;
}
