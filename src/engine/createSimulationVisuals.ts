import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { LabId, LabParameters } from "../types/lab";
import { wavelengthToRgb } from "../utils/visibleLight";
import { calculateRefractionAngle, degToRad, micrometerToMeters, millimeterToMeters, wavelengthNmToMeters } from "./waveMath";

const ROOT_NAME = "simulation-root";
const SLIT_X = -1.35;
const CM_TO_SCENE = 0.18;
const SCREEN_HALF_HEIGHT_CM = 12;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function wavelengthToColor3(wavelengthNm: number) {
  const { r, g, b } = wavelengthToRgb(wavelengthNm);
  return new Color3(r / 255, g / 255, b / 255);
}

type MaterialSet = {
  laser: StandardMaterial;
  laserSoft: StandardMaterial;
  mirror: StandardMaterial;
  barrier: StandardMaterial;
  screen: StandardMaterial;
  mediumA: StandardMaterial;
  mediumB: StandardMaterial;
  normal: StandardMaterial;
  grid: StandardMaterial;
};

function makeMaterial(scene: Scene, name: string, diffuse: Color3, emissive?: Color3, alpha = 1) {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = diffuse;
  material.emissiveColor = emissive ?? Color3.Black();
  material.specularColor = Color3.Black();
  material.alpha = alpha;
  material.backFaceCulling = false;
  return material;
}

function createMaterials(scene: Scene, laserColor: Color3): MaterialSet {
  return {
    laser: makeMaterial(scene, "sim-laser-mat", laserColor, laserColor, 1),
    laserSoft: makeMaterial(scene, "sim-laser-soft-mat", laserColor.scale(0.78), laserColor.scale(0.92), 0.72),
    mirror: makeMaterial(scene, "sim-mirror-mat", new Color3(0.86, 0.9, 0.98), new Color3(0.1, 0.12, 0.18), 1),
    barrier: makeMaterial(scene, "sim-barrier-mat", new Color3(0.82, 0.86, 0.94), new Color3(0.12, 0.14, 0.2), 1),
    screen: makeMaterial(scene, "sim-screen-mat", new Color3(0.88, 0.92, 1), new Color3(0.02, 0.03, 0.05), 1),
    mediumA: makeMaterial(scene, "sim-medium-a", new Color3(0.03, 0.09, 0.18), undefined, 1),
    mediumB: makeMaterial(scene, "sim-medium-b", new Color3(0.14, 0.07, 0.25), undefined, 1),
    normal: makeMaterial(scene, "sim-normal-mat", new Color3(0.58, 0.95, 0.86), new Color3(0.18, 0.42, 0.36), 1),
    grid: makeMaterial(scene, "sim-grid-mat", new Color3(0.12, 0.18, 0.28), undefined, 1)
  };
}

function disposeOldRoot(scene: Scene) {
  const oldRoot = scene.getTransformNodeByName(ROOT_NAME);
  if (oldRoot) {
    oldRoot.dispose(false, true);
  }

  scene.materials
    .filter((material) => material.name.startsWith("sim-"))
    .forEach((material) => material.dispose());
}

function makeRoot(scene: Scene) {
  return new TransformNode(ROOT_NAME, scene);
}

function createOpticalBench(scene: Scene, root: TransformNode, materials: MaterialSet) {
  const ground = MeshBuilder.CreateGround("optical-bench", { width: 10, height: 7, subdivisions: 2 }, scene);
  ground.parent = root;
  ground.position.y = -0.04;
  ground.material = materials.mediumA;

  for (let x = -5; x <= 5; x += 1) {
    const line = MeshBuilder.CreateLines(`grid-x-${x}`, {
      points: [new Vector3(x, -0.015, -3.5), new Vector3(x, -0.015, 3.5)]
    }, scene);
    line.parent = root;
    line.color = new Color3(0.16, 0.24, 0.34);
  }

  for (let z = -3; z <= 3; z += 1) {
    const line = MeshBuilder.CreateLines(`grid-z-${z}`, {
      points: [new Vector3(-5, -0.015, z), new Vector3(5, -0.015, z)]
    }, scene);
    line.parent = root;
    line.color = new Color3(0.16, 0.24, 0.34);
  }
}

