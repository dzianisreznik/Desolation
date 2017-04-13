'use strict'

function loop() {
    renderer.render(scene, camera);
    let delta = clock.getDelta();
    if (controlsEnabled) {
        clock.running = true;
        updatePlayer(delta);
        updateModels(delta);
        updateBullets(delta);
        updateEnemies(delta);
        updateEnemyBullets(delta);
        updateSounds();
    } else {
        clock.running = false;
        document.getElementById("menu").classList.remove("invisible");
    }
    requestAnimationFrame(loop);
}

function updatePlayer(delta) {
    let prev_pos_x = controls.getObject().position.x;
    let prev_pos_z = controls.getObject().position.z;
    let prev_pos_y = controls.getObject().position.y;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.y -= 10 * player.mass * delta;
    velocity.z -= velocity.z * 10.0 * delta;


    if (player.moveForward) velocity.z -= 200.0 * delta;
    if (player.moveBackward) velocity.z += 200.0 * delta;
    if (player.moveLeft) velocity.x -= 200.0 * delta;
    if (player.moveRight) velocity.x += 200.0 * delta;

    controls.getObject().translateX(velocity.x * delta);
    controls.getObject().translateY(velocity.y * delta);
    controls.getObject().translateZ(velocity.z * delta);
    if (checkPlatformCollision(platform.position, 5, 5)) {
        if (platform.height < controls.getObject().position.y - player.height) {
            player.feet = platform.height;
        } else if (platform.position.y - 2.5 <= controls.getObject().position.y && player.feet !== platform.height) {
            controls.getObject().position.x = prev_pos_x;
            controls.getObject().position.z = prev_pos_z;
            controls.getObject().position.y = prev_pos_y;
        }
    } else player.feet = 0;
    if (controls.getObject().position.y < player.feet + player.height) {
        velocity.y = 0;
        controls.getObject().position.y = player.feet + player.height;
        player.canJump = true;
    }

    if (checkWallCollision(controls.getObject().position)) {
        controls.getObject().position.x = prev_pos_x;
        controls.getObject().position.z = prev_pos_z;
        controls.getObject().position.y = prev_pos_y;
    }
    //     if (player.health <= 0) function die() {
    //
    //     }
}

function updateModels(delta) {
    if (player.gunPicked) {
        if (gunPickedSound == true) {
            soundPickGun.play();
            gunPickedSound = false;
        }

        weapon.position.set(
            controls.getObject().position.x - Math.sin(controls.getObject().rotation.y - Math.PI / 4) * 0.75,
            controls.getObject().position.y + 1,
            controls.getObject().position.z - Math.cos(controls.getObject().rotation.y - Math.PI / 4) * 0.75
        );

        weapon.rotation.set(
            controls.getObject().rotation.x,
            controls.getObject().rotation.y - Math.PI,
            controls.getObject().rotation.z
        );
    } else {
        weapon.rotation.y += 5 * delta;
        if (distance(weapon.position, controls.getObject().position) < 1.75) {
            player.gunPicked = true;
            document.getElementById("aim").classList.remove("invisible");
            player.ammo += 30;
        }
    }

    ammoBox.rotation.y += Math.PI * delta;
    ammoBox.position.y = Math.sin(clock.getElapsedTime() * Math.PI) * 0.3 + 2.5;
    if (clock.getElapsedTime() > lastAmmoPickup + 20) {
        if (distance(ammoBox.position, controls.getObject().position) < 1.5) {
            lastAmmoPickup = clock.getElapsedTime();
            soundPickStuff.play();
            player.ammo += 20;
        }
        ammoBox.material.wireframe = false;
    } else {
        ammoBox.material.wireframe = true;
    }
    document.getElementById("ammo").innerHTML = `${player.ammo}`;

    armorBox.rotation.y += Math.PI * delta;
    armorBox.position.y = Math.sin(clock.getElapsedTime() * Math.PI) * 0.3 + 2.5;
    if (clock.getElapsedTime() > lastArmorPickup + 20) {
        if (distance(armorBox.position, controls.getObject().position) < 1.5 && player.armor != 100) {
            lastArmorPickup = clock.getElapsedTime();
            soundPickArmor.play();
            player.armor = 100;
        }
        armorBox.material.wireframe = false;
    } else {
        armorBox.material.wireframe = true;
    }
    document.getElementById("armor").value = player.armor;

    healthBox.rotation.y += Math.PI * delta;
    healthBox.position.y = Math.sin(clock.getElapsedTime() * Math.PI) * 0.3 + 2.5;
    if (clock.getElapsedTime() > lastHealthBoxPickup + 20) {
        if (distance(healthBox.position, controls.getObject().position) < 1.5 && player.health != 100) {
            player.health = Math.min(player.health + 20, 100);
            lastHealthBoxPickup = clock.getElapsedTime();
            soundHeal.play();
        }
        healthBox.material.wireframe = false;
    } else {
        healthBox.material.wireframe = true;
    }
    document.getElementById("health").value = player.health;

    moon.rotation.z += 0.02 * delta;

    ship.position.x += 0.4 * delta;
    ship.position.z += 0.8 * delta;

    if (distance2d(controls.getObject().position, door1.closed) <= 5 && distance2d(controls.getObject().position, door2.closed) <= 5) {
        openDoors(delta);
    } else {
        closeDoors(delta);
    }
}

