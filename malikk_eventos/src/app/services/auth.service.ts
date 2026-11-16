import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { DatosRegistro, RespuestaSesion, TipoPerfil, Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}`;
  private readonly tokenKey = 'malikk-session-token';
  private readonly userKey = 'malikk-session-user';
  readonly usuarioActual = signal<Usuario | null>(this.leerUsuario());

  get token(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  async iniciarSesion(email: string, password: string): Promise<Usuario> {
    const respuesta = await firstValueFrom(
      this.http.post<RespuestaSesion>(`${this.baseUrl}/auth/login`, { email, password }),
    );
    this.guardarSesion(respuesta);
    return respuesta.usuario;
  }

  async registrar(datos: DatosRegistro): Promise<void> {
    await firstValueFrom(this.http.post<RespuestaSesion>(`${this.baseUrl}/auth/register`, datos));
  }

  async registrarAgente(datos: DatosRegistro): Promise<void> {
    await firstValueFrom(
      this.http.post<Usuario>(`${this.baseUrl}/usuarios`, { ...datos, tipo_usuario: 'Agente' }),
    );
  }

  async iniciarSesionAdmin(email: string, password: string): Promise<Usuario> {
    const usuario = await this.iniciarSesion(email, password);
    if (usuario.tipo_usuario !== 'Administrador') {
      this.cerrarSesion();
      throw new Error('La cuenta no tiene permisos de administrador.');
    }
    return usuario;
  }

  tienePerfil(tipo: TipoPerfil): boolean {
    return this.usuarioActual()?.tipo_usuario === tipo;
  }

  obtenerUsuarios() {
    return this.http.get<Usuario[]>(`${this.baseUrl}/usuarios`);
  }

  actualizarUsuario(id: number, cambios: Partial<Usuario> & { password?: string }) {
    return this.http.put<Usuario>(`${this.baseUrl}/usuarios/${id}`, cambios);
  }

  eliminarUsuario(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/usuarios/${id}`);
  }

  cerrarSesion(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
    this.usuarioActual.set(null);
  }

  private guardarSesion(respuesta: RespuestaSesion): void {
    sessionStorage.setItem(this.tokenKey, respuesta.token);
    sessionStorage.setItem(this.userKey, JSON.stringify(respuesta.usuario));
    this.usuarioActual.set(respuesta.usuario);
  }

  private leerUsuario(): Usuario | null {
    const perfil = sessionStorage.getItem(this.userKey);
    if (!perfil) return null;
    try {
      const usuario = JSON.parse(perfil) as Usuario;
      return usuario && Number.isInteger(usuario.ID_usuario) ? usuario : null;
    } catch {
      return null;
    }
  }
}
