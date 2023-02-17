const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

ctx.fillStyle = "white";
ctx.strokeStyle = "red";
ctx.arc(canvas.width / 2, canvas.height / 2, 20, 0, 2 * Math.PI);
ctx.stroke();
ctx.fill();
