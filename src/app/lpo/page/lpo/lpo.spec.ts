import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Lpo } from './lpo';

describe('Lpo', () => {
  let component: Lpo;
  let fixture: ComponentFixture<Lpo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lpo],
    }).compileComponents();

    fixture = TestBed.createComponent(Lpo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
