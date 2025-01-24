import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
//Post-processing
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { SobelOperatorShader } from 'three/examples/jsm/shaders/SobelOperatorShader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

/*------------------------------------------------------------------------------------------*
 *   Création de la scène                                                                   *
 * -----------------------------------------------------------------------------------------*/
const menuScene = new THREE.Scene(); // Correspond au menu du jeu
const gameScene = new THREE.Scene(); //Scène du jeu
const gameOverScene= new THREE.Scene(); // GameOver
const nextLevelScene= new THREE.Scene(); // Next Level
const winScene = new THREE.Scene(); //Victoire

/*------------------------------------------------------------------------------------------*
 *   Création de la caméra                                                                  *
 * -----------------------------------------------------------------------------------------*/
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const cameraGO = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
cameraGO.position.z = 30; // Positionnement de la caméra
const cameraMenu = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
cameraMenu.position.z = 30; // Positionnement de la caméra
const cameraNL = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
cameraNL.position.z = 30; // Positionnement de la caméra
const cameraW = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
cameraW.position.z = 30; // Positionnement de la caméra

/*------------------------------------------------------------------------------------------*
 *   Création de la lumière                                                                 *
 * -----------------------------------------------------------------------------------------*/
const light = new THREE.AmbientLight();
gameScene.add(light);
gameOverScene.add(light);
menuScene.add(light);
var ambientLight= new THREE.AmbientLight( 0x020202 );
gameScene.add( ambientLight);
var frontLight	= new THREE.DirectionalLight('white', 1);
frontLight.position.set(0, -130, 300);
gameScene.add( frontLight );
var backLight	= new THREE.DirectionalLight('white', 0.75);
backLight.position.set(0, -12, 0);

/*------------------------------------------------------------------------------------------*
 *   Creation du render                                                                     *
 * -----------------------------------------------------------------------------------------*/
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/*------------------------------------------------------------------------------------------*
 *   Post-Processing                                                                        *
 * -----------------------------------------------------------------------------------------*/
const effectSobel = new ShaderPass( SobelOperatorShader );
effectSobel.uniforms.resolution.value = new THREE.Vector2(window.innerWidth*4, window.innerHeight*4);
const composer = new EffectComposer( renderer );
const renderPass = new RenderPass(gameScene, camera);
composer.addPass(renderPass);
composer.addPass(effectSobel);

/*------------------------------------------------------------------------------------------*
 *   VARIABLES                                                                              *
 * -----------------------------------------------------------------------------------------*/
var aliens = []; // Liste d'aliens
var modelSM = null;
var modelCM = null;
var modelOM = null;
var modelUM = null;
var crab = null; 
var squid = null;
var octopus = null;
var ufo = null;
var modelBC1 = null;
var modelBC2 = null;
var modelBC3 = null;

var squids_nb = 11; //Nombre d'aliens
var crabs_nb = 22;
var octopuses_nb = 22;

var playerSpaceship = null;

const shelters = [];
var sheltersGroup = null;

var xstartposition = null; //Position
var ystartposition = null;
var speed = 2; //vitesse et déplacement
var alienSpeed = null;
var ystep = 0.5;
var xstep = 0.25;
var general_xdirection = 1; //direction
var general_ydirection = 0;
var frame = 0; //frame
var alienMoveFrame = 0;

var invincibleMode = false;
var cheatKeyInvinciblePressed = null;
var helpPressed = false;
var processPressed = false;
var musicPressed= false;
var gameOverTriggered = false;

var arcadeFont = null;

var levelGame = 1;
var score = null; //Score
var scorePoseX = 32.22;
var health = null; //Vies
var healthPoseX = 32.9;
var levelPoseX = 32.4;
var helpPoseX = -37;

var activeScene = menuScene; //Scene active
var cameraMode = "normal";
var camPosX = 0;

const mixer = new THREE.AnimationMixer();

/*------------------------------------------------------------------------------------------*
 *   Changement de caméra                                                                   *
 * -----------------------------------------------------------------------------------------*/
document.addEventListener("keydown", KeyCam, false);
function KeyCam(event) {
  if (event.keyCode === 48) {
    cameraMode = "normal";
    gameScene.remove(backLight);
  }
  if (event.keyCode === 49) {
    cameraMode = "moveable";
    gameScene.add(backLight);
  }
  if (event.keyCode === 50) {
    cameraMode = "laterale";
    gameScene.remove(backLight);
  }
}

/*------------------------------------------------------------------------------------------*
 *   Police d'écriture                                                                      *
 * -----------------------------------------------------------------------------------------*/
const loader = new FontLoader();
loader.load('./src/fonts/Arcade_Normal_Regular.json', function (font) {
  arcadeFont = font;
});

/*------------------------------------------------------------------------------------------*
 *   Aliens du menu                                                                         *
 * -----------------------------------------------------------------------------------------*/
var loaderSM = new GLTFLoader();
loaderSM.load('./src/medias/models/menuAliens/SquidMenu.gltf', function (gltf) {
  modelSM = gltf.scene;
});
var loaderCM = new GLTFLoader();
loaderCM.load('./src/medias/models/menuAliens/CrabMenu.gltf', function (gltf) {
  modelCM = gltf.scene;
});
var loaderOM = new GLTFLoader();
loaderOM.load('./src/medias/models/menuAliens/OctopusMenu.gltf', function (gltf) {
  modelOM = gltf.scene;
});
var loaderUM = new GLTFLoader();
loaderUM.load('./src/medias/models/menuAliens/ufoMenu.gltf', function (gltf) {
  modelUM = gltf.scene;
});

/*------------------------------------------------------------------------------------------*
 *   Sons du jeu                                                                            *
 * -----------------------------------------------------------------------------------------*/
const listenerAK = new THREE.AudioListener();
const soundAlienKilled = new THREE.Audio(listenerAK);
const audioLoaderAK = new THREE.AudioLoader();
audioLoaderAK.load('./src/medias/sounds/invaderkilled.wav', function (buffer) {
  soundAlienKilled.setBuffer(buffer);
  soundAlienKilled.setLoop(false);
  soundAlienKilled.setVolume(0.5);
});

//Son balle de tir
const listenerSH = new THREE.AudioListener();
const soundShoot = new THREE.Audio(listenerSH);
const audioLoaderSH = new THREE.AudioLoader();
audioLoaderSH.load('./src/medias/sounds/shoot.wav', function (buffer) {
  soundShoot.setBuffer(buffer);
  soundShoot.setLoop(false);
  soundShoot.setVolume(0.08);
});

//Son du menu
const listenerM = new THREE.AudioListener();
const soundMenu = new THREE.Audio(listenerM);
const audioLoaderM = new THREE.AudioLoader();
audioLoaderM.load('./src/medias/sounds/menu_sound.wav', function (buffer) {
  soundMenu.setBuffer(buffer);
  soundMenu.setLoop(false);
  soundMenu.setVolume(0.5);
});

