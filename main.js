// https://trello.com/b/xVqjzlqh/solar-system-threejs
// Main reference: https://i.dailymail.co.uk/1s/2020/01/13/15/23345186-0-image-a-17_1578929974592.jpg
// https://threejs.org/examples/


import './style.css'
import * as THREE from 'three';
// import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { DefaultLoadingManager } from 'three';


// // BASIC SCENE SETUP
const scene = new THREE.Scene(); 
const width = window.innerWidth;
const height = window.innerHeight;

const defaultCam = { left: width / - 16, right: width / 16, top: height / 16, bottom: height / - 16, near: 0.01, far: 1000, position: { x: 0, y: 0, z: 50 }, zoom: 1}
let camera = new THREE.OrthographicCamera(defaultCam.left, defaultCam.right, defaultCam.top, defaultCam.bottom, defaultCam.near, defaultCam.far);

// let controls;

function setupScene() {
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  resetCamera();
  renderer.render(scene, camera);
  // controls = new OrbitControls(camera, renderer.domElement);
}


const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),  
});

const loader = new THREE.TextureLoader();
loader.load('textures/background.png', function (texture) {
  scene.background = texture;
});



// mesh should be a dynamic param. Use constructor + prototype modification?
let planets = [
  {name: "Sun", radiusInKm: 695508, distanceFromSunInAU: 0, textureName: "Volcanic", meshRadius: 7, meshDistanceToSun: 0, mesh: null, camPos: {"x": -90, "y": 0, "z": 50 }, camZoom: 0.773},
  {name: "Mercury", radiusInKm:  2439.7, distanceFromSunInAU: 0.4, textureName: "Martian", meshRadius: 0.25, meshDistanceToSun: 58, mesh: null, camPos: {"x": -52, "y": 0, "z": 50 }, camZoom: 6},
  {name: "Venus", radiusInKm:  6052, distanceFromSunInAU: 0.7, textureName: "Venusian", meshRadius: 0.75, meshDistanceToSun: 67, mesh: null, camPos: {"x": -45, "y": 0, "z": 50 }, camZoom: 6},
  {name: "Earth", radiusInKm:  6371, distanceFromSunInAU: 1, textureName: "Terrestrial1", meshRadius: 0.75, meshDistanceToSun: 80, mesh: null, camPos: {"x": -35, "y": 0, "z": 50 }, camZoom: 6},
  {name: "Mars", radiusInKm:  3396, distanceFromSunInAU: 1.5, textureName: "Martian", meshRadius: 0.5, meshDistanceToSun: 95, mesh: null, camPos: {"x": -20, "y": 0, "z": 50 }, camZoom: 7.78},
  {name: "Jupiter", radiusInKm:  71492, distanceFromSunInAU: 5.2, textureName: "Gaseous1", meshRadius: 1.5, meshDistanceToSun: 120, mesh: null, camPos: {"x": 5, "y": 0.87, "z": 50 }, camZoom: 3.425},
  {name: "Saturn", radiusInKm:  60268, distanceFromSunInAU: 9.5, textureName: "Saturn2", meshRadius: 1, meshDistanceToSun: 150, mesh: null, hasRing: true, camPos: {"x": 40, "y": 1.22, "z": 50 }, camZoom: 3.424},
  {name: "Uranus", radiusInKm:  25559, distanceFromSunInAU: 19.8, textureName: "Uranus", meshRadius: 0.75, meshDistanceToSun: 175, mesh: null, camPos: {"x": 65, "y": 0, "z": 50 }, camZoom: 4.65},
  {name: "Neptune", radiusInKm:  24764, distanceFromSunInAU: 30.1, textureName: "Neptune", meshRadius: 0.75, meshDistanceToSun: 195, mesh: null, camPos: {"x": 85, "y": 0, "z": 50 }, camZoom: 6}
];


function resetCamera(){
  camTargetPos = defaultCam.position;
  camTargetZoom = defaultCam.zoom;
}

