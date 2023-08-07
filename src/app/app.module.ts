import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CreditsComponent } from './credits/credits.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MixerComponent } from './mixer/mixer.component';
import { PanneauConnexionsComponent } from './panneau-connexions/panneau-connexions.component';
import { ListboxModule } from 'primeng/listbox';
import { InputTextModule } from 'primeng/inputtext';
import { SliderModule } from 'primeng/slider';
import { TagModule } from 'primeng/tag';
import { ColorPickerModule } from 'primeng/colorpicker';
import { WebsocketService } from './services/websocket.service';
import { InfoPopupComponent } from './info-popup/info-popup.component';
import { LineMeterComponent } from './line-meter/line-meter.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NoteEventService } from './services/note-events.service';
import { KnobModule } from 'primeng/knob';
import { PasswordModule } from 'primeng/password';
import { SensorService } from './services/espConfig.service';
@NgModule({
    declarations: [
        AppComponent,
        CreditsComponent,
        MixerComponent,
        PanneauConnexionsComponent,
        InfoPopupComponent,
        LineMeterComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        DynamicDialogModule,
        ButtonModule,
        DropdownModule,
        InputSwitchModule,
        SliderModule,
        ListboxModule,
        InputTextModule,
        NgxChartsModule,
        TagModule,
        ColorPickerModule,
        KnobModule,
        PasswordModule
    ],
    providers: [WebsocketService, SensorService, NoteEventService],
    bootstrap: [AppComponent]
})
export class AppModule { }
