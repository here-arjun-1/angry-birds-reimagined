// const canvas = document.getElementById("game-canvas");
// const ctx = canvas.getContext("2d");

// function renderBackground() {
//   ctx.fillStyle = "#87ceeb";
//   ctx.fillRect(0, 0, 900, 500);

//   ctx.fillStyle = "#6cab46";
//   ctx.fillRect(0, 380, 900, 80);

//   ctx.fillStyle = "#8b6945";
//   ctx.fillRect(0, 460, 900, 40);
// }

// renderBackground();

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

background();