const listenerH = new THREE.AudioListener();
const soundHit = new THREE.Audio(listenerH);
const audioLoaderH = new THREE.AudioLoader();
audioLoaderH.load('./src/medias/sounds/hit.wav', function (buffer) {
  soundHit.setBuffer(buffer);
  soundHit.setLoop(false);
  soundHit.setVolume(0.5);
});

const listenerGO = new THREE.AudioListener();
const soundGO = new THREE.Audio(listenerGO);
const audioLoaderGO = new THREE.AudioLoader();
audioLoaderGO.load('./src/medias/sounds/gameOver.wav', function (buffer) {
  soundGO.setBuffer(buffer);
  soundGO.setLoop(false);
  soundGO.setVolume(0.5);
});

const listenerOL = new THREE.AudioListener();
const soundOL = new THREE.Audio(listenerOL);
const audioLoaderOL = new THREE.AudioLoader();
audioLoaderOL.load('./src/medias/sounds/alert.wav', function (buffer) {
  soundOL.setBuffer(buffer);
  soundOL.setLoop(false);
  soundOL.setVolume(0.5);
});

const listenerCheat = new THREE.AudioListener();
const soundCM = new THREE.Audio(listenerCheat);
const audioLoaderCM = new THREE.AudioLoader();
audioLoaderCM.load('./src/medias/sounds/cheat.wav', function (buffer) {
  soundCM.setBuffer(buffer);
  soundCM.setLoop(false);
  soundCM.setVolume(0.1);
});

const listenerShelterH = new THREE.AudioListener();
const soundSH = new THREE.Audio(listenerShelterH);
const audioLoaderSheldH = new THREE.AudioLoader();
audioLoaderSheldH.load('./src/medias/sounds/shelter_hit.wav', function (buffer) {
  soundSH.setBuffer(buffer);
  soundSH.setLoop(false);
  soundSH.setVolume(0.2);
});

const listenerHelp = new THREE.AudioListener();
const soundHelp = new THREE.Audio(listenerHelp);
const audioLoaderHelp = new THREE.AudioLoader();
audioLoaderHelp.load('./src/medias/sounds/help.wav', function (buffer) {
  soundHelp.setBuffer(buffer);
  soundHelp.setLoop(false);
  soundHelp.setVolume(0.2);
});

const listenerLevelUp = new THREE.AudioListener();
const soundLU = new THREE.Audio(listenerLevelUp);
const audioLoaderLevelUp = new THREE.AudioLoader();
audioLoaderLevelUp.load('./src/medias/sounds/level_up.wav', function (buffer) {
  soundLU.setBuffer(buffer);
  soundLU.setLoop(false);
  soundLU.setVolume(0.2);
});

const listenerBonus = new THREE.AudioListener();
const soundB = new THREE.Audio(listenerBonus);
const audioLoaderBonus = new THREE.AudioLoader();
audioLoaderBonus.load('./src/medias/sounds/sample_v2.wav', function (buffer) {
  soundB.setBuffer(buffer);
  soundB.setLoop(false);
  soundB.setVolume(0.2);
});

const listenerM1 = new THREE.AudioListener();
camera.add(listenerM1);
const music1 = new THREE.Audio(listenerM1);
const audioLoaderM1 = new THREE.AudioLoader();
audioLoaderM1.load('./src/medias/sounds/level1.mp3', function (buffer) {
  music1.setBuffer(buffer);
  music1.setLoop(true);
  music1.setVolume(0.1)
});
const listenerM2 = new THREE.AudioListener();
camera.add(listenerM1);
const music2 = new THREE.Audio(listenerM2);
const audioLoaderM2 = new THREE.AudioLoader();
audioLoaderM2.load('./src/medias/sounds/level2.mp3', function (buffer) {
  music2.setBuffer(buffer);
  music2.setLoop(true);
  music2.setVolume(0.1)
});
const listenerM3 = new THREE.AudioListener();
camera.add(listenerM1);
const music3 = new THREE.Audio(listenerM3);
const audioLoaderM3 = new THREE.AudioLoader();
audioLoaderM3.load('./src/medias/sounds/level3.mp3', function (buffer) {
  music3.setBuffer(buffer);
  music3.setLoop(true);
  music3.setVolume(0.1)
});

document.addEventListener("keydown", KeyDownMusic, false);
function KeyDownMusic(event) {
  if (activeScene == gameScene) {
    if (event.keyCode === 77 && !musicPressed) {
      if (levelGame == 1) { music1.play(); }
      if (levelGame == 2) { music2.play(); }
      if (levelGame == 3) { music3.play(); }
      musicPressed = true;
    } else if (event.keyCode === 77 && musicPressed) {
      if (levelGame == 1) { music1.pause(); }
      if (levelGame == 2) { music2.pause(); }
      if (levelGame == 3) { music3.pause(); }
      musicPressed = false;
    }
  }
}


/*------------------------------------------------------------------------------------------*
 *   Background                                                                             *
 * -----------------------------------------------------------------------------------------*/
var loaderBC1 = new GLTFLoader();
loaderBC1.load('./src/medias/models/cityBack/cityBlue.gltf', function (gltf) {
  modelBC1 = gltf.scene;
});
var loaderBC2 = new GLTFLoader();
loaderBC2.load('./src/medias/models/cityBack/cityPink.gltf', function (gltf) {
  modelBC2 = gltf.scene;
});
var loaderBC3 = new GLTFLoader();
loaderBC3.load('./src/medias/models/cityBack/cityOrange.gltf', function (gltf) {
  modelBC3 = gltf.scene;
});

var cityAdded = false;
function cityBackground() {
  if (modelBC1 != null && modelBC2 != null) {
    modelBC1.position.set(0, -19, 5);
    modelBC1.scale.set(12, 10, 10);
    modelBC2.position.set(0, -19, 5);
    modelBC2.scale.set(12, 10, 10);
    modelBC3.position.set(0, -19, 5);
    modelBC3.scale.set(12, 10, 10);
  }
  if (levelGame == 1) {
    if (cityAdded) {
      gameScene.remove(modelBC3);
      gameScene.remove(modelBC2);
      cityAdded = false;
    }
    if (!cityAdded) {
      gameScene.add(modelBC1);
      cityAdded = true;
    }
  }
  if (levelGame == 2) {
    if (cityAdded) {
      gameScene.remove(modelBC1);
      gameScene.remove(modelBC3);
      cityAdded = false;
    }
    if (!cityAdded) {
      gameScene.add(modelBC2);
      cityAdded = true;
    }
  }
  if (levelGame == 3) {
    if (cityAdded) {
      gameScene.remove(modelBC2);
      gameScene.remove(modelBC1);
      cityAdded = false;
    }
    if (!cityAdded) {
      gameScene.add(modelBC3);
      cityAdded = true;
    }
  }
}

var geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
var stars = [];

for (var i = 0; i < 500; i++) {
  var star = new THREE.Mesh(geometry, material);
  star.position.x = Math.random() * -60 + 30;
  star.position.y = Math.random() * -60 + 30;
  star.position.z = Math.random() * -60;
  star.scale.x = Math.random();
  star.scale.y = Math.random();
  star.scale.z = Math.random();
  gameScene.add(star);
  stars.push(star);
}

/*------------------------------------------------------------------------------------------*
 *   Menu                                                                                   *
 * -----------------------------------------------------------------------------------------*/
function menu() {
  var playText = null;
  const textGeometryPlay = new TextGeometry('Click here to play!', {
    font: arcadeFont,
    size: 1,
    height: 0.1,
    curveSegments: 12,
    bevelThickness: 0.1,
    bevelEnabled: false,
  });
  var textMaterialPlay = new THREE.MeshBasicMaterial({ color: 0xffffff });
  playText = new THREE.Mesh(textGeometryPlay, textMaterialPlay);
  playText.lookAt(cameraMenu.position);
  playText.position.set(-12, 9, 0);
  menuScene.add(playText);

  function onClick(event) {
    window.removeEventListener('click', onClick);
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    const mouse = new THREE.Vector2(mouseX, mouseY, 0);

    //rayon
    const ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, cameraMenu);

    //Interception du texte avec la souris
    const intersMouse = ray.intersectObjects([playText]);
    if (intersMouse.length > 0) {
      soundMenu.play();
      startGame();
    }
  }
  window.addEventListener('click', onClick);

  document.addEventListener("keydown", KeyEnterMenu, false);
  function KeyEnterMenu(event) {
    document.removeEventListener("keydown", KeyEnterMenu);
    if (activeScene == menuScene) {
      if (event.keyCode === 13) {
        soundMenu.play();
        startGame();
      }
    }
  }

  //Positionnement des aliens dans le menu
  if (modelSM != null && modelCM != null && modelOM != null && modelUM != null) {
    modelSM.position.set(-6, -0.8, 0);
    modelSM.scale.set(0.1, 0.2, 0.4);
    modelSM.rotation.set(0, Math.PI / 2, Math.PI / 2);
    menuScene.add(modelSM);
    modelCM.position.set(-6, -3.4, 0);
    modelCM.scale.set(0.1, 0.2, 0.4);
    modelCM.rotation.set(0, Math.PI / 2, Math.PI / 2);
    menuScene.add(modelCM);
    modelOM.position.set(-6, -6, 0);
    modelOM.scale.set(0.1, 0.2, 0.4);
    modelOM.rotation.set(0, Math.PI / 2, Math.PI / 2);
    menuScene.add(modelOM);
    modelUM.position.set(-6, 1, 0);
    modelUM.scale.set(6, 7, 9);
    menuScene.add(modelUM);
  }

  const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const textGeometryTableSCore = new TextGeometry('*Score Advance Table*', {
    font: arcadeFont,
    size: 1,
    height: 0.1,
    curveSegments: 12,
    bevelThickness: 0.1,
    bevelEnabled: false,
  });

  const textGeometryAlienSCore = new TextGeometry('= ? Points \n\n= 30 Points \n\n= 20 Points \n\n= 10 Points', {
    font: arcadeFont,
    size: 1,
    height: 0.1,
    curveSegments: 12,
    bevelThickness: 0.1,
    bevelEnabled: false,
  });

  const textGeometryGameName = new TextGeometry('Space Invaders', {
    font: arcadeFont,
    size: 1,
    height: 0.1,
    curveSegments: 12,
    bevelThickness: 0.1,
    bevelEnabled: false,
  });

  const tableScore = new THREE.Mesh(textGeometryTableSCore, textMaterial);
  tableScore.lookAt(cameraMenu.position);
  tableScore.position.set(-13.5, 3, 0);
  menuScene.add(tableScore);

  const alienPoints = new THREE.Mesh(textGeometryAlienSCore, textMaterial);
  alienPoints.lookAt(cameraMenu.position);
  alienPoints.position.set(-4, 1, 0);
  menuScene.add(alienPoints);

  const gameName = new THREE.Mesh(textGeometryGameName, textMaterial);
  gameName.lookAt(cameraMenu.position);
  gameName.position.set(-8.5, 11, 0);
  menuScene.add(gameName);

  const myName = new THREE.Mesh(textGeometryName, textMaterial);
  myName.lookAt(cameraMenu.position);
  myName.position.set(-39.7, -21, 0);
  menuScene.add(myName);

}

/*------------------------------------------------------------------------------------------*
 *   Affichage du score                                                                     *
 * -----------------------------------------------------------------------------------------*/
var textScore = null;
function ScoreUpdate() {
  if (textScore != null) {
    gameScene.remove(textScore);
  }
  const textGeometry = new TextGeometry('Score: ' + score, {
    font: arcadeFont,
    size: 0.5,
    height: 0.01,
    curveSegments: 12,
    bevelThickness: 0.1,
    bevelEnabled: false,
  });
  const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  textScore = new THREE.Mesh(textGeometry, textMaterial);

  if (cameraMode === "normal") {
    textScore.lookAt(camera.position);
    textScore.position.set(32, 20, 0);
  }
  if (cameraMode === "laterale") {
    textScore.lookAt(camera.position);
    textScore.position.set(-20, 42, 0);
    textScore.rotation.set(0, 0, Math.PI / 2);
  }
  if (cameraMode === "moveable") {
    textScore.position.set(scorePoseX, 25.2, -1.6);
    textScore.rotation.set(Math.PI / 4, 0, 0);
  }
  gameScene.add(textScore);
}

/*------------------------------------------------------------------------------------------*
 *   Affichage du nombre de vie                                                             *
 * -----------------------------------------------------------------------------------------*/
var textHealth = null;
function HealthUpdate() {
  if (textHealth != null) {
    gameScene.remove(textHealth);
  }
  //Caractere du font
  const textGeometry = new TextGeometry('å ' + health, {
    font: arcadeFont,
    size: 0.5,
    height: 0.01,
    curveSegments: 12,
    bevelThickness: 0.1,
    bevelEnabled: false,
  });
  const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  textHealth = new THREE.Mesh(textGeometry, textMaterial);

  if (cameraMode === "normal") {
    textHealth.lookAt(camera.position);
    textHealth.position.set(32, 18.5, 0);;
  }
  if (cameraMode === "laterale") {
    textHealth.lookAt(camera.position);
    textHealth.position.set(-18.5, 42, 0);
    textHealth.rotation.set(0, 0, Math.PI / 2);
  }
  if (cameraMode === "moveable") {
    textHealth.position.set(healthPoseX, 24.92, -2.8);
    textHealth.rotation.set(Math.PI / 4, 0, 0);
  }
  gameScene.add(textHealth);
}

