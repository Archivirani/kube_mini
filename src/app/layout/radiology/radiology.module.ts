import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadiologyComponent } from './radiology.component';
import { RouterModule, Routes } from '@angular/router';
import { FixedRoutes } from '@urls';
import { SharedModule } from '@shared/shared.module';
import { BsModalService } from 'ngx-bootstrap/modal';
import { RadiologyDetailComponent } from './radiology-detail/radiology-detail.component';
import { RadiologyServiceComponent } from './radiology-service/radiology-service.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RequestFormComponent } from './request-form/request-form.component';
import { NgSelectModule } from '@ng-select/ng-select';


const route: Routes = [
  { path: '', component: RadiologyComponent },
  { path: FixedRoutes.Radiology, component: RadiologyComponent },
  { path: FixedRoutes.RadiologyDetails, component: RadiologyServiceComponent },
];
@NgModule({
    
  declarations: [RadiologyComponent, RadiologyDetailComponent, RadiologyServiceComponent, RequestFormComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule
  ],
    
    providers:[BsModalService]
})
export class RadiologyModule { }
