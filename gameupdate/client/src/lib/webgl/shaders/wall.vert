#version 300 es

precision highp float;

layout(location = 0) in vec2 a_position;  // Screen position (x, y in pixels)
layout(location = 1) in vec2 a_texCoord;  // Texture coordinates (u, v)

uniform vec2 u_screenSize;    // Screen width, height

out vec2 v_texCoord;
out float v_distance;

void main() {
    // Convert pixel coordinates to clip space (-1 to 1)
    vec2 clipPos = (a_position / u_screenSize) * 2.0 - 1.0;
    // Flip Y because WebGL has Y up, screen has Y down
    clipPos.y = -clipPos.y;
    
    gl_Position = vec4(clipPos, 0.0, 1.0);
    v_texCoord = a_texCoord;
}
