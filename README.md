# ROV
This is the repository for the code of the 2023 MATE ROV.

## Installation (Requires Internet)
 - You will need `python3` installed on both machines, as these do not work with Python 2.7, I2C must also be enabled on the ROV, using `raspi-config`.
 - Make sure to install the dependencies on requirements.txt on both machines.
 - On the ROV, run the `index.py` in the `Control` directory, making sure the correct IP is written for the pneumatics computer in the `claw()` function.
 - On the pneumatics computer, run the `index.py` in the `Pneumatics` directory.
 - Open the ROV's IP in your web browser of choice, with a controller connected.
 - Profit.

## Automation
It is possible to run the ROV Control and Pneumatic automatically on starting using services. It is possible by doing the following:
 - On the ROV, move the `ROVControl.service` file to `/etc/systemd/system` directory, then enable it using `sudo systemctl enable ROVControl`, and reboot the machine.
 - On the Pneumatics computer, move the `ROVPneumatics.service` file to `/etc/systemd/system` directory, then enable it using `sudo systemctl enable ROVPneumatics`, then reboot the machine.
 - Both servers should be running on startup from now on.
 - NOTE: The services are written assuming that the default user is pi, and that the scripts are located in `~/ROV/Control/index.py` or `~/ROV/Pneumatics/index.py`.

## Controls
 - Left Stick: Forward/Backward Movement and Strafing
 - Right Stick: Vertical Movement and Turning
 - Y/Triangle Button: Full Upwards Movement, Disabling Horizontal
 - Left Bumper: Half Horizontal Speed
 - Left Trigger: Rotate Claw (toggle rotation)
 - Right Trigger: Open Claw (releasing button closes claw)
