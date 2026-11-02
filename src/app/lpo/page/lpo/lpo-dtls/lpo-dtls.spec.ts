import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LpoDtls } from './lpo-dtls';

describe('LpoDtls', () => {
  let component: LpoDtls;
  let fixture: ComponentFixture<LpoDtls>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LpoDtls],
    }).compileComponents();

    fixture = TestBed.createComponent(LpoDtls);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
