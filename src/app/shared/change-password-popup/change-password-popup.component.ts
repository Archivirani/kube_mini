import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DataService } from '@services/data.service';
import { Modules } from '@urls';
import {  BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-change-password-popup',
  templateUrl: './change-password-popup.component.html',
  styleUrls: ['./change-password-popup.component.scss'],
  providers:[BsModalService]
})
export class ChangePasswordPopupComponent implements OnInit {
  private modalRef: BsModalRef;
  public passform: FormGroup;
  constructor(private modalService: BsModalService,private dataService:DataService) { }
  @ViewChild('Changepassword', { static: true }) Changepassword: TemplateRef<any>;
  ngOnInit(): void {
  }
  
  createForm() {
    const setData=JSON.parse(sessionStorage.getItem('User'))
    return new FormGroup({
      password:new FormControl(),
      newPassword:new FormControl(),
      confirmNewPass: new FormControl(),
      id: new FormControl(setData.id),
      username: new FormControl(setData.username),
      isActive: new FormControl(setData.isActive),
      isDeleted: new FormControl(setData.isDeleted),
      doctor_Code: new FormControl(setData.doctor_Code),
      hosp_Code: new FormControl(setData.hosp_Code),
      casheir_id: new FormControl(setData.casheir_id),
      employee_id: new FormControl(setData.employee_id),
      lastName:new FormControl(setData.lastName),
      firstName:new FormControl(setData.firstName)
    });
    
  }

  showpopup(){
    this.passform = this.createForm();
    this.modalRef = this.modalService.show(this.Changepassword, { backdrop: true, ignoreBackdropClick: false, class: 'password-bgcolor' });
  }
  savePassword(){
    if(this.passform.value){
      if(this.passform.get('newPassword').value == this.passform.get('confirmNewPass').value){
        const {confirmNewPass,...res} =this.passform.value
        this.dataService.post<[]>(Modules.ChangePassword, res).then((resp) => {
        this.modalRef.hide();
        })
    }
    else{
       Swal.fire({
        title: 'New Password and Confirm Password must match',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      this.modalRef.hide();
    }
  }




}
}