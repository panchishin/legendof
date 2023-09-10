'use strict';

export class Control {
    constructor() {
    }

    setModel(model) {
        this.model = model;
        let actions = {
            'ArrowLeft' :  { desc : 'left' ,  funct : ()=>{ this.model.movePlayerYX( 0,-1) } },
            'ArrowRight' : { desc : 'right' , funct : ()=>{ this.model.movePlayerYX( 0, 1) } },
            'ArrowUp' :    { desc : 'up' ,    funct : ()=>{ this.model.movePlayerYX( 1, 0) } },
            'ArrowDown' :  { desc : 'down' ,  funct : ()=>{ this.model.movePlayerYX(-1, 0) } }
        };
        this.actions = actions;

        document.onkeydown = (e) => {
            console.log(e.code);
            if (e.code in actions) {
                this.actions[e.code].funct();
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