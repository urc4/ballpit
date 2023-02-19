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
    this.speed = 3;
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
    const color = this.color;
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

    if (this.changedDirection) {
      do {
        this.color = getRandomColor();
      } while (this.color === color);
    }
    this.changedDirection = false;
  }

  update() {
    this.draw();
    this.updateWallCollision();
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
    const colorOne = ball_1.color;
    const colorTwo = ball_2.color;
    do {
      ball_1.color = getRandomColor();
    } while (ball_1.color === colorOne);
    do {
      ball_2.color = getRandomColor();
    } while (ball_2.color === colorTwo);
    const distance = Number(
      Math.sqrt(
        (ball_2.position.x +
          ball_2.velocity.x -
          ball_1.position.x -
          ball_1.velocity.x) **
          2 +
          (ball_2.position.y +
            ball_2.velocity.y -
            ball_1.position.y -
            ball_1.velocity.y) **
            2
      ).toFixed(3)
    );
    const distanceVector = {
      x:
        (ball_2.position.x +
          ball_2.velocity.x -
          ball_1.position.x -
          ball_1.velocity.x) /
        distance,
      y:
        (ball_2.position.y +
          ball_2.velocity.y -
          ball_1.position.y -
          ball_2.velocity.y) /
        distance,
    };

    const ball_1NewDirection = {
      x:
        ball_1.velocity.x -
        2 * dotProduct(ball_1.velocity, distanceVector) * distanceVector.x,
      y:
        ball_1.velocity.y -
        2 * dotProduct(ball_1.velocity, distanceVector) * distanceVector.y,
    };
    const ball_2NewDirection = {
      x:
        ball_2.velocity.x -
        2 * dotProduct(ball_2.velocity, distanceVector) * distanceVector.x,
      y:
        ball_2.velocity.y -
        2 * dotProduct(ball_2.velocity, distanceVector) * distanceVector.y,
    };
    const normOne = Math.sqrt(
      ball_1NewDirection.x ** 2 + ball_1NewDirection.y ** 2
    );
    const normTwo = Math.sqrt(
      ball_2NewDirection.x ** 2 + ball_2NewDirection.y ** 2
    );
    ball_1.velocity.x = (ball_1NewDirection.x * ball_1.speed) / normOne;
    ball_1.velocity.y = (ball_1NewDirection.y * ball_1.speed) / normOne;
    ball_2.velocity.x = (ball_2NewDirection.x * ball_2.speed) / normTwo;
    ball_2.velocity.y = (ball_2NewDirection.y * ball_2.speed) / normTwo;
    // when they are going the same positive direction it just breaks
    // thats because the velocity is a littlw f=differnet from rounding I guess
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
