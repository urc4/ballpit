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
    if (this.position.x + 5 * this.radius > WIDTH)
      this.position.x = WIDTH - 5 * this.radius;
    if (this.position.x - 5 * this.radius < 0)
      this.position.x = 5 * this.radius;
    if (this.position.y + 5 * this.radius > HEIGHT)
      this.position.y = HEIGHT - 5 * this.radius;
    if (this.position.y - 5 * this.radius < 0)
      this.position.y = 5 * this.radius;

    this.direction = getRandomDirection();
    this.velocity = {
      x: this.direction.x * this.speed,
      y: this.direction.y * this.speed,
    };
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.position.x, this.position.y, 20, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }

  update() {
    this.draw();

    const leftSide = this.position.x + this.velocity.x - this.radius;
    const rightSide = this.position.x + this.velocity.x + this.radius;
    const bottomSide = this.position.y + this.velocity.y + this.radius;
    const topSide = this.position.y + this.velocity.y - this.radius;
    // wall collision
    if (leftSide < 0 || rightSide > WIDTH) {
      // if (this.velocity.x < 0) this.velocity.x = --this.velocity.x * -1;
      // else this.velocity.x = ++this.velocity.x * -1;
      this.velocity.x = -this.velocity.x;
    }
    if (topSide < 0 || bottomSide > HEIGHT) {
      // if (this.velocity.y < 0) this.velocity.y = --this.velocity.y * -1;
      // else this.velocity.y = ++this.velocity.y * -1;
      this.velocity.y = -this.velocity.y;
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

// create balls
const ball = new Ball(20);

// recursive callback function to update screen display
function animate() {
  //   ctx.fillStyle = "black";
  //   ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ball.update();
  requestAnimationFrame(animate);
}

animate();
