export interface Pais {
  ID_pais: number;
  nombre: string;
}

export interface Departamento {
  ID_departamento: number;
  nombre: string;
  ID_pais: number;
}

export interface Ciudad {
  ID_ciudad: number;
  nombre: string;
  ID_departamento: number;
}
