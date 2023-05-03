var index;
const connected = document.getElementById("connected");
const debug = document.getElementById("debug");
const info = document.getElementById("info");

const deadzone = 0.15;
const modifier = 5;

var interval;
var vpInterval;

var halfspeed = false;
var upfast = false;

var clawrotate = false;
var rotationcooldown = false;

const occurrencesOf = (number,numbers) => numbers.reduce((counter, currentNumber)=> (number === currentNumber ? counter+1 : counter),0);

vpInterval = setInterval(() => {
    $.ajax({
        url:"/vp",
        type:'GET',
        success: function(data){
            document.getElementById("vp").textContent = data
        }
     });
}, 2500)

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
        if (navigator.getGamepads()[index].buttons[6].pressed && !rotationcooldown) {
            clawrotate = true;
            setTimeout(() => {rotationcooldown = false}, 350);
            rotationcooldown = true;
        }
        $.postq("/motors", {"motor0": motors[0], "motor1": motors[1], "motor2": motors[3], "motor3": motors[2], "motor4": motors[4], "motor5": motors[5], "clawrotate" : clawrotate});
    }, 100);
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

function motorCalculation(lx, ly, rx) {
    if (upfast) return [90, 90, 110, 110, 90, 90]; //disable the horizontal motors if going up fast
    //check if more than 1 sticks are active
    //lx /= occurrencesOf(true, [lx != 0, ly != 0, rx != 0]);
    //ly /= occurrencesOf(true, [lx != 0, ly != 0, rx != 0]);
    //rx /= occurrencesOf(true, [lx != 0, ly != 0, rx != 0]);
    ly = -ly; //CHANGE THIS IF THE MOTORS ARE BACKWARDS!!!
    var frontleft = ly;
    var frontright = ly;
    var backleft = ly;
    var backright = ly;
    //strafing
    if (lx > 0) {
        frontleft -= lx;
        frontright += lx;
        backleft += lx;
        backright -= lx;
    } else if (lx < 0) {
        frontleft += lx;
        frontright -= lx;
        backleft -= lx;
        backright += lx;
    }
    //turning
    if (rx > 0) {
        frontleft -= rx;
        frontright -= rx;
        backleft += rx;
        backright += rx;
    } else if (rx < 0) {
        frontleft += rx;
        frontright += rx;
        backleft -= rx;
        backright -= rx;
    }
    if (halfspeed) {
        frontleft /= 2;
        frontright /= 2;
        backleft /= 2;
        backright /= 2;
    }
    return[Math.floor(frontleft*100)/modifier+90, Math.floor(frontright*100)/modifier+90, (upfast) ? 1 : -round(navigator.getGamepads()[index].axes[3])*(2*modifier)+90, (upfast) ? 1 : -round(navigator.getGamepads()[index].axes[3])*(2*modifier)+90, Math.floor(backleft*100)/modifier+90, Math.floor(backright*100)/modifier+90];
}

//last years motor calc
function motorCalc(x, y, r) {
  if (upfast) {
    return[90, 90, 120, 120, 90, 90];
  }
  if (!(r > -deadzone && r < deadzone)) {
    return [100 * r, -100 * r, -100 * r, 100 * r];
  }

  const p = Math.sqrt(x * x + y * y);

  let AC, BD;
  if ((x < 0) != (y < 0)) {
    AC = ((100 - (Math.atan(Math.abs(x / y)) * (20/9))) * p) || 0;
    BD = 100 * p;
  } else {
    AC = 100 * p;
    BD = ((100 - (Math.atan(Math.abs(x / y)) * (20/9))) * p) || 0;
    if (!y) {
      BD = -100 * p;
    }
  }

  if (halfspeed) {
    AC /= 2;
    BD /= 2;
  }

  return y < 0 ? [-AC/modifier+90, -BD/modifier+90, -round(navigator.getGamepads()[index].axes[3])*(2*modifier)+90, -round(navigator.getGamepads()[index].axes[3])*(2*modifier)+90, -AC/modifier-90, -BD/modifier-90] : [AC/modifier+90, BD/modifier+90, -round(navigator.getGamepads()[index].axes[3])*(2*modifier)+90, -round(navigator.getGamepads()[index].axes[3])*(2*modifier)+90, AC/modifier-90, BD/modifier-90];
}