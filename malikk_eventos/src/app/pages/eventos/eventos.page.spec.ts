import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventosPage } from './eventos.page';
import { provideAppTestConfig } from '../../testing/test-providers';

describe('EventosPage', () => {
  let component: EventosPage;
  let fixture: ComponentFixture<EventosPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventosPage],
      providers: provideAppTestConfig(),
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
