'use strict';

export class Model {
    constructor() {

        this.tilemap = [
            [21, 21, 21,  1,  1, 21, 21, 21, 21, 21, 22],
            [ 6,  0, 22,  8,  8, 21,  1,  5,  0, 22, 22],
            [20, 14, 21,  8,  8, 21,  8, 12,  7, 22, 22],
            [21, 22, 21,  8,  8, 22,  8, 19, 14, 21, 22],
            [ 0,  1,  5, 15, 15,  0,  8, 21, 22, 22, 22],
            [ 7,  8, 12, 13, 13,  7,  8, 22,  1,  1, 22],
            [14,  8, 12, 13, 13,  7,  8, 21,  8,  8, 22],
            [22,  8, 19, 20, 20, 14,  8, 21,  8,  8, 22],
            [21,  8, 21, 22, 21, 21,  8,  5, 15, 15, 22],
            [ 1,  8,  1,  5,  0, 21,  8, 19, 20, 20, 22],
            [ 8,  8,  8, 12,  7, 21,  8, 21, 22, 21, 22],
            [21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22]
        ];
        this.tilemapSize = [12,11];

        // move to view
        this.animations = {
            1: [[1, 2, 3, 4], 10],
            8: [[8, 9, 10, 11], 10],
            15: [[15, 16, 17, 18], 10],
            22: [[22, 23], 80]
        };
    
    }
}