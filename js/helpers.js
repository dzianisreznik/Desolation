function distance(pos1, pos2) {
    return Math.sqrt((pos2.x - pos1.x) * (pos2.x - pos1.x) + (pos2.y - pos1.y) * (pos2.y - pos1.y) + (pos2.z - pos1.z) * (pos2.z - pos1.z));
}

function distance2d(pos1, pos2) {
    return Math.sqrt((pos2.x - pos1.x) * (pos2.x - pos1.x) + (pos2.z - pos1.z) * (pos2.z - pos1.z));
}

function getMapSector(v) {
    let x, z;
    if (v.x > 0) x = Math.floor((v.x + UNITSIZE / 2 + 1.6) / UNITSIZE + mapH / 2);
    else x = Math.floor((v.x + UNITSIZE / 2 - 1.6) / UNITSIZE + mapH / 2);
    if (v.z > 0) z = Math.floor((v.z + UNITSIZE / 2 + 1.6) / UNITSIZE + mapW / 2);
    else z = Math.floor((v.z + UNITSIZE / 2 - 1.6) / UNITSIZE + mapW / 2);
    return {
        x: x,
        z: z
    };
}

function checkWallCollision(v) {
    let c = getMapSector(v);
    return map[c.x][c.z] > 0;
}

function checkPlatformCollision(pos, deltaX, deltaZ) {
    return (
        pos.x + deltaX > controls.getObject().position.x &&
        pos.x - deltaX < controls.getObject().position.x &&
        pos.z + deltaZ > controls.getObject().position.z &&
        pos.z - deltaZ < controls.getObject().position.z)
}

function pickHex(color1, color2, weight) {
    let w = weight * 2 - 1;
    let w1 = (w + 1) / 2;
    let w2 = 1 - w1;
    let rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)
    ];
    return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

function componentToHex(c) {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return parseInt('0x' + componentToHex(r) + componentToHex(g) + componentToHex(b));
}
