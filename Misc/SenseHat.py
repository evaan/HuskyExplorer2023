from sense_hat import SenseHat

sense = SenseHat()

sense.set_rotation(270)

while True:
  sense.show_message("Husky Explorer", scroll_speed=0.15, text_colour=(85, 26, 139))