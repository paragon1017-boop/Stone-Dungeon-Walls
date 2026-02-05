#version 300 es

precision highp float;

in vec2 v_texCoord;
in float v_depth;

uniform sampler2D u_texture;
uniform vec3 u_fogColor;
uniform float u_fogStart;
uniform float u_fogEnd;
uniform float u_fogDensity;
uniform float u_hitFlash; // Flash white when hit

out vec4 fragColor;

void main() {
    vec4 texColor = texture(u_texture, v_texCoord);
    
    // Alpha test - discard transparent pixels
    if (texColor.a < 0.5) {
        discard;
    }
    
    // Hit flash effect
    vec3 color = texColor.rgb;
    if (u_hitFlash > 0.0) {
        color = mix(color, vec3(1.0), u_hitFlash);
    }
    
    // Distance fog
    float fogFactor = smoothstep(u_fogStart, u_fogEnd, v_depth);
    fogFactor = clamp(fogFactor * u_fogDensity, 0.0, 1.0);
    
    // Apply fog
    vec3 finalColor = mix(color, u_fogColor, fogFactor);
    
    fragColor = vec4(finalColor, texColor.a);
}
