import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DataMaintenanceComponent } from './data-maintenance.component';
import { FixedRoutes } from '@urls';
import { DataMaintenanceTableComponent } from './data-maintenance-table/data-maintenance-table.component';
import { DataMaintenanceDetailsComponent } from './data-maintenance-details/data-maintenance-details.component';
import { UpdateConfigurationlistComponent } from './update-configurationlist/update-configurationlist.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AddConfigurationlistComponent } from './add-configurationlist/add-configurationlist.component';
import { ConversationTableComponent } from './conversation-table/conversation-table.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SharedModule } from '@shared/shared.module';
import { GlobalSearchFilter } from '@shared/pipes/global-search.pipe';

const route: Routes = [
  { path: '', component: DataMaintenanceComponent },
  { path: FixedRoutes.Datamaintenance, component: DataMaintenanceComponent },
];

@NgModule({
  declarations: [
    DataMaintenanceComponent,
    DataMaintenanceTableComponent,
    DataMaintenanceDetailsComponent,
    UpdateConfigurationlistComponent,
    AddConfigurationlistComponent,
    ConversationTableComponent
  ],
  providers: [
    GlobalSearchFilter
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
    ReactiveFormsModule,
    NgSelectModule,
    FormsModule,
    BsDatepickerModule,
    SharedModule
  ]
})
export class DataMaintenanceModule { }
