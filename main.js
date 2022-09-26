// https://trello.com/b/xVqjzlqh/solar-system-threejs
// https://threejs.org/examples/

import './style.css'
import * as THREE from 'three';
import { DefaultLoadingManager } from 'three';

// // BASIC SCENE SETUP
const scene = new THREE.Scene(); 
const width = window.innerWidth;
const height = window.innerHeight;

const defaultCam = { left: width / - 16, right: width / 16, top: height / 16, bottom: height / - 16, near: 0.01, far: 1000, position: { x: 0, y: 0, z: 50 }, zoom: 1}
let camera = new THREE.OrthographicCamera(defaultCam.left, defaultCam.right, defaultCam.top, defaultCam.bottom, defaultCam.near, defaultCam.far);

let camTargetPos = { x: defaultCam.position.x, y: defaultCam.position.y, z: defaultCam.position.z };
let camPos = { x: defaultCam.position.x, y: defaultCam.position.y, z: defaultCam.position.z };
let camTargetZoom = defaultCam.zoom;
let camZoom = defaultCam.zoom;
const camLerpSpeed = 0.01;


//Create outline object (GLOBAL SO FAR)
let outlineGeo = new THREE.SphereGeometry(7, 20, 20);
//Notice the second parameter of the material
let outlineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide });
let outline = new THREE.Mesh(outlineGeo, outlineMat);
let isOutlineVisible = false;
let allowOutline = true;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),  
});

const loader = new THREE.TextureLoader();
loader.load('textures/background.png', function (texture) {
  scene.background = texture;
});


let time = 0;
const sunXPosition = -115;

// Cached HTML elements
const planetNameElement = document.getElementById("planet-name");
const planetRadiusElement = document.getElementById("planet-radius");
const planetDistanceElement = document.getElementById("planet-distance");
const planetDescription = document.getElementById("planet-desc");
const planetType = document.getElementById("planet-type");

let sideMenuElement = document.getElementById("side-menu");
let isShowingSideMenu = false;

let button = document.getElementsByClassName("x")[0];

button.addEventListener('click', function() {
  hideSideMenu();
  allowOutline = true;
});

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
document.addEventListener('mousedown', onDocumentMouseDown, false);
document.addEventListener('mousemove', onDocumentMouseMove, false);

