// https://trello.com/b/xVqjzlqh/solar-system-threejs
// Main reference: https://i.dailymail.co.uk/1s/2020/01/13/15/23345186-0-image-a-17_1578929974592.jpg
// https://threejs.org/examples/


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

const loader = new THREE.TextureLoader();
loader.load('textures/background.png', function (texture) {
  scene.background = texture;
});


let time = 0;

const sunXPosition = -115;
const offset = 50;
let planets = [];

// Cached HTML elements
const planetNameElement = document.getElementById("planet-name");
const planetRadiusElement = document.getElementById("planet-radius");
const planetDistanceElement = document.getElementById("planet-distance");



class PlanetData{
  constructor(name, radiusInKm, distanceFromSunInAU){
    this.name = name;
    this.radiusInKm = radiusInKm;
    this.distanceFromSunInAU = distanceFromSunInAU;
  }
}

class Planet{
  constructor(data, mesh, ringMesh = null){
    this.data = data;
    this.mesh = mesh;
    this.ringMesh = ringMesh;
  }
  
  getName(){
    return this.data.name;
  }

  getRadiusInKm(){
    return this.data.radiusInKm;
  }

  getDistanceFromSunInAU(){
    return this.data.distanceFromSunInAU;
  }

  rotateAroundItself(angle){
    this.mesh.rotateY(angle);
  }
}



start();
update();


function RefreshSelectedPlanetInfo(planetData) {
  planetNameElement.innerText = planetData.name;
  planetRadiusElement.innerText = planetData.radiusInKm;
  planetDistanceElement.innerText = planetData.distanceFromSunInAU;
}



function start() {
  setupScene();
  setupLights();
  drawAllPlanets();
}


function update(){ 
  requestAnimationFrame(update);
  // sphere.rotation.y += 0.001;
  time++;

  planets.forEach(element => element.rotateAroundItself(0.001));


  renderer.render(scene, camera);
}


// on click - callback
function objectClickHandler() {
  // window.open('https://pericror.com/', '_blank');
  console.log("click");
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











function setupScene() {
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.position.z = 50;
  renderer.render(scene, camera);
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
  drawPlanet(new PlanetData("Sun", 1, 1), 7, 0, "Volcanic"); // SUN - TODO add a cool shader!

  drawPlanet(new PlanetData("Mercury", 1, 1), 0.25, 8 + offset, "Martian");
  drawPlanet(new PlanetData("Venus", 1, 1), 0.75, 17 + offset, "Venusian");
  drawPlanet(new PlanetData("Earth", 1, 1), 0.75, 30 + offset, "Terrestrial1");
  drawPlanet(new PlanetData("Mars", 1, 1), 0.75, 45 + offset, "Martian");
  drawPlanet(new PlanetData("Jupiter", 1, 1), 1.5, 70 + offset, "Gaseous1");
  drawPlanet(new PlanetData("Saturn", 1, 1), 1, 100 + offset, "Saturn2", true);
  drawPlanet(new PlanetData("Uranus", 1, 1), 0.75, 125 + offset, "Uranus");
  drawPlanet(new PlanetData("Neptune", 1, 1), 0.75, 145 + offset, "Neptune");
}

// wanna create an object! - builder for things like the ring
function drawPlanet(name, radius, distanceToSunInUnits, textureName, hasRing = false) {

  var loader = new THREE.TextureLoader();
  const texturePath = 'textures/' + textureName + '.png';

  let ring = null;

  loader.load(texturePath, function (texture) {
    const sphereGeometry = new THREE.SphereGeometry(7, 20, 20);
    const sphereMat = new THREE.MeshPhongMaterial({ map: texture});
    const sphere = new THREE.Mesh(sphereGeometry, sphereMat);
    sphere.scale.set(radius, radius, radius);
    sphere.position.x = sunXPosition + distanceToSunInUnits;
    sphere.rotateY(Math.PI/4);
    sphere.callback = objectClickHandler;
    scene.add(sphere);

    if(hasRing){
      const ringGeometry = new THREE.TorusGeometry(12, 3, 16, 100);
      const ringMat = new THREE.MeshPhongMaterial({ map: texture});
      ring = new THREE.Mesh(ringGeometry, ringMat);
      ring.scale.set(radius, radius, 0.05);
      ring.position.x = sunXPosition + distanceToSunInUnits;
      ring.rotateX(Math.PI/2.5);
      ring.rotateY(-Math.PI/8);
      scene.add(ring);
    }

    let planet = new Planet(name, sphere, ring);
    planets.push(planet);
  });


}