function addTube(scene: Scene, root: TransformNode, name: string, start: Vector3, end: Vector3, material: StandardMaterial, radius = 0.035) {
  const distance = Vector3.Distance(start, end);
  if (distance < 0.001) return null;

  const tube = MeshBuilder.CreateTube(name, {
    path: [start, end],
    radius,
    tessellation: 24,
    updatable: false
  }, scene);
  tube.parent = root;
  tube.material = material;
  return tube;
}

function addLine(scene: Scene, root: TransformNode, name: string, start: Vector3, end: Vector3, color: Color3) {
  const line = MeshBuilder.CreateLines(name, { points: [start, end], updatable: false }, scene);
  line.parent = root;
  line.color = color;
  return line;
}

function addLaserSource(scene: Scene, root: TransformNode, materials: MaterialSet, position: Vector3, target: Vector3) {
  const body = MeshBuilder.CreateCylinder("laser-source", { height: 0.62, diameter: 0.22, tessellation: 32 }, scene);
  body.parent = root;
  body.position = position;
  body.material = materials.laser;
  body.rotation.z = Math.PI / 2;

  const dot = MeshBuilder.CreateSphere("laser-source-dot", { diameter: 0.28, segments: 24 }, scene);
  dot.parent = root;
  dot.position = position.add(target.subtract(position).normalize().scale(0.17));
  dot.material = materials.laserSoft;
}

function addMirror(scene: Scene, root: TransformNode, materials: MaterialSet, mirrorWidthCm: number) {
  const mirror = MeshBuilder.CreateBox("mirror", { size: 1 }, scene);
  mirror.parent = root;
  mirror.position = new Vector3(0, 0.72, 0);
  mirror.scaling = new Vector3(0.06, 0.95, clamp(mirrorWidthCm * 0.075, 1.15, 4.6));
  mirror.material = materials.mirror;
  return mirror;
}

function addScreen(scene: Scene, root: TransformNode, materials: MaterialSet, screenX: number, screenOffsetCm: number) {
  const screen = MeshBuilder.CreateBox("screen", { size: 1 }, scene);
  screen.parent = root;
  screen.position = new Vector3(screenX, 0.82, screenOffsetCm * CM_TO_SCENE);
  screen.scaling = new Vector3(0.05, 1.14, SCREEN_HALF_HEIGHT_CM * 2 * CM_TO_SCENE);
  screen.material = materials.screen;
  return screen;
}

function addBarrierSegment(scene: Scene, root: TransformNode, materials: MaterialSet, name: string, zStart: number, zEnd: number) {
  const length = Math.max(0.02, zEnd - zStart);
  const segment = MeshBuilder.CreateBox(name, { size: 1 }, scene);
  segment.parent = root;
  segment.position = new Vector3(SLIT_X, 0.74, (zStart + zEnd) / 2);
  segment.scaling = new Vector3(0.07, 0.95, length);
  segment.material = materials.barrier;
}

function addSlitBarrier(scene: Scene, root: TransformNode, materials: MaterialSet, slotCenters: number[], slotWidth: number) {
  const fullMin = -3.05;
  const fullMax = 3.05;
  const slots = slotCenters
    .map((center) => ({ start: center - slotWidth / 2, end: center + slotWidth / 2 }))
    .sort((a, b) => a.start - b.start);

  let cursor = fullMin;
  slots.forEach((slot, index) => {
    const start = Math.max(fullMin, slot.start);
    const end = Math.min(fullMax, slot.end);
    if (start > cursor) {
      addBarrierSegment(scene, root, materials, `barrier-segment-${index}`, cursor, start);
    }
    cursor = Math.max(cursor, end);
  });

  if (cursor < fullMax) {
    addBarrierSegment(scene, root, materials, "barrier-segment-last", cursor, fullMax);
  }
}

