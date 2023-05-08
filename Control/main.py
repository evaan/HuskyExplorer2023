from socketio import Server, WSGIApp
from adafruit_servokit import ServoKit

kit = ServoKit(channels=16, frequency=80)

for x in range(0, 6):
    kit.servo[x].angle = 90

socket = Server()
app = WSGIApp(socket, static_files={"/": "./static/"})

@socket.on("motors")
def motors(sid, request):
    for x in range[0, 6]:
        kit.servo[x].angle = int(float(request["motor" + str(x)]))
    kit.servo[8].angle = (0 if bool(request.form["clawrotate"]) else 120)
    print(request)

if __name__ == '__main__':
    from eventlet import wsgi, listen
    wsgi.server(listen(("0.0.0.0", 8080)), app)