function updateBullets(delta) {
    for (let i = 0; i < playerBullets.length; i++) {
        let hit = false;
        let bullet = playerBullets[i];
        for (let j = 0; j < aliveEnemies.length; j++) {
            let enemy = aliveEnemies[j];
            let x = 2.05,
                z = 2.05,
                y = 2.05;
            if (bullet.position.x < enemy.position.x + x &&
                bullet.position.x > enemy.position.x - x &&
                bullet.position.y < enemy.position.y + y &&
                bullet.position.y > enemy.position.y - y &&
                bullet.position.z < enemy.position.z + z &&
                bullet.position.z > enemy.position.z - z) {
                let soundBulletExplosion = new THREE.Audio(listener);
                audioLoader.load('sounds/explosion.wav', function(buffer) {
                    soundBulletExplosion.setBuffer(buffer);
                    soundBulletExplosion.setVolume(0.5);
                    soundBulletExplosion.play();
                });
                hit = true;
                scene.remove(bullet);
                waitingPlayerBullets.push(playerBullets.splice(i, 1)[0]);
                enemy.health -= 25;
                break;
            }
        }
        if (!hit) {
            bullet.translateX(delta * 50 * bullet.ray.direction.x);
            bullet.translateZ(delta * 50 * bullet.ray.direction.z);
            bullet.translateY(delta * 50 * bullet.ray.direction.y);
            if (checkWallCollision(bullet.position)) {
                let soundBulletExplosion = new THREE.Audio(listener);
                audioLoader.load('sounds/explosion.wav', function(buffer) {
                    soundBulletExplosion.setBuffer(buffer);
                    soundBulletExplosion.setVolume(0.5);
                    soundBulletExplosion.play();
                });
                scene.remove(bullet);
                waitingPlayerBullets.push(playerBullets.splice(i, 1)[0]);
            }
        }
    }
}

function updateEnemies(delta) {
    for(let i=0;i<md2Enemies.length;i++){
            md2Enemies[i].update(delta *0.5);
        }
    for (let i = 0; i < aliveEnemies.length; i++) {
        let enemy = aliveEnemies[i];

        enemyFire(enemy);

        if (Math.random() > 0.995) {
            enemy.lastRandomX = Math.random() * 2 - 1;
            enemy.lastRandomZ = Math.random() * 2 - 1;
        }
        enemy.translateX(0.1 * delta * 50 * enemy.lastRandomX);
        enemy.translateZ(0.1 * delta * 50 * enemy.lastRandomZ);
        if (checkWallCollision(enemy.position)) {
            enemy.translateX(-0.2 * delta * 50 * enemy.lastRandomX);
            enemy.translateZ(-0.2 * delta * 50 * enemy.lastRandomZ);
            enemy.lastRandomX = Math.random() * 2 - 1;
            enemy.lastRandomZ = Math.random() * 2 - 1;
        }
        if (enemy.health <= 0) {
            scene.remove(enemy);
            deadEnemies.push(aliveEnemies.splice(i, 1)[0]);
            let sound3 = new THREE.Audio(listener);
            player.points++;
            audioLoader.load(sounds[countS], function(buffer) {
                countS++;
                if (countS == 4) countS = 0;
                sound3.setBuffer(buffer);
                sound3.setVolume(0.5);
                sound3.play();
            });
        }
        document.getElementById('score').innerHTML = `KILLS: ${player.points}`;

    }
    spawnEnemy();
}

