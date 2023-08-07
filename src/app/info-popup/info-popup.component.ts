import { Component, OnInit } from '@angular/core';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-info-popup',
  templateUrl: './info-popup.component.html',
  styleUrls: ['./info-popup.component.css'],
  providers: [DialogService]
})
export class InfoPopupComponent implements OnInit {
  message: string;
  action: boolean;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ){}

  ngOnInit(): void {
    this.message = this.config.data.message;
    this.action = this.config.data.action;
  }

  actionTrue() {
    this.ref.close(true);
  }

  annuler() {
    this.ref.close();
  }
}
