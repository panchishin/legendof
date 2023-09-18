'use strict';

export const OldScreenShader = {

	uniforms: {
		'tDiffuse': { value: null }
	},

	vertexShader: `

		varying vec2 v_uv;

		void main() {

			v_uv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: `

		#include <common>
        uniform sampler2D tDiffuse;
		varying vec2 v_uv;

		void main() {
            float distortion = 0.8;
            // center and distort uv have a curve
            vec2 uv = v_uv - 0.5;
            uv /= vec2(cos(uv.y*distortion),cos(uv.x*distortion));

            // grey outside of regular viewing area
            if ((abs(uv.x) > 0.5) || (abs(uv.y) > 0.5)) {
                gl_FragColor = vec4( vec3(0.01),1.0 );    

            } else {
                // undo centering
                uv += 0.5;

                // sample from distorted uv
                vec4 texel = texture2D( tDiffuse, uv );

                // add scanlines to give it an old-tv feel
                texel += round(fract(uv.y*50.0))*0.003;

                gl_FragColor = texel;
            }

		}`

};

