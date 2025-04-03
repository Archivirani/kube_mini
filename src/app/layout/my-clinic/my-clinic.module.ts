import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from '@shared/shared.module';
import { FixedRoutes } from '@urls';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { ImageCropperModule } from 'ngx-image-cropper';
import { WebcamModule } from 'ngx-webcam';
import { AppointmentPopupComponent } from './appointment-popup/appointment-popup.component';
import { DailyPopupViewComponent } from './appointment-popup/daily-popup-view/daily-popup-view.component';
import { WeeklyPopupViewComponent } from './appointment-popup/weekly-popup-view/weekly-popup-view.component';
import { ClinicServicesComponent } from './my-clinic-detail/clinic-services/clinic-services.component';
import { CreateClinicOrderComponent } from './my-clinic-detail/clinic-services/create-clinic-order/create-clinic-order.component';
import { FaceNeckDocumentComponent } from './my-clinic-detail/face-neck-document/face-neck-document.component';
import { FaceReadingDocumentComponent } from './my-clinic-detail/face-reading-document/face-reading-document.component';
import { GeneralDocumentComponent } from './my-clinic-detail/general-document/general-document.component';
import { MyClinicDetailComponent } from './my-clinic-detail/my-clinic-detail.component';
import { HistoryPopupComponent } from './my-clinic-detail/patient-profile/history-popup/history-popup.component';
import { PatientProfileComponent } from './my-clinic-detail/patient-profile/patient-profile.component';
import { SurgeryProcedureDocumentComponent } from './my-clinic-detail/surgery-procedure-document/surgery-procedure-document.component';
import { ClinicWebCamComponent } from './my-clinic-detail/web-cam/web-cam.component';
import { MyClinicComponent } from './my-clinic.component';
import { AttachmentPopupComponent } from './my-clinic-detail/patient-profile/attachment-popup/attachment-popup.component';
import { SoapDocumentComponent } from './my-clinic-detail/soap-document/soap-document.component';
import { VisitNoteDocumentationComponent } from './my-clinic-detail/visit-note-documentation/visit-note-documentation.component';
import { ServicesClinicOrderComponent } from './my-clinic-detail/services-clinic-order/services-clinic-order.component';
import { CreateServicesComponent } from './my-clinic-detail/services-clinic-order/create-services/create-services.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { QuillModule } from 'ngx-quill';
import { RequestFormComponent } from './request-form/request-form.component';
import { SafeUrlPipe } from '@shared/pipes/safeurl.pipe';
import {ClipboardModule} from '@angular/cdk/clipboard'
import { VisitNotePopupComponent } from './my-clinic-detail/patient-profile/visit-note-popup/visit-note-popup.component';
import { PrintVisitnoteComponent } from './my-clinic-detail/patient-profile/print-visitnote/print-visitnote.component';
import { GeneralPopupComponent } from './my-clinic-detail/patient-profile/general-popup/general-popup.component';

const route: Routes = [
  { path: '', component: MyClinicComponent },
  { path: FixedRoutes.MyClinicDetails, component: MyClinicDetailComponent },
  { path: `${FixedRoutes.MyClinicDetails}/:mrn`, component: MyClinicDetailComponent },
]

@NgModule({
  declarations: [
    MyClinicComponent,
    MyClinicDetailComponent,
   // PatientProfileComponent,
    ClinicServicesComponent,
    CreateClinicOrderComponent,
   // HistoryPopupComponent,
   // VisitNoteDocumentationComponent,
   // FaceReadingDocumentComponent,
    AppointmentPopupComponent,
    WeeklyPopupViewComponent,
    DailyPopupViewComponent,
   // SoapDocumentComponent,
   // GeneralDocumentComponent,
    // ClinicWebCamComponent,
    //FaceNeckDocumentComponent,
   // SurgeryProcedureDocumentComponent,
    //AttachmentPopupComponent,
    ServicesClinicOrderComponent,
    CreateServicesComponent,
    //RequestFormComponent,
   // SafeUrlPipe,
//VisitNotePopupComponent,
   // PrintVisitnoteComponent

  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgSelectModule,
    WebcamModule,
    ImageCropperModule,
    BsDatepickerModule.forRoot(),
    TabsModule.forRoot(),
    CarouselModule.forRoot(),
    PopoverModule.forRoot(),
    TimepickerModule.forRoot(),
    RouterModule.forChild(route),
    BsDropdownModule.forRoot(),
    QuillModule.forRoot(),
    ClipboardModule
  ],
  providers: [BsModalService],
  exports:[PatientProfileComponent,AttachmentPopupComponent,HistoryPopupComponent,PrintVisitnoteComponent,GeneralPopupComponent,VisitNotePopupComponent,GeneralDocumentComponent,SoapDocumentComponent,FaceNeckDocumentComponent,SurgeryProcedureDocumentComponent,ClinicWebCamComponent,FaceReadingDocumentComponent,SafeUrlPipe,RequestFormComponent,VisitNoteDocumentationComponent]
})
export class MyClinicModule { }
