const canvas = document.querySelector("canvas");

const nextBtn = document.getElementById("nextBtn");
const homeBtn = document.getElementById("menu")
const refreshBtn = document.getElementById("refreshBtn");
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
levelCompleteSound.src = 'assets/sounds/levelComplete.mp3';
const levelFailedSound = new Audio();
levelFailedSound.src = 'assets/sounds/levelFailed.mp3'
const birdShoot = new Audio();
birdShoot.src = 'assets/sounds/birdShoot.mp3'
birdShoot.preload = "auto";
birdShoot.volume = 0.8;
const ambienceSound = new Audio();
ambienceSound.src = 'assets/sounds/ambienceSound.mp3';
ambienceSound.loop = true;

const gravity = 0.40;
const maxPull = 130;
const launchPower = 0.30;

let score = 0;
let levelWon = false;
let levelFailed = false;
let birdsLeft = 3;
let imagesLoaded = 0;
const point={
  x: 150,
  y: canvas.height-groundHeight-100
};

const bird ={
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
  active: true
};

function drawBird(){
  if(!bird.active){
    return;
  }

  if(!redBird.complete){
    return;
  }
  const frameWidth = redBird.width/4;
  const frameHeight = redBird.height;

  ctx.drawImage(
    redBird,
    bird.frame*frameWidth,
    0,
    frameWidth,
    frameHeight,
    bird.x-bird.width/2,
    bird.y-bird.height/2,
    bird.width,
    bird.height
  );
}
function updateBird(){
  bird.frameTimer++;
  if(bird.frameTimer >= 10){
    bird.frameTimer = 0;
    bird.frame++;
    if (bird.frame >= 4){
      bird.frame = 0;
    }
  }
}

const pig ={
  x: canvas.width-250,
  y: canvas.height-groundHeight-30,

  width: 100,
  height: 80,
  radius: 40,
  alive: true,
  frame: 0,
  frameTimer: 0
};

function drawPig(){
  if(!pig.alive){
    return;
  }
  if (!pigSpriteSheet.complete) {
    return;
  }
  const frameWidth = pigSpriteSheet.width/6;
  const frameHeight = pigSpriteSheet.height;

  ctx.drawImage(
    pigSpriteSheet,
    pig.frame * frameWidth,
    0,
    frameWidth,
    frameHeight,
    pig.x-pig.width/2,
    pig.y-pig.height/2,
    pig.width,
    pig.height
  );
}

function updatePig(){
  if(!pig.alive){
    return;
  }
  pig.frameTimer++;
  if (pig.frameTimer >= 150){
    pig.frameTimer = 0;
    pig.frame++;
    if (pig.frame >= 6){
      pig.frame = 0;
    }
  }
}

function drawWood(x, y, width, height){
  ctx.fillStyle = "#9D6C3C";
  ctx.fillRect(x,y, width,height);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.strokeRect(x,y, width,height);
}

function drawGlass(x, y, width, height){
  ctx.fillStyle = "#A7C7CB";
  ctx.fillRect(x,y ,width,height);

  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;

  ctx.strokeRect(x,y, width,height);
}

const woods =[{
    x: canvas.width-350,
    y: canvas.height-groundHeight-170,
    width: 40,
    height: 170,
    destroyed: false,
    falling: false,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVelocity: 0,
    exploding: false,
    explosionTimer: 0
  },

  {
    x: canvas.width-190,
    y: canvas.height-groundHeight-170,
    width: 40,
    height: 170,
    destroyed: false,
    falling: false,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVelocity: 0,
    exploding: false,
    explosionTimer: 0
  }
];

const glasses =[{
    x: canvas.width-350,
    y: canvas.height-groundHeight -210,
    width: 200,
    height: 40,
    destroyed: false,
    exploding: false,
    explosionTimer: 0,
    falling: false,
    vy: 0
  }
];

function drawExplosion(x,y,timer){
  const radius = 10 + timer*2;
  ctx.beginPath();
  ctx.arc(x,y,radius,0,Math.PI*2);
  ctx.fillStyle = "brown";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x,y,radius*0.5,0,Math.PI*2);
  ctx.fillStyle = "orange";
  ctx.fill();
}

