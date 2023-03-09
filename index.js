const express = require("express")
const path = require("path");
  
const app = express();
const port = process.env.PORT || 80;

const i2cBus = require("i2c-bus");
const Pca9685Driver = require("pca9685").Pca9685Driver;

//MAKE SURE TO CHANGE THIS WHEN TESTING ON THE ACTUAL ROV AS CHANNELS MAY BE DIFFERENT!!!
pwm = new Pca9685Driver(options, function(err) {
    for (var i = 0; i>6; i++);
    pwm.setPulseValue(i, 1500);
});

// Setting path for public directory 
const static_path = path.join(__dirname, "static");
app.use(express.static(static_path));
app.use(express.urlencoded({ extended: true }));

var modifier;

app.post("/init", (req, res) => {
    modifier = req.body.modifier;
});

// Get motor values and send them to the ESCs
app.post("/motor", (req, res) => {
   console.log(req.body);
   pwm.setPulseValue(0, 1100+(req.body.motor1*400*modifier));
   pwm.setPulseValue(1, 1100+(req.body.motor2*400*modifier));
   pwm.setPulseValue(2, 1100+(req.body.motor3*400*modifier));
   pwm.setPulseValue(3, 1100+(req.body.motor4*400*modifier));
   pwm.setPulseValue(4, 1100+(req.body.motor5*400*modifier));
   pwm.setPulseValue(5, 1100+(req.body.motor6*400*modifier));

})
  
// Server Setup
app.listen(port, () => {
   console.log(`Server is currently running at port ${port}.`);
});