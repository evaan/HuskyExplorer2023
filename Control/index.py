from flask import Flask, send_from_directory, request
from adafruit_servokit import ServoKit

kit = ServoKit(channels=16)
app = Flask(__name__)

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
    print(request.form)
    for x in range(0, 6):
        kit.servo[x].angle = request.form["motor" + x]
    return "penor"

if __name__ == '__main__':
    app.run(port=80)