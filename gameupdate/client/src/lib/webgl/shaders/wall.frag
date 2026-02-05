#version 300 es

precision highp float;

in vec2 v_texCoord;

uniform sampler2D u_texture;
uniform float u_fogStart;
uniform float u_fogEnd;
uniform float u_sideShade;    // 1.0 for x-side, 0.7 for y-side

out vec4 fragColor;

void main() {
    vec4 texColor = texture(u_texture, v_texCoord);
    
    // Apply side shading (y-side walls are slightly darker)
    vec3 color = texColor.rgb * u_sideShade;
    
    // Distance fog (based on texture Y coordinate which encodes distance)
    // We encode distance in the texture Y coordinate for simplicity
    float fogFactor = smoothstep(u_fogStart, u_fogEnd, v_texCoord.y * 20.0);
    fogFactor = clamp(fogFactor, 0.0, 0.85);
    
    vec3 fogColor = vec3(0.02, 0.02, 0.03);
    color = mix(color, fogColor, fogFactor);
    
    fragColor = vec4(color, 1.0);
}
