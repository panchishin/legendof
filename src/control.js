'use strict';

import { Action } from './model.js';

export class Control {
    constructor() {
    }

    setModel(model) {
        this.model = model;
        let actions = {
            'ArrowLeft' : Action.MoveWest,
            'ArrowRight' :  Action.MoveEast,
            'ArrowUp' :    Action.MoveNorth,
            'ArrowDown' :  Action.MoveSouth,
            'KeyA' : Action.MoveWest,
            'KeyD' :  Action.MoveEast,
            'KeyW' :    Action.MoveNorth,
            'KeyS' :  Action.MoveSouth,
        };
        this.actions = actions;

        document.onkeydown = (e) => {
            if (e.code in actions) {
                model.setPlayerAction(this.actions[e.code]);
            } else {
                console.log(e.code);
            }
        };

        document.onkeyup = (e) => {
            if (e.code in actions) {
                model.unsetPlayerAction(this.actions[e.code]);
            }
        };

        // prevent window from scrolling when using the arrow functions
        window.addEventListener("keydown", function(e) {
            if (e.code in actions) {
                e.preventDefault();
            }
        }, false);
    }
}