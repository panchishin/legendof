'use strict';

import { Model } from './model.js';
import { View } from './view.js';
import { Control } from './control.js';

let model = new Model();
let view = new View().setModel(model);
let control = new Control().setModel(model);

let frame = 0;

function animate() {
    requestAnimationFrame( animate );

    frame = 1 - frame;
    if (frame == 1) {
        let dirty = model.advanceTime();
        view.render(dirty);
    }
}

setTimeout(animate, 10);
