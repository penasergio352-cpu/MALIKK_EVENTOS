import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClienteEventoReservaPage } from './cliente-evento-reserva.page';
import { provideAppTestConfig } from '../../testing/test-providers';

describe('ClienteEventoReservaPage', () => {
  let component: ClienteEventoReservaPage;
  let fixture: ComponentFixture<ClienteEventoReservaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClienteEventoReservaPage],
      providers: provideAppTestConfig(),
    }).compileComponents();

    fixture = TestBed.createComponent(ClienteEventoReservaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});