import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PatientModule } from '../layout/patient/patient.module';
import { BookAppointmentPopupComponent } from './component/book-appointment-popup/book-appointment-popup.component';
import { CommentPopupComponent } from './component/comment-popup/comment-popup.component';
import { EditCommentPopupComponent } from './component/edit-comment-popup/edit-comment-popup.component';
import { LayoutHeaderComponent } from './component/layout-header/header.component';
import { LayoutPanelHeaderComponent } from './component/layout-panel-header/layout-panel-header.component';
import { NavigationHeaderComponent } from './component/navigation-header/navigation-header.component';
import { ReasonPopupComponent } from './component/reason-popup/reason-popup.component';
import { SidebarComponent } from './component/sidebar/sidebar.component';
import { FilterNamePipe } from './pipes/filter.name.pipe';
import { TimeParsePipe } from './pipes/time.parse.pipe';
import { SearchFilterPipe } from './pipes/search-filter.pipe';
import { PatientDataFilterPopupComponent } from './component/patient-data-filter-popup/patient-data-filter-popup.component';
import { PatientListPopupComponent } from './component/patient-list-popup/patient-list-popup.component';
import { ChangePasswordPopupComponent } from './change-password-popup/change-password-popup.component';
import { SearchPatientPopupComponent } from './component/search-patient-popup/search-patient-popup.component';
import { FaceNeckDocumentComponent } from '../layout/my-clinic/my-clinic-detail/face-neck-document/face-neck-document.component';
import { AttachmentPopupComponent } from '../layout/my-clinic/my-clinic-detail/patient-profile/attachment-popup/attachment-popup.component';
import { PatientProfileComponent } from '../layout/my-clinic/my-clinic-detail/patient-profile/patient-profile.component';
import { HistoryPopupComponent } from '../layout/my-clinic/my-clinic-detail/patient-profile/history-popup/history-popup.component';
import { PrintVisitnoteComponent } from '../layout/my-clinic/my-clinic-detail/patient-profile/print-visitnote/print-visitnote.component';
import { VisitNotePopupComponent } from '../layout/my-clinic/my-clinic-detail/patient-profile/visit-note-popup/visit-note-popup.component';
import { GeneralDocumentComponent } from '../layout/my-clinic/my-clinic-detail/general-document/general-document.component';
import { SoapDocumentComponent } from '../layout/my-clinic/my-clinic-detail/soap-document/soap-document.component';
import { SurgeryProcedureDocumentComponent } from '../layout/my-clinic/my-clinic-detail/surgery-procedure-document/surgery-procedure-document.component';
import { ClinicWebCamComponent } from '../layout/my-clinic/my-clinic-detail/web-cam/web-cam.component';
import { WebcamModule } from 'ngx-webcam';
import { ImageCropperModule } from 'ngx-image-cropper';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { route } from '../auth/auth.module';
import { QuillModule } from 'ngx-quill';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { FaceReadingDocumentComponent } from '../layout/my-clinic/my-clinic-detail/face-reading-document/face-reading-document.component';
import { SafeUrlPipe } from './pipes/safeurl.pipe';
import { RequestFormComponent } from '../layout/my-clinic/request-form/request-form.component';
import { VisitNoteDocumentationComponent } from '../layout/my-clinic/my-clinic-detail/visit-note-documentation/visit-note-documentation.component';
import { PatientAppointmentsPopupComponent } from './component/patient-appointments-popup/patient-appointments-popup.component';
import { GeneralPopupComponent } from '../layout/my-clinic/my-clinic-detail/patient-profile/general-popup/general-popup.component';
@NgModule({
  declarations: [LayoutHeaderComponent, SidebarComponent, LayoutPanelHeaderComponent, NavigationHeaderComponent, BookAppointmentPopupComponent, EditCommentPopupComponent, ReasonPopupComponent, TimeParsePipe, FilterNamePipe, CommentPopupComponent, SearchFilterPipe, PatientDataFilterPopupComponent, PatientListPopupComponent, ChangePasswordPopupComponent, SearchPatientPopupComponent,PatientProfileComponent,AttachmentPopupComponent,HistoryPopupComponent,PrintVisitnoteComponent,GeneralPopupComponent,VisitNotePopupComponent,GeneralDocumentComponent,SoapDocumentComponent,FaceNeckDocumentComponent,SurgeryProcedureDocumentComponent,ClinicWebCamComponent,FaceReadingDocumentComponent,SafeUrlPipe,RequestFormComponent,VisitNoteDocumentationComponent,PatientAppointmentsPopupComponent],
  imports: [CommonModule, RouterModule, NgSelectModule, FormsModule, ReactiveFormsModule, TooltipModule, BsDatepickerModule.forRoot(), PopoverModule.forRoot(), BsDropdownModule.forRoot(),
    WebcamModule,
    ImageCropperModule,
    TabsModule.forRoot(),
    CarouselModule.forRoot(),
    TimepickerModule.forRoot(),
    QuillModule.forRoot(),
    ClipboardModule,
    ],
  exports: [LayoutHeaderComponent, SidebarComponent, LayoutPanelHeaderComponent, NavigationHeaderComponent, BookAppointmentPopupComponent, EditCommentPopupComponent, ReasonPopupComponent, TimeParsePipe, FilterNamePipe, CommentPopupComponent, PatientDataFilterPopupComponent,PatientListPopupComponent,SearchPatientPopupComponent,PatientProfileComponent,AttachmentPopupComponent,HistoryPopupComponent,PrintVisitnoteComponent,VisitNotePopupComponent,GeneralPopupComponent,GeneralDocumentComponent,SoapDocumentComponent,FaceNeckDocumentComponent,SurgeryProcedureDocumentComponent,ClinicWebCamComponent,FaceReadingDocumentComponent,SafeUrlPipe,RequestFormComponent,VisitNoteDocumentationComponent,PatientAppointmentsPopupComponent]
})
export class SharedModule { }