/*------------------------------------------------------------------------------------------*
 *   Affichage du level                                                                     *
 * -----------------------------------------------------------------------------------------*/
var textLevel = null;
function levelUpdate() {
  if (textLevel != null) {
    gameScene.remove(textLevel);
  }
  const textGeometry = new TextGeometry('level <' + levelGame + '>', {
    font: arcadeFont,
    size: 0.5,
    height: 0.01,
    curveSegments: 12,
    bevelThickness: 0.1,
    bevelEnabled: false,
  });
  const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  textLevel = new THREE.Mesh(textGeometry, textMaterial);

  if (cameraMode === "normal") {
    textLevel.lookAt(camera.position);
    textLevel.position.set(32, 16.5, 0);;
  }
  if (cameraMode === "laterale") {
    textLevel.lookAt(camera.position);
    textLevel.position.set(-16.5, 42, 0);
    textLevel.rotation.set(0, 0, Math.PI / 2);
  }
  if (cameraMode === "moveable") {
    textLevel.position.set(levelPoseX, 22.88, -4.2);
    textLevel.rotation.set(Math.PI / 4, 0, 0);
  }
  gameScene.add(textLevel);
}


/*------------------------------------------------------------------------------------------*
 *   Recapitulatif des raccourcis clavier                                                   *
 * -----------------------------------------------------------------------------------------*/
var textRecap = null;
var helpTextIsCrea = false;
function recap() {
  if (!helpPressed && textRecap != null) {
    gameScene.remove(textRecap);
    helpTextIsCrea = false;
    textRecap = null;
  } else if (helpPressed && !helpTextIsCrea) {
    const textGeometryRecap = new TextGeometry("Controls:\n\nGo right: right arrow\n\nGo left: left arrow\n\nShoot: spacebar\n\n\nCheat codes:\n\nInvincible mode: i\n\nKill all aliens: k\n\n\nOther:\n\nMusic: m\n\nPost-Processing: p\n\nCamera: 0/1/2", {
      font: arcadeFont,
      size: 0.5,
      height: 0.01,
      curveSegments: 12,
      bevelThickness: 0.1,
      bevelEnabled: false,
    });
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    textRecap = new THREE.Mesh(textGeometryRecap, textMaterial);

    if (cameraMode === "normal") {
      textRecap.position.set(-37, 20, 0);
    }
    if (cameraMode === "laterale") {
      textRecap.position.set(8, 35, 0);
      textRecap.rotation.set(0, 0, Math.PI / 2);
    }
    if (cameraMode === "moveable") {
      textRecap.position.set(helpPoseX, 25.2, -1.6);
      textRecap.rotation.set(Math.PI / 4, 0, 0);
    }
    textRecap.visible = true;
    helpPressed = true;
    helpTextIsCrea = true;
    gameScene.add(textRecap);
  }
}

document.addEventListener("keydown", KeyDownHelp, false);
//document.addEventListener("keyup", KeyUpHelp, false);
function KeyDownHelp(event) {
  if (event.keyCode === 72) {
    helpPressed = !helpPressed;
    soundHelp.play();
    //recap();
  }
}




/*------------------------------------------------------------------------------------------*
 *   Mode triche                                                                            *
 * -----------------------------------------------------------------------------------------*/

function cheatMode() {
  document.addEventListener("keydown", KeyDownCheat, false);
  document.addEventListener("keyup", KeyUpCheat, false);
  document.addEventListener("keydown", KeyKill, false);

  function KeyDownCheat(event) {
    if (event.keyCode === 73 && !cheatKeyInvinciblePressed) {
      soundCM.play();
      invincibleMode = !invincibleMode;
      gameScene.remove(alienBullet);
      cheatKeyInvinciblePressed = true;
    }
  }

  function KeyUpCheat(event) {
    if (event.keyCode === 73) {
      cheatKeyInvinciblePressed = false;
    }
  }

  function KeyKill(event) {
    if (event.keyCode === 75) {
      score = 0;
      soundCM.play();
      gameScene.remove(alienBullet);
      for (var i = 0; i < aliens.length; i++) {
        gameScene.remove(aliens[i].object);
      }
      aliens = [];
    }
  }
}

/*------------------------------------------------------------------------------------------*
 *   Autres commandes                                                                       *
 * -----------------------------------------------------------------------------------------*/
document.addEventListener("keydown", KeyDownPostProcess, false);
function KeyDownPostProcess(event) {
  if (event.keyCode === 80) {
    processPressed = !processPressed;
  }
}

/*------------------------------------------------------------------------------------------*
 *   GameOver                                                                               *
 * -----------------------------------------------------------------------------------------*/
function gameOverScreen() {
  var textGameOver = null;
  var textReturn = null;
  var newTextScore = null;
  const textMaterialGO = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const textGeometryGO = new TextGeometry('GameOver', {
    font: arcadeFont,
    size: 2,
    height: 0.1,
    curveSegments: 12,
    bevelThickness: 0.1,
    bevelEnabled: false,
  });

  const textGeometryGOreturn = new TextGeometry('Go back to menu', {
    font: arcadeFont,
    size: 1,
    height: 0.1,
    curveSegments: 12,
    bevelThickness: 0.1,
    bevelEnabled: false,
  });

  const textGeometryGOscore = new TextGeometry('Score:' + score, {
    font: arcadeFont,
    size: 1,
    height: 0.1,
    curveSegments: 12,
    bevelThickness: 0.1,
    bevelEnabled: false,
  });

  textGameOver = new THREE.Mesh(textGeometryGO, textMaterialGO);
  textGameOver.lookAt(cameraGO.position);
  textGameOver.position.set(-10, 15, 0);
  gameOverScene.add(textGameOver);

  textReturn = new THREE.Mesh(textGeometryGOreturn, textMaterialGO);
  textReturn.lookAt(cameraGO.position);
  textReturn.position.set(-9, 12, 0);
  gameOverScene.add(textReturn);

  newTextScore = new THREE.Mesh(textGeometryGOscore, textMaterialGO);
  newTextScore.lookAt(cameraGO.position);
  newTextScore.position.set(-9, 9, 0);
  gameOverScene.add(newTextScore);

  async function onClick(event) {
    window.removeEventListener('click', onClick);
    event.preventDefault();
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    const mouse = new THREE.Vector2(mouseX, mouseY, 0);

    //rayon
    const ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, cameraGO);

    //Interception du texte avec la souris
    const intersMouse = ray.intersectObjects([textReturn], true);
    if (intersMouse.length > 0) {
      levelGame = 1;
      setLevel();
      health = 3;
      activeScene = menuScene;
      gameScene.add(playerSpaceship);
      gameOverTriggered = false;
    }
  }
  window.addEventListener('click', onClick);

  document.addEventListener("keydown", KeyEnterGO, false);
  function KeyEnterGO(event) {
    document.removeEventListener("keydown", KeyEnterGO);
    if (activeScene == gameOverScene) {
      if (event.keyCode === 13) {
        levelGame = 1;
        setLevel();
        health = 3;
        activeScene = menuScene;
        gameScene.add(playerSpaceship);
        gameOverTriggered = false;
      }
    }
  }
}