function updateExplosions(){
  for(let i=0;i<woods.length;i++){
    const wood = woods[i];
    if(wood.exploding){
      wood.explosionTimer++;
      if(wood.explosionTimer > 15){
        wood.exploding = false;
        wood.destroyed = true;
      }
    }
  }
  let allWoodsDestroyed = true;
  for(let i=0;i<woods.length;i++){
    if(!woods[i].destroyed){
      allWoodsDestroyed = false;
      break;
    }
  }
  if(allWoodsDestroyed){
    for(let i=0;i<glasses.length;i++){
      if(!glasses[i].destroyed){
        glasses[i].falling = true;
      }
    }
  }
  for(let i=0;i<glasses.length;i++){
    const glass = glasses[i];
    if(glass.exploding){
      glass.explosionTimer++;
      if(glass.explosionTimer > 15){
        glass.exploding = false;
        glass.destroyed = true;
      }
    }
  }
}

function drawObjects(){
  for(let i=0; i<woods.length; i++){
    const wood = woods[i];
    if(wood.destroyed){
      continue;
    }

    if(wood.exploding){
      drawExplosion(
        wood.x + wood.width,
        wood.y + wood.height,
        wood.explosionTimer
      );
    }
    else{
      ctx.save();
      ctx.translate(
        wood.x + wood.width,
        wood.y + wood.height
      );
      ctx.rotate(wood.angle);
      drawWood(
        -wood.width,
        -wood.height,
        wood.width,
        wood.height
      );
      ctx.restore();
    }
  }

  for(let i=0;i <glasses.length; i++){
    const glass = glasses[i];
    if (glass.destroyed){
      continue;
    }
    if(glass.exploding){
      drawExplosion(
        glass.x + glass.width/2,
        glass.y + glass.height/2,
        glass.explosionTimer
      );
    }
    else{
      drawGlass(glass.x,glass.y,glass.width,glass.height);
    }
  }
}

function drawSlingShot(){
  ctx.strokeStyle = "brown";
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(point.x,point.y);
  ctx.lineTo(point.x-10,point.y+90);

  ctx.moveTo(point.x,point.y);
  ctx.lineTo(point.x-10,point.y-90);
  ctx.stroke();

  if(drag){
    ctx.strokeStyle = "#3b2415";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(point.x,point.y-25);
    ctx.lineTo(bird.x,bird.y);

    ctx.lineTo(point.x,point.y+25);
    ctx.stroke();
  }
}
let drag = false;
function getMousePosition(e){
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX-rect.left,
    y: e.clientY-rect.top
  };
}

canvas.addEventListener("mousedown",function(e){
    if(levelWon || levelFailed){
      return;
    }
    if(birdsLeft <= 0){
      return;
    }
    if(bird.launch){
      return;
    }
    const mouse = getMousePosition(e);

    let disX = mouse.x-bird.x;
    let disY = mouse.y-bird.y;

    const dist = Math.sqrt(disX*disX +disY*disY);

    if(dist <= bird.radius){
      drag = true;
    }
  }
);

canvas.addEventListener("mousemove",function(e){
    if(!drag){
      return;
    }

    const mouse = getMousePosition(e);

    let disX = mouse.x-point.x;
    let disY = mouse.y-point.y;
    const dist = Math.sqrt(disX*disX +disY*disY);

    if(dist > maxPull){
      disX = (disX/dist)*maxPull;
      disY = (disY/dist)*maxPull;
    }
    bird.x = point.x+disX;
    bird.y = point.y+disY;
    birdShoot.currentTime = 0;
    birdShoot.play();
  }
);
canvas.addEventListener("mouseup",function(){
    if(!drag){
      return;
    }
    drag = false;
    launchBird();
  }
);

