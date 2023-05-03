#include <RTClib.h>
#include <Wire.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

const char *ssid = "ssid";
const char *password = "password";

RTC_DS3231 rtc;

void getTime(){

}

void setup() 
{
  Serial.begin(9600);

  WiFi.begin(ssid, password);
  while ( WiFi.status() != WL_CONNECTED ) {
    delay ( 500 );
    Serial.print ( "." );
  }
  Serial.println();

  Wire.begin();
  rtc.begin();

  char tmp[8];
  DateTime now = rtc.now();
  sprintf(tmp, "%2d:%02d:%02d", now.hour(), now.minute(), now.second());
  HTTPClient http;
  WiFiClient client;
  http.begin(client, "http://192.168.2.64/vpinput");
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");
  http.POST("text=[" + String(tmp) + "] Vertical profiler turned on!");
}
 
void loop () {
    char tmp[8];
    DateTime now = rtc.now();
    sprintf(tmp, "%2d:%02d:%02d", now.hour(), now.minute(), now.second());
    HTTPClient http;
    WiFiClient client;
    http.begin(client, "http://192.168.2.64/vptempinput");
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");
    http.POST("text=[" + String(tmp) + "] Vertical profiler still alive!");
    Serial.println(tmp);

    delay(1000);
}