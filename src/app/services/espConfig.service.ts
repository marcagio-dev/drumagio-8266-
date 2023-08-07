import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Sensor } from '../models/espConfig.model';

@Injectable({
  providedIn: 'root',
})
export class SensorService {
  private espConfig: BehaviorSubject<Sensor[]> = new BehaviorSubject<Sensor[]>({} as Sensor[]);
  public _espConfig = this.espConfig.asObservable();

  constructor(private http: HttpClient) { }

  private emitEspConfig(x: Sensor[]) {
    this.espConfig.next(x);
  }
  getConfig(): Observable<Sensor[]> {
    return this.http.get<Sensor[]>('http://192.168.4.1/getconfig').pipe(
      tap((a: Sensor[]) => {
        this.emitEspConfig(a);
      }
      ));
  }
  saveConfig(): Observable<Sensor[]> {
    return this.http.get<Sensor[]>('http://192.168.4.1/saveconfig').pipe(
    tap((a: Sensor[]) => {
        this.emitEspConfig(a);
    }));
  }

  loadConfig(): Observable<Sensor[]> {
    return this.http.get<Sensor[]>('http://192.168.4.1/loadconfig').pipe(
    tap((a: Sensor[]) => {
        this.emitEspConfig(a);
    }));
  }


}
