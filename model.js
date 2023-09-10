'use strict';

const animationFrames = 16;

export class Model {
    constructor() {

        this._tilemap = [
            [ 21, 21, 21, 21, 21,  1,  1, 21, 21, 21, 21, 21, 21, 21, 21],
            [ 21,  5,  6,  0, 22,  8,  8, 21, 21,  1,  5,  0, 22, 21, 21],
            [ 21, 19, 20, 14, 21,  8,  8, 21, 21,  8, 12,  7, 22, 21, 21],
            [ 21, 21, 21, 22, 21,  8,  8, 22, 21,  8, 19, 14, 21, 21, 21],
            [ 21, 21,  5,  1,  5, 15, 15,  0, 21,  8, 21, 22, 22, 21, 21],
            [ 21, 21, 12,  8, 12, 13, 13,  7, 21,  8, 22,  1,  1, 21, 21],
            [ 21, 21, 19,  8, 12, 13, 13,  7, 21,  8, 21,  8,  8, 21, 21],
            [ 21, 21, 22,  8, 19, 20, 20, 14, 21,  8, 21,  8,  8, 21, 21],
            [ 21, 21, 21,  8, 21, 22, 21, 21, 21,  8,  5, 15, 15,  0, 21],
            [ 21,  5,  1,  8,  1,  5,  0, 21, 21,  8, 19, 20, 20, 20, 21],
            [ 21, 12, 15, 15, 15, 12,  7, 21,  5, 15,  0, 22, 21, 21, 21],
            [ 21, 20, 20, 20, 20, 20, 20, 21, 19, 20, 20, 21, 21, 21, 21]
        ].reverse();

        this._playerYX = [5,7];
        this._playerTargetYX = [5,7];
        this._timeStep = 0;
    }

    getPlayerYX() {
        const miniStepEnd = 1.0*(this._timeStep % animationFrames)/animationFrames;
        const miniStepStart = 1.0 - miniStepEnd;
        const y = this._playerYX[0] * miniStepStart + this._playerTargetYX[0] * miniStepEnd;
        const x = this._playerYX[1] * miniStepStart + this._playerTargetYX[1] * miniStepEnd;
        return [y,x]
    }

    movePlayerYX(y,x) {
        if ((this._playerYX[0] == this._playerTargetYX[0]) && (this._playerYX[1] == this._playerTargetYX[1])) {
            this._playerTargetYX[0] = y + this._playerYX[0];
            this._playerTargetYX[1] = x + this._playerYX[1];
            this._timeStep = 0;
        }
    }

    getTilemapYX(y,x) {
        return this._tilemap[y][x];
    }

    advanceTime() {
        let dirty = false;
        this._timeStep = (this._timeStep + 1) % animationFrames;
        if (this._timeStep == 0) {
            this._playerYX = [ this._playerTargetYX[0], this._playerTargetYX[1] ];
            dirty = true;
        }
        return dirty;
    }

}
