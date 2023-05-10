from socketio import Server, WSGIApp
from RPi import GPIO

GPIO.setmode(GPIO.BCM)
GPIO.setup(6, GPIO.OUT)

socket = Server()
app = WSGIApp(socket)

@socket.on("claw")
def motors(sid, request):
    if (bool(request["pressed"])):
        GPIO.output(6, True)
    else:
        GPIO.output(6, False)

if __name__ == '__main__':
    from eventlet import wsgi, listen
    wsgi.server(listen(("0.0.0.0", 5000)), app)