function addFringe(scene: Scene, root: TransformNode, name: string, x: number, y: number, z: number, width: number, intensity: number, color: Color3) {
  const safeIntensity = clamp(intensity, 0, 1);
  const floor = 0.025;
  const visual = floor + safeIntensity * (1 - floor);
  const material = makeMaterial(
    scene,
    `sim-fringe-${name}`,
    color.scale(visual),
    color.scale(visual * 1.1),
    1
  );

  const stripe = MeshBuilder.CreateBox(name, { size: 1 }, scene);
  stripe.parent = root;
  stripe.position = new Vector3(x, y, z);
  stripe.scaling = new Vector3(0.025, 0.96, width);
  stripe.material = material;
  return stripe;
}

function addSlitMarkers(scene: Scene, root: TransformNode, materials: MaterialSet, centers: number[], width: number) {
  centers.forEach((z, index) => {
    const marker = MeshBuilder.CreateBox(`slit-marker-${index}`, { size: 1 }, scene);
    marker.parent = root;
    marker.position = new Vector3(SLIT_X - 0.05, 0.75, z);
    marker.scaling = new Vector3(0.025, 0.82, Math.max(0.045, width * 0.6));
    marker.material = materials.laserSoft;
  });
}

function screenXFromDistance(screenDistanceM: number) {
  return SLIT_X + 2.0 + screenDistanceM * 1.65;
}

function displaySlitSeparation(slitSeparationMm: number) {
  return clamp(slitSeparationMm * 1.25, 0.28, 1.25);
}

function displaySlitWidth(slitWidthUm: number) {
  return clamp(slitWidthUm / 650, 0.055, 0.28);
}

function sincSquared(value: number) {
  if (Math.abs(value) < 0.0001) return 1;
  const sinc = Math.sin(value) / value;
  return sinc * sinc;
}

function createReflection(scene: Scene, root: TransformNode, materials: MaterialSet, params: LabParameters) {
  createOpticalBench(scene, root, materials);
  addMirror(scene, root, materials, params.mirrorWidthCm);

  const angle = degToRad(params.incidentAngleDeg);
  const incidentDir = new Vector3(Math.cos(angle), 0, Math.sin(angle)).normalize();
  const reflectedDir = new Vector3(-Math.cos(angle), 0, Math.sin(angle)).normalize();
  const hitPoint = new Vector3(0, 0.35, 0);
  const start = hitPoint.subtract(incidentDir.scale(4.2));
  const end = hitPoint.add(reflectedDir.scale(4.2));

  addLaserSource(scene, root, materials, start, hitPoint);
  addTube(scene, root, "incident-laser", start, hitPoint, materials.laser, 0.04);
  addTube(scene, root, "reflected-laser", hitPoint, end, materials.laserSoft, 0.035);
  addLine(scene, root, "normal-reflection", new Vector3(-2.2, 0.05, 0), new Vector3(2.2, 0.05, 0), new Color3(0.58, 0.95, 0.86));
}

