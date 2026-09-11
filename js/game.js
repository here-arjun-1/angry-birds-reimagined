const canvas = document.querySelector("canvas");

const nextBtn = document.getElementById("nextBtn");
const homeBtn = document.getElementById("menu");
const refreshBtn = document.getElementById("refreshBtn");
const musicBtn = document.getElementById("musicBtn");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

const skyImage = new Image();
skyImage.src = "assets/images/sky1.webp";
const groundImage = new Image();
groundImage.src = "assets/images/ground1.png";
const pigSpriteSheet = new Image();
pigSpriteSheet.src = "assets/images/pigSpritesheet.png";
const redBird = new Image();
redBird.src = "assets/images/redBirdSpritesheet.png";
const groundHeight = 180;

const levelCompleteSound = new Audio();
levelCompleteSound.src = "assets/sounds/levelComplete.mp3";
const levelFailedSound = new Audio();
levelFailedSound.src = "assets/sounds/levelFailed.mp3";
const birdShoot = new Audio();
birdShoot.src = "assets/sounds/birdShoot.mp3";
birdShoot.preload = "auto";
birdShoot.volume = 0.5;
const ambienceSound = new Audio();
ambienceSound.src = "assets/sounds/ambienceSound.mp3";
ambienceSound.loop = true;

let musicOn = true;

const gravity = 0.4;
const maxPull = 130;
const launchPower = 0.3;
let score = 0;
let levelWon = false;
let levelFailed = false;
let birdsLeft = 3;
let imagesLoaded = 0;

const point = {
  x: 150,
  y: canvas.height - groundHeight - 100,
};

const bird = {
  x: point.x,
  y: point.y,
  width: 80,
  height: 80,
  radius: 40,
  vx: 0,
  vy: 0,
  frame: 0,
  frameTimer: 0,
  launch: false,
  active: true,
};
const birdQueue = [
  redBird,
  redBird
];

function drawBird() {
  if (!bird.active) {
    return;
  }
  if (!redBird.complete) {
    return;
  }
  const frameWidth = redBird.width / 4;
  const frameHeight = redBird.height;
  ctx.drawImage(
    redBird,
    bird.frame * frameWidth,
    0,
    frameWidth,
    frameHeight,
    bird.x - bird.width / 2,
    bird.y - bird.height / 2,
    bird.width,
    bird.height,
  );
}
function drawBirdQueue(){
  const startX = 50;
  const startY = canvas.height - groundHeight + 45;
  const spacing = 65;
  for(let i = 0; i < birdQueue.length; i++){
    const queueBird = birdQueue[i];
    if(!queueBird.complete){
      continue;
    }
    const frameWidth = queueBird.width / 4;
    const frameHeight = queueBird.height;
    ctx.drawImage(
      queueBird,
      0,
      0,
      frameWidth,
      frameHeight,
      startX + i * spacing - 25,
      startY - 25,
      50,
      50
    );
  }
}

function drawTrajectory() {
  if (!bird.active) {
    return;
  }
  let disX = bird.x - point.x;
  let disY = bird.y - point.y;
  let distance = Math.sqrt(disX * disX + disY * disY);
  if (distance > maxPull) {
    disX = (disX / distance) * maxPull;
    disY = (disY / distance) * maxPull;
  }
  let startX = point.x;
  let startY = point.y;
  let vx = -disX * launchPower;
  let vy = -disY * launchPower;

  for (let i = 1; i <= 10; i++) {
    let t = i * 3;
    let x = startX + vx * t;
    let y = startY + vy * t + 0.5 * gravity * t * t;
    if (drag) {
      ctx.save();
      ctx.beginPath();
      ctx.shadowColor = "black";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.restore();
    }
  }
}

function updateBird() {
  bird.frameTimer++;
  if (bird.frameTimer >= 10) {
    bird.frameTimer = 0;
    bird.frame++;
    if (bird.frame >= 4) {
      bird.frame = 0;
    }
  }
}

