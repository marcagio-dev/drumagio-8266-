export interface NoteEvent {
  capteur: number;
  valeur: number;
}

export interface MsgEvent {
  capteur: number;
  spec: string;
  valeur: any;
}




export interface Sensor {
  id: number;
  note: number;
  plancher: number; 
  plafond: number;
  etat: number;
}

