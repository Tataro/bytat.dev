import * as THREE from "three";

// ---------------------------------------------------------------------------
// Floating particles — clean, minimal, warm
// ---------------------------------------------------------------------------

const vertexShader = /* glsl */ `
uniform float uTime;
uniform vec2  uMouse;

attribute float aSize;
attribute float aSpeed;
attribute float aOffset;

varying float vAlpha;

void main() {
  vec3 pos = position;

  // Gentle floating motion — each particle has its own phase
  float t = uTime * aSpeed + aOffset;
  pos.y += sin(t) * 0.4;
  pos.x += cos(t * 0.7) * 0.2;
  pos.z += sin(t * 0.5) * 0.15;

  // Subtle mouse push
  vec3 toMouse = vec3(uMouse.x * 3.0, uMouse.y * 2.0, 0.0) - pos;
  float dist = length(toMouse);
  pos -= normalize(toMouse) * smoothstep(2.5, 0.0, dist) * 0.3;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPos;

  // Size attenuation
  gl_PointSize = aSize * (200.0 / -mvPos.z);

  // Fade with depth
  vAlpha = smoothstep(12.0, 3.0, -mvPos.z) * 0.35;
}
`;

const fragmentShader = /* glsl */ `
varying float vAlpha;

void main() {
  // Soft circle
  float d = length(gl_PointCoord - vec2(0.5));
  float alpha = smoothstep(0.5, 0.15, d) * vAlpha;

  // Warm particle color
  vec3 color = vec3(0.88, 0.72, 0.52);
  gl_FragColor = vec4(color, alpha * 0.5);
}
`;

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------
export function initScene(canvas: HTMLCanvasElement): () => void {
  const isMobile =
    globalThis.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(
    Math.min(globalThis.devicePixelRatio, isMobile ? 1.5 : 2),
  );
  renderer.setSize(globalThis.innerWidth, globalThis.innerHeight);
  renderer.setClearColor(0x0f0d0a, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    50,
    globalThis.innerWidth / globalThis.innerHeight,
    0.1,
    50,
  );
  camera.position.set(0, 0, 6);

  // --- Particles ---
  const count = isMobile ? 200 : 500;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const speeds = new Float32Array(count);
  const offsets = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Spread wide, biased to the right so left text area stays clear
    positions[i * 3] = (Math.random() - 0.2) * 14; // x — shifted right
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8; // y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10; // z

    sizes[i] = Math.random() * 3 + 0.8;
    speeds[i] = Math.random() * 0.3 + 0.1;
    offsets[i] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
  geometry.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 1));

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // --- Mouse ---
  const mouse = { x: 0, y: 0 };
  const smoothMouse = { x: 0, y: 0 };

  function onMouseMove(e: MouseEvent) {
    mouse.x = (e.clientX / globalThis.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / globalThis.innerHeight) * 2 + 1;
  }

  if (!isMobile) {
    globalThis.addEventListener("mousemove", onMouseMove);
  }

  // --- Resize ---
  function onResize() {
    camera.aspect = globalThis.innerWidth / globalThis.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(globalThis.innerWidth, globalThis.innerHeight);
  }
  globalThis.addEventListener("resize", onResize);

  // --- Animate ---
  let animationId: number;

  function animate() {
    animationId = requestAnimationFrame(animate);

    uniforms.uTime.value += 0.016;

    // Smooth mouse
    smoothMouse.x += (mouse.x - smoothMouse.x) * 0.04;
    smoothMouse.y += (mouse.y - smoothMouse.y) * 0.04;
    uniforms.uMouse.value.set(smoothMouse.x, smoothMouse.y);

    // Very slow global rotation
    particles.rotation.y += 0.0003;

    renderer.render(scene, camera);
  }

  animate();

  // --- Cleanup ---
  return () => {
    cancelAnimationFrame(animationId);
    globalThis.removeEventListener("mousemove", onMouseMove);
    globalThis.removeEventListener("resize", onResize);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
}
