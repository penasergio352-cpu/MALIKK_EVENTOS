import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Evento } from '../../models/evento.model';

@Component({
  selector: 'app-evento-card',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './evento-card.component.html',
  styleUrl: './evento-card.component.scss',
})
export class EventoCardComponent {
  @Input({ required: true }) evento!: Evento;
  @Input() mostrarAccionReserva = false;
  @Output() reservar = new EventEmitter<number>();
}