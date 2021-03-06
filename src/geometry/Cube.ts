import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Cube extends Drawable {
    indices: Uint32Array;
    positions: Float32Array;
    normals: Float32Array;
    center: vec4;

    constructor(center: vec3) {
        super();
        this.center = vec4.fromValues(center[0], center[1], center[2], 1);
    }

    create() {

        // Side length of 1
        let offset = 5;

        // Create the positions for the cube
        this.positions = new Float32Array([this.center[0] - offset, this.center[1] - offset, this.center[2] - offset, 1, // -Z face
                                        this.center[0] + offset, this.center[1] - offset, this.center[2] - offset, 1,
                                        this.center[0] + offset, this.center[1] + offset, this.center[2] - offset, 1,
                                        this.center[0] - offset, this.center[1] + offset, this.center[2] - offset, 1,

                                        this.center[0] + offset, this.center[1] - offset, this.center[2] + offset, 1, // +Z face
                                        this.center[0] - offset, this.center[1] - offset, this.center[2] + offset, 1,
                                        this.center[0] - offset, this.center[1] + offset, this.center[2] + offset, 1,
                                        this.center[0] + offset, this.center[1] + offset, this.center[2] + offset, 1,

                                        this.center[0] - offset, this.center[1] - offset, this.center[2] + offset, 1, // -X face
                                        this.center[0] - offset, this.center[1] - offset, this.center[2] - offset, 1,
                                        this.center[0] - offset, this.center[1] + offset, this.center[2] - offset, 1,
                                        this.center[0] - offset, this.center[1] + offset, this.center[2] + offset, 1,

                                        this.center[0] + offset, this.center[1] - offset, this.center[2] - offset, 1, // +X face
                                        this.center[0] + offset, this.center[1] - offset, this.center[2] + offset, 1,
                                        this.center[0] + offset, this.center[1] + offset, this.center[2] + offset, 1,
                                        this.center[0] + offset, this.center[1] + offset, this.center[2] - offset, 1,

                                        this.center[0] - offset, this.center[1] - offset, this.center[2] + offset, 1, // -Y face
                                        this.center[0] + offset, this.center[1] - offset, this.center[2] + offset, 1,
                                        this.center[0] + offset, this.center[1] - offset, this.center[2] - offset, 1,
                                        this.center[0] - offset, this.center[1] - offset, this.center[2] - offset, 1,

                                        this.center[0] - offset, this.center[1] + offset, this.center[2] - offset, 1, // +Y face
                                        this.center[0] + offset, this.center[1] + offset, this.center[2] - offset, 1,
                                        this.center[0] + offset, this.center[1] + offset, this.center[2] + offset, 1,
                                        this.center[0] - offset, this.center[1] + offset, this.center[2] + offset, 1]);

        this.normals = new Float32Array([0, 0, -1.0, 1,
                                        0, 0, -1.0, 1,
                                        0, 0, -1.0, 1,
                                        0, 0, -1.0, 1,
                                    
                                        0, 0, 1.0, 1,
                                        0, 0, 1.0, 1,
                                        0, 0, 1.0, 1,
                                        0, 0, 1.0, 1,

                                        -1, 0, 0, 1,
                                        -1, 0, 0, 1,
                                        -1, 0, 0, 1,
                                        -1, 0, 0, 1,

                                        1, 0, 0, 1,
                                        1, 0, 0, 1,
                                        1, 0, 0, 1,
                                        1, 0, 0, 1,

                                        0, -1, 0, 1,
                                        0, -1, 0, 1,
                                        0, -1, 0, 1,
                                        0, -1, 0, 1,

                                        0, 1, 0, 1,
                                        0, 1, 0, 1,
                                        0, 1, 0, 1,
                                        0, 1, 0, 1,]);

        this.indices = new Uint32Array([0, 1, 2,
                                        0, 2, 3,
                                        
                                        4, 5, 6,
                                        4, 6, 7,

                                        8, 9, 10,
                                        8, 10, 11,
                                        
                                        12, 13, 14,
                                        12, 14, 15,
                                    
                                        16, 17, 18,
                                        16, 18, 19,
                                    
                                        20, 21, 22,
                                        20, 22, 23]);

                                        


        this.generateIdx();
        this.generatePos();

        this.count = this.indices.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    }


};

export default Cube;