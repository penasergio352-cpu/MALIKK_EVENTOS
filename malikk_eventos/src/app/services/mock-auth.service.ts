import { Injectable } from '@angular/core';

export type TipoPerfil = 'Cliente' | 'Agente' | 'Administrador';

export interface DatosRegistro {
  nombre: string;
  email: string;
  telefono: string;
  password: string;
}

export interface PerfilRegistrado extends Omit<DatosRegistro, 'password'> {
  tipo_usuario: TipoPerfil;
}

interface UsuarioGuardado extends PerfilRegistrado {
  salt: string;
  passwordHash: string;
  creadoPorAdmin?: boolean;
}

@Injectable({ providedIn: 'root' })
export class MockAuthService {
  private readonly usuariosKey = 'malikk-demo-users';
  private readonly sesionKey = 'malikk-demo-session';
  private readonly adminDemo = {
    email: 'sergio@gmail.com',
    password: '12345678',
  };
  private readonly clienteDemo = {
    nombre: 'sergio p',
    email: 'sergiocliente@gmail.com',
    telefono: '3207882543',
    password: '12345678',
  };

  async registrar(datos: DatosRegistro): Promise<void> {
    await this.guardarUsuario(datos, 'Cliente');
  }

  async registrarAgente(datos: DatosRegistro): Promise<void> {
    if (!this.tienePerfil('Administrador')) {
      throw new Error('Solo el administrador puede registrar agentes.');
    }

    await this.guardarUsuario(datos, 'Agente', true);
  }

  async iniciarSesion(emailIngresado: string, password: string): Promise<PerfilRegistrado> {
    const email = emailIngresado.trim().toLowerCase();

    if (email === this.clienteDemo.email && password === this.clienteDemo.password) {
      const perfil: PerfilRegistrado = {
        nombre: this.clienteDemo.nombre,
        email: this.clienteDemo.email,
        telefono: this.clienteDemo.telefono,
        tipo_usuario: 'Cliente',
      };
      sessionStorage.setItem(this.sesionKey, JSON.stringify(perfil));
      return perfil;
    }

    const usuario = this.obtenerUsuarios().find((item) => item.email === email);

    if (!usuario || usuario.tipo_usuario === 'Administrador'
      || (usuario.tipo_usuario === 'Agente' && !usuario.creadoPorAdmin)
      || (await this.hashPassword(password, usuario.salt)) !== usuario.passwordHash) {
      throw new Error('Correo o contraseña incorrectos, o cuenta sin autorización.');
    }

    const { salt: _salt, passwordHash: _passwordHash, ...perfil } = usuario;
    sessionStorage.setItem(this.sesionKey, JSON.stringify(perfil));
    return perfil;
  }

  iniciarSesionAdmin(emailIngresado: string, password: string): void {
    if (emailIngresado.trim().toLowerCase() !== this.adminDemo.email || password !== this.adminDemo.password) {
      throw new Error('Credenciales de administrador incorrectas.');
    }

    sessionStorage.setItem(this.sesionKey, JSON.stringify({
      nombre: 'Administrador Malikk',
      email: this.adminDemo.email,
      telefono: '',
      tipo_usuario: 'Administrador',
    } satisfies PerfilRegistrado));
  }

  tienePerfil(tipo: TipoPerfil): boolean {
    return this.obtenerSesion()?.tipo_usuario === tipo;
  }

  cerrarSesion(): void {
    sessionStorage.removeItem(this.sesionKey);
  }

  private async guardarUsuario(
    datos: DatosRegistro,
    tipo: 'Cliente' | 'Agente',
    creadoPorAdmin = false,
  ): Promise<void> {
    const usuarios = this.obtenerUsuarios();
    const email = datos.email.trim().toLowerCase();

    const correoReservado = [this.adminDemo.email, this.clienteDemo.email]
      .some((correo) => correo.trim().toLowerCase() === email);

    if (correoReservado || usuarios.some((usuario) => usuario.email === email)) {
      throw new Error('Ya existe una cuenta con ese correo. Usa un correo diferente.');
    }

    const salt = this.crearSalt();
    const passwordHash = await this.hashPassword(datos.password, salt);
    usuarios.push({
      nombre: datos.nombre.trim(),
      email,
      telefono: datos.telefono.trim(),
      tipo_usuario: tipo,
      salt,
      passwordHash,
      creadoPorAdmin,
    });

    localStorage.setItem(this.usuariosKey, JSON.stringify(usuarios));
  }

  private obtenerSesion(): PerfilRegistrado | null {
    const sesion = sessionStorage.getItem(this.sesionKey);
    if (!sesion) {
      return null;
    }

    try {
      return JSON.parse(sesion) as PerfilRegistrado;
    } catch {
      return null;
    }
  }

  private obtenerUsuarios(): UsuarioGuardado[] {
    const usuariosGuardados = localStorage.getItem(this.usuariosKey);
    if (!usuariosGuardados) {
      return [];
    }

    try {
      return JSON.parse(usuariosGuardados) as UsuarioGuardado[];
    } catch {
      return [];
    }
  }

  private crearSalt(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    const contenido = new TextEncoder().encode(`${salt}:${password}`);
    const digest = await crypto.subtle.digest('SHA-256', contenido);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
}
