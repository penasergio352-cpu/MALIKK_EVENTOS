import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgenteReservaPage } from './agente-reserva.page';
import { provideAppTestConfig } from '../../testing/test-providers';

describe('AgenteReservaPage', () => {
  let component: AgenteReservaPage;
  let fixture: ComponentFixture<AgenteReservaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgenteReservaPage],
      providers: provideAppTestConfig(),
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgenteReservaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
