import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliciesAdmin } from './policies-admin';

describe('PoliciesAdmin', () => {
  let component: PoliciesAdmin;
  let fixture: ComponentFixture<PoliciesAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliciesAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoliciesAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
