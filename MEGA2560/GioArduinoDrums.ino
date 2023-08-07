#include <MIDI.h>
#include <ArduinoJson.h>


/* PROJECT BASED ON EVAN KALE'S ArduinoMidiDrums 
 *  Added support for CC Messages on the first 2 analog inputs (to control hihat pedal / CC messages).
 *  Added support for Hiduino / mocolufa MIDI on MEGA2560
 *  Added Serial Event communication to communicate with ESP8266 Web Interface (Angular) over Wifi
 */


/*
 * Copyright (c) 2015 Evan Kale
 * Email: EvanKale91@gmail.com
 * Website: www.ISeeDeadPixel.com
 *          www.evankale.blogspot.ca
 *
 * This file is part of ArduinoMidiDrums.
 *
 * ArduinoMidiDrums is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */



const int MAX_MIDI_VELOCITY = 127;
const int SERIAL_RATE = 31250;
const int SIGNAL_BUFFER_SIZE = 100;
const int PEAK_BUFFER_SIZE = 30;
const int MAX_TIME_BETWEEN_PEAKS = 20;
const int MIN_TIME_BETWEEN_NOTES = 50;
const int analogInputs = 16;
String NOTE_SPEC = "note";
String PLANCHER_SPEC = "plancher";
String PLAFOND_SPEC = "plafond";
String ETAT_SPEC = "etat";
String RESTART_SPEC = "restart";
const int slotMap[analogInputs] = {A0, A1, A2, A3, A4, A5, A6, A7, A8, A9, A10, A11, A12, A13, A14, A15};
int currentSignalIndex[analogInputs];
int currentPeakIndex[analogInputs];
int signalBuffer[analogInputs][SIGNAL_BUFFER_SIZE];
int peakBuffer[analogInputs][PEAK_BUFFER_SIZE];
bool noteReady[analogInputs];
int noteReadyVelocity[analogInputs];
bool isLastPeakZeroed[analogInputs];
int lastPeakTime[analogInputs];
int lastNoteTime[analogInputs];
bool initiation;
long lastInitQuery;
int note[analogInputs];
int plancher[analogInputs];
int plafond[analogInputs];
int etat[analogInputs];
MIDI_CREATE_DEFAULT_INSTANCE();
void setup()
{
    Serial1.begin(31251);

    Serial2.begin(31251);

    initiation = false;
    lastInitQuery = millis();
    // initialize globals
    for (int i = 0; i < 16; ++i)
    {
        currentSignalIndex[i] = 0;
        currentPeakIndex[i] = 0;
        memset(signalBuffer[i], 0, sizeof(signalBuffer[i]));
        memset(peakBuffer[i], 0, sizeof(peakBuffer[i]));
        noteReady[i] = false;
        noteReadyVelocity[i] = 0;
        isLastPeakZeroed[i] = true;
        lastPeakTime[i] = 0;
        lastNoteTime[i] = 0;
    }
        MIDI.begin();
}

