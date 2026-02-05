// 3D Monster models - Simple box/cube primitives
import { createBuffer, createIndexBuffer } from './renderer';

export interface MonsterMesh {
    vertexBuffer: WebGLBuffer;
    texCoordBuffer: WebGLBuffer;
    indexBuffer: WebGLBuffer;
    indexCount: number;
}

// Create a simple box mesh for monsters
export function createMonsterBoxMesh(gl: WebGL2RenderingContext, width: number, height: number, depth: number): MonsterMesh {
    const w = width / 2;
    const h = height / 2;
    const d = depth / 2;

    // Vertex positions (3D)
    const vertices = new Float32Array([
        // Front face
        -w, -h, d,  w, -h, d,  w, h, d,  -w, h, d,
        // Back face
        -w, -h, -d,  -w, h, -d,  w, h, -d,  w, -h, -d,
        // Top face
        -w, h, -d,  -w, h, d,  w, h, d,  w, h, -d,
        // Bottom face
        -w, -h, -d,  w, -h, -d,  w, -h, d,  -w, -h, d,
        // Right face
        w, -h, -d,  w, h, -d,  w, h, d,  w, -h, d,
        // Left face
        -w, -h, -d,  -w, -h, d,  -w, h, d,  -w, h, -d
    ]);

    // Texture coordinates for each face
    const texCoords = new Float32Array([
        // Front face
        0, 1,  1, 1,  1, 0,  0, 0,
        // Back face
        1, 1,  1, 0,  0, 0,  0, 1,
        // Top face
        0, 1,  0, 0,  1, 0,  1, 1,
        // Bottom face
        1, 1,  0, 1,  0, 0,  1, 0,
        // Right face
        1, 1,  1, 0,  0, 0,  0, 1,
        // Left face
        0, 1,  1, 1,  1, 0,  0, 0
    ]);

    // Indices for triangles
    const indices = new Uint16Array([
        0, 1, 2,   0, 2, 3,    // Front
        4, 5, 6,   4, 6, 7,    // Back
        8, 9, 10,  8, 10, 11,  // Top
        12, 13, 14, 12, 14, 15, // Bottom
        16, 17, 18, 16, 18, 19, // Right
        20, 21, 22, 20, 22, 23  // Left
    ]);

    return {
        vertexBuffer: createBuffer(gl, vertices),
        texCoordBuffer: createBuffer(gl, texCoords),
        indexBuffer: createIndexBuffer(gl, indices),
        indexCount: indices.length
    };
}

// Monster size configurations based on type
export interface MonsterSize {
    width: number;
    height: number;
    depth: number;
}

export function getMonsterSize(monsterName: string): MonsterSize {
    const name = monsterName.toLowerCase();
    
    // Small monsters
    if (name.includes('bat') || name.includes('rat') || name.includes('wisp') || 
        name.includes('beetle') || name.includes('imp')) {
        return { width: 0.4, height: 0.4, depth: 0.4 };
    }
    
    // Medium monsters (most common)
    if (name.includes('goblin') || name.includes('skeleton') || name.includes('zombie') ||
        name.includes('spider') || name.includes('kobold') || name.includes('slime')) {
        return { width: 0.6, height: 0.7, depth: 0.5 };
    }
    
    // Large monsters
    if (name.includes('orc') || name.includes('troll') || name.includes('knight') ||
        name.includes('minotaur') || name.includes('werewolf') || name.includes('golem')) {
        return { width: 0.9, height: 1.0, depth: 0.8 };
    }
    
    // Boss monsters
    if (name.includes('dragon') || name.includes('demon') || name.includes('lich')) {
        return { width: 1.2, height: 1.3, depth: 1.0 };
    }
    
    // Default size
    return { width: 0.6, height: 0.7, depth: 0.5 };
}

// Get texture URL for a monster
export function getMonsterTextureUrl(monsterName: string): string {
    // Map monster names to texture files
    const name = monsterName.toLowerCase().replace(/\s+/g, '_');
    return `/assets/monsters/${name}.png`;
}
