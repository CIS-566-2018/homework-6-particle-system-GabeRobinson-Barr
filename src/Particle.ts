import {vec3, vec4} from 'gl-matrix'

class Particle {
    orig: vec3;
    elastic: boolean = false;
    position: vec3 = vec3.fromValues(0,0,0);
    velocity: vec3 = vec3.fromValues(0,0,0);
    mass: number = 1; // Default mass of 1

    constructor (origin: vec3, e: boolean) {
        this.elastic = e;
        this.orig = vec3.clone(origin);
        this.position = vec3.clone(origin);
    }

    update(step: number, force: vec4, gravity: vec3) : vec3 {
        let fLoc = vec3.fromValues(force[0], force[1], force[2]);
        let dist = Math.max(vec3.distance(fLoc, this.position), 1); // Keeping distance greater than 1 makes the forces act more predictably
        //dist = Math.min(dist, 100); // Keep distance
        let accel = force[3] / (this.mass * dist * dist * 0.25); // Treat forces as gravitational (scale down by dist^2) and divide by mass for inertia
        let fDir = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), fLoc, this.position)); // Get the normalized direction of acceleration

        let totalAcc = vec3.scale(vec3.create(), fDir, accel);
        vec3.add(totalAcc, gravity, totalAcc); // Add acceleration from gravity to the total acceleration

        if (this.elastic) {
            let eforce = vec3.subtract(vec3.create(), this.orig, this.position); // Moves back to its original position
            vec3.add(this.velocity, this.velocity, vec3.scale(vec3.create(), eforce, step));
        }

        vec3.add(this.velocity, this.velocity, vec3.fromValues(Math.sign(this.velocity[0]) * -step, Math.sign(this.velocity[1]) * -step, Math.sign(this.velocity[2]) * -step))

        // Use kinematics equations to calculate new position/velocity. Forces won't change during an update call so this should be fine
        let change = vec3.scale(vec3.create(), totalAcc, 0.5 * step * step);
        vec3.add(change, change, vec3.scale(vec3.create(), this.velocity, step)); // This is, 1/2 * Acceleration * t^2 + Velocity * t
        vec3.add(this.position, this.position, change); // Add the change to our position to complete the equation, Position = 1/2 * Acceleration * t^2 + Velocity * t + oldPosition

        vec3.add(this.velocity, this.velocity, vec3.scale(vec3.create(), totalAcc, step)); // Velocity = Acceleration * t + oldVelocity

        return vec3.clone(this.position);
    }

};

export default Particle;