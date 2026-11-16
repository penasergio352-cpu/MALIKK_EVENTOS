import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClienteReservaPage } from './cliente-reserva.page';
import { provideAppTestConfig } from '../../testing/test-providers';

describe('ClienteReservaPage', () => {
  let component: ClienteReservaPage;
  let fixture: ComponentFixture<ClienteReservaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClienteReservaPage],
      providers: provideAppTestConfig(),
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClienteReservaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
