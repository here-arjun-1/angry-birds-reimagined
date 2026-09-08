const canvas = document.querySelector("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

function background(){
  ctx.fillStyle = "#87ceeb";
  ctx.fillRect(0,0,canvas.width,500);
  
  ctx.fillStyle = "#6cab46";
  ctx.fillRect(0,500, canvas.width,100);

  ctx.fillStyle = "#8b6945";
  ctx.fillRect(0,600,canvas.width,canvas.height-500-100);
}


const point = {
  x:140,
  y:400,
}

const bird = {
  x : point.x,
  y : point.y,
  rad : 20,

  vx : 0,
  vy : 0,
  launch :false,
}

function drawBird(){
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.rad, 0, Math.PI *2);
  ctx.fill();
  ctx.strokeStyle = "darkred";
  ctx.stroke();
}

function drawSlingShot(){
  ctx.strokeStyle = "brown";
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(140,400);
  ctx.lineTo(300,360);

  ctx.moveTo(140,400);
  ctx.lineTo(300,440);
  ctx.stroke();
}

const pig ={
  x : canvas.width - 250,
  y : 250,
  rad : 40,
  fall : false,
}

function drawPig(){
  ctx.fillStyle = "green";
  ctx.beginPath();
  ctx.arc(pig.x, pig.y, pig.rad, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "green";
  ctx.lineWidth = 2;
  ctx.stroke();
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

render();
