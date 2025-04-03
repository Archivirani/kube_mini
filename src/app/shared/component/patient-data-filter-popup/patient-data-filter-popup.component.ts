import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '@services/data.service';
import { Patient } from '@services/model/patient.model';
import { FixedRoutes } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'patient-data-filter-popup',
  templateUrl: './patient-data-filter-popup.component.html',
  styleUrls: ['./patient-data-filter-popup.component.scss'],
  providers: [BsModalService, DatePipe]
})
export class PatientDataFilterPopupComponent implements OnInit {

  @ViewChild('filterPopup', { static: true }) filterPopup: TemplateRef<any>;
  public routerLink = FixedRoutes;
  public searchDataForm: FormGroup;
  public modalRef: BsModalRef;
  public visibleDataBackup: Patient[];
  isIPadAir: boolean;
  imageUrl: string;
  visibleData: any[];

  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();

  constructor(private modalService: BsModalService, public dataService: DataService, private router: Router) { }

  ngOnInit(): void {
    this.searchDataForm = this.generateForm();
  }

  generateForm(): FormGroup {
    return new FormGroup({
      medicalRecordNumber: new FormControl(),
      firstName: new FormControl(),
      dateOfBirth: new FormControl(),
      contactNo1: new FormControl(),
      identificationNo: new FormControl(),
    })
  }

  showPopup() {
    this.modalRef = this.modalService.show(this.filterPopup, { backdrop: true, ignoreBackdropClick: true });
  }
  registerNewUser() {
    this.modalRef.hide();
    this.router.navigate([`${FixedRoutes.Patient}/${FixedRoutes.PatientRegister}`])
  }

  submitForm() {
    this.modalRef.hide();
    this.onClose.emit(this.searchDataForm.value);
  }
  closePopup(){
    this.modalRef.hide();  
  }
}