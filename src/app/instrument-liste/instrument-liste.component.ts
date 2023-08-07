import { Component } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Instrument } from '../models/espConfig.model';
import { InstrumentService } from '../services/instruments.service';
import { AjouterInstrumentComponent } from './ajouter-instrument/ajouter-instrument.component';

@Component({
  selector: 'app-instrument-liste',
  templateUrl: './instrument-liste.component.html',
  styleUrls: ['./instrument-liste.component.css'],
  providers: [DialogService],
})
export class InstrumentListeComponent {
  instruments: Instrument[];

  constructor(
    private dialogSrv: DialogService,
    private instrumentSrv: InstrumentService
  ) {
    this.instruments = {} as Instrument[];
    this.instrumentSrv._instruments$.subscribe((a: any) => {
      this.instruments = a;
    });
  }

  ajouterInstrument() {
    const ref = this.dialogSrv.open(AjouterInstrumentComponent, {
      header: 'Ajouter un instrument',
    });
    ref.onClose.subscribe((a: Instrument) => {
      if (a) {
        this.instrumentSrv.ajouterUnInstrument(a);
      }
    });
  }
}
