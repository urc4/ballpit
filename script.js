const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const CTX = canvas.getContext("2d");

const COLOR_PALETTE = [
  "#66FF00",
  "#1974D2",
  "#08E8DE",
  "#FFF000",
  "#FFAA1D",
  "#FF007F",
  "#F2F2F2",
];

const getRandomColor = () =>
  COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];

const getRandomPosition = () => {
  position = {};
  position.x = Math.floor(Math.random() * WIDTH);
  position.y = Math.floor(Math.random() * HEIGHT);
  return position;
};

const getRandomDirection = () => {
  direction = {};
  const x = Math.random();
  const y = Math.random();
  const norm = Math.sqrt(x ** 2 + y ** 2);
  direction.x = x / norm;
  direction.y = y / norm;
  return direction;
};

const dotProduct = (vec1, vec2) => vec1.x * vec2.x + vec1.y * vec2.y;

class Ball {
  constructor(radius) {
    this.radius = radius;
    this.color = getRandomColor();

    this.position = getRandomPosition();
    if (this.position.x + this.radius > WIDTH)
      this.position.x = WIDTH - 5 * this.radius;
    else if (this.position.x - this.radius < 0)
      this.position.x = 5 * this.radius;
    if (this.position.y + this.radius > HEIGHT)
      this.position.y = HEIGHT - 5 * this.radius;
    else if (this.position.y - this.radius < 0)
      this.position.y = 5 * this.radius;

    const direction = getRandomDirection();
    this.speed = 5;
    this.velocity = {
      x: direction.x * this.speed,
      y: direction.y * this.speed,
    };
    this.changedDirection = false;
  }

  draw() {
    CTX.beginPath();
    CTX.fillStyle = this.color;
    CTX.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
    CTX.fill();
    CTX.closePath();
  }

  updateWallCollision() {
    // get rid of + this.velocity. ...?
    const leftSide = this.position.x + this.velocity.x - this.radius;
    const rightSide = this.position.x + this.velocity.x + this.radius;
    const bottomSide = this.position.y + this.velocity.y + this.radius;
    const topSide = this.position.y + this.velocity.y - this.radius;

    if (leftSide < 0 || rightSide > WIDTH) {
      this.velocity.x = -this.velocity.x;
      this.changedDirection = true;
    }
    if (topSide < 0 || bottomSide > HEIGHT) {
      this.velocity.y = -this.velocity.y;
      this.changedDirection = true;
    }
  }

