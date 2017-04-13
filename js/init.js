function menu() {
    document.getElementById('game').innerHTML = `<div class="loader"></div> `;
    let promise = new Promise((resolve) => {

        loadModelsAndTextures();
        loadSounds();

        setInterval(() => {
            if (soundMenu.isPlaying) resolve();
        }, 1000);

    });
    promise
        .then(
            () => {
                document.getElementById('game').innerHTML = `<button id="startGame">Start</button>`;
                document.getElementById('startGame').addEventListener('click', function() {
                    init();
                    soundMenu.stop();
                }, false);
            });


}

function loadModelsAndTextures() {
    for (let _key in models) {
        (function(key) {
            mtlLoader.load(models[key].mtl, function(materials) {
                materials.preload();
                let objLoader = new THREE.OBJLoader(loadingManager);
                objLoader.setMaterials(materials);
                objLoader.load(models[key].obj, function(mesh) {
                    mesh.traverse(function(node) {
                        if (node instanceof THREE.Mesh) {
                            if ('castShadow' in models[key])
                                node.castShadow = models[key].castShadow;
                            else node.castShadow = true;
                            if ('receiveShadow' in models[key])
                                node.receiveShadow = models[key].receiveShadow;
                        }
                    });
                    models[key].mesh = mesh;
                });
            });

        })(_key);
    }
    for (let key in textures) {
        textures[key].texture = textureLoader.load(textures[key].link);
    }
}

function loadSounds() {
    audioLoader.load('sounds/theme1.mp3', function(buffer) {
        soundGlobal.setBuffer(buffer);
        soundGlobal.setLoop(true);
        soundGlobal.setVolume(0.2);
    });
    audioLoader.load('sounds/menuTheme.mp3', function(buffer) {
        soundMenu.setBuffer(buffer);
        soundMenu.setVolume(0.5);
        soundMenu.play();
    });
    audioLoader.load('sounds/regeneration.mp3', function(buffer) {
        soundHeal.setBuffer(buffer);
        soundHeal.setVolume(1);
    });
    audioLoader.load('sounds/misFire.mp3', function(buffer) {
        soundMisFire.setBuffer(buffer);
        soundMisFire.setVolume(1);
    });
    audioLoader.load('sounds/gunPickUp.mp3', function(buffer) {
        soundPickGun.setBuffer(buffer);
        soundPickGun.setVolume(1);
    });
    audioLoader.load('sounds/ammoPickUp.mp3', function(buffer) {
        soundPickStuff.setBuffer(buffer);
        soundPickStuff.setVolume(1);
    });
    audioLoader.load('sounds/armorPickUp.mp3', function(buffer) {
        soundPickArmor.setBuffer(buffer);
        soundPickArmor.setVolume(1);
    });
    audioLoader.load('sounds/footstep.mp3', function(buffer) {
        soundFootStep.setBuffer(buffer);
        soundFootStep.setLoop(true);
        soundFootStep.setVolume(1);
    });
}

function init() {
    createScene();
    createCamera();

    createControls();
    createUI();
    gameMenu();

    createRenderer();

    createAmbientLight();
    createLight();

    createBullet();
    createEnemy();
    createEnemyBullet();

    createWalls();
    createFloor();
    createModels();
    clock.start();
    loop();
}

function createUI() {
    document.getElementById('game').innerHTML = `
	    <div id="menu" class="menu invisible" >
            <h2 id="menuContinue">CONTINUE</h2>
            <p id="menuMusic">Music Off</p>
        </div>
        <progress id="health" max="100"></progress>
        <img src="img/health.png" class="healthImg" width="30px" height="30px">
        <p id="score"></p>
        <p id="ammo"></p>
        <img src="img/bullet.png" class="bulletImg" width="30px" height="30px">
        <progress id="armor" max="100"></progress>
        <img src="img/armor.png" class="armorImg" width="30px" height="30px">
        <img id="aim" src="img/aim.png" class="invisible">
        <div id="infobox-intro" class="infobox invisible">
            <div id="progress">
                <div id="progressBar"></div>
            </div>
            <h2>3D SHOOTER</h2>
            <p>You can control the player by using the follow keys:</p>
            <p>W - Forward<br /
            >S - Backward<br />
                A - Left<br />
                D - Right<br />
                &larr; - Camera rotate left<br />
                &rarr; - Camera rotate right</p>
            <p>Just try and walk around.</p>
        </div>`;

}

