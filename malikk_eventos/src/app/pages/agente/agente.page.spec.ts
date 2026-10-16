import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentePage } from './agente.page';

describe('AgentePage', () => {
  let component: AgentePage;
  let fixture: ComponentFixture<AgentePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentePage]
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