  update() {
    this.draw();
    this.updateWallCollision();
    if (this.changedDirection) {
      const color = this.color;
      do {
        this.color = getRandomColor();
      } while (this.color === color);
    }
    this.changedDirection = false;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class BallPit {
  constructor(pitInit) {
    this.balls = [];
    for (let i = 0; i < pitInit.numberBalls; i++) {
      this.balls.push(new Ball(pitInit.ballRadius));
    }
    this.collisionMatrix = [];
    for (let i = 0; i < this.balls.length; i++) {
      this.collisionMatrix[i] = new Array(this.balls.length).fill(false);
    }
    // gotta make sure they are spread out when initiated
    this.updateStartPositions();
  }
  addBall(radius) {
    //NOT WORKING PROPERLY
    this.balls.push(new Ball(radius || 50));
    // would also have to create a new row and column in colisionmatrix
    // gotta also start in a valid place
    // can update collisino matrix and check it last row is all false if not get a new position
    this.collisionMatrix = [];
    for (let i = 0; i < this.balls.length; i++) {
      this.collisionMatrix[i] = new Array(this.balls.length).fill(false);
    }
    this.updateCollisionMatrix();
    const lastBallIndex = this.balls.length - 1;
    let isValidPosition = false;
    while (!isValidPosition) {
      for (let j = 0; j < this.collisionMatrix[lastBallIndex].length; j++) {
        isValidPosition =
          isValidPosition || !this.collisionMatrix[lastBallIndex][j];
      }
      this.balls.position = getRandomPosition();
    }
  }
  removeBall() {
    //NOT WORKING PROPERLY
    this.balls.pop();
    // updateMatrixColision
  }

  checkIntersection(ball_1, ball_2) {
    const distanceSquared =
      (ball_2.position.x +
        ball_2.velocity.x -
        (ball_1.position.x + ball_1.velocity.x)) **
        2 +
      (ball_2.position.y +
        ball_2.velocity.y -
        (ball_1.position.y + ball_1.velocity.y)) **
        2;
    const minimumDistanceSquared = (ball_1.radius + ball_2.radius) ** 2;
    return distanceSquared < minimumDistanceSquared;
  }

  updateCollisionMatrix() {
    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        const ball_1 = this.balls[i];
        const ball_2 = this.balls[j];
        const intersect = this.checkIntersection(ball_1, ball_2);
        this.collisionMatrix[i][j] = intersect;
        this.collisionMatrix[j][j] = intersect;
      }
    }
  }
  // basics elastic collisions with vectors gotta add weight here
  changeDirections(ball_1, ball_2) {
    ball_1.changedDirection = true;
    ball_2.changedDirection = true;

    const v1 = ball_1.velocity;
    const v2 = ball_2.velocity;

    const x1 = ball_1.position.x;
    const x2 = ball_2.position.x;
    const y1 = ball_1.position.y;
    const y2 = ball_2.position.y;
    // mass is proportional to radius squared
    const m1 = ball_1.radius ** 2;
    const m2 = ball_2.radius ** 2;

    const deltaX = x2 - x1;
    const deltaY = y2 - y1;

    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    const normX = deltaX / distance;
    const normY = deltaY / distance;

    const v1n = dotProduct({ x: normX, y: normY }, v1);
    const v2n = dotProduct({ x: normX, y: normY }, v2);
    // we are taking the perpendicular unit vector in respect to the distance vector
    const v1t = dotProduct({ x: -normY, y: normX }, v1);
    const v2t = dotProduct({ x: -normY, y: normX }, v2);
    // tangent line to collision does not change velocity prime is same as v1` but could be derivative as well which can lead to confusion
    const v1tPrime = v1t;
    const v2tPrime = v2t;
    // conservation of momentum in normal line to centers because sum of forces = 0
    const v1nPrime = (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);
    const v2nPrime = (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);
    // project final x speed over inversed distance unit vector (-normY,normX)
    //  basically doing (v->) - (2*vn->)
    v1.x = v1nPrime * normX + v1tPrime * -normY;
    v1.y = v1nPrime * normY + v1tPrime * normX;

    v2.x = v2nPrime * normX + v2tPrime * -normY;
    v2.y = v2nPrime * normY + v2tPrime * normX;

    // check if balls overlap and make sure they dont get stuck
    const overlap = (ball_1.radius + ball_2.radius - distance) / 2;
    // seocnd term is direction and first one is how much to move based on how much they overlap
    ball_1.position.x -= (overlap * (x1 - x2)) / distance;
    ball_1.position.y -= (overlap * (y1 - y2)) / distance;
    ball_2.position.x += (overlap * (x1 - x2)) / distance;
    ball_2.position.y += (overlap * (y1 - y2)) / distance;
  }

  updateStartPositions() {
    this.updateCollisionMatrix();
    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        while (this.collisionMatrix[i][j]) {
          this.balls[j].position = getRandomPosition(
            this.updateCollisionMatrix()
          );
        }
      }
    }
  }

  updateCollisions() {
    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        if (this.collisionMatrix[i][j]) {
          this.changeDirections(this.balls[i], this.balls[j]);
          this.collisionMatrix[i][j] = false;
          this.collisionMatrix[j][i] = false;
        }
      }
    }
  }
  update() {
    this.updateCollisionMatrix();
    this.updateCollisions();
    for (const ball of this.balls) {
      ball.update();
    }
  }
}
// create balls
const pitInit = {
  ballRadius: 20,
  numberBalls: 10,
};

const ballPit = new BallPit(pitInit); //does new keyword return a pointer?

function animate() {
  CTX.clearRect(0, 0, WIDTH, HEIGHT);
  ballPit.update();
  requestAnimationFrame(animate);
}
// recursive callback function to update screen display
animate();
