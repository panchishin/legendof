'use strict';

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const OldScreenShader = {

	uniforms: {

		'tDiffuse': { value: null }

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		#include <common>

        uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {
            vec2 uv = vUv - 0.5;
            vec2 distort;
            distort.x = cos(uv.y*0.8);
            distort.y = cos(uv.x*0.8);
            uv /= distort;
            if ((abs(uv.x) > 0.5) || (abs(uv.y) > 0.5)) {
                gl_FragColor = vec4( vec3(0.01),1.0 );    

            } else {
                uv += 0.5;
                vec4 texel = texture2D( tDiffuse, vec2(uv.x,uv.y) );
                texel += round(fract(uv.y*50.0))*0.003;
                gl_FragColor = texel;
            }

		}`

};

const size = 16;

export class View {

    setRenderSize() {
        const width = Math.floor(window.innerWidth/32 + 1)*16;
        const height = Math.floor(window.innerHeight/32 + 1)*16;
        this.renderer.setSize( width*2, height*2 );
        this.camera = new THREE.OrthographicCamera( -width/2, width/2, height/2, -height/2, -1, 1 );
        this.dirty = true;
    }

    loadTextures(rows, cols, image) {
        const totalSprites = cols*rows; // amount of images of sprite sheet

        const loader = new THREE.TextureLoader();
        const texture = loader.load(image);
    
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.magFilter = THREE.NearestFilter;
        
        texture.repeat.x = 1.0 / cols;
        texture.repeat.y = 1.0 / rows;

        function getTextureOffset(imageIndex) {
            let row = ( rows - Math.floor( imageIndex / cols ) - 1 ) / rows;
            let col = ( imageIndex % cols ) / cols;
            return [row, col]
        }

        const textures = {}
        for (let imageIndex = 0 ; imageIndex < totalSprites ; imageIndex++ ){
            textures[imageIndex] = texture.clone();
            [textures[imageIndex].offset.y, textures[imageIndex].offset.x] = getTextureOffset(imageIndex);
        }
        this.dirty=true;
        return [getTextureOffset, textures];
    }

    constructor() {
        this.dirty = true;
        this.ready = false;
        this.fps = 60;
        this.last_frame = -1;
        this.prevPlayerYX = [0,0];
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );

        this.setRenderSize();
        document.body.appendChild( this.renderer.domElement );
        window.addEventListener("resize", ()=>{this.setRenderSize()});

        [this.getTextureOffset, this.textures] = this.loadTextures(3, 8, "./asset/wucpG7e.png");
        this.animations = {
            1: [[1, 2, 3, 4], 10],
            8: [[8, 9, 10, 11], 10],
            15: [[15, 16, 17, 18], 10],
            22: [[22, 23], 80]
        };

        this.playerMesh = null;
    }

    setModel(model){
        this.model = model;

        const playerYX = this.model.getPlayerYX();
        const geometry = new THREE.PlaneGeometry( size, size );
        for (let x=0; x<15; x++) {
            for (let y=0; y<12; y++) {
                const imageIndex = this.model.getTilemapYX(y,x);
                const material = new THREE.MeshBasicMaterial( { map: this.textures[imageIndex] } );
                let mesh = new THREE.Mesh( geometry, material );
                mesh.position.set(x*size,y*size,0);
                this.scene.add( mesh );
            }
        }
        const playerMaterial = new THREE.MeshBasicMaterial( { map: this.textures[8] } )
        this.playerMesh = new THREE.Mesh(geometry, playerMaterial)
        this.playerMesh.position.set(playerYX[1]*size, playerYX[0]*size, 0)
        this.scene.add( this.playerMesh );

        [this.camera.position.y, this.camera.position.x] = [playerYX[0]*size, playerYX[1]*size];

        this.ready = true;

        this.composer = new EffectComposer( this.renderer )
        this.composer.addPass( new RenderPass( this.scene, this.camera ) );
        this.composer.addPass( new ShaderPass( OldScreenShader ) );
        this.composer.addPass( new OutputPass() );

        return this;
    }

    render(force) {
        const cameraBound = size*2;
        const frame = Math.floor(this.clock.getElapsedTime() * this.fps);
        if (frame != this.last_frame && this.ready) {
            let updated = false;

            // move player and camera
            const playerYX = this.model.getPlayerYX();
            if (playerYX[0] != this.prevPlayerYX.y || playerYX[1] != this.prevPlayerYX.x) {
                const player = [playerYX[0]*size, playerYX[1]*size]

                if (this.camera.position.y > playerYX[0]*size + cameraBound) {
                    this.camera.position.y = playerYX[0]*size + cameraBound;
                }
                if (this.camera.position.y < playerYX[0]*size - cameraBound) {
                    this.camera.position.y = playerYX[0]*size - cameraBound;
                }

                if (this.camera.position.x > playerYX[1]*size + cameraBound) {
                    this.camera.position.x = playerYX[1]*size + cameraBound;
                }
                if (this.camera.position.x < playerYX[1]*size - cameraBound) {
                    this.camera.position.x = playerYX[1]*size - cameraBound;
                }

                // [this.camera.position.y, this.camera.position.x] = [playerYX[0]*size, playerYX[1]*size];
                this.playerMesh.position.set(playerYX[1]*size, playerYX[0]*size, 0)
                updated = true;
            }

            // do keyframe animations
            for (let i of Object.keys(this.animations)) {
                const [animation, timeStep] = this.animations[i];
                const step = Math.floor(frame / timeStep) % animation.length;
                const prev_step = Math.floor((frame-1) / timeStep) % animation.length;
                updated = updated || (step != prev_step);
                const imageIndex = animation[step];
                [this.textures[i].offset.y, this.textures[i].offset.x] = this.getTextureOffset(imageIndex);
            }

            if (force || updated) {
                this.composer.render();
                // this.renderer.render( this.scene, this.camera );
                this.last_frame = frame;
                this.dirty = false;
            }
        }
    }
}