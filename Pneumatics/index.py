from flask import Flask, request

app = Flask(__name__)

@app.post('/claw')
def claw():
    GPIO.output(relays[6], request.form["pressed"])
    return "clawington"

if __name__ == "__main__":
    app.run(port=5000)