// mesh should be a dynamic param. Use constructor + prototype modification?
let planets = [
  {name: "Sun", radiusInKm: 695508, distanceFromSunInAU: 0, textureName: "Volcanic", meshRadius: 7, meshDistanceToSun: 0, mesh: null, camPos: {"x": -90, "y": 0, "z": 50 }, camZoom: 0.773, desc:"The Sun is a yellow dwarf star, a hot ball of glowing gases at the heart of our solar system. Its gravity holds everything from the biggest planets to tiny debris in its orbit.", type:"Yellow Dwarf Star"},
  {name: "Mercury", radiusInKm:  2439.7, distanceFromSunInAU: 0.4, textureName: "Martian", meshRadius: 0.25, meshDistanceToSun: 58, mesh: null, camPos: {"x": -52, "y": 0, "z": 50 }, camZoom: 6, desc:"Mercury—the smallest planet in our solar system and closest to the Sun—is only slightly larger than Earth's Moon. Mercury is the fastest planet, zipping around the Sun every 88 Earth days.", type:"Terrestrial Planet"},
  {name: "Venus", radiusInKm:  6052, distanceFromSunInAU: 0.7, textureName: "Venusian", meshRadius: 0.75, meshDistanceToSun: 67, mesh: null, camPos: {"x": -45, "y": 0, "z": 50 }, camZoom: 6, desc:"Venus spins slowly in the opposite direction from most planets. A thick atmosphere traps heat in a runaway greenhouse effect, making it the hottest planet in our solar system.", type:"Terrestrial Planet"},
  {name: "Earth", radiusInKm:  6371, distanceFromSunInAU: 1, textureName: "Terrestrial1", meshRadius: 0.75, meshDistanceToSun: 80, mesh: null, camPos: {"x": -35, "y": 0, "z": 50 }, camZoom: 6, desc:"Earth—our home planet—is the only place we know of so far that’s inhabited by living things. It's also the only planet in our solar system with liquid water on the surface.", type:"Terrestrial Planet"},
  {name: "Mars", radiusInKm:  3396, distanceFromSunInAU: 1.5, textureName: "Martian", meshRadius: 0.5, meshDistanceToSun: 95, mesh: null, camPos: {"x": -20, "y": 0, "z": 50 }, camZoom: 7.78, desc:"Mars is a dusty, cold, desert world with a very thin atmosphere. There is strong evidence Mars was—billions of years ago—wetter and warmer, with a thicker atmosphere.", type:"Terrestrial Planet"},
  {name: "Jupiter", radiusInKm:  71492, distanceFromSunInAU: 5.2, textureName: "Gaseous1", meshRadius: 1.5, meshDistanceToSun: 120, mesh: null, camPos: {"x": 5, "y": 0.87, "z": 50 }, camZoom: 3.425, desc:"Jupiter is more than twice as massive than the other planets of our solar system combined. The giant planet's Great Red spot is a centuries-old storm bigger than Earth.", type:"Gas Giant"},
  {name: "Saturn", radiusInKm:  60268, distanceFromSunInAU: 9.5, textureName: "Saturn2", meshRadius: 1, meshDistanceToSun: 150, mesh: null, hasRing: true, camPos: {"x": 40, "y": 1.22, "z": 50 }, camZoom: 3.424, desc:"Adorned with a dazzling, complex system of icy rings, Saturn is unique in our solar system. The other giant planets have rings, but none are as spectacular as Saturn's.", type:"Gas Giant"},
  {name: "Uranus", radiusInKm:  25559, distanceFromSunInAU: 19.8, textureName: "Uranus", meshRadius: 0.75, meshDistanceToSun: 175, mesh: null, camPos: {"x": 65, "y": 0, "z": 50 }, camZoom: 4.65, desc:"Uranus—seventh planet from the Sun—rotates at a nearly 90-degree angle from the plane of its orbit. This unique tilt makes Uranus appear to spin on its side.", type:"Ice Giant"},
  {name: "Neptune", radiusInKm:  24764, distanceFromSunInAU: 30.1, textureName: "Neptune", meshRadius: 0.75, meshDistanceToSun: 195, mesh: null, camPos: {"x": 85, "y": 0, "z": 50 }, camZoom: 6, desc:"Neptune—the eighth and most distant major planet orbiting our Sun—is dark, cold and whipped by supersonic winds. It was the first planet located through mathematical calculations, rather than by telescope.", type:"Ice Giant"}
];



start();
update();

function setupScene() {
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  resetCamera();
  renderer.render(scene, camera);
}

function resetCamera(){
  camTargetPos = defaultCam.position;
  camTargetZoom = defaultCam.zoom;
}

function focusCameraOnPlanet(planet){
  camTargetPos = planet.camPos;
  camTargetZoom = planet.camZoom;
}

function lerpCamera(){
  
  camPos.x += (camTargetPos.x - camPos.x)*camLerpSpeed;
  camPos.y += (camTargetPos.y - camPos.y)*camLerpSpeed;
  camPos.z += (camTargetPos.z - camPos.z)*camLerpSpeed;
  camZoom += (camTargetZoom - camZoom)*camLerpSpeed;

  camera.position.set(camPos.x, camPos.y, camPos.z);
  camera.zoom = camZoom;
  camera.updateProjectionMatrix();
}


// I'd like to make part of all planet objects (now on the global scope)
function rotateAroundItself(planet, angle){
  if(planet.mesh != undefined){
    planet.mesh.rotateY(angle);
  }
}

function refreshPlanetInfo(planet) {
  planetNameElement.innerText = planet.name;
  planetRadiusElement.innerText = "Radius:\n" + planet.radiusInKm + " km";
  planetDistanceElement.innerText = "Distance from Sun:\n" + planet.distanceFromSunInAU + " AU";
  planetDescription.innerText = planet.desc;
  planetType.innerText = planet.type;
}

