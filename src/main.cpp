#include <Arduino.h>
#include <ArduinoJson.h>
#include <FS.h>
#include <LittleFS.h>
#include <ESP8266WiFi.h> // Include the Wi-Fi library
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>

AsyncWebServer webServer(80);
AsyncWebSocket ws("/ws");

std::string NOTE_SPEC = "note";
std::string PLANCHER_SPEC = "plancher";
std::string PLAFOND_SPEC = "plafond";
std::string ETAT_SPEC = "etat";
std::string RESTART_SPEC = "restart";
std::string INIT_SPEC = "init";

bool resetesp = false;
const char *filename = "/config.txt";
const char progname[9] = "drumagio";

int note[16];
int plancher[16];
int plafond[16];
int etat[16];

void writeFile()
{
  File file = LittleFS.open(filename, "w");
  DynamicJsonDocument doc(1536);

  for (int i = 0; i < 16; ++i)
  {
    doc[i]["note"] = note[i];
    doc[i]["plancher"] = plancher[i];
    doc[i]["plafond"] = plafond[i];
    doc[i]["etat"] = etat[i];
  }
  serializeJson(doc, file);

  file.close();
}

void sendSerialValues(std::string spec, int capteur, int value)
{
  DynamicJsonDocument message(128);
  message["spec"] = spec;
  message["capteur"] = capteur;
  message["valeur"] = value;
  deserializeJson(message, Serial);
}

void loadFile()
{

  File file = LittleFS.open(filename, "r");
  if (!file)
  {
    for (int i = 0; i < 16; ++i)
    {
      note[i] = 0;
      plancher[i] = 1;
      plafond[i] = 127;
      etat[i] = 1;
    }
    writeFile();
  }
  else
  {
    DynamicJsonDocument filedoc(1536);
    deserializeJson(filedoc, file);
    for (int i = 0; i < 16; ++i)
    {
      note[i] = filedoc[i]["note"].as<int>();
      plancher[i] = filedoc[i]["plancher"].as<int>();
      plafond[i] = filedoc[i]["plafond"].as<int>();
      etat[i] = filedoc[i]["etat"].as<int>();
    }
  }
  file.close();
}

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len)
{
  AwsFrameInfo *info = (AwsFrameInfo *)arg;
  if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT)
  {
    DynamicJsonDocument message(128);
    deserializeJson(message, data);
    std::string spec = message["spec"].as<std::string>();
    int id = message["capteur"].as<int>();
    if (spec == RESTART_SPEC)
    {
      resetesp = true;
    }
    if (spec == NOTE_SPEC)
    {
      note[id] = message["valeur"].as<int>();
      serializeJson(message, Serial);
    }
    else if (spec == PLANCHER_SPEC)
    {
      plancher[id] = message["valeur"].as<int>();
      serializeJson(message, Serial);
    }
    else if (spec == PLAFOND_SPEC)
    {
      plafond[id] = message["valeur"].as<int>();
      serializeJson(message, Serial);
    }
    else if (spec == ETAT_SPEC)
    {
      etat[id] = message["valeur"].as<int>();
      serializeJson(message, Serial);
    }
    writeFile();
  }
}

void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type,
             void *arg, uint8_t *data, size_t len)
{
  switch (type)
  {
  case WS_EVT_CONNECT:
    break;
  case WS_EVT_DISCONNECT:
    break;
  case WS_EVT_DATA:
    handleWebSocketMessage(arg, data, len);
    break;
  case WS_EVT_PONG:
  case WS_EVT_ERROR:
    break;
  }
}
void parseAllSerialValues()
{
  for (int i = 0; i < 16; ++i)
  {
    sendSerialValues(NOTE_SPEC, i, note[i]);
    sendSerialValues(PLANCHER_SPEC, i, plancher[i]);
    sendSerialValues(PLAFOND_SPEC, i, plafond[i]);
    sendSerialValues(ETAT_SPEC, i, etat[i]);
  }
}
void setupWebServer()
{
  // FILES : 
  webServer.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(LittleFS, "/index.html", "text/html");
  });
  webServer.on("/styles.css", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(LittleFS, "/styles.css", "text/css");
  });
  webServer.on("/main.js", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(LittleFS, "/main.js", "application/javascript");
  });
    webServer.on("/polyfills.js", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(LittleFS, "/polyfills.js", "application/javascript");
  });
    webServer.on("/runtime.js", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(LittleFS, "/runtime.js", "application/javascript");
  });
    webServer.on("/index.html", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(LittleFS, "/index.html", "text/html");
  });
    webServer.on("/main.js", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(LittleFS, "/main.js", "application/javascript");
  });
    webServer.on("/favicon.ico", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(LittleFS, "/favico.ico", "image/svg");
  });

  // API FUNCTIONS :

  webServer.on("/getconfig", HTTP_GET, [](AsyncWebServerRequest *request)
               {
                 AsyncResponseStream *response = request->beginResponseStream("application/json");
  DynamicJsonDocument configdoc(1536);
  for (int i = 0; i < 16; ++i)
  {
    configdoc[i]["id"] = i;
    configdoc[i]["note"] = note[i];
    configdoc[i]["plancher"] = plancher[i];
    configdoc[i]["plafond"] = plafond[i];
    configdoc[i]["etat"] = etat[i];
  }
                 serializeJson(configdoc, *response);
                 request->send(response); });

  webServer.on("/saveconfig", HTTP_GET, [](AsyncWebServerRequest *request)
               { 
                 AsyncResponseStream *response = request->beginResponseStream("application/json");
  writeFile();
  DynamicJsonDocument configdoc(128);
  configdoc["ok"] = "ok";
                 serializeJson(configdoc, *response);
                 request->send(response); });

  webServer.on("/loadconfig", HTTP_GET, [](AsyncWebServerRequest *request)
               {
                 AsyncResponseStream *response = request->beginResponseStream("application/json");
  loadFile();
  DynamicJsonDocument configdoc(128);
  configdoc["ok"] = "ok";
                 serializeJson(configdoc, *response);
                 request->send(response); });
}
void setup()
{
  Serial.begin(31250);
  LittleFS.begin();

  loadFile();

  WiFi.mode(WIFI_AP);
  WiFi.softAP(progname, "FaceDeTransmission");

  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Methods", "PUT,POST,GET,OPTIONS");
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Headers", "*");
  ws.onEvent(onEvent);
  webServer.addHandler(&ws);
  setupWebServer();
  webServer.begin();
}

void loop()
{
  if (Serial.available())
  {
    // Read the JSON document from the "link" serial port
    DynamicJsonDocument message(128);
    deserializeJson(message, Serial);
    std::string spec = message["spec"].as<std::string>();
    if (spec == INIT_SPEC)
    {
      parseAllSerialValues();
    }
    else
    {
      char data[128];
      size_t len = serializeJson(message, data);
      ws.textAll(data, len);
    }
  }
  ws.cleanupClients();
  if (resetesp == true)
  {
    ESP.restart();
  }
}