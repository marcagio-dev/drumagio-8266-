import { Component } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { CreditsComponent } from './credits/credits.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [DialogService]
})
export class AppComponent {
  title = 'Le Drum à Gio 2.0';



  constructor(
    private dialogSrv: DialogService,
    ) { 
  }


  triggerAppCredits() {
    this.dialogSrv.open(CreditsComponent, {

    });
  }


}