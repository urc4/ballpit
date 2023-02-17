const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const ctx = canvas.getContext("2d");

const COLOR_PALETTE = [
  "#66FF00",
  "#1974D2",
  "#08E8DE",
  "#FFF000",
  "#FFAA1D",
  "#FF007F",
  "white",
];

function getRandomColor() {
  return COLOR_PALETTE[
    Math.floor(Math.random() * (COLOR_PALETTE.length - 0.001))
  ];
  //   its zero inclusive and one exclusive
}

function getRandomPosition() {
  position = {};
  position.x = Math.floor(Math.random() * WIDTH);
  position.y = Math.floor(Math.random() * HEIGHT);
  return position;
}

function getRandomDirection() {
  direction = {};
  const x = Math.random();
  const y = Math.random();
  const norm = Math.sqrt(x ** 2 + y ** 2);
  direction.x = x / norm;
  direction.y = y / norm;
  return direction;
}

class Ball {
  constructor(radius) {
    this.speed = 1;
    this.radius = radius;
    this.color = getRandomColor();
    this.position = getRandomPosition();
    this.position.x = WIDTH - 1;
    this.position.y = HEIGHT - 1;

    this.direction = getRandomDirection();
    this.velocity = {
      x: this.direction.x * this.speed,
      y: this.direction.y * this.speed,
    };
  }

  draw() {
    ctx.fillStyle = this.color;
    if (
      this.position.x + this.radius > WIDTH &&
      this.position.y + this.radius > HEIGHT
    )
      ctx.arc(
        WIDTH - 5 * this.radius,
        HEIGHT - 5 * this.radius,
        20,
        0,
        2 * Math.PI
      );
    else if (this.position.x + 5 * this.radius > WIDTH)
      ctx.arc(WIDTH - 5 * this.radius, this.position.y, 20, 0, 2 * Math.PI);
    else if (this.position.y + 5 * this.radius > HEIGHT)
      ctx.arc(this.position.x, HEIGHT - 5 * this.radius, 20, 0, 2 * Math.PI);
    else ctx.arc(this.position.x, this.position.y, 20, 0, 2 * Math.PI);

    ctx.fill();
  }
}

const ball = new Ball(20);
ball.draw();
