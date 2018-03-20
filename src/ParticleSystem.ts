import Particle from './Particle'
import {vec3, vec4} from 'gl-matrix'

class ParticleSystem {
    particles: Particle[] = []; // Array of particles in the system
    pnum: number = 0; // Number of particles in the system
    forces: vec4[] = []; // Array of forces in the system, [0:2] location of force, [3] magnitude of force (positive attractive, negative repulsive)
    gravity: vec3 = vec3.fromValues(0,-1,0); // Direction of gravity
    gravconst: number = 0; // Magnitude of gravity
    comass: boolean = false; // Whether center of mass attraction is activated
    minfield: vec3;
    maxfield: vec3;

    constructor (sqrtParticles: number, elastic: boolean) {
        this.pnum = sqrtParticles * sqrtParticles * sqrtParticles;
        this.minfield = vec3.fromValues(-sqrtParticles * 2,-sqrtParticles * 2,-sqrtParticles * 2);
        this.maxfield = vec3.fromValues(sqrtParticles * 2, sqrtParticles * 2, sqrtParticles * 2);
        for (let z = 0; z < sqrtParticles; z++) {
            for (let y = 0; y < sqrtParticles; y++) {
                for (let x = 0; x < sqrtParticles; x++) {
                    this.particles.push(new Particle(vec3.fromValues(x - sqrtParticles / 2, y - sqrtParticles / 2, z - sqrtParticles / 2), elastic));
                }
            }
        }
        if (this.comass) {
            this.forces.push(vec4.fromValues(sqrtParticles / 2, sqrtParticles / 2, sqrtParticles / 2, this.pnum)); // Initialize gravity from center of mass of the system
        }

    }

    update (step: number) : vec3[] {
        let newpositions : vec3[] = [];
        let CoM = vec3.fromValues(0,0,0); // Used to calculate center of mass of the system for next update call

        // Here I sum the forces in the system and pass them to each particle to simplify the calculation for updating position and velocity
        let sumForce = 0; // Holds total forces in this system
        let sumLocation = vec3.fromValues(0,0,0); // Holds average location of the forces in this system
        for (let i = 0; i < this.forces.length; i++) {
            let f = this.forces[i];
            sumForce += f[3];
            vec3.add(sumLocation, sumLocation, vec3.scale(vec3.create(), vec3.fromValues(f[0], f[1], f[2]), Math.abs(f[3])));
        }
        if (sumForce != 0) {
            vec3.scale(sumLocation, sumLocation, 1.0 / sumForce); // Divide by the total force to get the ave location
        }

        vec3.normalize(this.gravity, this.gravity);
        let grav = vec3.scale(vec3.create(), this.gravity, this.gravconst); // Direction/magnitude of gravity combined


        for (let i = 0; i < this.pnum; i++) { // Update the location of each particle
            let newp = this.particles[i].update(step, vec4.fromValues(sumLocation[0], sumLocation[1], sumLocation[2], sumForce), grav);
            let calcp = vec3.clone(newp);
            vec3.max(newp, newp, this.minfield);
            vec3.min(newp, newp, this.maxfield);
            if (vec3.length(calcp) != vec3.length(newp)) { // If a particle hits a wall cut its velocity in half
                vec3.scale(this.particles[i].velocity, this.particles[i].velocity, 0.5);
            }

            this.particles[i].position = vec3.clone(newp);
            newpositions.push(newp);
            vec3.add(CoM, CoM, newp);
        }

        // Forces[0] is always the gravitational force of the center of mass of the system (if activated)
        // As a note this Center of mass calculation isn't a particularly accurate approximation for large system like this, 
        // but its alot faster than doing n^n calculations each frame to make it accurate
        let newf: vec4[] = [];
        let i = 0;
        if (this.comass) {
            vec3.scale(CoM, CoM, 1 / this.pnum);
            newf.push(vec4.fromValues(CoM[0], CoM[1], CoM[2], this.particles[0].mass * this.pnum * this.particles[0].mass));
            i = 1;
        }
        for (i; i < this.forces.length; i++) { // Update the other forces (clicking forces)
            let f = this.forces[i];
            f[3] /= 10;
            if (f[3] >= 10) { // if this force is still large enough to be relevant add it back to the list
                newf.push(f);
            }
        }
        this.forces = newf;

        return newpositions;
    }
    

};

export default ParticleSystem;