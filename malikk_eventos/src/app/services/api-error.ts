import { HttpErrorResponse } from '@angular/common/http';

export function mensajeErrorApi(error: unknown, predeterminado: string): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error;
    if (typeof body === 'object' && body !== null && 'error' in body) {
      const detail = body.error;
      if (typeof detail === 'object' && detail !== null && 'message' in detail && typeof detail.message === 'string') {
        return detail.message;
      }
    }
  }
  return error instanceof Error ? error.message : predeterminado;
}
