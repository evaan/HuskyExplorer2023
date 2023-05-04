from flask import Flask, send_from_directory, request
import requests
from adafruit_servokit import ServoKit
from math import degrees, atan, sqrt

kit = ServoKit(channels=16)
app = Flask(__name__)

for x in range(0, 6):
    kit.servo[x].angle = 90

vpinfo = ""
vptempinfo = []

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
        kit.servo[x].angle = int(float(request.form["motor" + str(x)]))
    kit.servo[8].angle = (0 if request.form["clawrotate"] == "1" else 180)
    return "penor"

@app.post('/claw')
def claw():
    requests.post("http://192.168.177.11:5000/claw", data=request.form) #CHANGE THIS TO THE PNEUMATIC SERVERS IP!
    return "sheesh"

@app.post('/vpinput')
def vpSender():
    global vpinfo
    vpinfo = vpinfo + ("\n" if vpinfo != "" else "") + request.form['text']
    print(vpinfo)
    return "success"

@app.post('/vptempinput')
def vpTempSender():
    global vptempinfo
    vptempinfo.reverse()
    vptempinfo.append(request.form['text'])
    vptempinfo.reverse()

    return "success"

@app.route('/vp', methods=["GET"])
def returnVpInfo():
    global vpinfo, vptempinfo
    return (('\n'.join(vptempinfo[:5]) + '\n\n') if vptempinfo != "" else "") + vpinfo

if __name__ == '__main__':
    app.run(port=8080, host='0.0.0.0')