/*------------------------------------------------------------------------------------------*
 *   Win                                                                                    *
 * -----------------------------------------------------------------------------------------*/
function WinScreen() {
  var textWin = null;
  var textReturn = null;
  var newTextScore = null;
  const textMaterialGO = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const textGeometryW = new TextGeometry('Victory!', {
    font: arcadeFont,
    size: 2,
    height: 0.1,
    curveSegments: 12,
    bevelThickness: 0.1,
    bevelEnabled: false,
  });

  const textGeometryWreturn = new TextGeometry('Go back to menu', {
    font: arcadeFont,
    size: 1,
    height: 0.1,
    curveSegments: 12,
    bevelThickness: 0.1,
    bevelEnabled: false,
  });

  const textGeometryWscore = new TextGeometry('Score:' + score, {
    font: arcadeFont,
    size: 1,
    height: 0.1,
    curveSegments: 12,
    bevelThickness: 0.1,
    bevelEnabled: false,
  });

  textWin = new THREE.Mesh(textGeometryW, textMaterialGO);
  textWin.lookAt(cameraW.position);
  textWin.position.set(-9, 15, 0);
  winScene.add(textWin);

  textReturn = new THREE.Mesh(textGeometryWreturn, textMaterialGO);
  textReturn.lookAt(cameraW.position);
  textReturn.position.set(-9, 12, 0);
  winScene.add(textReturn);

  newTextScore = new THREE.Mesh(textGeometryWscore, textMaterialGO);
  newTextScore.lookAt(cameraW.position);
  newTextScore.position.set(-9, 9, 0);
  winScene.add(newTextScore);

  async function onClick(event) {
    window.removeEventListener('click', onClick);
    event.preventDefault();
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    const mouse = new THREE.Vector2(mouseX, mouseY, 0);

    //rayon
    const ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, cameraW);

    //Interception du texte avec la souris
    const intersMouse = ray.intersectObjects([textReturn], true);
    if (intersMouse.length > 0) {
      levelGame = 1;
      setLevel();
      health = 3;
      activeScene = menuScene;
    }
  }
  window.addEventListener('click', onClick);

  document.addEventListener("keydown", KeyEnterW, false);
  function KeyEnterW(event) {
    document.removeEventListener("keydown", KeyEnterW);
    if (activeScene == winScene) {
      if (event.keyCode === 13) {
        levelGame = 1;
        setLevel();
        health = 3;
        activeScene = menuScene;
      }
    }
  }
}

/*------------------------------------------------------------------------------------------*
 *   Next Level                                                                             *
 * -----------------------------------------------------------------------------------------*/
async function nextLevelScreen() {
  var textLevelUp = null;
  var textContinue = null;
  var newTextScore = null;
  const textMaterialGO = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const textGeometryLU = new TextGeometry('Level Up!', {
    font: arcadeFont,
    size: 2,
    height: 0.1,
    curveSegments: 12,
    bevelThickness: 0.1,
    bevelEnabled: false,
  });

  const textGeometryLUcontinue = new TextGeometry('Go to next Level', {

    font: arcadeFont,
    size: 1,
    height: 0.1,
    curveSegments: 12,
    bevelThickness: 0.1,
    bevelEnabled: false,
  });

  const textGeometryNLscore = new TextGeometry('Score:' + score, {
    font: arcadeFont,
    size: 1,
    height: 0.1,
    curveSegments: 12,
    bevelThickness: 0.1,
    bevelEnabled: false,
  });

  textLevelUp = new THREE.Mesh(textGeometryLU, textMaterialGO);
  textLevelUp.lookAt(cameraNL.position);
  textLevelUp.position.set(-10, 15, 0);
  nextLevelScene.add(textLevelUp);

  textContinue = new THREE.Mesh(textGeometryLUcontinue, textMaterialGO);
  textContinue.lookAt(cameraNL.position);
  textContinue.position.set(-9.5, 12, 0);
  nextLevelScene.add(textContinue);

  async function onClick(event) {
    window.removeEventListener('click', onClick);
    event.preventDefault();
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    const mouse = new THREE.Vector2(mouseX, mouseY, 0);

    //rayon
    const ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, cameraNL);

    //Interception du texte avec la souris
    const intersMouse = ray.intersectObjects([textContinue], true);
    if (intersMouse.length > 0) {
      await setLevel();
      activeScene = gameScene;
      startGame();
    }
  }
  window.addEventListener('click', onClick);

  document.addEventListener("keydown", KeyEnterNL, false);
  function KeyEnterNL(event) {
    document.removeEventListener("keydown", KeyEnterNL);
    if (activeScene == nextLevelScene) {
      if (event.keyCode === 13) {
        setLevel();
        activeScene = gameScene;
        startGame();
      }
    }
  }

  newTextScore = new THREE.Mesh(textGeometryNLscore, textMaterialGO);
  newTextScore.lookAt(cameraGO.position);
  newTextScore.position.set(-9.5, 9, 0);
  nextLevelScene.add(newTextScore);
}

/*------------------------------------------------------------------------------------------*
*   Balle de tir                                                                            *
* ------------------------------------------------------------------------------------------*/
var GeometryB = new THREE.CylinderGeometry(0.1, 0.1, 1, 10);
var MaterialB = new THREE.MeshBasicMaterial({ color: 0xffffff });
var bullet = new THREE.Mesh(GeometryB, MaterialB);
var alienBullet = new THREE.Mesh(GeometryB, MaterialB);

/*------------------------------------------------------------------------------------------*
 *   Player                                                                                 *
 * -----------------------------------------------------------------------------------------*/
var loaderP = new GLTFLoader(); //On charge le modèle
loaderP.load('./src/medias/models/SpaceShipPlayer.glb', function (gltf) {
  playerSpaceship = gltf.scene;
  playerSpaceship.scale.set(0.15, 0.15, 0.2);
  playerSpaceship.position.y = -10;
  gameScene.add(playerSpaceship);

  document.addEventListener("keydown", onDocumentKeyPress, false); //Déplacements 
  function onDocumentKeyPress(event) {
    var keyCode = event.which;
    if (keyCode === 37) { //Mouvement vers la gauche
      if (playerSpaceship.position.x <= -10) {
        playerSpaceship.position.x = playerSpaceship.position.x;
      } else {
        playerSpaceship.position.x -= 1;
        camPosX -= 1;
        scorePoseX -= 1;
        healthPoseX -= 1;
        levelPoseX -= 1;
        helpPoseX -= 1;
      }
    }
    if (keyCode === 39) { //Mouvement vers la droite
      if (playerSpaceship.position.x >= 10) {
        playerSpaceship.position.x = playerSpaceship.position.x;
      } else {
        playerSpaceship.position.x += 1;
        camPosX += 1;
        scorePoseX += 1;
        healthPoseX += 1;
        levelPoseX += 1;
        helpPoseX += 1;
      }
    }
  }

  document.addEventListener("keydown", onDocumentKeyBullet, false); //Tirs
  function onDocumentKeyBullet(event) {
    var keyCode = event.which;
    if (bullet.parent != gameScene) {
      if (keyCode === 32) {
        soundShoot.play();
        gameScene.add(bullet);
        bullet.position.x = playerSpaceship.position.x;
        bullet.position.y = playerSpaceship.position.y + 0.5;
      }
    }
  }
});

