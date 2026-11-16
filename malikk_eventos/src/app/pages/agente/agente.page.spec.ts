import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentePage } from './agente.page';
import { provideAppTestConfig } from '../../testing/test-providers';

describe('AgentePage', () => {
  let component: AgentePage;
  let fixture: ComponentFixture<AgentePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentePage],
      providers: provideAppTestConfig(),
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
