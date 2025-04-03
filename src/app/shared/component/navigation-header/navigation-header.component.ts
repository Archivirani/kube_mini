import { Component, Input } from '@angular/core';
import { SystemCount } from '@services/model/system.count.model';
import { FixedRoutes } from '@urls';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'dashboard-panel-header',
  templateUrl: './navigation-header.component.html',
  styleUrls: ['./navigation-header.component.scss']
})
export class NavigationHeaderComponent {
  public navigation = FixedRoutes;
  public currency = environment.currency;
  @Input() systemCounts: SystemCount;
}
