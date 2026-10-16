import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClienteReservaPage } from './cliente-reserva.page';

describe('ClienteReservaPage', () => {
  let component: ClienteReservaPage;
  let fixture: ComponentFixture<ClienteReservaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClienteReservaPage]
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