const pig = {
  x: canvas.width - 250,
  y: canvas.height - groundHeight - 30,
  width: 100,
  height: 80,
  radius: 40,
  alive: true,
  frame: 0,
  frameTimer: 0,
};
function drawPig() {
  if (!pig.alive) {
    return;
  }
  if (!pigSpriteSheet.complete) {
    return;
  }
  const frameWidth = pigSpriteSheet.width / 6;
  const frameHeight = pigSpriteSheet.height;
  ctx.drawImage(
    pigSpriteSheet,
    pig.frame * frameWidth,
    0,
    frameWidth,
    frameHeight,
    pig.x - pig.width / 2,
    pig.y - pig.height / 2,
    pig.width,
    pig.height,
  );
}

function updatePig() {
  if (!pig.alive) {
    return;
  }
  pig.frameTimer++;
  if (pig.frameTimer >= 150) {
    pig.frameTimer = 0;
    pig.frame++;
    if (pig.frame >= 6) {
      pig.frame = 0;
    }
  }
}

function drawWood(x, y, width, height) {
  ctx.fillStyle = "#9D6C3C";
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
}

function drawGlass(x, y, width, height) {
  ctx.fillStyle = "#A7C7CB";
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
}

const woods = [
  {
    x: canvas.width - 350,
    y: canvas.height - groundHeight - 170,
    width: 40,
    height: 170,
    mass: 10,
    health: 100,
    maxHealth: 100,
    points: 100,
    destroyed: false,
    falling: false,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVelocity: 0,
    angularAcceleration: 0,
    exploding: false,
    explosionTimer: 0,
    hitCooldown: 0,
  },

  {
    x: canvas.width - 190,
    y: canvas.height - groundHeight - 170,
    width: 40,
    height: 170,
    mass: 10,
    health: 100,
    maxHealth: 100,
    points: 100,
    destroyed: false,
    falling: false,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVelocity: 0,
    angularAcceleration: 0,
    exploding: false,
    explosionTimer: 0,
    hitCooldown: 0,
  },
];

const glasses = [
  {
    x: canvas.width - 350,
    y: canvas.height - groundHeight - 210,
    width: 200,
    height: 40,
    mass: 5,
    health: 100,
    maxHealth: 100,
    points: 200,
    destroyed: false,
    falling: false,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVelocity: 0,
    angularAcceleration: 0,
    exploding: false,
    explosionTimer: 0,
    hitCooldown: 0,
  },
];

function drawExplosion(x, y, timer) {
  const radius = 10 + timer * 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "brown";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = "orange";
  ctx.fill();
}

function updateExplosions() {
  for (let i = 0; i < woods.length; i++) {
    const wood = woods[i];
    if (wood.exploding) {
      wood.explosionTimer++;
      if (wood.explosionTimer > 15) {
        wood.exploding = false;
        wood.destroyed = true;
      }
    }
  }
  for (let i = 0; i < glasses.length; i++) {
    const glass = glasses[i];
    if (glass.exploding) {
      glass.explosionTimer++;
      if (glass.explosionTimer > 15) {
        glass.exploding = false;
        glass.destroyed = true;
      }
    }
  }
}

function drawObjects() {
  for (let i = 0; i < woods.length; i++) {
    const wood = woods[i];
    if (wood.destroyed) {
      continue;
    }
    ctx.save();
    ctx.translate(wood.x + wood.width / 2, wood.y + wood.height / 2);
    ctx.rotate(wood.angle);
    drawWood(-wood.width / 2, -wood.height / 2, wood.width, wood.height);
    ctx.restore();
    if (wood.exploding) {
      drawExplosion(
        wood.x + wood.width / 2,
        wood.y + wood.height / 2,
        wood.explosionTimer,
      );
    }
  }

  for (let i = 0; i < glasses.length; i++) {
    const glass = glasses[i];
    if (glass.destroyed) {
      continue;
    }
    ctx.save();
    ctx.translate(glass.x + glass.width / 2, glass.y + glass.height / 2);
    ctx.rotate(glass.angle);
    drawGlass(-glass.width / 2, -glass.height / 2, glass.width, glass.height);
    ctx.restore();
    if (glass.exploding) {
      drawExplosion(
        glass.x + glass.width / 2,
        glass.y + glass.height / 2,
        glass.explosionTimer,
      );
    }
  }
}

