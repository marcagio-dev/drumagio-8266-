import { Injectable } from '@angular/core';
import { Subject, Observable, Observer, map } from 'rxjs';
import { AnonymousSubject } from 'rxjs/internal/Subject';
import { MsgEvent } from '../models/espConfig.model';


@Injectable()
export class WebsocketService {
    private subject: AnonymousSubject<MessageEvent>;
    public messages: Subject<MsgEvent>;

    private destination = "ws://192.168.4.1/ws";
    constructor() {
        this.messages = <Subject<any>>this.connect(this.destination).pipe(
            map(
                (response: MessageEvent): MsgEvent => {
                    let data = JSON.parse(response.data)
                    data.time = new Date().toISOString();
                    return data as MsgEvent;
                }
            )
        );

    } 

    public connect(url): AnonymousSubject<MessageEvent> {
        if (!this.subject) {
            this.subject = this.create(url);
            console.log("Successfully connected: " + url);
        }
        return this.subject;
    }

    private create(url): AnonymousSubject<MessageEvent> {
        let ws = new WebSocket(url);
        let observable = new Observable((obs: Observer<MessageEvent>) => {
            ws.onmessage = obs.next.bind(obs);
            ws.onerror = obs.error.bind(obs);
            ws.onclose = obs.complete.bind(obs);


            return ws.close.bind(ws);
        });
        let observer = {
            error: null,
            complete: null,
            next: (data: Object) => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(data));
                }
            }
        };
        return new AnonymousSubject<MessageEvent>(observer, observable);
    }



}
