import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import Icosphere from './geometry/Icosphere';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import ParticleSystem from './ParticleSystem'
import Particle from './Particle';
import { join } from 'path';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  'Load Scene': loadScene, // A function pointer, essentially
  cbrtParticles: 10,
  elastic: false,
  CenterofMass: false,
  Gravity: 0,
  Mesh: 'Cube',
};

let square: Square;
let cube: Cube; // Using cube and Icosphere for particle attraction
let icosphere: Icosphere;
let time: number = 0.0;
let system: ParticleSystem;
let lastTime: number;
let currentMesh = 'None';

function loadScene() {
  lastTime = Date.now();
  square = new Square();
  square.create();

  cube = new Cube(vec3.fromValues(0,0,0));
  cube.create();
  icosphere = new Icosphere(vec3.fromValues(0,0,0), 10, 6);
  icosphere.create();

  // Set up particles here. Hard-coded example data for now
  let offsetsArray = [];
  let colorsArray = [];
  let n = controls.cbrtParticles;
  system = new ParticleSystem(n, controls.elastic);
  let particlepos = system.update(0); // Get the initial positions of our particles

  for(let i = 0; i < n; i++) {
    for(let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        let pos = particlepos[i * n * n + j * n + k];
        offsetsArray.push(pos[0]);
        offsetsArray.push(pos[1]);
        offsetsArray.push(pos[2]);

        colorsArray.push(i / n);
        colorsArray.push(j / n);
        colorsArray.push(k / n);
        colorsArray.push(1.0); // Alpha channel
      }
    }
  }
  
  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  square.setInstanceVBOs(offsets, colors);
  square.setNumInstances(n * n * n); // 10x10 grid of "particles"
  
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'Load Scene');
  gui.add(controls, 'cbrtParticles', 1, 50).step(1);
  gui.add(controls, 'elastic');
  gui.add(controls, 'CenterofMass');
  gui.add(controls, 'Gravity', 0, 20).step(1);
  gui.add(controls, 'Mesh', ['None', 'Cube', 'Icosphere']);


  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(controls.cbrtParticles * 8, controls.cbrtParticles * 8, controls.cbrtParticles * 8), vec3.fromValues(0,0,0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/particle-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/particle-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    system.comass = controls.CenterofMass;
    system.gravity = vec3.fromValues(0, -controls.Gravity, 0);

    if (currentMesh != controls.Mesh) {
      if (controls.Mesh == 'None') {
        system.addMesh(new Float32Array(0));
      }
      else if (controls.Mesh == 'Cube') {
        system.addMesh(cube.positions);
      }
      else if (controls.Mesh == 'Icosphere') {
        system.addMesh(icosphere.positions);
      }
      currentMesh = controls.Mesh;
    }

    // Get the difference in time between ticks for particle updating
    let currTime = Date.now();
    let diffTime = (currTime - lastTime) / 1000;
    lastTime = currTime;

    let offsetsArray = [];
    let particlepos = system.update(diffTime / 10); // Get the new positions of the particles (scaled time down by 10 to slow system down)
    //console.log(particlepos);
    let n = Math.sqrt(system.pnum);

    for(let i = 0; i < particlepos.length; i++) {
        let pos = particlepos[i];
        offsetsArray.push(pos[0]);
        offsetsArray.push(pos[1]);
        offsetsArray.push(pos[2]);
      }
    
    let offsets: Float32Array = new Float32Array(offsetsArray);
    square.setInstanceOffsets(offsets);

    camera.update();
    stats.begin();
    lambert.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, lambert, [
      square,
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  
  function clicked(ev: MouseEvent) {

    let button = ev.button; // 0 for left, 2 for right
    let forcemag = 0;
    if (button == 0) {
      forcemag = 100000 * controls.cbrtParticles;
    }
    else if (button == 2) {
      forcemag = -100000 * controls.cbrtParticles;
    }
    else {
      return;
    }


    let x = ev.clientX;
    let y = ev.clientY;


    x = (x / window.innerWidth) * 2 - 1;
    y = 1 - (y / window.innerHeight) * 2;
    let F = vec3.scale(vec3.create(), camera.forward, camera.near);
    let R = vec3.scale(vec3.create(), camera.right, x * camera.near * camera.aspectRatio * Math.tan(camera.fovy / 2));
    let U = vec3.scale(vec3.create(), camera.up, y * camera.near * Math.tan(camera.fovy / 2));
    let raydir = vec3.add(vec3.create(), vec3.add(vec3.create(), F, R), U);
    vec3.normalize(raydir, raydir);
    let orig = vec3.clone(camera.position);

    let p1 = vec3.subtract(vec3.create(), system.minfield, orig);
    let p2 = vec3.subtract(vec3.create(), system.maxfield, orig);

    let dist1 = vec3.divide(vec3.create(), p1, raydir);
    let dist2 = vec3.divide(vec3.create(), p2, raydir);

    let forcepos = vec3.fromValues(0,0,0);
    let valid = false;

    if (orig[0] <= system.maxfield[0] && orig[0] >= system.minfield[0] && orig[1] <= system.maxfield[1] && orig[1] >= system.minfield[1] &&
        orig[2] <= system.maxfield[2] && orig[2] >= system.minfield[2]) {
          vec3.add(forcepos, forcepos, orig);
          valid = true;
        }

    for(let i = 0; i < 3; i++) {
      if (dist1[i] > 0) {
        vec3.add(p1, orig, vec3.scale(vec3.create(), raydir, dist1[i]));
        if (p1[0] <= system.maxfield[0] && p1[0] >= system.minfield[0] && p1[1] <= system.maxfield[1] && p1[1] >= system.minfield[1] &&
          p1[2] <= system.maxfield[2] && p1[2] >= system.minfield[2]) {
            vec3.add(forcepos, forcepos, vec3.clone(p1));
            valid = true;
          }
      }
      if (dist2[i] > 0) {
        vec3.add(p2, orig, vec3.scale(vec3.create(), raydir, dist2[i]));
        if (p2[0] <= system.maxfield[0] && p2[0] >= system.minfield[0] && p2[1] <= system.maxfield[1] && p2[1] >= system.minfield[1] &&
          p2[2] <= system.maxfield[2] && p2[2] >= system.minfield[2]) {
            vec3.add(forcepos, forcepos, vec3.clone(p2));
            valid = true;
          }
      }
    }

    if (valid) {
      vec3.scale(forcepos, forcepos, 0.5);
      system.forces.push(vec4.fromValues(forcepos[0], forcepos[1], forcepos[2], forcemag));
      //console.log(dist1);
      //console.log(p1);
      //console.log(dist2);
      //console.log(p2);
      //console.log(forcepos);
      //console.log(forcemag);
    }


  }
  window.addEventListener('click', clicked);



  // Start the render loop
  tick();
}

main();
