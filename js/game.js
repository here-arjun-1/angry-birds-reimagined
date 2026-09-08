const canvas = document.querySelector("canvas");

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
redBird.src ='assets/images/redBirdSpritesheet.png'

const groundHeight = 150;
function background(){
  ctx.drawImage(skyImage,0,0,canvas.width,canvas.height);
  ctx.drawImage(groundImage,0,canvas.height-groundHeight,canvas.width,groundHeight);
}
skyImage.onload = imageLoaded;
groundImage.onload = imageLoaded;
pigSpriteSheet.onload = imageLoaded;
redBird.onload = imageLoaded;

const point = {
  x:140,
  y:600,
}

const bird = {
  x : point.x,
  y : point.y,
  width:80,
  height:80,
  vx : 0,
  vy : 0,
  frame:0,
  frameTimer:0,
  launch :false,
}

function drawBird(){
  if(!redBird.complete){
    return;
  }
  const frameWidth = redBird.width / 4;
  const frameHeight = redBird.height;
  
  ctx.drawImage(redBird,bird.frame * frameWidth,0,frameWidth,frameHeight,bird.x - bird.width / 2,bird.y - bird.height / 2,bird.width,bird.height);
}
function updateBird(){
  bird.frameTimer++;
  if (bird.frameTimer >= 58){
    bird.frameTimer = 0;
    bird.frame++;
    if (bird.frame >= 4) {
      bird.frame = 0;
    }
  }
}

function drawSlingShot(){
  ctx.strokeStyle = "brown";
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(140,600);
  ctx.lineTo(300,560);

  ctx.moveTo(140,600);
  ctx.lineTo(300,640);
  ctx.stroke();
}

const pig ={
  x : canvas.width - 250,
  y : 550,
  width:100,
  height:80,
  fall : false,
  frame:0,
  frameTimer:0
}

function drawPig(){
  if(!pigSpriteSheet.complete){
    return;
  }
  const frameWidth = pigSpriteSheet.width / 6;
  const frameHeight = pigSpriteSheet.height;
  
  ctx.drawImage(pigSpriteSheet,pig.frame * frameWidth,0,frameWidth,frameHeight,pig.x - pig.width / 2,pig.y - pig.height / 2,pig.width,pig.height);
}

function updatePig(){
  pig.frameTimer++;
  if (pig.frameTimer >= 158) {
    pig.frameTimer = 0;
    pig.frame++;
    if (pig.frame >= 6) {
      pig.frame = 0;
    }
  }
}

function drawWood(x, y, width, height){
  ctx.fillStyle = "#9D6C3C";
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.strokeRect(x,y,width,height);
}

function drawGlass(x, y, width, height){
  ctx.fillStyle = "#A7C7CB";
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
}


let drag = false;
const maxPull = 100;

function getMousePosition(e){
  const rect = canvas.getBoundingClientRect();
  return{
    x: e.clientX-rect.left,
    y: e.clientY-rect.top
  };
}

canvas.addEventListener("mousedown", function(e){
  const mouse = getMousePosition(e);
  let disX = mouse.x-bird.x;
  let disY = mouse.y-bird.y;

  const dist = Math.sqrt(disX*disX + disY*disY);
  if(dist <= bird.rad){
    drag = true;
  }
})

canvas.addEventListener("mousemove", function(){
  if(!drag){
    return;
  }
  const mouse = getMousePosition(e);

  let disX = mouse.x-point.x;
  let disY = mouse.y-point.y;
   
  const dist = Math.sqrt(disX*disX + disY*disY);
  if(dist > maxPull){
    let disX = (disX/dist)*maxPull;
    let disY = (disY/dist)*maxPull;
  }
  bird.x = point.x+disX;
  bird.y = point.y+disY;
  render();
})

canvas.addEventListener("mouseup", function(){
  if(!drag){
    return;
  }
  drag = false;
  bird.launch = true;
})

function render(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  background();
  drawSlingShot();
  drawGlass(pig.x-90, pig.y+pig.rad, 180, 40);
  drawWood(pig.x-90, 330, 40, 170);
  drawWood(pig.x+50, 330, 40, 170);

  drawPig();
  drawBird();
}
function gameLoop(){
  if(drag){
    updateBird();
  }
  updatePig();
  render();
  requestAnimationFrame(gameLoop);
}

let imagesLoaded = 0;
function imageLoaded(){
    imagesLoaded++;
    if (imagesLoaded === 4) {
      gameLoop();
    }
}
