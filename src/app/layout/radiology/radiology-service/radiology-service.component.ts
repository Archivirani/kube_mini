import { Component, OnInit } from '@angular/core';
import { ClinicService } from '@services/clinic.service';
import { DocumentationService } from '@services/documentation.service';

@Component({
  selector: 'app-radiology-service',
  templateUrl: './radiology-service.component.html',
  styleUrls: ['./radiology-service.component.scss']
})
export class RadiologyServiceComponent implements OnInit {
  public serviceModel: string;
  constructor(public documentationService:DocumentationService, public clinicService: ClinicService) { }

  ngOnInit(): void {
  }

}
