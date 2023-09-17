'use strict';

export const OldScreenShader = {

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

