#version 300 es

precision highp float;

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec2 a_texCoord;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

out vec2 v_texCoord;
out float v_depth;

void main() {
    vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
    vec4 viewPos = u_viewMatrix * worldPos;
    vec4 clipPos = u_projectionMatrix * viewPos;
    
    gl_Position = clipPos;
    v_texCoord = a_texCoord;
    v_depth = -viewPos.z;
}