function gameMenu() {
    document.getElementById('menuContinue').addEventListener('click', function() {
        document.getElementById("menu").classList.add("invisible");
        element.requestPointerLock();
        document.pointerLockElement = element;
    }, false);
    document.getElementById("menuMusic").addEventListener("click", function() {
        if (triggerMenuMusic == 1) {
            document.getElementById("menuMusic").innerHTML = "Music On";
            soundGlobal.setVolume(0.0);
            triggerMenuMusic = 0;
        } else {
            document.getElementById("menuMusic").innerHTML = "Music Off";
            soundGlobal.setVolume(0.2);
            triggerMenuMusic = 1;
        }
    });
}

function createScene() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    scene = new THREE.Scene;
    scene.fog = new THREE.Fog(0xffffff, 0, 750);
    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 80;
    nearPlane = 0.1;
    farPlane = 1000;
}

function createCamera() {
    camera = new THREE.PerspectiveCamera(
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane
    );
    camera.position.set(0, player.height, 0);
}

function createRenderer() {

    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
    document.getElementById('game').appendChild(renderer.domElement);

    function handleWindowResize() {
        HEIGHT = window.innerHeight;
        WIDTH = window.innerWidth;
        renderer.setSize(WIDTH, HEIGHT);
        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', handleWindowResize, false);
}

function createAmbientLight() {
    ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
}

function createLight() {
    light = new THREE.PointLight(0xffffff, 0.5, 18);
    light.position.set(-3, 6, -3);
    light.castShadow = true;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 25;
    scene.add(light);
}

function createControls() {
    controls = new THREE.PointerLockControls(camera);
    scene.add(controls.getObject());
    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, player.height);
    document.getElementById("game").addEventListener('click', function() {
        fire();
    });

    window.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('keyup', onKeyUp, false);

    function onKeyDown(event) {
        switch (event.keyCode) {
            case 70:
                document.getElementById("infobox-intro").classList.remove("invisible");
                break;
            case 38: // up
            case 87: // w
                if (!soundFootStepForward) {
                    soundFootStep.play();
                    soundFootStepForward = true;
                }
                player.moveForward = true;
                break;
            case 37: // left
            case 65: // a

                if (!soundFootStepLeft) {
                    soundFootStep.play();
                    soundFootStepLeft = true;
                }
                player.moveLeft = true;
                break;
            case 40: // down
            case 83: // s
                if (!soundFootStepBack) {
                    soundFootStep.play();
                    soundFootStepBack = true;
                }
                player.moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                if (!soundFootStepRight) {
                    soundFootStep.play();
                    soundFootStepRight = true;
                }
                player.moveRight = true;
                break;
            case 32: // space
                if (player.canJump === true) velocity.y += 200;
                player.canJump = false;
                break;
        }
    }

    function onKeyUp(event) {
        switch (event.keyCode) {
            case 70:
                document.getElementById("infobox-intro").classList.add("invisible");
                break;
            case 38: // up
            case 87: // w
                soundFootStepForward = false;
                if (!soundFootStepBack && !soundFootStepLeft && !soundFootStepRight) soundFootStep.stop();
                player.moveForward = false;
                break;
            case 37: // left
            case 65: // a
                soundFootStepLeft = false;
                if (!soundFootStepBack && !soundFootStepForward && !soundFootStepRight) soundFootStep.stop();
                player.moveLeft = false;
                break;
            case 40: // down
            case 83: // s
                soundFootStepBack = false;
                if (!soundFootStepForward && !soundFootStepLeft && !soundFootStepRight) soundFootStep.stop();
                player.moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                soundFootStepRight = false;
                if (!soundFootStepBack && !soundFootStepLeft && !soundFootStepForward) soundFootStep.stop();
                player.moveRight = false;
                break;
        }
    }

    element.requestPointerLock();
    document.pointerLockElement = element;
    controlsEnabled = true;
    controls.enabled = true;

    function pointerlockchange(event) {
        if (document.pointerLockElement === element ||
            document.mozPointerLockElement === element ||
            document.webkitPointerLockElement === element) {
            controlsEnabled = true;
            controls.enabled = true;
        } else {
            controlsEnabled = false;
            controls.enabled = false;
        }
    };
    document.addEventListener('pointerlockchange', pointerlockchange, false);
    document.addEventListener('mozpointerlockchange', pointerlockchange, false);
    document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
}

