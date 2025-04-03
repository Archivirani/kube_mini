import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentationService {
  public submitEvent: Subject<boolean> = new Subject();
  public cancelEvent: Subject<boolean> = new Subject();
}