/*------------------------------------------------------------------------------------------*
 *   Aliens                                                                                 *
 * -----------------------------------------------------------------------------------------*/
async function LoadSquid() {
  if (levelGame == 1 || levelGame == 2) {
    squids_nb = 11
  } else {
    squids_nb = 22
  }
  var loader1 = new GLTFLoader();
  var gltf = await loader1.loadAsync('./src/medias/models/squidAlien/squid.gltf');
  var modelS1 = gltf.scene;
  for (let i = 0; i < squids_nb; i++) {
    squid = {
      typeA: "squid",
      xdirection: 1,
      ydirection: 0,
      object: modelS1.clone()
    };
    squid.object.scale.set(5.05, 5.1, 5.2);
    squid.object.position.set(xstartposition, ystartposition, 0);
    gameScene.add(squid.object);
    aliens.push(squid);

    xstartposition++;
    xstartposition = xstartposition + 0.5;

    //Tous les 11 aliens, ont passe à la ligne en dessous
    if ((i + 1) % 11 === 0) {
      ystartposition -= 2;
      xstartposition = -6;
    }
    mixer.clipAction(gltf.animations[0], squid.object).play();
  }
}

async function LoadCrab() {
  if (levelGame == 1) {
    crabs_nb = 11
  } else {
    crabs_nb = 22
  }
  var loader2 = new GLTFLoader();
  var gltf = await loader2.loadAsync('./src/medias/models/crabAlien/Crab.gltf');
  var modelC1 = gltf.scene;
  for (let i = 0; i < crabs_nb; i++) {
    crab = {
      typeA: "crab",
      xdirection: 1,
      ydirection: 0,
      object: modelC1.clone()
    };
    crab.object.scale.set(5.05, 5.1, 5.2);
    crab.object.position.set(xstartposition, ystartposition, 0);
    gameScene.add(crab.object);
    aliens.push(crab);

    xstartposition++;
    xstartposition = xstartposition + 0.5;

    //Tous les 11 aliens, ont passe à la ligne en dessous
    if ((i + 1) % 11 === 0) {
      ystartposition -= 2;
      xstartposition = -6;
    }
    mixer.clipAction(gltf.animations[0], crab.object).play();
  }
}
ystartposition = ystartposition - 1;

async function LoadOcto() {
  var loader3 = new GLTFLoader();
  var gltf = await loader3.loadAsync('./src/medias/models/octoAlien/octo.gltf');
  var modelO1 = gltf.scene;
  for (let i = 0; i < octopuses_nb; i++) {
    octopus = {
      typeA: "octopus",
      xdirection: 1,
      ydirection: 0,
      object: modelO1.clone()
    };
    octopus.object.scale.set(5.05, 5.1, 5.15);
    octopus.object.position.set(xstartposition, ystartposition, 0);
    gameScene.add(octopus.object);
    aliens.push(octopus);

    xstartposition++;
    xstartposition = xstartposition + 0.5;

    //Tous les 11 aliens, ont passe à la ligne en dessous
    if ((i + 1) % 11 === 0) {
      ystartposition -= 2;
      xstartposition = -6;
    }
    mixer.clipAction(gltf.animations[0], octopus.object).play();
  }
}

var ufo = null;
async function LoadUfo() {
  var loader4 = new GLTFLoader();
  var gltf = await loader4.loadAsync('./src/medias/models/ufoAlien/ufo.gltf');
  var ufoModel = gltf.scene;
  ufo = {
    typeA: "ufo",
    object: ufoModel
  };
  ufo.object.scale.set(5.05, 5.1, 5.2);
}

/*------------------------------------------------------------------------------------------*
 *   Niveau                                                                                 *
 * -----------------------------------------------------------------------------------------*/

async function removeAll() {
  removeAliens();
  removeShelters();
  if (ufo != null) {
    gameScene.remove(ufo.object);
    gameScene.remove(ufo.object.geometry);
    gameScene.remove(ufo.object.material);
    ufoExist = false;
  }
  allRemoved = true;
}

var allRemoved = false;
async function setLevel() {

  if (levelGame == 1) {
    health = 3;
    score = 0;
    await removeAll();
    xstartposition = -6; //Position
    ystartposition = 20;
    if (allRemoved == true) {
      await LoadSquid();
      await LoadCrab();
      await LoadOcto();
      await LoadUfo();
      createShelters();
      allRemoved = false;
    }
  }
  else if (levelGame == 2) {
    health = 3;
    score = 0;
    await removeAll();
    xstartposition = -6; //Position
    ystartposition = 20;
    if (allRemoved == true) {
      await LoadSquid();
      await LoadCrab();
      await LoadOcto();
      await LoadUfo();
      createShelters();
      allRemoved = false;
    }
  }
  else if (levelGame == 3) {
    health = 3;
    score = 0;
    await removeAll();
    xstartposition = -6; //Position
    ystartposition = 20;
    if (allRemoved == true) {
      await LoadSquid();
      await LoadCrab();
      await LoadOcto();
      await LoadUfo();
      createShelters();
      allRemoved = false;
    }
  }
}

/*------------------------------------------------------------------------------------------*
 *   Nettoyage de la scène                                                                  *
 * -----------------------------------------------------------------------------------------*/
function removeAliens() {
  for (let i = 0; i < aliens.length; i++) {
    gameScene.remove(aliens[i].object);
    aliens[i] = null;
  }
  aliens.length = 0;
}

function removeShelters() {
  shelters.forEach(shelter => {
    gameScene.remove(shelter);
  });
  shelters.length = 0;
}



/*------------------------------------------------------------------------------------------*
 *   Balle de tir des aliens                                                                *
 * -----------------------------------------------------------------------------------------*/
function checkAlienBullet() {
  if (alienBullet.parent != gameScene) {
    aliens.forEach(function (alien) {
      if (invincibleMode != true) {
        var randomNum = Math.floor(Math.random() * 100);
        if (randomNum == 1) {
          alienBullet.position.x = alien.object.position.x;
          alienBullet.position.y = alien.object.position.y;
          alienBullet.position.z = alien.object.position.z;
          gameScene.add(alienBullet);
        }
      }
    });

  }
}


