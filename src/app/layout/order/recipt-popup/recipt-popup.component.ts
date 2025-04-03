import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { PrintService } from '@services/print.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-recipt-popup',
  templateUrl: './recipt-popup.component.html',
  styleUrls: ['./recipt-popup.component.scss'],
  providers : [BsModalService],

})
export class ReciptPopupComponent implements OnInit {
  private model: BsModalRef;
  
  constructor(private modalService: BsModalService, private printService: PrintService) { }
  @ViewChild('reciptpopup', { static: true }) reciptpopup:TemplateRef<any>
   public reciptlist: any;
  ngOnInit(): void {
  }

  showPopup(data) {
    this.reciptlist = data;
    this.model = this.modalService.show(this.reciptpopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup' });
  }
  printDocument() {
    this.printService.print(document.getElementById("print-recipt").innerHTML)
  }
}
