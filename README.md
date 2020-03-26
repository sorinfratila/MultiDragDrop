# MultiDragDrop

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.1.0.

This project is a proof of concept for a multiple items drag and drop functionality with multiSelection.

## What does it do

- displays tiles and gap tiles in a grid display (an array of tiles) of 10 x 25 tiles = 250 (this length is editable in code, it's not limited)
- select single or multiple tiles
- ctrl-click for ctrl-click-selection behaviour
- shift-click for shift-selection behaviour
- drag and drop single or multiple tiles in same array
- keyboard events for actions such as:
  - unToggle all (escape),
  - select all (ctrl + a/cmd + a)
- OOP design

## Contributions

This was done with a very specific use case in mind and it's not very flexible at the moment, feel free to fork and use it however you wish and make updates to it that better suite your needs! I might make it into an actual usable npm package some day with a more general use case;

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
