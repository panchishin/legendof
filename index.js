'use strict';

import { Model } from './model.js';
import { View } from './view.js';

let model = new Model();
let view = new View().setModel(model);

function animate() {
    requestAnimationFrame( animate );
    view.render();
}

setTimeout(animate, 10);
