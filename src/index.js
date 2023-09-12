'use strict';

import { Model } from './model.js';
import { View } from './view.js';
import { Control } from './control.js';

let model = new Model();
let view = new View().setModel(model);
let control = new Control().setModel(model);

function animate() {
    requestAnimationFrame( animate );
    let dirty = model.advanceTime();
    view.render(dirty);
}

setTimeout(animate, 10);