function drawSlingShot() {
  ctx.strokeStyle = "brown";
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(point.x, point.y);
  ctx.lineTo(point.x - 50, point.y - 70);
  ctx.moveTo(point.x, point.y);
  ctx.lineTo(point.x + 50, point.y - 70);
  ctx.moveTo(point.x, point.y);
  ctx.lineTo(point.x, point.y + 100);
  ctx.stroke();
  if (drag) {
    ctx.strokeStyle = "#3b2415";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(point.x - 25, point.y - 35);
    ctx.lineTo(bird.x, bird.y);
    ctx.lineTo(point.x + 25, point.y - 35);
    ctx.stroke();
  }
}

let drag = false;

function getMousePosition(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

canvas.addEventListener("mousedown", function (e) {
  if (levelWon || levelFailed) {
    return;
  }
  if (birdsLeft <= 0) {
    return;
  }
  if (bird.launch) {
    return;
  }
  const mouse = getMousePosition(e);
  let disX = mouse.x - bird.x;
  let disY = mouse.y - bird.y;
  const dist = Math.sqrt(disX * disX + disY * disY);
  if (dist <= bird.radius) {
    drag = true;
  }
});

canvas.addEventListener("mousemove", function (e) {
  if (!drag) {
    return;
  }
  const mouse = getMousePosition(e);
  let disX = mouse.x - point.x;
  let disY = mouse.y - point.y;
  const dist = Math.sqrt(disX * disX + disY * disY);
  if (dist > maxPull) {
    disX = (disX / dist) * maxPull;
    disY = (disY / dist) * maxPull;
  }
  bird.x = point.x + disX;
  bird.y = point.y + disY;
  if (musicOn) {
    birdShoot.currentTime = 0;
    birdShoot.play();
  }
});

canvas.addEventListener("mouseup", function () {
  if (!drag) {
    return;
  }
  drag = false;
  launchBird();
});

function launchBird() {
  if (levelWon || levelFailed) {
    return;
  }
  if (birdsLeft <= 0) {
    return;
  }
  const pullX = point.x - bird.x;
  const pullY = point.y - bird.y;
  bird.vx = pullX * launchPower;
  bird.vy = pullY * launchPower;
  bird.launch = true;
  birdsLeft--;
}

function updateBirdPhysics() {
  if (!bird.launch || !bird.active || levelWon) {
    return;
  }
  bird.vy += gravity;
  bird.x += bird.vx;
  bird.y += bird.vy;
  const groundY = canvas.height - groundHeight;
  if (bird.y + bird.radius >= groundY) {
    bird.y = groundY - bird.radius;
    bird.vy *= -0.3;
    bird.vx *= 0.7;
    if (Math.abs(bird.vy) < 1 && Math.abs(bird.vx) < 1) {
      bird.launch = false;
      setTimeout(resetBird, 500);
    }
  }
  if (bird.y > canvas.height + 200) {
    bird.launch = false;
    setTimeout(resetBird, 300);
  }
}

function checkSupport(piece1, piece2) {
  const requiredSupport = Math.max(piece1.width * 0.4, 25);
  let totalSupport = 0;
  const groundY = canvas.height - groundHeight;
  const pieceBottom = piece1.y + piece1.height;
  const groundGap = Math.abs(pieceBottom - groundY);
  if (groundGap <= 10) {
    totalSupport = piece1.width;
  }
  for (let i = 0; i < piece2.length; i++) {
    const support = piece2[i];
    if (support == piece1) {
      continue;
    }
    if (support.destroyed) {
      continue;
    }
    if (support.falling) {
      continue;
    }
    if (support.exploding) {
      continue;
    }
    const supportTop = support.y;
    const verticalGap = Math.abs(pieceBottom - supportTop);
    if (verticalGap > 10) {
      continue;
    }
    const overlapLeft = Math.max(piece1.x, support.x);
    const overlapRight = Math.min(
      piece1.x + piece1.width,
      support.x + support.width,
    );
    const overlap = overlapRight - overlapLeft;
    if (overlap > 0) {
      totalSupport += overlap;
    }
  }
  return totalSupport >= requiredSupport;
}
function checkPieceCollision(piece1, piece2) {
  if (piece1.destroyed) {
    return false;
  }
  if (piece2.destroyed) {
    return false;
  }
  if (piece1.exploding) {
    return false;
  }
  if (piece2.exploding) {
    return false;
  }
  return (
    piece1.x < piece2.x + piece2.width &&
    piece1.x + piece1.width > piece2.x &&
    piece1.y < piece2.y + piece2.height &&
    piece1.y + piece1.height > piece2.y
  );
}
function checkDamage(piece, damage) {
  if (piece.destroyed) {
    return;
  }
  if (piece.exploding) {
    return;
  }
  piece.health -= damage;
  if (piece.health <= 0) {
    piece.health = 0;
    piece.destroyed = true;
    piece.falling = false;
    score += piece.points;
  }
}

function applyCollisionResponse(movingPiece, targetPiece) {
  if (movingPiece.hitCooldown > 0) {
    return;
  }
  const speed = Math.sqrt(
    movingPiece.vx * movingPiece.vx + movingPiece.vy * movingPiece.vy,
  );
  let damage = 10;
  if (speed > 3) {
    damage = 20;
  }
  if (speed > 6) {
    damage = 30;
  }
  if (speed > 10) {
    damage = 40;
  }
  checkDamage(targetPiece, damage);
  movingPiece.vy *= -0.25;
  movingPiece.vx += 0.5;
  if (movingPiece.vx >= 0) {
    movingPiece.angularVelocity += 0.01;
  } else {
    movingPiece.angularVelocity -= 0.01;
  }
  movingPiece.hitCooldown = 10;
}

function updateWoodPhysics() {
  for (let i = 0; i < woods.length; i++) {
    const wood = woods[i];
    if (wood.destroyed) {
      continue;
    }
    if (wood.exploding) {
      continue;
    }
    if (wood.hitCooldown > 0) {
      wood.hitCooldown--;
    }
    if (!wood.falling) {
      const supported = checkSupport(wood, woods);
      if (!supported) {
        wood.falling = true;
        wood.vy = 0;
        wood.vx = 0;
        wood.angularVelocity = 0.02;
        wood.angularAcceleration = 0.001;
      }
    }

    if (wood.falling) {
      wood.vy += gravity;
      wood.x += wood.vx;
      wood.y += wood.vy;
      wood.angularVelocity += wood.angularAcceleration;
      wood.angle += wood.angularVelocity;

      for (let j = 0; j < woods.length; j++) {
        if (i === j) {
          continue;
        }
        const otherWood = woods[j];
        if (otherWood.destroyed) {
          continue;
        }
        if (otherWood.exploding) {
          continue;
        }
        if (checkPieceCollision(wood, otherWood)) {
          applyCollisionResponse(wood, otherWood);
        }
      }
      for (let j = 0; j < glasses.length; j++) {
        const glass = glasses[j];
        if (glass.destroyed) {
          continue;
        }
        if (glass.exploding) {
          continue;
        }
        if (checkPieceCollision(wood, glass)) {
          applyCollisionResponse(wood, glass);
        }
      }

      const groundY = canvas.height - groundHeight;
      if (wood.y + wood.height >= groundY) {
        wood.y = groundY - wood.height;
        wood.vy = 0;
        wood.falling = false;
      }
    }
  }
}
function updateGlassPhysics() {
  for (let i = 0; i < glasses.length; i++) {
    const glass = glasses[i];
    if (glass.destroyed) {
      continue;
    }
    if (glass.exploding) {
      continue;
    }
    if (glass.hitCooldown > 0) {
      glass.hitCooldown--;
    }

    if (!glass.falling) {
      const supported = checkSupport(glass, woods);
      if (!supported) {
        glass.falling = true;
        glass.vy = 0;
        glass.vx = 0;
        glass.angularVelocity = 0.05;
        glass.angularAcceleration = 0.005;
      }
    }

    if (glass.falling) {
      glass.vy += gravity;
      glass.x += glass.vx;
      glass.y += glass.vy;
      glass.angularVelocity += glass.angularAcceleration;
      glass.angle += glass.angularVelocity;

      for (let j = 0; j < woods.length; j++) {
        const wood = woods[j];
        if (wood.destroyed) {
          continue;
        }
        if (wood.exploding) {
          continue;
        }
        if (checkPieceCollision(glass, wood)) {
          applyCollisionResponse(glass, wood);
        }
      }
      for (let j = 0; j < glasses.length; j++) {
        if (i == j) {
          continue;
        }
        const otherGlass = glasses[j];
        if (otherGlass.destroyed) {
          continue;
        }
        if (otherGlass.exploding) {
          continue;
        }
        if (checkPieceCollision(glass, otherGlass)) {
          applyCollisionResponse(glass, otherGlass);
        }
      }
      const groundY = canvas.height - groundHeight;
      if (glass.y + glass.height >= groundY) {
        glass.y = groundY - glass.height;
        glass.vy = 0;
        glass.falling = false;
        glass.exploding = true;
        glass.explosionTimer = 0;
      }
    }
  }
}

function resetBird() {
  if (levelWon || levelFailed) {
    return;
  }
  birdQueue.shift();
  if (birdsLeft <= 0) {
    levelFailed = true;
    bird.active = false;
    if (musicOn) {
      levelFailedSound.currentTime = 0;
      levelFailedSound.play();
      ambienceSound.pause();
      ambienceSound.currentTime = 0;
    }
    homeBtn.style.display = "block";
    return;
  }
  bird.x = point.x;
  bird.y = point.y;
  bird.vx = 0;
  bird.vy = 0;
  bird.launch = false;
  bird.active = true;
}
function circleRectCollision(circle, rect) {
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
  const disX = circle.x - closestX;
  const disY = circle.y - closestY;
  const distance = Math.sqrt(disX * disX + disY * disY);
  return distance < circle.radius;
}

function checkWoodCollision() {
  if (!bird.launch) {
    return;
  }
  for (let i = 0; i < woods.length; i++) {
    const wood = woods[i];
    if (wood.destroyed || wood.exploding) {
      continue;
    }
    if (circleRectCollision(bird, wood)) {
      const speed = Math.sqrt(bird.vx * bird.vx + bird.vy * bird.vy);
      let damage = 20;
      if (speed > 8) {
        damage = 30;
      }
      if (speed > 12) {
        damage = 50;
      }
      if (wood.hitCooldown <= 0) {
        checkDamage(wood, damage);
        wood.hitCooldown = 15;
      }
      wood.falling = true;
      wood.vx = bird.vx * 0.2;
      wood.vy = bird.vy * 0.2;
      wood.angularVelocity = 0.04;
      resolveBirdCollision(bird, wood);
    }
  }
}

function checkGlassCollision() {
  if (!bird.launch) {
    return;
  }
  for (let i = 0; i < glasses.length; i++) {
    const glass = glasses[i];
    if (glass.destroyed || glass.exploding) {
      continue;
    }
    if (circleRectCollision(bird, glass)) {
      const speed = Math.sqrt(bird.vx * bird.vx + bird.vy * bird.vy);
      let damage = 30;
      if (speed > 8) {
        damage = 50;
      }
      if (speed > 12) {
        damage = 70;
      }
      if (glass.hitCooldown <= 0) {
        checkDamage(glass, damage);
        glass.hitCooldown = 15;
      }
      glass.falling = true;
      glass.vx = bird.vx * 0.2;
      glass.vy = bird.vy * 0.2;
      glass.angularVelocity = 0.05;
      resolveBirdCollision(bird, glass);
    }
  }
}

function checkPigCollision() {
  if (!bird.launch) {
    return;
  }
  if (!pig.alive) {
    return;
  }
  const disX = bird.x - pig.x;
  const disY = bird.y - pig.y;
  const distance = Math.sqrt(disX * disX + disY * disY);
  if (distance < bird.radius + pig.radius) {
    pig.alive = false;
    score += 300;
    checkWin();
  }
}
function checkCollisions() {
  if (levelWon || levelFailed) {
    return;
  }
  checkWoodCollision();
  if (levelWon) {
    return;
  }
  checkGlassCollision();
  if (levelWon) {
    return;
  }
  checkPigCollision();
}

function resolveBirdCollision(bird, object) {
  const objectCenterX = object.x + object.width / 2;
  const objectCenterY = object.y + object.height / 2;
  const dx = bird.x - objectCenterX;
  const dy = bird.y - objectCenterY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) {
      bird.x = object.x + object.width + bird.radius;
      bird.vx = Math.abs(bird.vx) * 0.5;
    } else {
      bird.x = object.x - bird.radius;
      bird.vx = -Math.abs(bird.vx) * 0.5;
    }
  } else {
    if (dy > 0) {
      bird.y = object.y + object.height + bird.radius;
      bird.vy = Math.abs(bird.vy) * 0.5;
    } else {
      bird.y = object.y - bird.radius;
      bird.vy = -Math.abs(bird.vy) * 0.5;
    }
  }
}
function checkWin() {
  if (!pig.alive && !levelWon) {
    levelWon = true;
    bird.active = false;
    bird.launch = false;
    drag = false;
    if (musicOn) {
      levelCompleteSound.currentTime = 0;
      levelCompleteSound.play();
      ambienceSound.pause();
      ambienceSound.currentTime = 0;
    }
    localStorage.setItem("level2Unlocked", "true");
    nextBtn.style.display = "block";
  }
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "bold 30px Arial";
  ctx.fillText("Score: " + score, canvas.width / 2 - 10, 45);
  ctx.fillText("Birds: " + birdsLeft, canvas.width / 2 - 150, 45);
}

