"use client";

import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  ConeGeometry,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from "three";

export interface GlobePin {
  lat: number;
  lng: number;
}

const RADIUS = 1;
const INDIA = { lat: 22, lng: 80 };

function toVector(lat: number, lng: number, radius = RADIUS) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
}

/** An even spread of points over a sphere (Fibonacci lattice), drawn as the globe's surface. */
function surfacePoints(count: number) {
  const positions: number[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    positions.push(Math.cos(golden * i) * ring * RADIUS, y * RADIUS, Math.sin(golden * i) * ring * RADIUS);
  }
  return positions;
}

/**
 * A slowly turning dotted globe that faces India, with a glowing pin for each destination
 * and a small aircraft on an orbit. Decorative: the section beside it lists the same places as links.
 */
export default function Globe3D({ pins, className }: { pins: GlobePin[]; className?: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = host.current;
    if (!element) return;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    element.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.set(0, 0, 3.6);

    const globe = new Group();
    scene.add(globe);

    // A dark core hides the far side, so the globe reads as solid.
    globe.add(new Mesh(new SphereGeometry(RADIUS * 0.985, 48, 48), new MeshBasicMaterial({ color: "#0b2a33" })));

    const dots = new BufferGeometry();
    dots.setAttribute("position", new Float32BufferAttribute(surfacePoints(2600), 3));
    globe.add(new Points(dots, new PointsMaterial({ color: new Color("#7cc9d6"), size: 0.014, transparent: true, opacity: 0.75 })));

    const pinGeometry = new BufferGeometry();
    pinGeometry.setAttribute("position", new Float32BufferAttribute(pins.flatMap((pin) => toVector(pin.lat, pin.lng, RADIUS * 1.012).toArray()), 3));
    const pinMaterial = new PointsMaterial({ color: new Color("#f2a33c"), size: 0.05, transparent: true, blending: AdditiveBlending, depthWrite: false });
    globe.add(new Points(pinGeometry, pinMaterial));

    // Soft rim light: brightest at the edge of the globe, fading outwards.
    const atmosphere = new Mesh(
      new SphereGeometry(RADIUS * 1.06, 48, 48),
      new ShaderMaterial({
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        vertexShader: "varying vec3 vNormal; void main(){ vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader: "varying vec3 vNormal; void main(){ float rim = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))); float glow = pow(rim, 4.0) * 0.9; gl_FragColor = vec4(0.35, 0.78, 0.86, 1.0) * glow; }",
      }),
    );
    scene.add(atmosphere);

    // An orbit ring with a small aircraft travelling along it.
    const orbit = new Group();
    orbit.rotation.set(1.15, 0, 0.35);
    orbit.add(new Mesh(new TorusGeometry(RADIUS * 1.35, 0.003, 8, 160), new MeshBasicMaterial({ color: "#f2a33c", transparent: true, opacity: 0.45 })));
    const plane = new Mesh(new ConeGeometry(0.025, 0.08, 10), new MeshBasicMaterial({ color: "#ffffff" }));
    orbit.add(plane);
    scene.add(orbit);

    // Turn the globe so India faces the camera.
    const india = toVector(INDIA.lat, INDIA.lng);
    const baseYaw = -Math.atan2(india.x, india.z);
    globe.rotation.x = (INDIA.lat * Math.PI) / 180;

    let dragYaw = 0;
    let dragStart: number | null = null;
    const onDown = (event: PointerEvent) => {
      dragStart = event.clientX - dragYaw * 200;
      element.setPointerCapture(event.pointerId);
    };
    const onMove = (event: PointerEvent) => {
      if (dragStart !== null) dragYaw = Math.max(-1.2, Math.min(1.2, (event.clientX - dragStart) / 200));
    };
    const onUp = () => {
      dragStart = null;
    };
    element.addEventListener("pointerdown", onDown);
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerup", onUp);
    element.addEventListener("pointercancel", onUp);

    const resize = () => {
      const { clientWidth, clientHeight } = element;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / Math.max(clientHeight, 1);
      camera.updateProjectionMatrix();
    };
    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(element);
    resize();

    // Draws only while on screen and the tab is visible.
    let visible = true;
    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
    });
    viewObserver.observe(element);

    let frame = 0;
    const startTime = performance.now();
    const render = (now: number) => {
      frame = requestAnimationFrame(render);
      if (!visible || document.hidden) return;
      const t = (now - startTime) / 1000;
      // Sways around India rather than spinning it out of view.
      if (dragStart === null) dragYaw *= 0.96;
      globe.rotation.y = baseYaw + Math.sin(t * 0.25) * 0.45 + dragYaw;
      pinMaterial.size = 0.045 + Math.sin(t * 3) * 0.012;
      const angle = t * 0.5;
      plane.position.set(Math.cos(angle) * RADIUS * 1.35, Math.sin(angle) * RADIUS * 1.35, 0);
      plane.rotation.z = angle;
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      sizeObserver.disconnect();
      viewObserver.disconnect();
      element.removeEventListener("pointerdown", onDown);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerup", onUp);
      element.removeEventListener("pointercancel", onUp);
      scene.traverse((object) => {
        if (object instanceof Mesh || object instanceof Points) {
          object.geometry.dispose();
          (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [pins]);

  return <div ref={host} aria-hidden className={className} style={{ touchAction: "pan-y", cursor: "grab" }} />;
}
