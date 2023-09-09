'use strict';

const size = 16;

export class View {

    setRenderSize() {
        const width = Math.floor(window.innerWidth/32 + 1)*16;
        const height = Math.floor(window.innerHeight/32 + 1)*16;
        this.renderer.setSize( width*2, height*2 );
        this.camera = new THREE.OrthographicCamera( -width/2, width/2, height/2, -height/2, -1, 1 );
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
        return [getTextureOffset, textures];
    }

    constructor(model) {
        this.model = model;
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.setRenderSize();
        document.body.appendChild( this.renderer.domElement );
        window.addEventListener("resize", ()=>{this.setRenderSize()});

        this.fps = 60;
        this.last_frame = -1;
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        [this.getTextureOffset, this.textures] = this.loadTextures(3, 8, "wucpG7e.png");
        
        for (let x=-25; x<=25; x++) {
            for (let y=-15; y<=15; y++) {
                const geometry = new THREE.PlaneGeometry( size, size );
    
                const imageIndex = this.model.tilemap[(15-y)%12][(x+25)%11];
                const material = new THREE.MeshBasicMaterial( { map: this.textures[imageIndex] } );
                let mesh = new THREE.Mesh( geometry, material );
                mesh.position.set(x*size,y*size,0);
                this.scene.add( mesh );
            }
        }
    }

    render() {
        if ( this.textures && this.scene && this.camera ) {    
            const frame = Math.floor(this.clock.getElapsedTime() * this.fps);
            if (frame != this.last_frame) {
                let updated = false;
                for (let i of Object.keys(this.model.animations)) {
                    const [animation, timeStep] = this.model.animations[i];
                    const step = Math.floor(frame / timeStep) % animation.length;
                    const prev_step = Math.floor((frame-1) / timeStep) % animation.length;
                    updated = updated || (step != prev_step);
                    const imageIndex = animation[step];
                    [this.textures[i].offset.y, this.textures[i].offset.x] = this.getTextureOffset(imageIndex);
                }
                if (updated) { this.renderer.render( this.scene, this.camera ); }
                this.last_frame = frame;
            }
        }        
    }
}