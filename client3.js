import * as THREE from './jsm/build/three.module.js';

import Stats from './jsm/libs/stats.module.js';

import {
  FirstPersonControls
} from './jsm/controls/FirstPersonControls.js';
import {
  ImprovedNoise
} from './jsm/math/ImprovedNoise.js';

let container, stats;
let camera, controls, scene, renderer;
let mesh, texture;
// *edited world size
const worldWidth = 356,
  worldDepth = 356;
const clock = new THREE.Clock();

init();
animate();

function init() {

  container = document.getElementById('container');

// *edited to change position
  camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 10000);

  // *edited to change the color and density of the fog
  scene = new THREE.Scene();
  scene.background = new THREE.TextureLoader().load( './assets/space.jpg' );
  scene.fog = new THREE.FogExp2('rgb(115,230,255)', 0.00035);

  const data = generateHeight(worldWidth, worldDepth);
  // *edited
  camera.position.set(100, 800, -800);
  camera.lookAt(-100, 400, -800);

  const geometry = new THREE.PlaneGeometry(7500, 7500, worldWidth - 1, worldDepth - 1);
  geometry.rotateX(-Math.PI / 2);

  const vertices = geometry.attributes.position.array;

  for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
    // *edited to change the lanscape
    vertices[j + 1] = data[i] * 4;

  }

  texture = new THREE.CanvasTexture(generateTexture(data, worldWidth, worldDepth));
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
    map: texture
  }));
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // *edited controls to make the perspective more static and emmersive
  controls = new FirstPersonControls(camera, renderer.domElement);
  controls.movementSpeed = 90;
  controls.lookSpeed = 0.02;

  stats = new Stats();
  container.appendChild(stats.dom);


  //

  window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  controls.handleResize();

}

function generateHeight(width, height) {

  let seed = Math.PI / 10;
  window.Math.random = function() {

    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);

  };

  const size = width * height,
    data = new Uint8Array(size);
  const perlin = new ImprovedNoise(),
    z = Math.random() * 500;

  let quality = 1;

  for (let j = 0; j < 4; j++) {

    for (let i = 0; i < size; i++) {

      const x = i % width,
        y = ~~(i / width);
      data[i] += Math.abs(perlin.noise(x / quality, y / quality, z) * quality * 1.75);

    }

    quality *= 5;

  }

  return data;

}

function generateTexture(data, width, height) {

  let context, image, imageData, shade;

  const vector3 = new THREE.Vector3(0, 0, 0);

  const sun = new THREE.Vector3(1, 1, 1);
  sun.normalize();

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  context = canvas.getContext('2d');
  context.fillStyle = '#000';
  context.fillRect(0, 0, width, height);

  image = context.getImageData(0, 0, canvas.width, canvas.height);
  imageData = image.data;

  for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {

    vector3.x = data[j - 2] - data[j + 2];
    vector3.y = 2;
    vector3.z = data[j - width * 2] - data[j + width * 2];
    vector3.normalize();

    shade = vector3.dot(sun);

    // *edited color pallete
    imageData[i] = (9 + shade * 18) * (0.2 + data[j] * 0.0007);
    imageData[i + 1] = (32 + shade * 105) * (0.5 + data[j] * 0.007);
    imageData[i + 2] = (shade * 126) * (0.4 + data[j] * 0.007);

  }

  context.putImageData(image, 0, 0);



  const canvasScaled = document.createElement('canvas');
  canvasScaled.width = width * 4;
  canvasScaled.height = height * 4;

  context = canvasScaled.getContext('2d');
  // *edited to make the landscape bigger
  context.scale(4, 8);
  context.drawImage(canvas, 0, 0);

  image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
  imageData = image.data;

  for (let i = 0, l = imageData.length; i < l; i += 4) {

    const v = ~~(Math.random() * 5);

    imageData[i] += v;
    imageData[i + 55] += v;
    imageData[i + 2] += v;

  }

  context.putImageData(image, 0, 0);

  return canvasScaled;

}

//

function animate() {

  requestAnimationFrame(animate);

  render();
  stats.update();

}


function render() {

  controls.update(clock.getDelta());
  renderer.render(scene, camera);

}
