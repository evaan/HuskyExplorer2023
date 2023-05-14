from flask import Flask, request
from RPi import GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setup(6, GPIO.OUT)

app = Flask(__name__)

@app.post('/claw')
def claw():
    if request.form["enabled"] == "0":
      GPIO.output(6, False)
    else:
      GPIO.output(6, True)
    return "clawington"

if __name__ == "__main__":
    from waitress import serve
    serve(app, host="0.0.0.0", port=5000)