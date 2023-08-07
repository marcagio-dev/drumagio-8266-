import { Component, Input, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription, single } from 'rxjs';
import {  NoteEvent, Sensor } from '../models/espConfig.model';
import { NoteEventService } from '../services/note-events.service';


@Component({
  selector: 'app-line-meter',
  templateUrl: './line-meter.component.html',
  styleUrls: ['./line-meter.component.css'],
  providers: [DialogService],
})
export class LineMeterComponent implements OnInit{
  multi: any[];

  @Input() capteur: Sensor;
  updateInterval: NodeJS.Timer;
  counter = 99;
  view: any[] = [90, 40];

  plancherRef: number = 0;

  plafondRef: number = 127;

  colorScheme = {
    domain: ['#15ff00'],
  };

  noteSubscription: Subscription;

  noteEventFilter: any;
  constructor(
    private noteSrv: NoteEventService,

  ) {
    Object.assign(this, { single })

    this.multi = [{
      "name": "Data",
      "series": this.initData()
    }];


  
  }

  ngOnInit() {
    this.updateInterval = setInterval(() => {
      var data = {
        capteur: this.capteur.id,
        time: new Date().toISOString(),
        valeur: this.capteur.id <= 1 ? this.multi[this.multi.length] : 1
      };

      this.addData(data);
    }, 100);

    this.noteSrv._noteEvent$.subscribe((noteEvent: NoteEvent) => {


      if (noteEvent.capteur === this.capteur.id) {

        this.addData(noteEvent);
      }


    });
  }

  onSelect(event) {
    // console.log(event);
  }

  initData() {
    const array = [];
    for (let i = 0; i < 100; i++) {
      // console.log(i)
      array.push({
        "name": i.toString(),
        "value": 1
      });
    }
    // console.log("generated", array)
    //debugger;
    return array;
  }



  addData(input: NoteEvent) {
    this.counter++;
    // console.log("test", this.counter, this.multi);
    this.multi[0].series.shift();

    const data =
    {
      "name": this.counter.toString(),
      "value": input.valeur > 0 ? input.valeur : 1
    };
    this.multi[0].series.push(data);
    this.multi = [...this.multi];

  }

  get isLastValue(): number {


    return this.multi[this.multi.length - 1].value;
  }
}