/*------------------------------------------------------------------------------------------*
 *   Abris                                                                                  *
 * -----------------------------------------------------------------------------------------*/
function createShelters() {
  const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

  for (let i = 0; i < 4; i++) {
    sheltersGroup = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 3; j++) {
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.x = (i / 2 - 10); // Horizontalement
        cube.position.y = (j / 2 - 6); // Verticalement
        sheltersGroup.add(cube);
      }
    }
    sheltersGroup.position.x = i * 6;
    gameScene.add(sheltersGroup);
    shelters.push(sheltersGroup);
  }
}

/*------------------------------------------------------------------------------------------*
 *   Debris                                                                                 *
 * -----------------------------------------------------------------------------------------*/
function debris(pos, objType) {
  var debris = new THREE.Group();
  var particleGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);

  for (let i = 0; i < 8; i++) {
    if (objType === "crab") {
      var particle = new THREE.Mesh(particleGeometry, new THREE.MeshBasicMaterial({ color: 0xff6600 }));
    } else if (objType === "squid") {
      var particle = new THREE.Mesh(particleGeometry, new THREE.MeshBasicMaterial({ color: 0x33ffad }));
    } else if (objType === "octopus") {
      var particle = new THREE.Mesh(particleGeometry, new THREE.MeshBasicMaterial({ color: 0x3333ff }));
    } else if (objType === "spaceShip") {
      var particle = new THREE.Mesh(particleGeometry, new THREE.MeshBasicMaterial({ color: 0x808080 }));
    } else if (objType === "ufo") {
      var particle = new THREE.Mesh(particleGeometry, new THREE.MeshBasicMaterial({ color: 0xff0069 }));
    }
    particle.position.set(pos.x, pos.y, pos.z);
    debris.add(particle);
  }
  gameScene.add(debris);

  const animateDebris = function () {
    debris.children.forEach((particle) => {
      particle.position.x += (Math.random() - 0.5) * 0.3;
      particle.position.y += (Math.random() - 0.5) * 0.3;
      particle.position.z += (Math.random() - 0.5) * 0.3;
    });

    setTimeout(() => {
      gameScene.remove(debris);
    }, 500);

    if (debris.children.length > 0) {
      requestAnimationFrame(animateDebris);
    }
  };
  animateDebris();
}

/*------------------------------------------------------------------------------------------*
 *   Collision                                                                              *
 * -----------------------------------------------------------------------------------------*/
function checkCollision() {
  var ray = new THREE.Raycaster();
  var bulletDir = new THREE.Vector3(bullet.position.x, bullet.position.y, 0);
  var dir = new THREE.Vector3(0, 1, 1).normalize()

  var rayA = new THREE.Raycaster();
  var bulletDirA = new THREE.Vector3(alienBullet.position.x, alienBullet.position.y, 1);
  var dirA = new THREE.Vector3(0, -1, -1).normalize()

  if (bullet.parent === gameScene) {
    ray.set(bulletDir, dir);
    aliens.forEach(function (alien, index) {
      if (alien.object.parent === gameScene) {
        var alienIntersect = ray.intersectObject(alien.object);
        if (alienIntersect.length > 0) {
          gameScene.remove(alien.object);
          gameScene.remove(bullet);
          soundAlienKilled.play();
          aliens.splice(index, 1);
          debris(alien.object.position, alien.typeA);

          if (alien.typeA === "crab") {
            score = score + 20;
          }
          if (alien.typeA === "squid") {
            score = score + 30;
          }
          if (alien.typeA === "octopus") {
            score = score + 10;
          }
        }
        var alienUfoIntersect = ray.intersectObject(ufo.object);
        if (alienUfoIntersect.length > 0) {
          score = score + ufo.object.score;
          gameScene.remove(ufo.object);
          gameScene.remove(bullet);
          soundB.play();
          debris(ufo.object.position, "ufo");
          ufo.object.geometry.dispose();
          ufo.object.material.dispose();
        }
      }
    });


    shelters.forEach(function (shelter) {
      var intersectCubeP = ray.intersectObjects(shelter.children);
      if (intersectCubeP.length > 0) {
        soundSH.play();
        var cube = intersectCubeP[0].object;
        shelter.remove(cube);
        gameScene.remove(bullet);
      }
    });
  }

  if (alienBullet.parent === gameScene) {
    rayA.set(bulletDirA, dirA);
    var playerIntersect = rayA.intersectObject(playerSpaceship);
    if (playerIntersect.length > 0) {
      gameScene.remove(alienBullet);
      soundHit.play();
      health = health - 1;
      if (health == 1) {
        soundOL.play();
      }
      if (health == 0) {
        gameScene.remove(playerSpaceship);
        debris(playerSpaceship.position, "spaceShip");
      }
    }

    shelters.forEach(function (shelter) {
      var intersectCubeA = rayA.intersectObjects(shelter.children);
      if (intersectCubeA.length > 0) {
        soundSH.play();
        var cube = intersectCubeA[0].object;
        shelter.remove(cube);
        gameScene.remove(alienBullet);
      }
    });
  }
}
var ufoExist = false;
var scoreUFO = [50, 100, 150, 200, 300];
function newUfo() {
  ufo.object.position.set(50, 21.5, 0);
  var randomIndex = Math.floor(Math.random() * 5);
  var setScoreUFO = scoreUFO[randomIndex];
  ufo.object.score = setScoreUFO;
  gameScene.add(ufo.object);
  ufoExist = true;
}

// Déplacement de l'UFO
var ufoSpeed = 0.2;
var ufoDirection = -1;

function moveUfO() {
  var randomNumUfo = Math.floor(Math.random() * 1000);
  if (invincibleMode != true) {
    ufo.object.position.x += ufoSpeed * ufoDirection;
  }

  if (randomNumUfo == 1 && ufoExist == false) {
    newUfo();
  }

  if (ufo.object.position.x < -50 && ufo != null) {
    gameScene.remove(ufo.object);
    ufoExist = false;
  }
}

/*------------------------------------------------------------------------------------------*
 *   Aliens Position                                                                        *
 * -----------------------------------------------------------------------------------------*/
function aliensMove() {
  if (invincibleMode != true) {
    aliens.forEach(function (alien) {
      if (alien.object.position.x >= 10 && general_xdirection == 1) {
        general_xdirection = -1;
        general_ydirection = -1;
      }
      else if (alien.object.position.x <= -10 && general_xdirection == -1) {
        general_xdirection = 1;
        general_ydirection = -1;
      }
    });

    aliens.forEach(function (alien) {
      if (general_xdirection == alien.xdirection) {
        alien.object.position.x += general_xdirection * xstep * alienSpeed;
      }
      alien.object.position.y += general_ydirection * ystep * alienSpeed;
      alien.ydirection = general_ydirection;
      alien.xdirection = general_xdirection;

      if (alien.object.position.y <= playerSpaceship.position.y && !gameOverTriggered) {
        activeScene = gameOverScene;
        gameOverScreen();
        gameScene.remove(ufo.object);
        gameScene.remove(ufo.object.geometry);
        gameScene.remove(ufo.object.material);
        ufoExist = false;
        soundGO.play();
        gameOverTriggered = true;
      }
    });
    general_ydirection = 0;
  }
}

