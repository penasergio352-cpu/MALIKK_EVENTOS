import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgenteEventosPage } from './agente-eventos.page';

describe('AgenteEventosPage', () => {
  let component: AgenteEventosPage;
  let fixture: ComponentFixture<AgenteEventosPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgenteEventosPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgenteEventosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
