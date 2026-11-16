import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPage } from './admin.page';
import { provideAppTestConfig } from '../../testing/test-providers';

describe('AdminPage', () => {
  let component: AdminPage;
  let fixture: ComponentFixture<AdminPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPage],
      providers: provideAppTestConfig(),
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
