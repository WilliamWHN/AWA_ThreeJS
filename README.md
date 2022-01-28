# Projet AWA Animation avec ThreeJS
Ce projet a pour but d'apprendre à utiliser la librairie THREEJS. 
J'avais comme objectif d'animer une scene 3D qui comporterait des modèles 3D ainsi que différentes formes créer sur mesure.
J'ai pu explorer les bases de THREE en incorporant des éléments tel qu'une caméra, lumière, modèles 3D, physique et des mouvements.

Je suis parti sur une base seine et donc il ne suffit que d'un serveur web pour faire tourner mon application.

Une version est hébergée sur netify à ce lien : https://angry-murdock-d0b313.netlify.app/ 

# Libraire et Outils
- ThreeJS
- Live Server 
- Beautify
- Typings (autocomplete pour threejs)

# ThreeJs
ThreeJS est une libraire javascript permettant la création de scène 3D depuis le navigateur. Les rendus sont fait en WebGL.  Ce qui fait la force de threeJS c'est qu'il n'a besoin d'aucune autre plugin pour être utilisée. Il suffit d'une balise canvas en HTML5 et le tour est joué, on pourra déja commencé la réalisation.

# Fonctionnalités
## Actuelles
- Caméra orbitale au tour du joueur qu'on peut déplacer en arc de cercle grâce à la souris
- Déplacement du joueur avec les WASD
- Animation de déplacement (marcher, courir, et inactif) (maitenir la touche SHIFT pour courir)
- Collisions du personnage avec les objets entourant (mur, bureau, canapé)

## Que j'aurai voulu faire
- Intercation avec des éléments du décor 
- Animer un modèle soit-même (en utilisant blender)

# Exemples de code
Récuperation des animation d'un modèle 3D en .glb
```js
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
	console.log(characterControls)
})
```

Gérer la transition des animations
```js
if (this.currentAction != play) {
    const toPlay = this.animationsMap.get(play)
    const current = this.animationsMap.get(this.currentAction)

    current.fadeOut(this.fadeDuration)
    toPlay.reset().fadeIn(this.fadeDuration).play();

    this.currentAction = play
}
```

Callback de threeJS rafraichissant à chaque nouvelle frame 
```js
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
``` 

#Sources utilisée
- https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene
- https://www.youtube.com/watch?v=C3s0UHpwlf8
- https://www.youtube.com/watch?v=t3lbOyH5eKo