function createRefraction(scene: Scene, root: TransformNode, materials: MaterialSet, params: LabParameters) {
  const thicknessScene = clamp(params.mediumThicknessCm * 0.08, 0.75, 3.6);

  const leftMedium = MeshBuilder.CreateGround("medium-1", { width: 5, height: 7 }, scene);
  leftMedium.parent = root;
  leftMedium.position.x = -2.5;
  leftMedium.position.y = -0.04;
  leftMedium.material = materials.mediumA;

  const rightMedium = MeshBuilder.CreateGround("medium-2", { width: thicknessScene, height: 7 }, scene);
  rightMedium.parent = root;
  rightMedium.position.x = thicknessScene / 2;
  rightMedium.position.y = -0.035;
  rightMedium.material = materials.mediumB;

  addLine(scene, root, "boundary-refraction", new Vector3(0, 0.06, -3.2), new Vector3(0, 0.06, 3.2), new Color3(0.82, 0.9, 1));
  addLine(scene, root, "normal-refraction", new Vector3(-2.2, 0.07, 0), new Vector3(2.2, 0.07, 0), new Color3(0.58, 0.95, 0.86));

  const theta1 = degToRad(params.incidentAngleDeg);
  const theta2 = calculateRefractionAngle(params.incidentAngleDeg, params.refractiveIndex1, params.refractiveIndex2);
  const incidentDir = new Vector3(Math.cos(theta1), 0, Math.sin(theta1)).normalize();
  const hitPoint = new Vector3(0, 0.35, 0);
  const start = hitPoint.subtract(incidentDir.scale(4.2));

  addLaserSource(scene, root, materials, start, hitPoint);
  addTube(scene, root, "incident-refracted-laser", start, hitPoint, materials.laser, 0.04);

  if (theta2 === null) {
    const reflectedDir = new Vector3(-Math.cos(theta1), 0, Math.sin(theta1)).normalize();
    addTube(scene, root, "total-internal-reflection", hitPoint, hitPoint.add(reflectedDir.scale(4.1)), materials.laserSoft, 0.035);
  } else {
    const refractedDir = new Vector3(Math.cos(theta2), 0, Math.sin(theta2)).normalize();
    const refractedLength = clamp(thicknessScene / Math.max(0.18, Math.cos(theta2)), 1.6, 4.2);
    addTube(scene, root, "refracted-laser", hitPoint, hitPoint.add(refractedDir.scale(refractedLength)), materials.laserSoft, 0.04);
  }
}

function createInterference(scene: Scene, root: TransformNode, materials: MaterialSet, params: LabParameters, laserColor: Color3) {
  createOpticalBench(scene, root, materials);

  const screenX = screenXFromDistance(params.screenDistanceM);
  const lambda = wavelengthNmToMeters(params.wavelengthNm);
  const d = millimeterToMeters(params.slitSeparationMm);
  const a = micrometerToMeters(params.slitWidthUm);
  const slitOffsetScene = params.slitOffsetCm * CM_TO_SCENE;
  const displayD = displaySlitSeparation(params.slitSeparationMm);
  const displayA = displaySlitWidth(params.slitWidthUm);
  const slitA = slitOffsetScene - displayD / 2;
  const slitB = slitOffsetScene + displayD / 2;
  const source = new Vector3(-4.35, 0.36, slitOffsetScene);
  const slitCenter = new Vector3(SLIT_X, 0.36, slitOffsetScene);
  const slitPointA = new Vector3(SLIT_X, 0.36, slitA);
  const slitPointB = new Vector3(SLIT_X, 0.36, slitB);

  addScreen(scene, root, materials, screenX, params.screenOffsetCm);
  addSlitBarrier(scene, root, materials, [slitA, slitB], displayA);
  addSlitMarkers(scene, root, materials, [slitA, slitB], displayA);
  addLaserSource(scene, root, materials, source, slitCenter);

  addTube(scene, root, "laser-to-slit-center", source, slitCenter, materials.laser, 0.04);
  addTube(scene, root, "laser-to-slit-a", slitCenter, slitPointA, materials.laserSoft, 0.022);
  addTube(scene, root, "laser-to-slit-b", slitCenter, slitPointB, materials.laserSoft, 0.022);

  const centralScreen = new Vector3(screenX, 0.36, params.slitOffsetCm * CM_TO_SCENE);
  addTube(scene, root, "slit-a-central-ray", slitPointA, centralScreen, materials.laserSoft, 0.016);
  addTube(scene, root, "slit-b-central-ray", slitPointB, centralScreen, materials.laserSoft, 0.016);

  const sampleCount = 160;
  const stepCm = (SCREEN_HALF_HEIGHT_CM * 2) / sampleCount;
  for (let i = 0; i < sampleCount; i += 1) {
    const localCm = -SCREEN_HALF_HEIGHT_CM + stepCm * (i + 0.5);
    const pointCmFromSlit = params.screenOffsetCm + localCm - params.slitOffsetCm;
    const yM = pointCmFromSlit / 100;
    const sinTheta = yM / Math.sqrt(params.screenDistanceM * params.screenDistanceM + yM * yM);
    const interference = Math.pow(Math.cos(Math.PI * d * sinTheta / lambda), 2);
    const envelope = sincSquared(Math.PI * a * sinTheta / lambda);
    const intensity = interference * envelope;
    const z = (params.screenOffsetCm + localCm) * CM_TO_SCENE;
    addFringe(scene, root, `interference-fringe-${i}`, screenX - 0.07, 0.82, z, stepCm * CM_TO_SCENE * 0.92, intensity, laserColor);
  }
}

