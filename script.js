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
  return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
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
    this.speed = 5;
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
    // also add to check if there are any oteher balls

    this.direction = getRandomDirection();
    this.velocity = {
      x: this.direction.x * this.speed,
      y: this.direction.y * this.speed,
    };
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }

  update() {
    this.draw();
    const color = this.color;
    const leftSide = this.position.x + this.velocity.x - this.radius;
    const rightSide = this.position.x + this.velocity.x + this.radius;
    const bottomSide = this.position.y + this.velocity.y + this.radius;
    const topSide = this.position.y + this.velocity.y - this.radius;
    // wall collision
    if (leftSide < 0 || rightSide > WIDTH) {
      // if (this.velocity.x < 0) this.velocity.x = --this.velocity.x * -1;
      // else this.velocity.x = ++this.velocity.x * -1;
      this.velocity.x = -this.velocity.x;
      do {
        this.color = getRandomColor();
      } while (this.color === color);
      // gotta make sure it does not get the same value
      // make a return statement with ||
    }
    if (topSide < 0 || bottomSide > HEIGHT) {
      // if (this.velocity.y < 0) this.velocity.y = --this.velocity.y * -1;
      // else this.velocity.y = ++this.velocity.y * -1;
      this.velocity.y = -this.velocity.y;
      do {
        this.color = getRandomColor();
      } while (this.color === color);
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class BallPit {
  constructor(pitInit) {
    this.ballRadius = pitInit.ballRadius;
    this.balls = [];
    for (let i = 0; i < pitInit.numberBalls; i++) {
      this.balls.push(new Ball(this.ballRadius));
    }
    this.collisionMatrix = [];
    for (let i = 0; i < pitInit.numberBalls; i++) {
      this.collisionMatrix[i] = new Array(pitInit.numberBalls).fill(false);
    }
  }
  addBall() {
    this.balls.push(new Ball(this.ballRadius));
  }
  removeBall() {
    this.balls.pop();
  }

  checkIntersection(ballOne, ballTwo) {
    const distanceSquared =
      (ballTwo.position.x +
        ballTwo.velocity.x -
        (ballOne.position.x + ballOne.velocity.x)) **
        2 +
      (ballTwo.position.y +
        ballTwo.velocity.y -
        (ballOne.position.y + ballOne.velocity.y)) **
        2;
    const minimumDistanceSquared = (ballOne.radius + ballTwo.radius) ** 2;
    // console.log(distanceSquared < minimumDistanceSquared);
    return distanceSquared < minimumDistanceSquared;
  }

  updateCollisionMatrix() {
    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        const ballOne = this.balls[i];
        const ballTwo = this.balls[j];
        const intersect = this.checkIntersection(ballOne, ballTwo);
        this.collisionMatrix[i][j] = intersect;
        this.collisionMatrix[j][j] = intersect;
      }
    }
  }
  changeDirections(ballOne, ballTwo) {
    ballOne.color = "red";
    ballTwo.color = "red";
  }
  updateCollisions() {
    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        if (this.collisionMatrix[i][j]) {
          this.changeDirections(this.balls[i], this.balls[j]);
        }
      }
    }
  }
  update() {
    for (const ball of this.balls) {
      ball.update();
    }
    this.updateCollisionMatrix();
    this.updateCollisions();
  }
}
// create balls
const pitInit = {
  ballRadius: 20,
  numberBalls: 5,
};
const ballPit = new BallPit(pitInit);
// recursive callback function to update screen display
function animate() {
  //   ctx.fillStyle = "black";
  //   ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ballPit.update();
  requestAnimationFrame(animate);
}

animate();
