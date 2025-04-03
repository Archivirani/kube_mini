import { Component, Input, OnInit } from '@angular/core';
import { SystemCount } from '@services/model/system.count.model';
import { FixedRoutes } from '@urls';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'doctor-header',
  templateUrl: './doctor-header.component.html',
  styleUrls: ['./doctor-header.component.scss']
})
export class DoctorHeaderComponent{
  public navigation = FixedRoutes;
  public currency = environment.currency;
  @Input() systemCounts: SystemCount;
}
