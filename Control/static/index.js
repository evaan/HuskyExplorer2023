const socket = io();

const connected = document.getElementById("connected");
const debug = document.getElementById("debug");
const info = document.getElementById("info");

const deadzone = 0.15;
let multiplier = 0.2;
const verticalmultiplier = 20;

var halfspeed = false;
var upfast = false;

var forward = false;
var forwardTime = 0;

var clawInterval;

var clawRotation = false;
var clawCooldown = false;

window.addEventListener('gamepadconnected', (e) => {
    connected.classList = "green";
    debug.textContent = `Id: ${e.gamepad.id}\nButtons: ${e.gamepad.buttons.length}\nAxes: ${e.gamepad.axes.length}`;
    requestAnimationFrame(onFrame);
    clawInterval = setInterval(function() {
        socket.emit("http://192.168.177.11:5000/claw", {"enabled": bool(navigator.getGamepads()[0].buttons[7].pressed)});
    }, 500);
});

function onFrame() {
    if (navigator.getGamepads().length > 0) requestAnimationFrame(onFrame);
    if (navigator.getGamepads()[0].buttons[9].pressed) {
        forward = true;
        forwardTime = Date.now() + 5000;
        setTimeout(() => {forward = false;}, 5000);
    }
    upfast = navigator.getGamepads()[0].buttons[3].pressed;
    document.getElementById("upfast").hidden = !upfast;
    halfspeed = navigator.getGamepads()[0].buttons[4].pressed;
    document.getElementById("halfspeed").hidden = !halfspeed;
    let temp = multiplier;
    if (halfspeed) multiplier /= 2;
    let motors = motorCalculation(round(navigator.getGamepads()[0].axes[0]), round(navigator.getGamepads()[0].axes[1]), round(navigator.getGamepads()[0].axes[2]), round(navigator.getGamepads()[0].axes[3]));
    if (navigator.getGamepads()[0].buttons[6].pressed && !clawCooldown) {
        clawRotation = !clawRotation;
        clawCooldown = true;
        setTimeout(() => {clawCooldown = false;}, 500);
    }
    multiplier = temp;
    motors = motors.map(function(each_element){
        return Number(each_element.toFixed(2));
    });
    info.textContent = `Motors:
    [${motors[0]}, ${motors[1]}]
    [${motors[2]}, ${motors[3]}]
    [${motors[4]}, ${motors[5]}]

    Left Stick: (${round(navigator.getGamepads()[0].axes[0])}, ${round(navigator.getGamepads()[0].axes[1])})
    Right Stick: (${round(navigator.getGamepads()[0].axes[2])}, ${round(navigator.getGamepads()[0].axes[3])})

    Y Button: ${navigator.getGamepads()[0].buttons[3].pressed}

    Left Bumper: ${navigator.getGamepads()[0].buttons[4].pressed}
    Left Trigger: ${navigator.getGamepads()[0].buttons[6].pressed}
    Right Trigger: ${navigator.getGamepads()[0].buttons[7].pressed}
    
    Start Button: ${navigator.getGamepads()[0].buttons[9].pressed}
    Forward: ${(forwardTime - Date.now() > 0) ? Math.round((forwardTime - Date.now())/100)/10 : 0}

    Claw Rotation: ${clawRotation}
    Claw Cooldown: ${clawCooldown}`;
    socket.emit("motors", {"motor0": motors[0], "motor1": motors[1], "motor2": motors[2], "motor3": motors[3], "motor4": motors[4], "motor5": motors[5], "motor6": motors[6], "clawRotation": bool(clawRotation)});
}

window.addEventListener('gamepaddisconnected', (e) => {
    connected.classList = "red";
    debug.textContent = "";
    info.textContent = "";
    clearInterval(clawInterval);
});

function round(int) {
    if (deadzone > int && -deadzone < int) return 0;
    else return Math.floor(int*100)/100;
}

function degrees(radians) {return radians * (180/Math.PI);}

function motorCalculation(x, y, r, v) {
    y *= -1;
    if (forward) return [110, 110, v*verticalmultiplier+90, v*verticalmultiplier+90, 70, 70];
    if (upfast) return [90, 90, verticalmultiplier*-1.5+90, verticalmultiplier*-1.5+90, 90, 90];
    if (r != 0) return [90+(100*r)*multiplier, 90+(-100*r)*multiplier, v*verticalmultiplier+90, v*verticalmultiplier+90, 90-(-100*r)*multiplier, 90-(100*r)*multiplier];

    const p = Math.sqrt(x * x + y * y);
    let AC, BD;
    if ((x < 0) != (y < 0)) {
        if (y !== 0) AC = ((100 - (degrees(Math.atan(Math.abs(x / y))) * (20/9)))) * p;
        else AC = -100 * p;
        BD = 100 * p;
        
    } else {
        AC = 100 * p;
        if (y !== 0) BD = (100 - (degrees(Math.atan(Math.abs(x/y))) * (20/9))) * p;
        else BD = -100 * p;
    }

    if (y<0) return [90+(-AC)*multiplier, 90+(-BD)*multiplier, v*verticalmultiplier+90, v*verticalmultiplier+90, 90-(-AC)*multiplier, 90-(-BD)*multiplier];
    else return [90+(AC)*multiplier, 90+(BD)*multiplier, v*verticalmultiplier+90, v*verticalmultiplier+90, 90-(AC)*multiplier, 90-(BD)*multiplier];
}

function bool(input) {return (input) ? "1" : "";}