void loop()
{

    while (Serial2.available())
    {
        // Read the JSON document from the "link" serial port
        StaticJsonDocument<128> message;
        deserializeJson(message, Serial2);
        String spec = message["spec"].as<String>();
        int id = message["capteur"].as<int>();
        if (spec == NOTE_SPEC)
        {
            note[id] = message["valeur"].as<int>();
            MIDI.sendNoteOn(note[id], 127, 1);
            MIDI.sendNoteOff(note[id], 127, 1);
        }
        else if (spec == PLANCHER_SPEC)
        {
            plancher[id] = message["valeur"].as<int>();
             MIDI.sendNoteOn(note[id], plancher[id], 1);
            MIDI.sendNoteOff(note[id], plancher[id], 1);
        }
        else if (spec == PLAFOND_SPEC)
        {
            plafond[id] = message["valeur"].as<int>();
            MIDI.sendNoteOn(note[id], plafond[id], 1);
            MIDI.sendNoteOff(note[id], plafond[id], 1);
        }
        else if (spec == ETAT_SPEC)
        {
            etat[id] = message["valeur"].as<int>();
            if (etat[id] == 1)
            {
              MIDI.sendNoteOn(note[id], 127, 1);
              MIDI.sendNoteOff(note[id],127, 1);
            }
        }
    }

    long currentTime = millis();
    if (initiation == false && (currentTime - lastInitQuery) > 1000)
    {
        checkNotes();
    }
    if (initiation == true)
    {
        for (int i = 0; i < analogInputs; ++i)
        {

            int analReading = analogRead(slotMap[i]);
            int newSignal = (analReading * 127) / 1023;
            signalBuffer[i][currentSignalIndex[i]] = newSignal;
            if (i > 1)
            {
                if (!isLastPeakZeroed[i] && (currentTime - lastPeakTime[i]) > MAX_TIME_BETWEEN_PEAKS)
                {
                    recordNewPeak(i, 1);
                }
                else
                {
                    int prevSignalIndex = currentSignalIndex[i] - 1;
                    if (prevSignalIndex < 0)
                        prevSignalIndex = 100 - 1;
                    int prevSignal = signalBuffer[i][prevSignalIndex];
                    int newPeak = 0;
                    // find the wave peak if previous signal was not 0 by going
                    // through previous signal values until another 0 is reached
                    while (prevSignal >= 1)
                    {
                        if (signalBuffer[i][prevSignalIndex] > newPeak)
                        {
                            newPeak = signalBuffer[i][prevSignalIndex];
                        }

                        // decrement previous signal index, and get previous signal
                        prevSignalIndex--;
                        if (prevSignalIndex < 1)
                            prevSignalIndex = 100 - 1;
                        prevSignal = signalBuffer[i][prevSignalIndex];
                    }
                    if (newPeak > 0)
                    {
                        recordNewPeak(i, newPeak);
                    }
                }
                currentSignalIndex[i]++;
                if (currentSignalIndex[i] == 100)
                {
                    currentSignalIndex[i] = 0;
                }
            }
            if (i < 2)
            {
                int prevVelo = noteReadyVelocity[i];
                if ((currentTime - lastPeakTime[i]) > MAX_TIME_BETWEEN_PEAKS && newSignal != prevVelo)
                {
           envoyerControlChange(i, newSignal);
               
                        


                    envoyerNoteAInterface(i, newSignal);
                    noteReadyVelocity[i] = newSignal;
                    lastPeakTime[i] = currentTime;
                }
            }
        }
    }
}
void initialisation()
{
    StaticJsonDocument<128> message;
    message["spec"] = "init";
    message["capteur"] = NULL;
    message["valeur"] = NULL;
    serializeJson(message, Serial2);
}

void recordNewPeak(int slot, int newPeak)
{
    isLastPeakZeroed[slot] = (newPeak == 1);
    long currentTime = millis();
    lastPeakTime[slot] = currentTime;
    peakBuffer[slot][currentPeakIndex[slot]] = newPeak;
    int prevPeakIndex = currentPeakIndex[slot] - 1;
    if (prevPeakIndex < 0)
    {
        prevPeakIndex = 100 - 1;
    }
    int prevPeak = peakBuffer[slot][prevPeakIndex];
    if (newPeak > prevPeak && (currentTime - lastNoteTime[slot]) > MIN_TIME_BETWEEN_NOTES)
    {
        noteReady[slot] = true;
        if (newPeak > noteReadyVelocity[slot])
        {
            noteReadyVelocity[slot] = newPeak; // MIDI defines
        }
    }
    else if (newPeak < prevPeak && noteReady[slot])
    {

            envoyerNoteMidi(slot, noteReadyVelocity[slot]);
       
        envoyerNoteAInterface(slot, noteReadyVelocity[slot]);

        noteReady[slot] = false;
        noteReadyVelocity[slot] = 0;
        lastNoteTime[slot] = currentTime;
    }
    currentPeakIndex[slot]++;
    if (currentPeakIndex[slot] == 100)
    {
        currentPeakIndex[slot] = 0;
    }
}

bool checkNotes()
{
    bool checked = false;

    for (int i = 0; i < 16; ++i)
    {
        if ((note[i] || plafond[i] || plancher[i] || etat[i]) == NULL)
        {
            checked = true;
        }
    }

    initiation = checked;
}


void envoyerNoteMidi(int input, int velocity)
{
  if (etat[input] == 1)
  {
    if (velocity > plancher[input])
  {
    velocity = 127;
    }
    MIDI.sendNoteOn(note[input], velocity, 1);
    MIDI.sendNoteOff(note[input], velocity, 1);  
  }
  
}
void envoyerControlChange(int input, int velocity)
{
    if (etat[input] == 1)
  {
    if (velocity > plancher[input])
  {
    velocity = 127;
    }
  MIDI.sendControlChange(note[input], velocity, 1);
  }
}
void envoyerNoteAInterface(int input, int velocity)
{
    StaticJsonDocument<128> doc;
    doc["spec"] = "hit";
    doc["capteur"] = input;
    doc["valeur"] = velocity;
    serializeJson(doc, Serial2);
}
