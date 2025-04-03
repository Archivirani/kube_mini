import { NgModule } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LaboratoryComponent } from './laboratory.component';
import { FixedRoutes } from '@urls';
import { LaboratoryServiceComponent } from './laboratory-service/laboratory-service.component';
import { LaboratoryDetailComponent } from './laboratory-detail/laboratory-detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { BsModalService } from 'ngx-bootstrap/modal';
import { LabRequestFormComponent } from './lab-request-form/lab-request-form.component';

const route: Routes = [
  {path:'',component:LaboratoryComponent},
  {path:FixedRoutes.laboratory,component:LaboratoryComponent},
  {path:FixedRoutes.laboratoryDetails,component:LaboratoryServiceComponent}
]
@NgModule({
  declarations: [LaboratoryComponent, LaboratoryServiceComponent, LaboratoryDetailComponent, LabRequestFormComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
    ReactiveFormsModule,
    SharedModule,
    FormsModule
  ],
  providers:[BsModalService]
})
export class LaboratoryModule { }
