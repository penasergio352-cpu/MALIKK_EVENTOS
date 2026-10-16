import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClienteEventosPage } from './cliente-eventos.page';

describe('ClienteEventosPage', () => {
  let component: ClienteEventosPage;
  let fixture: ComponentFixture<ClienteEventosPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClienteEventosPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClienteEventosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
