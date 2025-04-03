import { Component, Input, OnInit } from '@angular/core';
import { SystemCount } from '@services/model/system.count.model';
import { FixedRoutes } from '@urls';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'pharmacist-header',
  templateUrl: './pharmacist-header.component.html',
  styleUrls: ['./pharmacist-header.component.scss']
})
export class PharmacistHeaderComponent {
  public navigation = FixedRoutes;
  public currency = environment.currency;
  @Input() systemCounts: SystemCount;
}
