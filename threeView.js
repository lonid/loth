var renderer, scene, camera, renderLoop;
var pointLight, sunLight;

var cameraPosition = {horizontal: 0, vertical: 0, distance: 300, automove: false};
var mouse = {x: 0, y: 0, down: false, ox: 0, oy: 0, h: 0, v: 0};
var center = new THREE.Vector3(0,150,0);

var delta, clock = new THREE.Clock();
var stats;

var meshs = [];
var materials = [];
var players = [];
var currentPlay;

//-----------------------------------------------------
//  INIT VIEW
//-----------------------------------------------------

function initThree(canvasName) {
	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize( vsize.x, vsize.y );
	document.getElementById( canvasName ).appendChild( renderer.domElement );
	renderer.setClearColor( 0x161616, 1 );
	renderer.physicallyBasedShading = true;
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x161616 , 0, 2000 );

	camera = new THREE.PerspectiveCamera( 70, 1, 1, 4000 );
	scene.add(camera);

	//content =new THREE.Object3D();
	//scene.add(content);

	document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener( 'mousedown', onMouseDown, false );
	document.addEventListener( 'mouseup', onMouseUp, false );
	
	initLights();
	initObject();
	initSea3DMesh();

	onThreeChangeView(45,60,1000);

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = 110+'px';
	stats.domElement.style.left = '20px';
	document.getElementById( "stats" ).appendChild(stats.domElement);

	//animate();
    startRender();
}

//-----------------------------------------------------
//  LIGHT
//-----------------------------------------------------

function initLights() {
	sunLight = new THREE.DirectionalLight( 0xffffff );
	sunLight.intensity = 1.2;
	sunLight.castShadow = true;

	sunLight.shadowCameraNear = 100;
	sunLight.shadowCameraFar = 2000;
	
	sunLight.shadowMapBias = 0.01;
	sunLight.shadowMapDarkness = 0.7;
	sunLight.shadowMapWidth = 1024;
	sunLight.shadowMapHeight = 1024;

	var lightSize = 1000;

	sunLight.shadowCameraLeft = -lightSize;
	sunLight.shadowCameraRight = lightSize;
	sunLight.shadowCameraTop = lightSize;
	sunLight.shadowCameraBottom = -lightSize;

	//sunLight.shadowCameraVisible = true;

	sunLight.position.copy( Orbit(center , 35, 45, 1000));
	sunLight.lookAt(center);

	scene.add(sunLight);

	pointLight = new THREE.PointLight( 0x60ff60, 0.5, 2000 );
	pointLight.position.set( 0, 50, -400 );
	scene.add( pointLight );

	pointLight2 = new THREE.PointLight( 0xff6060, 0.5, 2000 );
	pointLight2.position.set( 0, 50, 400 );
	scene.add( pointLight2 );
}

//-----------------------------------------------------
//  OBJECT
//-----------------------------------------------------

function initObject() {
	var geometry = new THREE.PlaneGeometry( 10000,10000 );
	var plane = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0x303030, shininess:100, specular:0xffffff } ) );
	plane.rotation.x = degToRad(-90);
	scene.add(plane);

	plane.receiveShadow = true;
	plane.castShadow = false;

	geometry = new THREE.SphereGeometry( 50,30,30 );
	//var sphereA = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0xff0000 } ) );
	var sphereA = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0xff0000, shininess:100, specular:0xffffff } ) );
	var sphereB = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0x00ff00, shininess:100, specular:0xffffff } ) );
	sphereA.position.z = 400;
	sphereB.position.z = -400;
	sphereA.position.y = sphereB.position.y = 50;
	scene.add(sphereA);
	scene.add(sphereB);

	sphereA.receiveShadow = sphereB.castShadow = true;
	sphereA.castShadow = sphereB.castShadow = true;
}

//-----------------------------------------------------
//  SEA3D IMPORT
//-----------------------------------------------------

function initSea3DMesh() {
	var loader = new THREE.SEA3D( false );
	loader.onComplete = function( e ) {
		for (i=0; i < loader.meshes.length; i++){
			meshs[i] = loader.meshes[i];
		}
	    addSea3DMesh();
	};
	loader.load( 'assets/model.sea' );
}

