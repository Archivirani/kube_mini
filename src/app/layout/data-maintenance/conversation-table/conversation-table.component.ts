import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DataService } from '@services/data.service';
import { Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-conversation-table',
  templateUrl: './conversation-table.component.html',
  styleUrls: ['./conversation-table.component.scss'],
  providers:[BsModalService]
})
export class ConversationTableComponent implements OnInit {
  @Output() sendMedicationData: EventEmitter<any> = new EventEmitter();
  @ViewChild('conversationTable', { static: true })conversationTable:TemplateRef<any>;
  private modalRef: BsModalRef;
  public medicationTableForm:FormGroup;
  public MedicationUnitList:any[]=[];
  constructor(private modalService: BsModalService,private dataService:DataService) { 
    
  }

  ngOnInit(): void {
    this.getMedicattionUnitList()  
  }
showTable(data){
this.createMedicationList(data);
  this.modalRef = this.modalService.show(this.conversationTable, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup conversation-modal' });
}
createMedicationList(data) {
  const setData=JSON.parse(sessionStorage.getItem('User'))
  this.medicationTableForm = new FormGroup({
    id: new FormControl(data.id),
    createdBy: new FormControl(setData.id),
    createdDate: new FormControl(new Date()),
    updatedBy: new FormControl(setData.id),
    updatedDate: new FormControl(new Date()),
    code: new FormControl(data.code),
    name: new FormControl(data.name),
    defaultPrice: new FormControl(data.defaultPrice),
    categorization: new FormControl("Medication"),
    unit: new FormControl(data.unit),
    arabicName: new FormControl(''),
    isMedication: new FormControl(true),
    isActive:new FormControl(data.isActive),
    number:new FormControl(data?.number) ,
    conversionFactor:new FormControl(data.conversionFactor) ,
    medicationUnitId:new FormControl(data.medicationUnitId),
    medicationUnit:new FormControl() 
  });
}

onClose(){
  this.modalRef.hide();
}
getMedicattionUnitList(){
this.dataService.getData(Modules.getMedicationUnit).then((resp:any)=>{
  this.MedicationUnitList=resp;
})
}
saveMedicationTable() {
  const payload = this.medicationTableForm.value;
  this.dataService.post<[]>(`${Modules.addServices}`, payload).then((res: any) => {
    if (res.status == 1) {
      this.sendMedicationData.emit(payload.id);
      this.modalRef.hide();
    }
  });
}
}