// on click - callback
function onPlanetClicked(planet) {
  if(isShowingSideMenu) return;
  focusCameraOnPlanet(planet);
  showSideMenu();
  allowOutline = false;
  hideOutline();
  refreshPlanetInfo(planet);
}


function showSideMenu() {
  isShowingSideMenu = true;
  sideMenuElement.classList.remove("hid");
}

function hideSideMenu() {
  isShowingSideMenu = false;
  sideMenuElement.classList.add("hid");
  resetCamera();
}


function start() {
  setupScene();
  setupLights();
  drawAllPlanets();
}


function update(){ 
  requestAnimationFrame(update);
  time++;
  planets.forEach(planet => rotateAroundItself(planet, 0.001));
  lerpCamera();
  renderer.render(scene, camera);
}


function onDocumentMouseDown(event) {
  event.preventDefault();
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = - (event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var meshes = planets.map(function (v) {
    return v.mesh;
  });

  var intersects = raycaster.intersectObjects(meshes);

  if (intersects.length > 0) {
    intersects[0].object.callback();
  }
}

function onDocumentMouseMove(event) {
  event.preventDefault();
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = - (event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var meshes = planets.map(function (v) {
    return v.mesh;
  });

  var intersects = raycaster.intersectObjects(meshes);

  if (intersects.length > 0) {
    showOutline(intersects[0].object.planet);
  } else {
    hideOutline();
  }
}


function setupLights() {
  const pointLightLeft = new THREE.PointLight(0xffffff, 1.25); // sun
  pointLightLeft.position.x = sunXPosition;
  pointLightLeft.castShadow = false;

  // pointLight.scale.set(100, 100, 100);
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  const lightHelper = new THREE.PointLightHelper(pointLightLeft);
  // const gridHelper = new THREE.GridHelper(50, 100);

  scene.add(pointLightLeft);
  scene.add(ambientLight);

  scene.add(lightHelper);
}

function drawAllPlanets() {
  planets.forEach(p => drawPlanet(p));
}


function showOutline(planet) {
  if(isOutlineVisible || allowOutline === false) return;
  //Scale the object up to have an outline (as discussed in previous answer)
  outline.position.x = planet.mesh.position.x;
  outline.scale.set(planet.mesh.scale.x, planet.mesh.scale.y, planet.mesh.scale.z);
  outline.scale.addScalar(0.03);
  scene.add(outline);
  isOutlineVisible = true;
}


function hideOutline() {
  if(!isOutlineVisible) return;
  scene.remove(outline);
  isOutlineVisible = false;
}


function drawPlanet(planet) {

  var loader = new THREE.TextureLoader();
  const texturePath = 'textures/' + planet.textureName + '.png';

  let ring = null;

  loader.load(texturePath, function (texture) {
    const sphereGeo = new THREE.SphereGeometry(7, 20, 20);
    const sphereMat = new THREE.MeshPhongMaterial({ map: texture});
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.scale.set(planet.meshRadius, planet.meshRadius, planet.meshRadius);
    sphere.position.x = sunXPosition + planet.meshDistanceToSun;
    sphere.rotateY(Math.PI/4);
    scene.add(sphere);

    if(planet.hasRing != undefined){
      const ringGeo = new THREE.TorusGeometry(12, 3, 16, 100);
      const ringMat = new THREE.MeshPhongMaterial({ map: texture});
      ring = new THREE.Mesh(ringGeo, ringMat);
      ring.scale.set(planet.meshRadius, planet.meshRadius, 0.05);
      ring.position.x = sunXPosition + planet.meshDistanceToSun;
      ring.rotateX(Math.PI/2.5);
      ring.rotateY(-Math.PI/8);
      scene.add(ring);
    }

    planet.mesh = sphere;
    sphere.callback = function(){ onPlanetClicked(planet);};
    sphere.planet = planet;
    planets.push(planet);
  });


}


