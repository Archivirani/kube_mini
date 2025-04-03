import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from '@shared/shared.module';
import { FixedRoutes } from '@urls';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ImageCropperModule } from 'ngx-image-cropper';
import { WebcamModule } from 'ngx-webcam';
import { HistoryPopupComponent } from './patient-profile/history-popup/history-popup.component';
import { PatientProfilePopupComponent } from './patient-profile/patient-profile-popup.component';
import { PatientComponent } from './patient.component';
import { RegisterPatientComponent } from './register-patient/register-patient.component';
import { WebCamComponent } from './register-patient/web-cam/web-cam.component';
import { FaceReadingDocumentComponent } from './face-reading-document/face-reading-document.component';
import { NgxBarcodeModule } from 'ngx-barcode';
// import { PatientFilterComponent } from './patient-filter/patient-filter.component';

const route: Routes = [
  { path: '', component: PatientComponent },
  { path: FixedRoutes.PatientRegister, component: RegisterPatientComponent },
  { path: FixedRoutes.PatientEdit, component: RegisterPatientComponent },
]

@NgModule({
  declarations: [PatientComponent, RegisterPatientComponent, WebCamComponent, PatientProfilePopupComponent, HistoryPopupComponent, FaceReadingDocumentComponent],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    NgSelectModule,
    FormsModule,
    RouterModule.forChild(route),
    BsDatepickerModule.forRoot(),
    WebcamModule,
    ImageCropperModule,
    CarouselModule.forRoot(),
    NgxBarcodeModule
  ]
})
export class PatientModule { }
