const connected = document.getElementById("connected");
const debug = document.getElementById("debug");
const info = document.getElementById("info");

const deadzone = 0.15;
let multiplier = 0.2;
const verticalmultiplier = 20;

var halfspeed = false;
var upfast = false;

window.addEventListener('gamepadconnected', (e) => {
    connected.classList = "green";
    debug.textContent = ` Id: ${e.gamepad.id}\nButtons: ${e.gamepad.buttons.length}\nAxes: ${e.gamepad.axes.length}`;
    requestAnimationFrame(onFrame);
});

function onFrame() {
    if (navigator.getGamepads().length > 0) requestAnimationFrame(onFrame);
    upfast = navigator.getGamepads()[0].buttons[3].pressed;
    document.getElementById("upfast").hidden = !upfast;
    halfspeed = navigator.getGamepads()[0].buttons[4].pressed;
    document.getElementById("halfspeed").hidden = !halfspeed;
    let temp = multiplier;
    if (halfspeed) multiplier /= 2;
    var motors = motorCalculation(round(navigator.getGamepads()[0].axes[0]), round(navigator.getGamepads()[0].axes[1]), round(navigator.getGamepads()[0].axes[2]), round(navigator.getGamepads()[0].axes[3]));
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
    Right Trigger: ${navigator.getGamepads()[0].buttons[7].pressed}`;
    $.post("/motors", {"motor0": motors[0], "motor1": motors[1], "motor2": motors[2], "motor3": motors[3], "motor4": motors[4], "motor5": motors[5], "motor6": motors[6]});
    $.post("/claw", {"enabled": (navigator.getGamepads()[0].buttons[7].pressed)});
}

window.addEventListener('gamepaddisconnected', (e) => {
    connected.classList = "red";
    debug.textContent = "";
    info.textContent = "";
});

function round(int) {
    if (deadzone > int && -deadzone < int) return 0;
    else return Math.floor(int*100)/100;
}

function degrees(radians) {return radians * (180/Math.PI);}

function motorCalculation(x, y, r, v) {
    y *= -1;
    if (upfast) return [90, 90, verticalmultiplier+90, verticalmultiplier+90, 90, 90];
    if (r != 0) return [90+(100*r)*multiplier, 90+(-100*r)*multiplier, v*20+90, v*20+90, 90-(-100*r)*multiplier, 90-(100*r)*multiplier];

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