function createWalls() {
    let cube = new THREE.BoxGeometry(UNITSIZE, UNITSIZE * 2, UNITSIZE);
    for (let i = 0; i < mapH; i++) {
        for (let j = 0; j < mapW; j++) {
            if (map[i][j]) {
                let wall = new THREE.Mesh(cube,
                    new THREE.MeshPhongMaterial({
                        side: THREE.DoubleSide,
                        map: textures.wall.texture
                    })
                );
                wall.position.y = UNITSIZE;
                wall.position.x = (i - mapH / 2) * UNITSIZE;
                wall.position.z = (j - mapW / 2) * UNITSIZE;
                scene.add(wall);
            }
        }
    }
}

function createFloor() {
    let texture = textures.floor.texture;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(15, 15);
    let meshFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(UNITSIZE * mapH, UNITSIZE * mapW, 10, 10),
        new THREE.MeshPhongMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            map: texture
        })
    );
    meshFloor.position.set(0, 0, 0);
    meshFloor.rotation.x += Math.PI / 2;
    meshFloor.receiveShadow = true;
    scene.add(meshFloor);
}

function createModels() {
    weapon = models.rocketlauncher.mesh;
    weapon.position.set(5, player.height + 1, 0);
    weapon.scale.set(0.03, 0.03, 0.03);
    scene.add(weapon);

    moon = models.moon.mesh.clone();
    moon.position.set(250, 60, 250);
    moon.scale.set(3, 3, 3);
    scene.add(moon);

    ship = models.ship.mesh.clone();
    ship.position.set(-150, 100, -150);
    ship.rotation.y += Math.PI / 9;
    ship.scale.set(0.5, 0.5, 0.5);
    scene.add(ship);

    healthBox = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshPhongMaterial({
            map: textures.health.texture
        })
    );
    healthBox.position.set(5, player.height + 1, 5);
    scene.add(healthBox);
    healthBox.receiveShadow = true;
    healthBox.castShadow = true;

    ammoBox = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshPhongMaterial({
            map: textures.ammo.texture
        })
    );
    ammoBox.position.set(5, player.height + 1, 7);
    scene.add(ammoBox);
    ammoBox.receiveShadow = true;
    ammoBox.castShadow = true;

    armorBox = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshPhongMaterial({
            map: textures.armor.texture
        })
    );
    armorBox.position.set(5, player.height + 1, 10);
    scene.add(armorBox);
    armorBox.receiveShadow = true;
    armorBox.castShadow = true;

    platform = new THREE.Mesh(
        new THREE.BoxGeometry(10, 5, 10),
        new THREE.MeshPhongMaterial({
            map: textures.lava.texture
        })
    );
    platform.position.set(20, 10, 0);
    scene.add(platform);
    platform.height = new THREE.Box3().setFromObject(platform).max.y;

    door1 = new THREE.Mesh(
        new THREE.BoxGeometry(1, 20, 5),
        new THREE.MeshPhongMaterial({
            map: textures.lava.texture
        })
    );
    door1.position.set(-20, 10, 0);
    scene.add(door1);

    door2 = new THREE.Mesh(
        new THREE.BoxGeometry(1, 20, 5),
        new THREE.MeshPhongMaterial({
            map: textures.lava.texture
        })
    );
    door2.position.set(-20, 10, 5);
    scene.add(door2);


    door1.closed = {
        x: door1.position.x,
        z: door1.position.z
    }
    door2.closed = {
        x: door2.position.x,
        z: door2.position.z
    }
    door1.opened = {
        z: door1.closed.z - 2.5,
        x: door1.closed.x
    }
    door2.opened = {
        z: door2.closed.z + 2.5,
        x: door2.closed.x
    }
}

function createBullet() {
    return new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 8),
        new THREE.MeshBasicMaterial({
            map: textures.lava.texture
        })
    );
}

function createEnemy() {
    let md2Enemy = new THREE.MD2Character();
    md2Enemy.scale = 0.1;
    md2Enemy.loadParts(configEnemy);
    md2Enemy.onLoadComplete = function() {
        md2Enemy.setSkin(1);
        md2Enemy.setAnimation(md2Enemy.meshBody.geometry.animations[1].name);
        md2Enemy.setWeapon(0);

    };
    md2Enemies.push(md2Enemy);
    return md2Enemy.root;

}

function createEnemyBullet() {
    return new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 8),
        new THREE.MeshBasicMaterial({
            color: 0x0000aa
        })
    );
}
