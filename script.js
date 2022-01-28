import * as THREE from './three.js-master/build/three.module.js'
import {GLTFLoader} from './three.js-master/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';
import { CharacterControls } from './characterControls.js';

const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()
const loader = new GLTFLoader()
const collisions = []

//Camera
const size = {
    height: window.innerHeight,
    width: window.innerWidth
}

const cameraOptions = {
    speed: 0.2,
    turnSpeed: Math.PI*0.02
}
const camera = new THREE.PerspectiveCamera(45, size.width/size.height, 0.1, 1000)
camera.position.set(10,5,0)
camera.lookAt(new THREE.Vector3(0,2,0));
scene.add(camera)

//Renderer
const renderer = new THREE.WebGL1Renderer({canvas: canvas})

renderer.setSize(size.width, size.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.BasicShadowMap;

//Controls
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true
orbitControls.minDistance = 5
orbitControls.maxDistance = 15
orbitControls.enablePan = false
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05
orbitControls.update();

// Load Player
var characterControls
loader.load('assets/Soldier.glb', function (gltf){
	const model = gltf.scene;
	model.scale.set(1.5,1.5,1.5)
	model.traverse(function (object){
		if (object.isMesh) object.castShadow = true;
	});
	scene.add(model);

	// Get all animation that are not the default T-pose and stock them in an array
	const gltfAnimations = gltf.animations;
    const mixer = new THREE.AnimationMixer(model);
    const animationsMap = new Map()
    gltfAnimations.filter(a => a.name != 'TPose').forEach((a) => {
        animationsMap.set(a.name, mixer.clipAction(a))
    })

    characterControls = new CharacterControls(model,  mixer, animationsMap, orbitControls, camera,  'Idle')
})

createRoom();


// CONTROL KEYS
const keysPressed = {  }
document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() == "shift" && characterControls && !event.repeat) {
        characterControls.switchRunToggle()
    } else {
        keysPressed[event.key.toLowerCase()] = true
    }
}, false);

document.addEventListener('keyup', (event) => {
	if (event.key.toLowerCase() == "shift") {
		characterControls.switchRunToggle()
    } else {
        keysPressed[event.key.toLowerCase()] = false
    }
}, false);

const clock = new THREE.Clock();

function animate(){
	let mixerUpdateDelta = clock.getDelta();
    if (characterControls) {
        characterControls.update(mixerUpdateDelta, keysPressed);
    }
    orbitControls.update()
    renderer.render(scene, camera);
	if(characterControls){
		if ( collisions.length > 0 ) {
			detectCollisions();
		}
	}
	
    requestAnimationFrame(animate);
}

animate()

// RESIZE HANDLER
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

function createRoom(){
	// Load a glTF resource (desk)
	loader.load(
		// resource URL
		'assets/desktop_computer/scene.gltf',
		// called when the resource is loaded
		function ( gltf ) {

			const desk = gltf.scene
			desk.position.y += 1
			desk.rotation.y += Math.PI / 2 
			desk.position.x -= 3
			desk.scale.set(0.5, 0.5, 0.5)

			gltf.scene.traverse( function( node ) {

				if ( node.isMesh ) { node.castShadow = true; }
		
			} );

			scene.add( desk );
			calculateCollisionPoints( desk, 'desk' );
		}
	);

	// Load a glTF resource (sofa)
	loader.load(
		// resource URL
		'assets/sofa/scene.gltf',
		// called when the resource is loaded
		function ( gltf ) {

			const sofa = gltf.scene
			sofa.rotation.y = Math.PI / 2
			sofa.position.x += 2.5
			sofa.position.z -= 4
			sofa.scale.set(0.05, 0.05, 0.05)

			gltf.scene.traverse( function( node ) {

				if ( node.isMesh ) { node.castShadow = true; }
		
			} );

			scene.add( sofa );
			calculateCollisionPoints( sofa, 'sofa' );
			
		}
	);

	//Create the textures 
	const floorTexture = new THREE.TextureLoader().load( './assets/textures/light_wood.jpg');
	const wallTexture = new THREE.TextureLoader().load( './assets/textures/concrete.jpg');

	//Create the floor of the room
	const meshFloor = new THREE.Mesh(
		new THREE.PlaneGeometry(10,10,10,10),
		new THREE.MeshPhongMaterial({map: floorTexture, wireframe:false})
	)
	meshFloor.rotation.x -= Math.PI / 2
	meshFloor.receiveShadow = true;
	scene.add(meshFloor)

	//Create a wall
	const meshWallRight = new THREE.Mesh(
		new THREE.PlaneGeometry(10,5,5,5),
		new THREE.MeshPhongMaterial({map: wallTexture, wireframe:false})
	)
	meshWallRight.position.y += 2.5
	meshWallRight.position.x -= 5
	meshWallRight.rotation.y -= - Math.PI / 2
	meshWallRight.receiveShadow = true;
	scene.add(meshWallRight)
	calculateCollisionPoints( meshWallRight, 'WallRight' );

	//Create a wall
	const meshWallLeft = new THREE.Mesh(
		new THREE.PlaneGeometry(10,5,5,5),
		new THREE.MeshPhongMaterial({map: wallTexture, wireframe:false})
	)
	meshWallLeft.position.y += 2.5
	meshWallLeft.position.x += 5
	meshWallLeft.rotation.y -= Math.PI / 2
	meshWallLeft.receiveShadow = true;
	scene.add(meshWallLeft)
	calculateCollisionPoints( meshWallLeft, 'WallLeft' );
	

	//Create a wall
	const meshWallBack = new THREE.Mesh(
		new THREE.PlaneGeometry(10,5,5,5),
		new THREE.MeshPhongMaterial({map: wallTexture, wireframe:false})
	)

	meshWallBack.position.y += 2.5
	meshWallBack.position.z += 5
	meshWallBack.rotation.y -= Math.PI 
	meshWallBack.receiveShadow = true;
	scene.add(meshWallBack)
	calculateCollisionPoints( meshWallBack, 'WallBack' );

	//Create a wall
	const meshWallFront = new THREE.Mesh(
		new THREE.PlaneGeometry(10,5,5,5),
		new THREE.MeshPhongMaterial({map: wallTexture, wireframe:false})
	)

	meshWallFront.position.y += 2.5
	meshWallFront.position.z -= 5
	meshWallFront.receiveShadow = true;
	scene.add(meshWallFront)
	calculateCollisionPoints( meshWallFront,  'WallFront');

	//Add Light to the space
	const ambiantLight = new THREE.AmbientLight( 0x404040, 0.5 ); // soft white light
	scene.add(ambiantLight)

	//Add a light like a bulb in the space
	const light = new THREE.PointLight(0xffffff, 0.8, 18);
	light.position.set(-3,6,-3);
	light.castShadow = true;
	// Will not light anything closer than 0.1 units or further than 25 units
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 25;
	scene.add(light);
}