function drawWinScreen() {
  if (!levelWon) {
    return;
  }
  ctx.fillStyle = "rgba(0, 0, 0, 0.60)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.font = "bold 60px Arial";
  ctx.fillText("LEVEL 1 COMPLETE!", canvas.width / 2, canvas.height / 2 - 60);
  ctx.font = "bold 35px Arial";
  ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2);
  ctx.font = "bold 30px Arial";
  ctx.fillText("YOU WIN!", canvas.width / 2, canvas.height / 2 + 60);
  ctx.textAlign = "left";
}
function drawFailScreen() {
  if (!levelFailed) {
    return;
  }
  ctx.fillStyle = "rgba(0, 0, 0, 0.60)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.font = "bold 60px Arial";
  ctx.fillText("LEVEL 1 FAILED!", canvas.width / 2, canvas.height / 2 - 40);
  ctx.font = "bold 35px Arial";
  ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 20);
  ctx.font = "bold 25px Arial";
  ctx.fillText("No birds left!", canvas.width / 2, canvas.height / 2 + 70);
  ctx.textAlign = "left";
}

function background() {
  if (skyImage.complete) {
    ctx.drawImage(skyImage, 0, 0, canvas.width, canvas.height);
  }
  if (groundImage.complete) {
    ctx.drawImage(
      groundImage,
      0,
      canvas.height - groundHeight,
      canvas.width,
      groundHeight,
    );
  }
}

