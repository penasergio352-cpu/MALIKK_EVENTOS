import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarComponents } from './navbar.components';
import { provideAppTestConfig } from '../../testing/test-providers';

describe('NavbarComponents', () => {
  let component: NavbarComponents;
  let fixture: ComponentFixture<NavbarComponents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponents],
      providers: provideAppTestConfig(),
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarComponents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
