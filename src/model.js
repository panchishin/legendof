'use strict';

const animationFrames = 32;
const maxFrameMove = 8;

export class Action {
    static StandStill = 0;
    static MoveNorth = 1;
    static MoveWest = 2;
    static MoveEast = 4;
    static MoveSouth = 8;
    static ALL = 16 - 1;
}

export class TileAttribute {
    static None = 0;
    static Walkable = 1;
    static DownForce = 2;
    static NoNorth = 4;
    static NoSouth = 8;
}

const tileAttributes = [
    TileAttribute.Walkable + TileAttribute.NoSouth, // 0 rock top left
    TileAttribute.Walkable + TileAttribute.DownForce, // 1 animated top waterfall
    TileAttribute.None, // used for animation
    TileAttribute.None, // used for animation
    TileAttribute.None, // used for animation
    TileAttribute.Walkable + TileAttribute.NoSouth, // 5 rock top right
    TileAttribute.Walkable + TileAttribute.NoSouth, // 6 rock top middle
    TileAttribute.None, // 7 rock
    TileAttribute.Walkable + TileAttribute.DownForce, // 8 animated waterfall
    TileAttribute.None, // used for animation
    TileAttribute.None, // used for animation
    TileAttribute.None, // used for animation
    TileAttribute.None, // 12 rock
    TileAttribute.None, // 13 rock
    TileAttribute.Walkable + TileAttribute.NoNorth, // 14 rock bottom right
    TileAttribute.Walkable + TileAttribute.NoSouth, // 15 animated waterfall bottom
    TileAttribute.None, // used for animation
    TileAttribute.None, // used for animation
    TileAttribute.None, // used for animation
    TileAttribute.Walkable + TileAttribute.NoNorth, // 19 rock bottom left
    TileAttribute.Walkable + TileAttribute.NoNorth, // 20 rock bottom middle
    TileAttribute.Walkable, // 21 wall
    TileAttribute.Walkable,  // 22 animated wall
    TileAttribute.None // used for animation
];

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

        this._playerYX = [3,7];
        this._playerTargetYX = [5,7];
        this._playerAction = Action.StandStill;
        this._playerPreviousAction = Action.StandStill;
        this._timeStep = 0;
        this._playerSpeed = 0;
    }

    getPlayerYX() {
        const miniStepEnd = 1.0*(this._timeStep % animationFrames)/animationFrames;
        const miniStepStart = 1.0 - miniStepEnd;
        const y = this._playerYX[0] * miniStepStart + this._playerTargetYX[0] * miniStepEnd;
        const x = this._playerYX[1] * miniStepStart + this._playerTargetYX[1] * miniStepEnd;
        return [y,x]
    }

    setPlayerAction(action) {
        this._playerAction |= action;
    }

    unsetPlayerAction(action) {
        this._playerAction &= (Action.All - action); // Action.StandStill;
    }

    getTilemapYX(y,x) {
        try {
            return this._tilemap[y][x];
        } catch (e) {
            return 0;
        }
    }
    getTileAttribute(y,x) {
        try {
            return tileAttributes[this._tilemap[y][x]];
        } catch (e) {
            return TileAttribute.None;
        }
    }

    setTarget() {
        const target = [...this._playerYX];
        const currentTileAttribute = this.getTileAttribute(...this._playerYX);
        if ((this._playerAction & Action.MoveNorth) && ((currentTileAttribute & TileAttribute.NoNorth) != TileAttribute.NoNorth)) { target[0] = this._playerYX[0] + 1 };
        if (this._playerAction & Action.MoveWest )  { target[1] = this._playerYX[1] - 1 };
        if ((this._playerAction & Action.MoveSouth) && ((currentTileAttribute & TileAttribute.NoSouth) != TileAttribute.NoSouth)) { target[0] = this._playerYX[0] - 1 };
        if (this._playerAction & Action.MoveEast )  { target[1] = this._playerYX[1] + 1 };

        const targetTileAttribute = this.getTileAttribute(...target);
        if ((targetTileAttribute & TileAttribute.Walkable) == TileAttribute.Walkable) {
            this._playerTargetYX = target;
        }
    }

    advanceTime() {
        // nothing is happening.  don't increment the timestep

        let downForce = false;
        if (this._timeStep == 0 && this._playerAction == Action.StandStill) {
            downForce = (this.getTileAttribute(...this._playerYX) & TileAttribute.DownForce) == TileAttribute.DownForce;
            this._playerAction = downForce ? Action.MoveSouth : Action.StandStill;
            if (this._playerAction == Action.StandStill) {
                return true;
            }
        }

        // set next target position if there is an action
        if (this._timeStep == 0 && this._playerAction != Action.StandStill) {
            this._playerPreviousAction = this._playerAction;
            this.setTarget()
            this._playerSpeed = Math.max(1, this._playerSpeed);
            this._timeStep = (this._timeStep + this._playerSpeed);
        } else if (this._timeStep != 0) {
            if ((this._playerPreviousAction & this._playerAction) > 0 || this._playerAction == Action.StandStill) {
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

        this._playerAction = downForce ? Action.StandStill : this._playerAction;

        return true;
    }

}
