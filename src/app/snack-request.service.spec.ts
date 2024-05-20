import { TestBed } from '@angular/core/testing';

import { SnackRequestService } from './snack-request.service';

describe('SnackRequestService', () => {
  let service: SnackRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SnackRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
