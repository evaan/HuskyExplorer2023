from flask import Flask, request
from RPi import GPIO
import time
import logging
from flask_cors import CORS

logger = logging.getLogger('waitress')
logger.setLevel(logging.INFO)

GPIO.setmode(GPIO.BCM)
GPIO.setup(6, GPIO.OUT)

app = Flask(__name__)
CORS(app)

@app.post('/claw')
def claw():
    GPIO.output(6, bool(int(request.form["enabled"])))
    return "clawington"

if __name__ == "__main__":
    from waitress import serve
    serve(app, host="0.0.0.0", port=5001)