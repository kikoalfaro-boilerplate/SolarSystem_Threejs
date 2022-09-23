import './style.css'

import * as THREE from 'three';

// // BASIC SCENE SETUP
const scene = new THREE.Scene(); 
const width = window.innerWidth;
const height = window.innerHeight;
const camera = new THREE.OrthographicCamera( width / - 16, width / 16, height / 16, height / - 16, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),  
});

let time = 0;

const sunXPosition = -115;
const offset = 50;


start();
update();

function start() {
  setupScene();
  setupLights();
  drawAllPlanets();
}


function update(){ 
  requestAnimationFrame(update);
  // sphere.rotation.y += 0.001;
  time++;

  renderer.render(scene, camera);
}


function setupScene() {
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.position.z = 50;
  renderer.render(scene, camera);
}

function setupLights() {
  const pointLightLeft = new THREE.PointLight(0xffffff, 0.75); // sun
  pointLightLeft.position.x = sunXPosition;
  pointLightLeft.castShadow = false;

  // pointLight.scale.set(100, 100, 100);
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

  const lightHelper = new THREE.PointLightHelper(pointLightLeft);
  // const gridHelper = new THREE.GridHelper(50, 100);

  scene.add(pointLightLeft);
  scene.add(ambientLight);

  scene.add(lightHelper);
}

function drawAllPlanets() {
  drawPlanet(7, 0, "yellow");
  drawPlanet(0.25, 8 + offset, "red");
  drawPlanet(0.75, 17 + offset, "orange");
  drawPlanet(0.75, 30 + offset, "blue");
  drawPlanet(0.75, 45 + offset, "red");
  drawPlanet(1.5, 70 + offset, "orange");
  drawPlanet(1, 100 + offset, "yellow");
  drawPlanet(0.75, 120 + offset, "cyan");
  drawPlanet(0.75, 140 + offset, "blue");
}

// wanna create an object!
function drawPlanet(radius, distanceToSunInUnits, color) {
  const sphereGeometry = new THREE.SphereGeometry(7);
  const sphereMat = new THREE.MeshPhongMaterial({ color });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMat);
  sphere.scale.set(radius, radius, radius);
  sphere.position.x = sunXPosition + distanceToSunInUnits;
  scene.add(sphere);
}



