import { Component, OnInit } from '@angular/core';
import { ClinicService } from '@services/clinic.service';
import { DocumentationService } from '@services/documentation.service';

@Component({
  selector: 'app-laboratory-service',
  templateUrl: './laboratory-service.component.html',
  styleUrls: ['./laboratory-service.component.scss']
})
export class LaboratoryServiceComponent implements OnInit {

  constructor(public documentationService:DocumentationService, public clinicService: ClinicService) { }

  ngOnInit(): void {
  }

}