function launchBird(){
  if (levelWon || levelFailed){
    return;
  }
  if (birdsLeft <= 0){
    return;
  }
  const pullX =point.x-bird.x;
  const pullY =point.y-bird.y;

  bird.vx =pullX*launchPower;
  bird.vy =pullY*launchPower;
  bird.launch = true;
  birdsLeft--;
}

function updateBirdPhysics(){
  if(!bird.launch || !bird.active || levelWon){
    return;
  }
  bird.vy += gravity;
  bird.x += bird.vx;
  bird.y += bird.vy;

  const groundY =canvas.height-groundHeight;
  if(bird.y+bird.radius>=groundY){
    bird.y =groundY-bird.radius;
    bird.vy *= -0.30;
    bird.vx *= 0.70;
    if(Math.abs(bird.vy)< 1 && Math.abs(bird.vx)< 1){
      bird.launch = false;
      setTimeout(resetBird,500);
    }
  }

  if(bird.x-bird.radius <= 0){
    bird.x = bird.radius;
    bird.vx *= -0.5;
  }

  if (bird.y-bird.radius <= 0){
    bird.y = bird.radius;
    bird.vy *= -0.5;
  }

  if (bird.y > canvas.height+200){
    bird.launch = false;
    setTimeout(resetBird, 300);
  }
}
function updateWoodPhysics(){
  for(let i=0;i<woods.length;i++){
    const wood = woods[i];
    if(wood.destroyed){
      continue;
    }
    if(wood.exploding){
      continue;
    }
    if(!wood.falling){
      continue;
    }
    wood.angle += wood.angularVelocity;
    wood.angularVelocity += 0.002;
    if(Math.abs(wood.angle) >= Math.PI/2){
      wood.angle = Math.PI/2;
      wood.falling = false;
      wood.exploding = true;
      wood.explosionTimer = 0;
    }
  }
}
function updateGlassPhysics(){
  for(let i=0;i<glasses.length;i++){
    const glass = glasses[i];
    if(glass.destroyed){
      continue;
    }
    if(glass.exploding){
      continue;
    }
    if(!glass.falling){
      continue;
    }
    glass.vy += gravity;
    glass.y += glass.vy;
    const groundY = canvas.height-groundHeight;
    if(glass.y+glass.height >= groundY){
      glass.y = groundY-glass.height;
      glass.vy = 0;
      glass.falling = false;
      glass.exploding = true;
      glass.explosionTimer = 0;
    }
  }
}

