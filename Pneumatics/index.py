from flask import Flask, request
from RPi import GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setup(6, GPIO.OUT)

app = Flask(__name__)

@app.post('/claw')
def claw():
    print(request.form["pressed"])
    if request.form["pressed"] == "0":
      GPIO.output(6, False)
    else:
      GPIO.output(6, True)
    return "clawington"
    time.sleep(500)

if __name__ == "__main__":
    app.run(port=5000, host='0.0.0.0')