function drawGrass() {
  const groundY = canvas.height - groundHeight;
  ctx.strokeStyle = "#4d8f38";
  ctx.lineWidth = 2;

  for (let x = 0; x < canvas.width; x += 15) {
    const wave = Math.sin((x + performance.now() * 0.05) * 0.05) * 4;
    ctx.beginPath();
    ctx.moveTo(x, groundY + 5);
    ctx.lineTo(x + wave, groundY - 5);
    ctx.stroke();
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  background();
  drawGrass();
  drawSlingShot();
  drawObjects();
  drawPig();
  drawTrajectory();
  drawBird();
  drawBirdQueue();
  drawScore();
  drawWinScreen();
  drawFailScreen();
}

function gameLoop() {
  if (drag) {
    updateBird();
  }
  updateBirdPhysics();
  updateWoodPhysics();
  updateGlassPhysics();
  updatePig();
  updateExplosions();
  checkCollisions();
  render();
  requestAnimationFrame(gameLoop);
}

function imageLoaded() {
  imagesLoaded++;

  if (imagesLoaded == 4) {
    gameLoop();
  }
}

skyImage.onload = imageLoaded;
groundImage.onload = imageLoaded;
pigSpriteSheet.onload = imageLoaded;
redBird.onload = imageLoaded;

ambienceSound.play();
nextBtn.addEventListener("click", function () {
  window.location.href = "menu.html";
});
homeBtn.addEventListener("click", function () {
  window.location.href = "menu.html";
});
refreshBtn.addEventListener("click", function () {
  window.location.reload();
});

musicBtn.addEventListener("click", function () {
  musicOn = !musicOn;
  if (musicOn) {
    ambienceSound.play();
    musicBtn.textContent = "MUSIC ON";
  } else {
    ambienceSound.pause();
    levelCompleteSound.pause();
    levelFailedSound.pause();
    birdShoot.pause();
    musicBtn.textContent = "MUSIC OFF";
  }
});
