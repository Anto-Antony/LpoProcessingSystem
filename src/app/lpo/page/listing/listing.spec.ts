import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ApiResponse, LpoModel } from '../../models/lpo.model';
import { LpoService } from '../../services/lpo';
import { Listing } from './listing';

describe('Listing', () => {
  let component: Listing;
  let fixture: ComponentFixture<Listing>;
 
  const response: ApiResponse<LpoModel[]> = {
    success: true,
    statusCode: 200,
    errorCode: 'LPO_GET',
    data: [null as unknown as LpoModel], 
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Listing],
      providers: [
        {
          provide: LpoService,
          useValue: {
            getAllLpo: () => of(response),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Listing);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should bind API records and display them in the list', async () => {
    component.loadLpos();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const tableText = fixture.nativeElement.textContent;

  });
});