function updateEnemyBullets(delta) {
    for (let i = 0; i < enemyBullets.length; i++) {
        let hit = false;
        let bullet = enemyBullets[i];
        let x = 1.25,
            z = 1.25,
            y = player.height;
        if (bullet.position.x < controls.getObject().position.x + x &&
            bullet.position.x > controls.getObject().position.x - x &&
            bullet.position.z < controls.getObject().position.z + z &&
            bullet.position.z > controls.getObject().position.z - z &&
            bullet.position.y < controls.getObject().position.y + y &&
            bullet.position.y > controls.getObject().position.y - y) {
            scene.remove(bullet);
            enemyBullets.splice(i, 1)[0];
            if (player.armor > 0) player.armor -= 10;
            else if (player.armor === 0) player.health -= 10;
            else {
                player.health -= 10 + Math.abs(player.armor);
                player.armor = 0;
            }
            hit = true;
        }
        if (!hit) {
            bullet.translateX(delta * 50 * bullet.ray.direction.x);
            bullet.translateZ(delta * 50 * bullet.ray.direction.z);
            bullet.translateY(delta * 50 * bullet.ray.direction.y);
            if (checkWallCollision(bullet.position)) {
                scene.remove(bullet);
                enemyBullets.splice(i, 1)[0];
            }
        }
    }
}

function updateSounds() {
    if (audioGlobal == true) {
        soundGlobal.play();
        audioGlobal = false;
    }
}
//--------------------------------------------
function fire() {
    if (player.gunPicked && controlsEnabled && (clock.getElapsedTime() > player.lastFire + player.bulletTimeout)) {
        if (player.ammo === 0) {
            soundMisFire.play();
            return;
        }
        player.lastFire = clock.getElapsedTime();
        player.ammo--;
        let bullet = (function() {
            if (waitingPlayerBullets.length) {
                return waitingPlayerBullets.pop();
            } else {
                return createBullet();
            }
        })()
        bullet.position.set(
            weapon.position.x,
            weapon.position.y + 0.15,
            weapon.position.z
        );
        bullet.ray = new THREE.Ray(
            bullet.position,
            controls.getDirection(new THREE.Vector3(0, 0, 0)).clone().multiplyScalar(2)
        );
        playerBullets.push(bullet);
        scene.add(bullet);
        let soundBullet = new THREE.Audio(listener);
        audioLoader.load('sounds/rocketShot.mp3', function(buffer) {
            soundBullet.setBuffer(buffer);
            soundBullet.setVolume(0.5);
            soundBullet.play();
        });
    }
}

function enemyFire(enemy) {
    if ((clock.getElapsedTime() > enemy.lastFire + player.enemyBulletTimeout) &&
        distance(enemy.position, controls.getObject().position) < 40) {
        enemy.lastFire = clock.getElapsedTime();
        let bullet = createEnemyBullet();
        bullet.position.set(
            enemy.position.x,
            enemy.position.y,
            enemy.position.z
        );
        bullet.ray = new THREE.Ray(
            bullet.position,
            controls.getObject().position.clone().sub(bullet.position).normalize()
        );
        enemyBullets.push(bullet);
        scene.add(bullet);
    }
}

function spawnEnemy() {
    if (clock.getElapsedTime() - lastSpawn > 10 && aliveEnemies.length <3) {
        lastSpawn = clock.getElapsedTime();
        let enemy = (function() {
            if (deadEnemies.length) {
                return deadEnemies.pop();
            } else {
                return createEnemy();
            }
        })();
        enemy.position.x = 0;
        enemy.position.y = player.height + 1;
        enemy.position.z = 0;
        enemy.health = 100;
        enemy.lastFire = -3;
        enemy.lastRandomX = Math.random();
        enemy.lastRandomZ = Math.random();
        aliveEnemies.push(enemy);
        scene.add(enemy);
    }
}

function openDoors(delta) {
    if (door1.position.z > door1.opened.z) door1.position.z -= delta * 10;
    if (door2.position.z < door2.opened.z) door2.position.z += delta * 10;
}
function closeDoors(delta) {
    if (door1.position.z < door1.closed.z) door1.position.z += delta * 10;
    if (door2.position.z > door2.closed.z) door2.position.z -= delta * 10;
}
