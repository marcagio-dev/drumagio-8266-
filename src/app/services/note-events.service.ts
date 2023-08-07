import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NoteEvent } from '../models/espConfig.model';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root',
})
export class NoteEventService {
  private noteEvent: BehaviorSubject<NoteEvent> = new BehaviorSubject<NoteEvent>({} as NoteEvent);
  public _noteEvent$ = this.noteEvent.asObservable();

  


  constructor(private ws: WebsocketService) {
    this.ws.messages.subscribe(a => {

        this.emitNoteEvents({
          capteur: a.capteur,
          valeur: a.valeur
        } as NoteEvent);
      
      
    });
  }


  private emitNoteEvents(x: NoteEvent) {
    this.noteEvent.next(x);
  }



}
