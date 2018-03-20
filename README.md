
# Project 6: Particle System

Gabriel Robinson-Barr

To control the particle system, you can increase the number of particles with cbrtParticles. This will set the number of particles on each side of a cube, so the total number of particles will be your input cubed.

I have set up an invisible box that the particles can't move outside of. They just stop when the hit the walls. The box scales up the more particles there are in the system. Clicking inside this box will apply a force to the particles in line with where you click. Left clicking applys an attractive force to the particles, and Right clicking applys a repulsive force. For some reason on my laptop right clicking doesnt register, and I'm not sure if its because of the trackpad or its something with chrome, but just a heads up the repulsive force is mapped to mousebutton 2 whatever that happens to be on your computer. 

Checking elastic will make each particle have a small force towards its original position. Both this and cbrtParticles need to be set, and then the scene needs to be reloaded for them to take effect.

Checking CenterofMass will create a gravitational force at the center of mass of the particles. This isn't particularly accurate in simulating gravity between all the particles as far as I know, but is much faster than n^n force calculations. Also it looks nice when everything swirls around, particularly at higher particle counts. I highly reccomend leaving this on with no other forces and letting it go for a bit.

Gravity is the force of gravity. Its very hard to notice if its under 5 and particles fall pretty slowly anyway. If you check GravDown the particles will fall in the down direction relative to the camera instead of in the -y direction.

Mesh lets you pick a mesh to attract the particles. Particles only attract to vertices, and the only meshes I have as options are a basic cube, and an Icosphere with 6 tessalations. If there are more verts than particles the particles will choose one vert to attract to, if there are more particles than verts each vert will attract multiple particles. When the particles get really close to the verts they slow down and stop moving. To get them moving again you just have to apply a force to them like CenterofMass or by clicking.

The color scheme is just mapping the absolute value of the x,y,z component of each particle's velocity to its rgb color. There is a bit of tweaking to scale the velocities down but it is mostly untouched. If a particle isn't moving it turns a darkish grey, more specifically color (0.2,0.2,0.2) which is the lowest any of the color components can be. If a bunch of particles are overlapping each other it just looks like white because of the alpha blending, so if they are really clumped up it will be hard to tell the colors apart.