from sense_hat import SenseHat
from time import sleep
from random import shuffle, choice

sense = SenseHat()

sense.set_rotation(270)

while True:
  sense.show_message("Husky Explorer", scroll_speed=0.15, text_colour=(85, 26, 139))
  locations = []
  for x in range(8):
    for y in range(8):
      locations.append((x, y))
      
  shuffle(locations)

  for x in range(64):
    colour = (255, 255, 255) if choice([True, False]) else (255, 0, 0)
    sense.set_pixel(locations[x][0], locations[x][1], colour)
    sleep(0.025)
    
  for x in range(8):
    for y in range(8):
      sense.set_pixel(y, x, 0, 0, 0)
    sleep(0.1)