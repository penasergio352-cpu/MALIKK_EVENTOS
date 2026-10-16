import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Evento } from '../../models/evento.model';
import { EventoCardComponent } from './evento-card.component';

describe('EventoCardComponent', () => {
  let fixture: ComponentFixture<EventoCardComponent>;

  const evento: Evento = {
    ID_evento: 1,
    nombre: '[Texto de ejemplo] Noche Vector',
    teatro: '[Texto de ejemplo] Teatro Aurora',
    fecha_inicio: new Date(2026, 11, 12),
    descripcion: '[Texto de ejemplo] Evento musical.',
    precio_base_entrada: 35,
    capacidad_total: 1200,
    precio_base: 10,
    hora_fin: 2,
    observaciones: '[Texto de ejemplo] Compra en taquilla sujeta a disponibilidad.',
    fecha_fin: new Date(2026, 11, 13),
    hora_inicio: 20,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventoCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventoCardComponent);
    fixture.componentRef.setInput('evento', evento);
    fixture.detectChanges();
  });

  it('muestra el nombre del evento', () => {
    expect(fixture.nativeElement.textContent).toContain(evento.nombre);
  });
  
    it('muestra la imagen cuando el evento tiene una', () => {
      fixture.componentRef.setInput('evento', {
        ...evento,
        imagenUrl: 'data:image/png;base64,imagen-de-prueba',
      });
      fixture.detectChanges();
    
      const imagen = fixture.nativeElement.querySelector('.event-card__image');
      expect(imagen).toBeTruthy();
      expect(imagen.alt).toContain(evento.nombre);
    });
});