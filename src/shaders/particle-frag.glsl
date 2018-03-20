#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;

out vec4 out_Col;

void main()
{
    //vec3 a = vec3(0.5, 0.5, 0.5);
    //vec3 b = vec3(fs_Col);
    //vec3 c = vec3(0.5, 0.5, 0.5); 
    //vec3 d = vec3(fs_Col);
    //vec3 col = a + b * cos(2.f * 3.14159 * (c + d));
    
    // Was experimenting with cosine palettes but I like velocity based colors better
    float dist = 1.0 - (length(fs_Pos.xyz) * 2.0);
    out_Col = vec4(dist) * (fs_Col + 0.2);
}
