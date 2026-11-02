import { TestBed } from '@angular/core/testing';
import { LpoService } from './lpo';

describe('LpoService', () => {
  let service: LpoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LpoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
