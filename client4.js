// Art 109 Three.js Demo Site
// client4.js
//import gltf loader add-on
import {
  GLTFLoader
} from "./src/GLTFLoader.js";
// Import required source code
// Import three.js core
import * as THREE from "./build/three.module.js";
// Import pointer lock controls
import {
  PointerLockControls
} from "./src/PointerLockControls.js";

// Establish variables
let camera, scene, renderer, controls, material;

const objects = [];
let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

// Initialization and animation function calls
init();
animate();

// Initialize the scene
function init() {
  // Establish the camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.y = 0;

  // Define basic scene parameters
  scene = new THREE.Scene();
  scene.background = new THREE.Color('rgb(41,49,69)');
  scene.fog = new THREE.Fog('rgb(149,178,248)', 50, .050);

  // Variable for GLTF data
  var mesh;

  // Load GLTF model, add material, and add it to the scene
  const loader = new GLTFLoader().load(
    "./assets/moss-building-bushes-fallen-ver2.glb", // comment this line out and un comment the line below to swithc models

    function(gltf) {
      // Scan loaded model for mesh and apply defined material if mesh is present
      gltf.scene.traverse(function(child) {
        if (child.isMesh) {
          //child.material = newMaterial;
        }
      });
      // set position and scale
      mesh = gltf.scene;
      mesh.position.set(100, 0, 200);
      mesh.rotation.set(0, 0, 0);
      mesh.scale.set(20, 20, 20); // <-- change this to (1, 1, 1) for photogrammetery model
      // Add model to scene
      scene.add(mesh);
    },
    undefined,
    function(error) {
      console.error(error);
    }
  );
  // Load the second GLTF model, add material, and add it to the scene
  const loader2 = new GLTFLoader().load(
    "./assets/moss-building-bushes-fallen-ver1.glb", // comment this line out and un comment the line below to swithc models

    function(gltf) {
      // Scan loaded model for mesh and apply defined material if mesh is present
      gltf.scene.traverse(function(child) {
        if (child.isMesh) {
          //child.material = newMaterial;
        }
      });
      // set position and scale
      mesh = gltf.scene;
      mesh.position.set(-340, 0, 550);
      mesh.rotation.set(0, 0, 0);
      mesh.scale.set(20, 20, 20);
      // Add model to scene
      scene.add(mesh);
    },
    undefined,
    function(error) {
      console.error(error);
    }
  );

  // Define scene lighting
  const light = new THREE.HemisphereLight('rgb(237,237,232)');
  light.position.set(0.5, 1, 0.1);
  scene.add(light);

  // Define controls
  controls = new PointerLockControls(camera, document.body);

  // Identify the html divs for the overlays
  const blocker = document.getElementById("blocker");
  const instructions = document.getElementById("instructions");

  // Listen for clicks and respond by removing overlays and starting mouse look controls
  // Listen
  instructions.addEventListener("click", function() {
    controls.lock();
  });
  // Remove overlays and begin controls on click
  controls.addEventListener("lock", function() {
    instructions.style.display = "none";
    blocker.style.display = "none";
  });
  // Restore overlays and stop controls on esc
  controls.addEventListener("unlock", function() {
    blocker.style.display = "block";
    instructions.style.display = "";
  });
  // Add controls to scene
  scene.add(controls.getObject());

  // Define key controls for WASD controls
  const onKeyDown = function(event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = true;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = true;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = true;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = true;
        break;

      case "Space":
        if (canJump === true) velocity.y += 350;
        canJump = false;
        break;
    }
  };

  const onKeyUp = function(event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = false;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = false;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = false;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = false;
        break;
    }
  };

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  // Add raycasting for mouse controls
  raycaster = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(0, -1, 0),
    0,
    10
  );

  // Generate the ground
  let floorGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
  floorGeometry.rotateX(-Math.PI / 2);

  // Vertex displacement pattern for ground
  let position = floorGeometry.attributes.position;

  for (let i = 0, l = position.count; i < l; i++) {
    vertex.fromBufferAttribute(position, i);

    vertex.x += Math.random() * 2 - 10;
    vertex.y += Math.random() * 2;
    vertex.z += Math.random() * 20 - 10;

    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

  position = floorGeometry.attributes.position;
  const colorsFloor = [];



  const floorMaterial = new THREE.MeshBasicMaterial({
    vertexColors: true
  });

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);

  // Insert completed floor into the scene
  scene.add(floor);

  //moss objects
  // Load image as texture
  const texture = new THREE.TextureLoader().load('./assets/lichen-texture-free.png');
  // Immediately use the texture for material creation
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide
  });
  // Create tetra geometry
  const geometry = new THREE.TetrahedronGeometry(15, 0);
  // Apply image texture to tetra geometry
  const tetra = new THREE.Mesh(geometry, material);
  // Position plane geometry
  tetra.position.set(50, 5, -15);
  // Place tetra geometry
  scene.add(tetra);

  // Load image as textures
  const texture2 = new THREE.TextureLoader().load('./assets/lichen-texture-free.png');
  // Immediately use the texture for material creation
  const material2 = new THREE.MeshBasicMaterial({
    map: texture2,
    side: THREE.DoubleSide
  });
  // Create tetra geometry
  const geometry2 = new THREE.TetrahedronGeometry(305, 0);
  // Apply image texture to tetra geometry
  const tetra2 = new THREE.Mesh(geometry, material);
  // Position plane geometry
  tetra2.position.set(300, 5, -15);
  // Place tetra geometry
  scene.add(tetra2);

  //CreateRing
  // Load image as textures
  const texture3 = new THREE.TextureLoader().load('./assets/lichen-texture-free.png');
  // Immediately use the texture for material creation
  const material3 = new THREE.MeshBasicMaterial({
    map: texture3,
    side: THREE.DoubleSide
  });
  const geometry3 = new THREE.RingGeometry(120, 250, 320);
  const mesh3 = new THREE.Mesh(geometry3, material3);
  // Position plane geometry
  tetra2.position.set(300, 5, -15);
  scene.add(mesh3);


  // Define Rendered and html document placement
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Listen for window resizing
  window.addEventListener("resize", onWindowResize);
}

// Window resizing function
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation function
function animate() {
  requestAnimationFrame(animate);

  const time = performance.now();

  // Check for controls being activated (locked) and animate scene according to controls
  if (controls.isLocked === true) {
    raycaster.ray.origin.copy(controls.getObject().position);
    raycaster.ray.origin.y -= 10;

    const intersections = raycaster.intersectObjects(objects, false);

    const onObject = intersections.length > 0;

    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    if (onObject === true) {
      velocity.y = Math.max(0, velocity.y);
      canJump = true;
    }

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    controls.getObject().position.y += velocity.y * delta; // new behavior

    if (controls.getObject().position.y < 10) {
      velocity.y = 0;
      controls.getObject().position.y = 10;

      canJump = true;
    }
  }

  prevTime = time;

  renderer.render(scene, camera);
}
