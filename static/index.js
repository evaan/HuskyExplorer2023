var index;
const connected = document.getElementById("connected");
const debug = document.getElementById("debug");
const info = document.getElementById("info");

const deadzone = 0.15;
const modifier = 0.2;

var interval;
var vpInterval;

var halfspeed = false;
var upfast = false;

var clawrotate = false;
var clawcooldown = false;
const occurrencesOf = (number,numbers) => numbers.reduce((counter, currentNumber)=> (number === currentNumber ? counter+1 : counter),0);

vpInterval = setInterval(() => {
    $.ajax({
        url:"/vp",
        type:'GET',
        success: function(data){
            document.getElementById("vp").textContent = data
        }
     });
}, 2000)

window.addEventListener('gamepadconnected', (e) => {
    index = e.gamepad.index;
    connected.classList = "green";
    debug.textContent = `Index: ${e.gamepad.index}\nId: ${e.gamepad.id}\nButtons: ${e.gamepad.buttons.length}\nAxes: ${e.gamepad.axes.length}`;
    interval = setInterval(() => {
        var motors = motorCalc(round(navigator.getGamepads()[index].axes[0]), round(navigator.getGamepads()[index].axes[1]), round(navigator.getGamepads()[index].axes[2]));
        
        /**
         *  MOTOR INDEX (CHANGE IF NEEDED):
         *  0 \ / 1
         *  3 - - 2
         *  4 / \ 5
         **/

        info.textContent = `Motors:
        [${motors[0]}, ${motors[1]}]
        [${motors[2]}, ${motors[3]}]
        [${motors[4]}, ${motors[5]}]

        Left Stick: (${round(navigator.getGamepads()[index].axes[0])}, ${round(navigator.getGamepads()[index].axes[1])})
        Right Stick: (${round(navigator.getGamepads()[index].axes[2])}, ${round(navigator.getGamepads()[index].axes[3])})

        A Button: ${navigator.getGamepads()[index].buttons[0].pressed}
        B Button: ${navigator.getGamepads()[index].buttons[1].pressed}
        X Button: ${navigator.getGamepads()[index].buttons[2].pressed}
        Y Button: ${navigator.getGamepads()[index].buttons[3].pressed}
        
        Up D-Pad: ${navigator.getGamepads()[index].buttons[12].pressed}
        Down D-Pad: ${navigator.getGamepads()[index].buttons[13].pressed}
        Left D-Pad: ${navigator.getGamepads()[index].buttons[14].pressed}
        Right D-Pad: ${navigator.getGamepads()[index].buttons[15].pressed}

        Left Bumper: ${navigator.getGamepads()[index].buttons[4].pressed}
        Right Bumper: ${navigator.getGamepads()[index].buttons[5].pressed}
        Left Trigger: ${navigator.getGamepads()[index].buttons[6].pressed}
        Right Trigger: ${navigator.getGamepads()[index].buttons[7].pressed}`;
        if (navigator.getGamepads()[index].buttons[4].pressed && !halfspeed) {
            halfspeed = true;
            document.getElementById("halfspeed").hidden = false;
        } else if (!navigator.getGamepads()[index].buttons[4].pressed && halfspeed) {
            halfspeed = false;
            document.getElementById("halfspeed").hidden = true;
        }
        if (navigator.getGamepads()[index].buttons[3].pressed && !upfast) {
            upfast = true;
            document.getElementById("upfast").hidden = false;
        } else if (!navigator.getGamepads()[index].buttons[3].pressed && upfast) {
            upfast = false;
            document.getElementById("upfast").hidden = true;
        }
	$.post("http://192.168.177.11:5000/claw", {"pressed": (navigator.getGamepads()[index].buttons[7].pressed) ? 1 : 0});
        $.post("/motors", {"motor0": motors[0], "motor1": motors[1], "motor2": motors[3], "motor3": motors[2], "motor4": motors[4], "motor5": motors[5], "clawrotate" : (navigator.getGamepads()[index].buttons[6].pressed) ? 1 : 0});
    }, 150);
});

window.addEventListener('gamepaddisconnected', (e) => {
    controller = null;
    connected.classList = "red";
    debug.textContent = "";
    clearInterval(interval);
    info.textContent = "";
});

function round(int) {
    if (deadzone > int && -deadzone < int) return 0;
    else return Math.floor(int*100)/100;
}

function degrees(radians)
{
  var pi = Math.PI;
  return radians * (180/pi);
}

function motor_values(x, y, r) {
    y = y*-1;
    if (r != 0) {
        return [100*r, -100*r, -100*r, 100*r];
    }

    let p = Math.sqrt(x*x + y*y);

    let AC, BD;
    if ((x < 0) != (y < 0)) {
	x = x*-1;
        if (y !== 0) AC = (100 - (degrees(Math.atan(Math.abs(x/y))) * (20/9)));
        else AC = -100 * p;
        BD = 100 * p;
    } else {
        AC = 100 * p;
        if (y !== 0) BD = (100 - (degrees(Math.atan(Math.abs(x/y))) * (20/9)));
        else BD = -100 * p;
    }

    if (y<0) return [-AC, -BD, -AC, -BD];
    else return [AC, BD, AC, BD];
}

function motorCalc(x, y, n) {
	balls = motor_values(x, y, n);
	return[
		parseInt(90 + (balls[2]*modifier)),
		parseInt(90 + (balls[3]*modifier)),
		parseInt(round(navigator.getGamepads()[index].axes[3])*(2/modifier)*2+90),
		parseInt(round(navigator.getGamepads()[index].axes[3])*(2/modifier)*2+90),
		parseInt(90 - (balls[1]*modifier)),
		parseInt(90 - (balls[0]*modifier))
	]
}