let camTargetPos = { x: defaultCam.position.x, y: defaultCam.position.y, z: defaultCam.position.z };
let camPos = { x: defaultCam.position.x, y: defaultCam.position.y, z: defaultCam.position.z };
let camTargetZoom = defaultCam.zoom;
let camZoom = defaultCam.zoom;




// // QUITAR CUANDO DESACTIVO LOS CONTROLES!!
// camera.position.set(camPos.x, camPos.y, camPos.z);
// camera.zoom = camZoom;
// camera.updateProjectionMatrix();
// // END QUITAR




function focusCameraOnPlanet(planet){
  camTargetPos = planet.camPos;
  camTargetZoom = planet.camZoom;
}


const camLerpSpeed = 0.01;
function lerpCamera(){
  
  camPos.x += (camTargetPos.x - camPos.x)*camLerpSpeed;
  camPos.y += (camTargetPos.y - camPos.y)*camLerpSpeed;
  camPos.z += (camTargetPos.z - camPos.z)*camLerpSpeed;
  camZoom += (camTargetZoom - camZoom)*camLerpSpeed;

  camera.position.set(camPos.x, camPos.y, camPos.z);
  camera.zoom = camZoom;
  camera.updateProjectionMatrix();
}


let time = 0;
const sunXPosition = -115;

// Cached HTML elements
const planetNameElement = document.getElementById("planet-name");
const planetRadiusElement = document.getElementById("planet-radius");
const planetDistanceElement = document.getElementById("planet-distance");

let sideMenuElement = document.getElementById("side-menu");
let isShowingSideMenu = false;

let button = document.getElementsByClassName("x")[0];

button.addEventListener('click', function() {
  hideSideMenu();
});



// I'd like to make part of all planet objects (now on the global scope)
function rotateAroundItself(planet, angle){
  if(planet.mesh != undefined){
    planet.mesh.rotateY(angle);
  }
}


start();
update();


function refreshPlanetInfo(planet) {
  planetNameElement.innerText = planet.name;
  planetRadiusElement.innerText = "Radius:\n" + planet.radiusInKm + " km";
  planetDistanceElement.innerText = "Distance from Sun:\n" + planet.distanceFromSunInAU + " AU";
}

// on click - callback
function onPlanetClicked(planet) {
  if(isShowingSideMenu) return;
  focusCameraOnPlanet(planet);
  showSideMenu();
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
  // controls.update();  
  lerpCamera();
  renderer.render(scene, camera);
  console.log(camera.position, camera.zoom);
}

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

// See https://stackoverflow.com/questions/12800150/catch-the-click-event-on-a-specific-mesh-in-the-renderer
// Handle all clicks to determine of a three.js object was clicked and trigger its callback
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

document.addEventListener('mousedown', onDocumentMouseDown, false);


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


function drawPlanet(planet) {

  var loader = new THREE.TextureLoader();
  const texturePath = 'textures/' + planet.textureName + '.png';

  let ring = null;

  loader.load(texturePath, function (texture) {
    const sphereGeometry = new THREE.SphereGeometry(7, 20, 20);
    const sphereMat = new THREE.MeshPhongMaterial({ map: texture});
    const sphere = new THREE.Mesh(sphereGeometry, sphereMat);
    sphere.scale.set(planet.meshRadius, planet.meshRadius, planet.meshRadius);
    sphere.position.x = sunXPosition + planet.meshDistanceToSun;
    sphere.rotateY(Math.PI/4);
    scene.add(sphere);

    if(planet.hasRing != undefined){
      const ringGeometry = new THREE.TorusGeometry(12, 3, 16, 100);
      const ringMat = new THREE.MeshPhongMaterial({ map: texture});
      ring = new THREE.Mesh(ringGeometry, ringMat);
      ring.scale.set(planet.meshRadius, planet.meshRadius, 0.05);
      ring.position.x = sunXPosition + planet.meshDistanceToSun;
      ring.rotateX(Math.PI/2.5);
      ring.rotateY(-Math.PI/8);
      scene.add(ring);
    }

    planet.mesh = sphere;
    sphere.callback = function(){ onPlanetClicked(planet);};
    planets.push(planet);
  });


}


