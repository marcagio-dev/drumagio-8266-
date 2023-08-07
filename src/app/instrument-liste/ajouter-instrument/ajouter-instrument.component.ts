import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import * as midiDrumMap from '../../models/midiDrumMap.json';
import * as midiCC from '../../models/midiCC.json';
import { Capteur } from 'src/app/models/espConfig.model';

import { SelectItem } from 'primeng/api';


@Component({
  selector: 'app-ajouter-instrument',
  templateUrl: './ajouter-instrument.component.html',
  styleUrls: ['./ajouter-instrument.component.css'],
  providers: [DialogService]
})
export class AjouterInstrumentComponent {
  instrumentConfig!: FormGroup;

  midiInstrumentList = (midiDrumMap as any).default.map((f: any) => {
    return {
      label: f.labelFr,
      value: f.value,
    };
  });

  ccList = (midiCC as any).default.map((f: any) => {
    return {
      label: f.label,
      value: f.value,
    };
  });




  typeOptions: { label: string, image: string, value: string }[] =
    [
      {
        label: 'Simple Zone',
        image: '/assets/snare-drum-single.svg',
        value: 'Simple Zone'
      },
      {
        label: 'Dual Zone',
        image: '/assets/snare-drum-plus-rim.svg',
        value: 'Dual Zone'
      },
      {
        label: 'Triple Zone',
        image: '/assets/snare-drum-dual-plus-rim.svg',
        value: 'Triple Zone'
      },
      {
        label: 'Dual Cymbal',
        image: '/assets/cymbal-dual.svg',
        value: 'Dual Cymbal'
      },
      {
        label: 'Triple Zone Cymbal',
        image: '/assets/cymbal-dual-bell.svg',
        value: 'Triple Zone Cymbal'
      },
      {
        label: 'Triple Zone Cymbal + Choke',
        image: '/assets/cymbal-dual-bell.svg',
        value: 'Triple Zone Cymbal + Choke'
      },
      {
        label: 'Hi Hat',
        image: '/assets/hihat.svg',
        value: 'Hi Hat'
      }
    ];
  capteursLibres!: SelectItem[];



  constructor(
    private fb: FormBuilder,
    private ref: DynamicDialogRef) {
    this.instrumentConfig = this.fb.group({
      type: new FormControl(''),
      nom: new FormControl(''),
      capteurs: this.fb.array([])
    });
   this.capteursLibres = [];
  }





  ajouterCapteur(input: any) {
    const sens = this.sensorForm(input);
    this.capteurs.push(sens);
  }






  selectCapteur(input: any) {
    this.capteurs.clear();
    switch (input.value) {
      case 'Simple Zone': {
        this.ajouterCapteur({

          type: 'PIEZO',
          nom: 'Capteur'
        } as Capteur);
        break;
      }
      case 'Dual Zone': {
        this.ajouterCapteur({
          type: 'PIEZO',
          nom: 'Centre'
        } as Capteur);
        this.ajouterCapteur({
          type: 'PIEZO',
          nom: 'Contour'
        } as Capteur);
        break;
      }
      case 'Triple Zone': {
        this.ajouterCapteur({
          type: 'PIEZO',
          nom: 'Cloche'
        } as Capteur);
        this.ajouterCapteur({
          type: 'PIEZO',
          nom: 'Centre'
        } as Capteur);
        this.ajouterCapteur({
          type: 'PIEZO',
          nom: 'Contour'
        } as Capteur);
        break;
      }
      case 'Hi Hat': {
        this.ajouterCapteur({
          type: 'PIEZO',
          nom: 'Pad'
        } as Capteur);
        this.ajouterCapteur({
          type: 'FSR',
          nom: 'Pédale'
        } as Capteur);
        break;
      }
    }
  }

  supprimerCapteur(input: number) {
    this.capteurs.removeAt(input);
  }

  sensorForm(valeurs: Capteur): FormGroup {
    const form = this.fb.group(valeurs);
    return form;
  }


  get capteurs(): FormArray {
    return this.instrumentConfig?.get('capteurs') as FormArray;
  }


  saveInstrument() {
    this.ref.close(this.instrumentConfig.value);
  }

}
