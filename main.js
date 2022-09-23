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
  drawPlanet(7, 0, "Volcanic"); // SUN - TODO add a cool shader!

  drawPlanet(0.25, 8 + offset, "Martian");
  drawPlanet(0.75, 17 + offset, "Venusian");
  drawPlanet(0.75, 30 + offset, "Terrestrial1");
  drawPlanet(0.75, 45 + offset, "Martian");
  drawPlanet(1.5, 70 + offset, "Gaseous1");
  drawPlanet(1, 100 + offset, "Saturn2", true);
  drawPlanet(0.75, 125 + offset, "Uranus");
  drawPlanet(0.75, 145 + offset, "Neptune");
}

// wanna create an object! - builder for things like the ring
function drawPlanet(radius, distanceToSunInUnits, textureName, hasRing = false) {

  var loader = new THREE.TextureLoader();
  const texturePath = 'textures/' + textureName + '.png';
  loader.load(texturePath, function (texture) {
    const sphereGeometry = new THREE.SphereGeometry(7, 20, 20);
    const sphereMat = new THREE.MeshPhongMaterial({ map: texture, overdraw: 0.5});
    const sphere = new THREE.Mesh(sphereGeometry, sphereMat);
    sphere.scale.set(radius, radius, radius);
    sphere.position.x = sunXPosition + distanceToSunInUnits;
    sphere.rotateY(Math.PI/4);
    scene.add(sphere);

    if(hasRing){
      const ringGeometry = new THREE.TorusGeometry(12, 3, 16, 100);
      const ringMat = new THREE.MeshPhongMaterial({ map: texture, overdraw: 0.5});
      const ring = new THREE.Mesh(ringGeometry, ringMat);
      ring.scale.set(radius, radius, 0.05);
      ring.position.x = sunXPosition + distanceToSunInUnits;
      ring.rotateX(Math.PI/2.5);
      ring.rotateY(-Math.PI/8);
      scene.add(ring);
    }
  });


}



