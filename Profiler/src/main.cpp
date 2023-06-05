#include <ESP8266WiFi.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <Servo.h>
#include <LittleFS.h>
#include <ArduinoJson.h>
#include <stdio.h>

AsyncWebServer server(80);
Servo servo;

bool enabled = false;

String logs = "";

int unixTime = 0;

String intToTimeStr(int n) {
  if (n < 10) return "0" + String(n);
  else return String(n);
}

String getTime(int t) {
  t = t + floor(millis()/1000);
  String hours;
  String minutes;
  String seconds;
  t = t % 86400;
  hours = intToTimeStr(floor(t/3600));
  t = t % 3600;
  minutes = intToTimeStr(floor(t/60));
  t = t % 60;
  seconds = intToTimeStr(t);
  return "[" + hours + ":" + minutes + ":" + seconds + "] ";
}

void logMsg(String message) {
    logs+=getTime(unixTime) + message + "\n";
}

void setup() {
  Serial.begin(9600);
  if(!LittleFS.begin()){
    Serial.println("An Error has occurred while mounting LittleFS");
    return;
  }
  File file = LittleFS.open("/config.json", "r");
  if (!file) {
    Serial.println("There was an error opening the file for reading");
    return;
  }
  char tmp[512];
  int i = 0;
  while (file.available()) {
    tmp[i] = file.read();
    i++;
  }
  tmp[i] = '\0';
  file.close();
  StaticJsonDocument<512> doc;
  DeserializationError err = deserializeJson(doc, tmp);
  if (err) {
    Serial.println("There was an error deserializing the JSON");
    return;
  }
  const char* ssid = doc["ssid"];
  const char* password = doc["password"];
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to: ");
  Serial.println(ssid);
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  servo.attach(2);
  servo.write(90);
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {request->send(LittleFS, "/index.html", "text/html");});
  server.on("/jquery-3.7.0.min.js", HTTP_GET, [](AsyncWebServerRequest *request) {request->send(LittleFS, "/jquery-3.7.0.min.js", "text/javascript");});
  server.on("/start", HTTP_GET, [](AsyncWebServerRequest *request) {
    if (!enabled) logMsg("ALVIN Starting!");
    else logMsg("ALVIN already started!");
    enabled = true;
    request->send_P(200, "text/html", "Started!");
  });
  server.on("/stop", HTTP_GET, [](AsyncWebServerRequest *request) {
    if (enabled) logMsg("ALVIN Stopped.");
    else logMsg("ALVIN already stopped!");
    enabled = false;
    request->send_P(200, "text/html", "Stopped!");
  });
  server.on("/print", HTTP_GET, [](AsyncWebServerRequest *request) {
    if (!request->hasParam("message")) {
      request->send_P(200, "text/html", "No argument provided.");
      return;
    }
    logMsg(request->getParam("message")->value());
    request->send_P(200, "text/html", "Success!");
  });
  server.on("/setTime", HTTP_GET, [](AsyncWebServerRequest *request) {
    if (unixTime != 0) {
      request->send_P(200, "text/html", "Time already set!");
      return;
    }
    if (!request->hasParam("time")) {
      request->send_P(200, "text/html", "No argument provided.");
      return;
    }
    unixTime = request->getParam("time")->value().toInt() - floor(millis()/1000);
    logMsg("Time set to: " + getTime(unixTime));
    request->send_P(200, "text/html", "Success!");
  });
  server.on("/logs", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send_P(200, "text/plain", logs.c_str());
  });
  server.begin();
}

void loop() {
  if (enabled) {
      servo.write(0);
      delay(1000);
      servo.write(180);
      delay(1000);
  } else servo.write(90);
}