function alienSetSpeed() {
  if (levelGame == 1) {
    if (aliens.length <= 44 && aliens.length > 33) {
      alienSpeed = 1;
    }
    if (aliens.length <= 33 && aliens.length > 11) {
      alienSpeed = 1.5;
    }
    if (aliens.length <= 11) {
      alienSpeed = 2;
    }
  }
  if (levelGame == 2) {
    if (aliens.length <= 55 && aliens.length > 44) {
      alienSpeed = 1;
    }
    if (aliens.length <= 44 && aliens.length > 33) {
      alienSpeed = 1.5;
    }
    if (aliens.length <= 33 && aliens.length > 11) {
      alienSpeed = 2;
    }
    if (aliens.length <= 11) {
      alienSpeed = 2.5;
    }
  }
  if (levelGame == 3) {
    if (aliens.length <= 66 && aliens.length > 44) {
      alienSpeed = 1;
    }
    if (aliens.length <= 44 && aliens.length > 33) {
      alienSpeed = 2;
    }
    if (aliens.length <= 33 && aliens.length > 11) {
      alienSpeed = 2.5;
    }
    if (aliens.length <= 11) {
      alienSpeed = 3;
    }
  }
}

/*------------------------------------------------------------------------------------------*
 *   Bullet position                                                                        *
 * -----------------------------------------------------------------------------------------*/
function bulletMove() {
  if (bullet) {
    bullet.position.y += 0.5;
    if (bullet.position.y == 24) {
      gameScene.remove(bullet);
    }
  }
  if (alienBullet) {
    //Level 1
    if (levelGame == 1) {
      if (aliens.length >= 44) {
        alienBullet.position.y -= 0.5;
      } else if (aliens.length < 44 && aliens.length >= 22) {
        alienBullet.position.y -= 0.52;
      } else if (aliens.length < 22) {
        alienBullet.position.y -= 0.54;
      }
    }
    //level 2
    if (levelGame == 2) {
      if (aliens.length >= 44) {
        alienBullet.position.y -= 0.54;
      } else if (aliens.length < 44 && aliens.length >= 22) {
        alienBullet.position.y -= 0.57;
      } else if (aliens.length < 22) {
        alienBullet.position.y -= 0.6;
      }
    }
    //level 3
    if (levelGame == 3) {
      if (aliens.length >= 44) {
        alienBullet.position.y -= 0.6;
      } else if (aliens.length < 44 && aliens.length >= 22) {
        alienBullet.position.y -= 0.65;
      } else if (aliens.length < 22) {
        alienBullet.position.y -= 0.7;
      }
    }
    if (alienBullet.position.y <= -24) {
      gameScene.remove(alienBullet);
    }
  }
}

/*------------------------------------------------------------------------------------------*
 *   Lancer une partie                                                                      *
 * -----------------------------------------------------------------------------------------*/
function startGame() {
  // Définir la scène active
  activeScene = gameScene;
}
/*------------------------------------------------------------------------------------------*
 *   Render                                                                                 *
 * -----------------------------------------------------------------------------------------*/
async function render() {
  requestAnimationFrame(render);
  mixer.update(0.0005);
  if (activeScene === gameScene) {
    if (levelGame == 2) {
      renderer.setClearColor(0x090512);
    } else if (levelGame == 3) {
      renderer.setClearColor(0x0C0408);
    } else {
      renderer.setClearColor(0x00000F);
    }
  } else {
    renderer.setClearColor(0x00000F);
  }

  if (activeScene === gameScene) {
    renderer.render(activeScene, camera);
  }
  else if (activeScene === menuScene) {
    renderer.render(activeScene, cameraMenu);
  }
  else if (activeScene === nextLevelScene) {
    renderer.render(activeScene, cameraNL);
  }
  else if (activeScene === gameOverScene) {
    renderer.render(activeScene, cameraGO);
  }
  else if (activeScene === winScene) {
    renderer.render(activeScene, cameraW);
  }

  if (frame == 0) {
    //On attend que la police d'écriture soit chargée
    if (arcadeFont != null) {
      if (activeScene === menuScene) {
        menu();
      }
    }
    if (activeScene === gameScene) {
      cheatMode();
      if (health <= 0) {
        activeScene = gameOverScene;
        gameOverScreen();
        soundGO.play();
      }
      if (aliens.length === 0) {
        levelGame = levelGame + 1;
        if (levelGame == 3 || levelGame == 2 || levelGame == 1) {
          await nextLevelScreen();
          activeScene = nextLevelScene;
        } else {
          activeScene = winScene;
          WinScreen();
        }
      }
    }
  }
  else {
    alienSetSpeed();
    if (activeScene === gameScene) {
      cityBackground();
      if (musicPressed) {
        if (levelGame == 1) { music1.play(); }
        if (levelGame == 2) { music2.play(); }
        if (levelGame == 3) { music3.play(); }
      }
      if (processPressed === true) {
        composer.render();
      } else {
        effectSobel.selectedObjects = [];
      }

      bulletMove();
      moveUfO();
      if (cameraMode === "normal") {
        camera.rotation.set(0, 0, 0);
        camera.position.set(0, 0, 30);
      }
      if (cameraMode === "moveable") {
        camera.rotation.set(0.8, 0, 0);
        camera.position.set(camPosX, -10.5, 5);
      }
      if (cameraMode === "laterale") {
        camera.rotation.set(0, 0, Math.PI / 2);
        camera.position.set(0, 10, 30);
      }

      checkAlienBullet();
      checkCollision();
      ScoreUpdate();
      HealthUpdate();
      levelUpdate();

      //help
      if (cameraMode === "normal") {
        helpTextIsCrea = false;
        gameScene.remove(textRecap);
      }
      if (cameraMode === "laterale") {
        helpTextIsCrea = false;
        gameScene.remove(textRecap);
      }
      if (cameraMode === "moveable") {
        helpTextIsCrea = false;
        gameScene.remove(textRecap);
      }
      recap();
      if (alienMoveFrame == Math.floor(30 / speed)) {
        alienMoveFrame = 0;
        aliensMove();
      }
      alienMoveFrame++;
    }
    else {
      music1.pause();
      music2.pause();
      music3.pause();
    }
  }
  frame++;
  if (frame == 60) {
    frame = 0;
  }
}

await setLevel();
render();