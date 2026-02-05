#version 300 es

precision highp float;

in vec2 v_position;

uniform vec3 u_ceilingColor;
uniform vec3 u_floorColor;
uniform vec3 u_fogColor;

out vec4 fragColor;

void main() {
    float y = v_position.y;
    
    // Create gradient from ceiling (top) to floor (bottom)
    // Middle area is fog/horizon
    
    vec3 color;
    if (y < 0.5) {
        // Floor area (bottom half)
        float t = y / 0.5;
        color = mix(u_fogColor, u_floorColor, t);
    } else {
        // Ceiling area (top half)
        float t = (y - 0.5) / 0.5;
        color = mix(u_fogColor, u_ceilingColor, 1.0 - t);
    }
    
    fragColor = vec4(color, 1.0);
}
