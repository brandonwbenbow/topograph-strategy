import { ShaderMaterial, MeshPhongMaterial, DoubleSide, ColorRepresentation } from 'three';

export const TopographicalShader = new ShaderMaterial({
  name: 'Topo Shader',
	uniforms: {
    time: { value: 1.0 },
    lines: { value: 5.5 }
  },

	vertexShader: `
    varying vec3 vertex;

    void main() {
      vertex = position; // Pass the position to the fragment shader
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

	fragmentShader: `
    varying vec3 vertex;
    uniform float lines;

    void main() {
      // Pick a coordinate to visualize in a grid
      float coord = vertex.z * lines;

      // Compute anti-aliased world-space grid lines
      float line = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);

      // Just visualize the grid lines directly
      float color = 1.0 - min(line, 1.0);

      // Apply gamma correction
      color = pow(color, 1.0 / 2.2);
      gl_FragColor = vec4(vec3(color), 0.75);
    }
  `
});

export const FlatMaterial = (color?: ColorRepresentation ) => new MeshPhongMaterial({ 
  name: 'Flat Material',

  color: color ?? 0x33ff33,
  // specular: 0x773300,
  side: DoubleSide,
  flatShading: true,
  shininess: 10,
  
  // wireframe: true,
  // wireframeLinewidth: 1
})