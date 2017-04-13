//main variables
let scene,
    camera,
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane,
    HEIGHT,
    WIDTH,
    renderer;

let controls,
    controlsEnabled,
    raycaster,
    element = document.getElementById("game"),
    velocity = new THREE.Vector3(),
    clock = new THREE.Clock(false),
    triggerMenuMusic = 1;

//loaders
let loadingManager = new THREE.LoadingManager(),
    textureLoader = new THREE.TextureLoader(loadingManager),
    mtlLoader = new THREE.MTLLoader(loadingManager),
    audioLoader = new THREE.AudioLoader(loadingManager);
//sounds
let listener = new THREE.AudioListener();
let countS = 0;
let sounds = ['sounds/humiliation.mp3',
    'sounds/excellent.mp3',
    'sounds/holyshit.mp3',
    'sounds/perfect.mp3'
];
let soundMenu = new THREE.Audio(listener);
let soundMisFire = new THREE.Audio(listener);
let soundPickGun = new THREE.Audio(listener);
let soundGlobal = new THREE.Audio(listener);
let soundHeal = new THREE.Audio(listener);
let soundPickStuff = new THREE.Audio(listener);
let soundPickArmor = new THREE.Audio(listener);
let soundFootStep = new THREE.Audio(listener);
let soundFootStepForward = false;
let soundFootStepBack = false;
let soundFootStepLeft = false;
let soundFootStepRight = false;
let audioGlobal = true;
let gunPickedSound = true;
let objects = [];
let healthBox, ammoBox, armorBox, weapon, moon, ship, platform;
let ambientLight, light;
let models = {
        moon: {
            obj: "models/moon.obj",
            mtl: "models/moon.mtl",
            mesh: null,
            castShadow: false
        },
        ship: {
            obj: "models/Starcruiser_military.obj",
            mtl: "models/Starcruiser_military.mtl",
            mesh: null,
            castShadow: false
        },
        rocketlauncher: {
            obj: "models/gun.obj",
            mtl: "models/gun.mtl",
            mesh: null,
            castShadow: false
        }
    },
    textures = {
        wall: {
            link: 'textures/wall.jpg'
        },
        ceiling: {
            link: 'textures/ceiling.jpg'
        },
        floor: {
            link: 'textures/floor.jpg'
        },
        health: {
            link: 'textures/health.jpg'
        },
        ammo: {
            link: 'textures/ammo.png'
        },
        armor: {
            link: 'textures/armor.png'
        },
        lava: {
            link: 'textures/lava.jpg'
        }
    };
    let md2Enemies = [];
let configEnemy = {
	baseUrl: "models/md2/ratamahatta/",
	body: "ratamahatta.md2",
	skins: [ "ratamahatta.png", "ctf_b.png", "ctf_r.png", "dead.png", "gearwhore.png" ],
	weapons:  [ [ "weapon.md2", "weapon.png" ],
	        	[ "w_bfg.md2", "w_bfg.png" ],
				[ "w_blaster.md2", "w_blaster.png" ],
				[ "w_chaingun.md2", "w_chaingun.png" ],
				[ "w_glauncher.md2", "w_glauncher.png" ],
				[ "w_hyperblaster.md2", "w_hyperblaster.png" ],
				[ "w_machinegun.md2", "w_machinegun.png" ],
				[ "w_railgun.md2", "w_railgun.png" ],
				[ "w_rlauncher.md2", "w_rlauncher.png" ],
				[ "w_shotgun.md2", "w_shotgun.png" ],
				[ "w_sshotgun.md2", "w_sshotgun.png" ]
				]
};
let playerBullets = [],
    waitingPlayerBullets = [],
    enemyBullets = [],
    aliveEnemies = [],
    deadEnemies = [];
let lastSpawn = -10,
    lastHealthBoxPickup = -20,
    lastAmmoPickup = -20,
    lastArmorPickup = -20;

let player = {
    height: 1.5,
    ammo: 0,
    armor: 0,
    health: 50,
    points: 0,
    mass: 40,
    bulletTimeout: 0.2,
    enemyBulletTimeout: 1,
    gunPicked: false,
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    canJump: false,
    feet: 0,
    lastFire: -0.2
};
const UNITSIZE = 20;
const map = [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1]
];


let mapH = map.length,
    mapW = map[0].length;

window.addEventListener('load', menu);
