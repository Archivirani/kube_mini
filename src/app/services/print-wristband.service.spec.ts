import { TestBed } from '@angular/core/testing';

import { PrintWristbandService } from './print-wristband.service';

describe('PrintWristbandService', () => {
  let service: PrintWristbandService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintWristbandService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
