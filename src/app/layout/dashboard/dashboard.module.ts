import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from '@shared/shared.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AreaChartComponent } from './area-chart/area-chart.component';
import { DashboardComponent } from './dashboard.component';
import { DoughnutChartComponent } from './doughnut-chart/doughnut-chart.component';

const route: Routes = [
  { path: '', component: DashboardComponent},
];
@NgModule({
  declarations: [DashboardComponent, AreaChartComponent, DoughnutChartComponent],
  imports: [CommonModule, NgSelectModule, SharedModule, FormsModule, RouterModule.forChild(route), BsDatepickerModule.forRoot()],

})
export class DashboardModule { }
