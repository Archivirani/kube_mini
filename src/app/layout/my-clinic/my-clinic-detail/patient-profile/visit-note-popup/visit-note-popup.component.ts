import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DataService } from '@services/data.service';
import { Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-visit-note-popup',
  templateUrl: './visit-note-popup.component.html',
  styleUrls: ['./visit-note-popup.component.scss']
})
export class VisitNotePopupComponent implements OnInit {
  private modalRef: BsModalRef;
  constructor(private modalService: BsModalService,public dataService: DataService) { }
  @ViewChild('visitnotePopup', { static: true }) visitnotePopup: TemplateRef<any>;
  @Output() onCloseevent: EventEmitter<any> = new EventEmitter<any>();
  public dyForm: FormGroup;
  ngOnInit(): void {
  }
  showPopup(data,item){
    this.dyForm=this.createForm(data,item)
    this.modalRef = this.modalService.show(this.visitnotePopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup visit-note-Popup' });
  }

  createForm(data,item): FormGroup {
    let getDoctorId = JSON.parse(sessionStorage.getItem('User'));
    return new FormGroup({
      createdDate: new FormControl(new Date()),
      reasonForVisit: new FormControl(data.reasonForVisit),
      diagnosis: new FormControl(data.diagnosis),
      assessment : new FormControl(data.assessment),
      id:new FormControl(item === 'copy' ? 0 : data.id),
      createdBy:new FormControl(getDoctorId.id),
      updatedBy:new FormControl(getDoctorId.id),
      updatedDate:new FormControl(getDoctorId.updatedDate),
      visitNoteGeneralId:new FormControl(data.visitNoteGeneralId),
      visitNoteGeneralDocuments:new FormControl(null),
      diagnosisCode:new FormControl(data.diagnosisCode),
      documentType:new FormControl('Visit Note Document'),
      document_number:new FormControl(null),
      doctor_Code: new FormControl(data.visitNoteGeneralDocuments?.patientDocuments.doctorDode),
      patientId: new FormControl(data.visitNoteGeneralDocuments?.patientId),
      appointmentId: new FormControl(data.visitNoteGeneralDocuments?.appointmentId),
    });
  }
  getVisitNoteDocumentSave() {
    let htmlString =this.dyForm.value.assessment;
  const plainText = htmlString?.replace(/<\/?[^>]+(>|$)/g, "");
    const payload = {
      ...this.dyForm.value,
      visitNoteStatus: "Draft",
      assessment:plainText
    }
    this.dataService.post<[]>(Modules.visitNoteDocument, payload).then((res) => {
    this.modalRef.hide();
     this.onCloseevent.emit();
    });
  }
  getVisitNoteDocumentRelease() {
    let htmlString =this.dyForm.value.assessment;
  const plainText = htmlString?.replace(/<\/?[^>]+(>|$)/g, "");
    const payload = {
      ...this.dyForm.value,
      visitNoteStatus: "Released",
      assessment:plainText
    }
    this.dataService.post<[]>(Modules.visitNoteDocument, payload,true).then((res) => {
      Swal.fire({
        title: "Document Released Successfully",
        icon: 'success',
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonText: "Close",
        cancelButtonColor: '#3f7473',
        customClass: {
          container: 'notification-popup'
        }
      })
     this.modalRef.hide();
     this.onCloseevent.emit();
    });
  }

  onClose(){
    this.modalRef.hide();
  }
}