function addSea3DMesh() {
	players[0] = meshs[27+6];
	players[0].scale.set( 10, 10, -10 );
    players[0].position.set(100, 45, -100);
	players[0].material = new THREE.MeshPhongMaterial( { color: 0x808080, shininess:100, specular:0xffffff, skinning:true });
	players[0].play('idle');
	scene.add(players[0]);

	players[1] = meshs[27+7];
	players[1].scale.set( 10, 10, -10 );
	players[1].position.set(-100, 250, 0);
	players[1].material = new THREE.MeshPhongMaterial( { color: 0x808080, shininess:100, specular:0xffffff, skinning:true });
	players[1].play('idle');
	scene.add(players[1]);
	currentPlay = 'idle'
}


function threeChangeAnimation(){
	if (players.length>0){
		if (currentPlay == "idle") {
			currentPlay = "walk";
		} else {
			currentPlay = "idle";
		}
		players[0].play(currentPlay);
		players[1].play(currentPlay);
	}
}
//-----------------------------------------------------
//  EVENT
//-----------------------------------------------------

function startRender() {
	//if(!renderLoop) renderLoop = setInterval( function () { animate();}, 1000 / 120 );
    if(!renderLoop) renderLoop = setInterval( function () { requestAnimationFrame( animate ); }, 1000 / 60 );
}

function stopRender() {
	if(renderLoop) {clearInterval(renderLoop); renderLoop = null;}
}

function animate() {
	delta = clock.getDelta();
	THREE.AnimationHandler.update( delta*0.5 );
	//requestAnimationFrame( animate );
	renderer.render( scene, camera );
	stats.update();
}

function onThreeResize(x, y) {
	camera.aspect = x/y;
	camera.updateProjectionMatrix();
	renderer.setSize( x, y );
	
	animate();
}

//-----------------------------------------------------
//  MOUSE
//-----------------------------------------------------

function onMouseDown(e) {
	if(e.clientX > vsize.w+10) return;
	mouse.ox = e.clientX;
	mouse.oy = e.clientY;
	mouse.h = cameraPosition.horizontal;
	mouse.v = cameraPosition.vertical;
	mouse.down = true;
}
		
function onMouseUp(e) {
	mouse.down = false;
}
		
function onMouseMove(e) {
	if (mouse.down && !cameraPosition.automove ) {
		mouse.x = e.clientX;
		mouse.y = e.clientY;
		cameraPosition.horizontal = ((mouse.x - mouse.ox) * 0.3) + mouse.h;
		cameraPosition.vertical = (-(mouse.y - mouse.oy) * 0.3) + mouse.v;
		moveCamera();
	}
}

//-----------------------------------------------------
//  CAMERA
//-----------------------------------------------------

function moveCamera() {
	camera.position.copy(Orbit(center, cameraPosition.horizontal, cameraPosition.vertical, cameraPosition.distance));
	camera.lookAt(center);
}
		
function endMove() {
	cameraPosition.automove = false;
}

function onThreeChangeView(h, v, d) {
	TweenLite.to(cameraPosition, 3, {horizontal: h, vertical: v, distance: d, onUpdate: moveCamera, onComplete: endMove });
	cameraPosition.automove = true;
}

//-----------------------------------------------------
//  MATH
//-----------------------------------------------------

function Orbit(origine, horizontal, vertical, distance) {
	var p = new THREE.Vector3();
	var phi = degToRad( unwrapDegrees(vertical) );
	var theta = degToRad( unwrapDegrees(horizontal) );
	p.x = (distance * Math.sin(phi) * Math.cos(theta)) + origine.x;
	p.z = (distance * Math.sin(phi) * Math.sin(theta)) + origine.z;
	p.y = (distance * Math.cos(phi)) + origine.y;
	return p;
}

function degToRad(Value) {
	return Value * Math.PI / 180;
}

function unwrapDegrees(r){
	r = r % 360;
	if (r > 180) 
		r -= 360;
	if (r < -180) 
		r += 360;
	return r;
}