import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import {   MsgEvent, Sensor } from '../models/espConfig.model';
import { SensorService } from '../services/espConfig.service';
import { WebsocketService } from '../services/websocket.service';
import * as midiDrumMap from '../models/midiDrumMap.json';
import * as midiCC from '../models/midiCC.json';
import { InfoPopupComponent } from '../info-popup/info-popup.component';


@Component({
  selector: 'app-panneau-connexions',
  templateUrl: './panneau-connexions.component.html',
  styleUrls: ['./panneau-connexions.component.css'],
  providers: [DialogService],
})
export class PanneauConnexionsComponent implements OnInit {
  capteurForm: FormGroup;
  capteurSelect: Sensor;
  formGroup: FormGroup;

  midiInstrumentList = (midiDrumMap as any).default.map((f: any) => {
    return {
      label: f.labelFr,
      value: f.value
    };
  });

  ccList = (midiCC as any).default.map((f: any) => {
    return {
      label: f.label,
      value: f.value,
    };
  });

  constructor(
    private dialog: DialogService,
    private espConfigSrv: SensorService,
    private ws: WebsocketService,
    private fb: FormBuilder
  ) {
    this.ws.messages.subscribe();
    
    this.capteurSelect = {} as Sensor;
    this.capteurForm = this.fb.group({
      sensors: this.fb.array([])
    });
    this.espConfigSrv._espConfig.subscribe((a: Sensor[]) => {
      const espConfig = a as Sensor[];
  
      this.sensors.clear();
      espConfig.map((i: Sensor) => {
       this.addCapteur(i);
      });
    });
   
  }

ngOnInit(){
this.espConfigSrv.getConfig().subscribe();
}


  addCapteur(input: Sensor) {
   const newForm = this.fb.group({
      id: new FormControl(input.id),
      note: new FormControl(input.note),
      plancher: new FormControl(input.plancher),
      plafond: new FormControl(input.plafond),
      etat: new FormControl(input.etat === 0 ? false : true)
     });
   this.sensors.push(newForm);
  }

  selectCapteur(input: Sensor) {
    this.capteurSelect = input;
  }

  sendMsgValue(msg: MsgEvent) {
      this.ws.messages.next(msg);
      this.espConfigSrv.getConfig().subscribe();
  }

 




get sensors(): FormArray {
 return this.capteurForm.get('sensors') as FormArray;
}

resetEsp() {
  const resPop = this.dialog.open(InfoPopupComponent, {});
  resPop.onClose.subscribe(a => {
   if (a)
   {
    this.sendMsgValue({
      capteur: 0,
      spec: "restart",
      valeur: 0
    } as MsgEvent);
    this.sensors.clear();

    this.espConfigSrv.getConfig().subscribe();
   }
  });
 }

 saveEsp() {
  const resPop = this.dialog.open(InfoPopupComponent, {});
  resPop.onClose.subscribe(a => {
   if (a)
   {
    this.espConfigSrv.saveConfig().subscribe();
    this.sensors.clear();
    this.espConfigSrv.getConfig().subscribe();
   }
  });
 }

 loadEsp() {
  const resPop = this.dialog.open(InfoPopupComponent, {});
  resPop.onClose.subscribe(a => {
   if (a)
   {
    this.espConfigSrv.loadConfig().subscribe();
    this.sensors.clear();
    this.espConfigSrv.getConfig().subscribe();
   }
  });
 }
}
