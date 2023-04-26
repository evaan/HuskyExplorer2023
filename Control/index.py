from flask import Flask, send_from_directory, request
import requests
from adafruit_servokit import ServoKit
from math import degrees, atan, sqrt

kit = ServoKit(channels=16)
app = Flask(__name__)

for x in range(0, 6):
    kit.servo[x].angle = 90

vpinfo = ""

@app.route('/')
def loveIsInTheAir():
    return send_from_directory('static', 'index.html')

@app.route('/index.js')
def WRONG():
    return send_from_directory('static', 'index.js')

@app.route('/jquery.js')
def gasLeak():
    return send_from_directory('static', 'jquery.js')

@app.post('/motors')
def recieve():
    for x in range(0, 6):
        kit.servo[x].angle = request.form["motor" + x]
    return "penor"

@app.post('/claw')
def claw():
    requests.post("http://127.0.0.1:5000/claw", data=request.form) #CHANGE THIS TO THE PNEUMATIC SERVERS IP!
    return "sheesh"

@app.post('/vpinput')
def vpSender():
    global vpinfo
    vpinfo += request.form['text'] + "\n"
    print(vpinfo)
    return "success"

@app.route('/vp', methods=["GET"])
def returnVpInfo():
    global vpinfo
    return vpinfo

if __name__ == '__main__':
    app.run(port=80)