function resetBird(){
  if(levelWon || levelFailed){
    return;
  }
  if (birdsLeft <= 0){
    levelFailed = true;
    bird.active = false;
    levelFailedSound.currentTime =0;
    levelFailedSound.play();
    ambienceSound.pause();
    ambienceSound.currentTime = 0;
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
function circleRectCollision(circle, rect){
  const closestX =Math.max(rect.x,Math.min(circle.x, rect.x + rect.width));
  const closestY =Math.max(rect.y,Math.min(circle.y,rect.y + rect.height));
  const disX =circle.x-closestX;
  const disY =circle.y-closestY;

  const distance =Math.sqrt(disX*disX +disY*disY);
  return distance < circle.radius;
}

function checkWoodCollision(){
  if(!bird.launch){
    return;
  }
  for (let i=0; i<woods.length; i++){
    const wood = woods[i];
    if(wood.destroyed || wood.falling || wood.exploding){
      continue;
    }
    if(circleRectCollision(bird, wood)){
      wood.falling = true;
      wood.angularVelocity = 0.04;
      score += 100;
    }
  }
}

function checkGlassCollision(){
  if(!bird.launch){
    return;
  }
  for(let i=0; i<glasses.length; i++){
    const glass = glasses[i];

    if(glass.destroyed || glass.exploding){
      continue;
    }
    if(circleRectCollision(bird,glass)){
      glass.exploding = true;
      glass.explosionTimer = 0;
      score += 200;
      checkWin();
      if(levelWon){
        return;
      }
    }
  }
}

function checkPigCollision(){
  if(!bird.launch){
    return;
  }
  if(!pig.alive){
    return;
  }
  const disX = bird.x-pig.x;
  const disY = bird.y-pig.y;
  const distance =Math.sqrt(disX*disX +disY*disY);
  if(distance <bird.radius+pig.radius){
    pig.alive = false;
    score += 300;
    checkWin();
  }
}
function checkCollisions(){
  if(levelWon || levelFailed){
    return;
  }
  checkWoodCollision();
  if(levelWon){
    return;
  }
  checkGlassCollision();
  if(levelWon){
    return;
  }
  checkPigCollision();
}
function checkWin(){
  if(!pig.alive && !levelWon){
    levelWon = true;
    bird.active = false;
    bird.launch = false;
    drag = false;
    levelCompleteSound.currentTime = 0;
    levelCompleteSound.play();
    ambienceSound.pause();
    ambienceSound.currentTime = 0;
    localStorage.setItem( "level2Unlocked", "true");
    nextBtn.style.display = "block";
  }
}
function drawScore(){
  ctx.fillStyle = "white";
  ctx.font = "bold 30px Arial";
  ctx.fillText("Score: " + score,canvas.width/2-10,45);
  ctx.fillText("Birds: " + birdsLeft,canvas.width/2-150,45);
}

function drawWinScreen(){
  if(!levelWon){
    return;
  }
  ctx.fillStyle ="rgba(0, 0, 0, 0.60)";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.font ="bold 60px Arial";

  ctx.fillText("LEVEL 1 COMPLETE!",canvas.width/2,canvas.height/2-60);
  ctx.font ="bold 35px Arial";
  ctx.fillText("Score: " + score,canvas.width/2,canvas.height/2);
  ctx.font ="bold 30px Arial";
  ctx.fillText("YOU WIN!",canvas.width/2,canvas.height/2+60);
  ctx.textAlign = "left";
}

function drawFailScreen(){
  if(!levelFailed){
    return;
  }
  ctx.fillStyle ="rgba(0, 0, 0, 0.60)";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.font ="bold 60px Arial";

  ctx.fillText("LEVEL 1 FAILED!",canvas.width/2,canvas.height/2-40);
  ctx.font="bold 35px Arial";
  ctx.fillText(
    "Score: "+score,
    canvas.width/2,
    canvas.height/2+20
  );
  ctx.font ="bold 25px Arial";
  ctx.fillText("No birds left!",canvas.width/2, canvas.height/2 + 70);
  ctx.textAlign = "left";
}

function background() {
  if (skyImage.complete) {
    ctx.drawImage(
      skyImage,
      0,
      0,
      canvas.width,
      canvas.height
    );
  }
  if (groundImage.complete) {
    ctx.drawImage(
      groundImage,
      0,
      canvas.height-groundHeight,
      canvas.width,
      groundHeight
    );
  }
}

function drawGrass(){
  const groundY = canvas.height-groundHeight;
  ctx.strokeStyle = "#4d8f38";
  ctx.lineWidth = 2;

  for(let x=0; x<canvas.width;x+=15){
    const wave = Math.sin((x+performance.now()*0.05)*0.05)*4;
    ctx.beginPath();
    ctx.moveTo(x, groundY+5);
    ctx.lineTo(x+wave, groundY-5);
    ctx.stroke();
  }
}
function render(){
  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );
  background();
  drawGrass();
  drawSlingShot();
  drawObjects();
  drawPig();
  drawBird();
  drawScore();
  drawWinScreen();
  drawFailScreen();
}

function gameLoop(){
  if(drag){
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
function imageLoaded(){
  imagesLoaded++;
  if(imagesLoaded==4){
    gameLoop();
  }
}
skyImage.onload = imageLoaded;
groundImage.onload = imageLoaded;
pigSpriteSheet.onload = imageLoaded;
redBird.onload = imageLoaded;
ambienceSound.play();

nextBtn.addEventListener("click",function(){
  window.location.href = "menu.html";
  }
);
homeBtn.addEventListener("click", function(){
  window.location.href ='menu.html';
});
refreshBtn.addEventListener("click", function(){
  window.location.reload();
});