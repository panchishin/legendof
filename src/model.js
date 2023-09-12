'use strict';

const animationFrames = 32;
const maxFrameMove = 6;

export class Action {
    static StandStill = 0;
    static MoveNorth = 1;
    static MoveWest = 2;
    static MoveEast = 4;
    static MoveSouth = 8;
    static ALL = 16 - 1;
}

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
        this._playerAction = Action.StandStill;
        this._playerPreviousAction = Action.StandStill;
        this._timeStep = 0;
    }

    getPlayerYX() {
        const miniStepEnd = 1.0*(this._timeStep % animationFrames)/animationFrames;
        const miniStepStart = 1.0 - miniStepEnd;
        const y = this._playerYX[0] * miniStepStart + this._playerTargetYX[0] * miniStepEnd;
        const x = this._playerYX[1] * miniStepStart + this._playerTargetYX[1] * miniStepEnd;
        return [y,x]
    }

    setPlayerAction(action) {
        this._playerAction = action; // this._playerAction | action;
    }

    unsetPlayerAction(action) {
        this._playerAction = Action.StandStill; // ( action ^ Action.ALL );
    }

    getTilemapYX(y,x) {
        return this._tilemap[y][x];
    }

    setTarget() {
        if (this._playerAction & Action.MoveNorth ) { this._playerTargetYX[0] = this._playerYX[0] + 1 };
        if (this._playerAction & Action.MoveWest )  { this._playerTargetYX[1] = this._playerYX[1] + 1 };
        if (this._playerAction & Action.MoveSouth ) { this._playerTargetYX[0] = this._playerYX[0] - 1 };
        if (this._playerAction & Action.MoveEast )  { this._playerTargetYX[1] = this._playerYX[1] - 1 };
    }

    advanceTime() {
        // nothing is happening.  don't increment the timestep
        if (this._timeStep == 0 && this._playerAction == Action.StandStill) {
            return true;
        }

        // set next target position if there is an action
        if (this._timeStep == 0 && this._playerAction != Action.StandStill) {
            this._playerPreviousAction = this._playerAction;
            this.setTarget()
            this._playerSpeed = 1;
            this._timeStep = (this._timeStep + this._playerSpeed);
        } else if (this._timeStep != 0) {
            if (this._playerPreviousAction == this._playerAction) {
                this._playerSpeed = Math.min(this._playerSpeed+1, maxFrameMove);
            } else if (this._timeStep + this._playerSpeed * this._playerSpeed / 2 > animationFrames) {
                this._playerSpeed = Math.max(this._playerSpeed-2, 1);
            }
            this._timeStep = (this._timeStep + this._playerSpeed);
        }
        if (this._timeStep >= animationFrames) {
            this._playerYX = [ this._playerTargetYX[0], this._playerTargetYX[1] ];
            if (this._playerPreviousAction != this._playerAction) {
                this._playerPreviousAction = this._playerAction;
                this._timeStep = 0;
            } else {
                this._timeStep = this._timeStep % animationFrames;
            }
            this.setTarget();
        }

        return true;
    }

}