function calculateCollisionPoints(mesh, name){
	// Compute the bounding box after scale, translation, etc.
	var bbox = new THREE.Box3().setFromObject(mesh);
 
	var bounds = {
	  type: 'collision',
	  name: name,
	  xMin: bbox.min.x,
	  xMax: bbox.max.x,
	  yMin: bbox.min.y,
	  yMax: bbox.max.y,
	  zMin: bbox.min.z,
	  zMax: bbox.max.z,
	};
   
	collisions.push( bounds );
}

function detectCollisions(){
	var bounds = {
		xMin: characterControls.model.position.x - 3/4,
		xMax: characterControls.model.position.x + 3/4,
		yMin: characterControls.model.position.y - 3/4,
		yMax: characterControls.model.position.y + 3/4,
		zMin: characterControls.model.position.z - 3/4,
		zMax: characterControls.model.position.z + 3/4, 
	};
	

	 // Run through each object and detect if there is a collision.
	 for ( var index = 0; index < collisions.length; index ++ ) {
 
		if (collisions[ index ].type == 'collision' ) {
		  if ( ( bounds.xMin <= collisions[ index ].xMax && bounds.xMax >= collisions[ index ].xMin ) &&
			 ( bounds.yMin <= collisions[ index ].yMax && bounds.yMax >= collisions[ index ].yMin) &&
			 ( bounds.zMin <= collisions[ index ].zMax && bounds.zMax >= collisions[ index ].zMin) ) {
				 
			// Move the object in the clear. Detect the best direction to move.
			if ( bounds.xMin <= collisions[ index ].xMax && bounds.xMax >= collisions[ index ].xMin ) {
			  // Determine center then push out accordingly.
			  var objectCenterX = ((collisions[ index ].xMax - collisions[ index ].xMin) / 2) + collisions[ index ].xMin;
			  var playerCenterX = ((bounds.xMax - bounds.xMin) / 2) + bounds.xMin;
			  var objectCenterZ = ((collisions[ index ].zMax - collisions[ index ].zMin) / 2) + collisions[ index ].zMin;
			  var playerCenterZ = ((bounds.zMax - bounds.zMin) / 2) + bounds.zMin;
	 
			  // Determine the X axis push.
			  if (objectCenterX > playerCenterX) {
				characterControls.model.position.x -= 0.1;
			  } else {
				characterControls.model.position.x += 0.1;
			  }
			}
			if ( bounds.zMin <= collisions[ index ].zMax && bounds.zMax >= collisions[ index ].zMin ) {
			  // Determine the Z axis push.
			  if (objectCenterZ > playerCenterZ) {
				characterControls.model.position.z -= 0.1;
			  } else {
				characterControls.model.position.z += 0.1;
			  }
			}
		  }
		}
	  }
}