function createDiffraction(scene: Scene, root: TransformNode, materials: MaterialSet, params: LabParameters, laserColor: Color3) {
  createOpticalBench(scene, root, materials);

  const screenX = screenXFromDistance(params.screenDistanceM);
  const lambda = wavelengthNmToMeters(params.wavelengthNm);
  const a = micrometerToMeters(params.slitWidthUm);
  const slitOffsetScene = params.slitOffsetCm * CM_TO_SCENE;
  const displayA = displaySlitWidth(params.slitWidthUm);
  const source = new Vector3(-4.35, 0.36, slitOffsetScene);
  const slitPoint = new Vector3(SLIT_X, 0.36, slitOffsetScene);

  addScreen(scene, root, materials, screenX, params.screenOffsetCm);
  addSlitBarrier(scene, root, materials, [slitOffsetScene], displayA);
  addSlitMarkers(scene, root, materials, [slitOffsetScene], displayA);
  addLaserSource(scene, root, materials, source, slitPoint);
  addTube(scene, root, "laser-to-single-slit", source, slitPoint, materials.laser, 0.04);

  for (let m = -3; m <= 3; m += 1) {
    const yM = m === 0 ? 0 : (m * lambda * params.screenDistanceM) / a;
    const yCm = yM * 100;
    if (Math.abs(yCm) <= SCREEN_HALF_HEIGHT_CM) {
      addTube(scene, root, `diffraction-ray-${m}`, slitPoint, new Vector3(screenX, 0.36, slitOffsetScene + yCm * CM_TO_SCENE), materials.laserSoft, 0.014);
    }
  }

  const sampleCount = 170;
  const stepCm = (SCREEN_HALF_HEIGHT_CM * 2) / sampleCount;
  for (let i = 0; i < sampleCount; i += 1) {
    const localCm = -SCREEN_HALF_HEIGHT_CM + stepCm * (i + 0.5);
    const pointCmFromSlit = params.screenOffsetCm + localCm - params.slitOffsetCm;
    const yM = pointCmFromSlit / 100;
    const sinTheta = yM / Math.sqrt(params.screenDistanceM * params.screenDistanceM + yM * yM);
    const beta = Math.PI * a * sinTheta / lambda;
    const intensity = sincSquared(beta);
    const z = (params.screenOffsetCm + localCm) * CM_TO_SCENE;
    addFringe(scene, root, `diffraction-fringe-${i}`, screenX - 0.07, 0.82, z, stepCm * CM_TO_SCENE * 0.92, intensity, laserColor);
  }
}

export function createSimulationVisuals(scene: Scene, labId: LabId, params: LabParameters) {
  disposeOldRoot(scene);
  const laserColor = wavelengthToColor3(params.wavelengthNm);
  const root = makeRoot(scene);
  const materials = createMaterials(scene, laserColor);

  switch (labId) {
    case "reflection":
      createReflection(scene, root, materials, params);
      break;
    case "refraction":
      createRefraction(scene, root, materials, params);
      break;
    case "interference":
      createInterference(scene, root, materials, params, laserColor);
      break;
    case "diffraction":
      createDiffraction(scene, root, materials, params, laserColor);
      break;
  }

  return root;
}
