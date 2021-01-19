let random = (min, max) => (Math.random() * (max - min + 1) + min) | 0;
let firstevent = true;
class Birthday {
  constructor() {
    this.resize();
    this.fireworks = [];
    this.counter = 0;
  }
  resize() {
    this.width = canvas.width = window.innerWidth;
    let center = (this.width / 2) | 0;
    this.spawnA = (center - center / 4) | 0;
    this.spawnB = (center + center / 4) | 0;

    this.height = canvas.height = window.innerHeight;
    this.spawnC = this.height * 0.1;
    this.spawnD = this.height * 0.5;
  }
  onClick(evt) {
    let x = evt.clientX || (evt.touches && evt.touches[0].pageX);
    let y = evt.clientY || (evt.touches && evt.touches[0].pageY);

    let count = random(3, 5);
    for (let i = 0; i < count; i++)
      this.fireworks.push(
        new Firework(
          random(this.spawnA, this.spawnB),
          this.height,
          x,
          y,
          random(300, 450),
          random(30, 110)
        )
      );

    this.counter = -30;
  }
  update() {  
    ctx.fillStyle = "rgba(10,10,60,0.1)";
    ctx.fillRect(0, 0, this.width, this.height);
    for (let firework of this.fireworks) firework.update();
    if (++this.counter === 10) {
      this.fireworks.push(
        new Firework(
          random(this.spawnA, this.spawnB),
          this.height,
          random(0, this.width),
          random(this.spawnC, this.spawnD),
          random(300, 450),
          random(30, 110)
        )
      );
      this.counter = 0;
    }
    if (random(0, 120) > 119 || firstevent) {
      let x = Math.floor(this.width / 2);
      let y = Math.floor(this.height / 4);
 firstevent = false;
      let count = 12;
      for (let i = 0; i < count; i++) {
        this.fireworks.push(
          new Firework(
            random(this.spawnA, this.spawnB),
            this.height,
            x + random(-250, 250),
            y + random(-50, 75),
            random(300, 450),
            random(30, 110)
          )
        );
      }
    } 
    this.fireworks = this.fireworks.filter(firework => !firework.dead);
  }
}

class Firework {
  constructor(x, y, targetX, targetY, shade, offsprings, tracer) {
    this.dead = false;
    this.offsprings = offsprings;
    this.tracer = tracer;

    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.lifetime = 6;
    this.shade = shade;
    this.history = [];
    if (tracer && offsprings <0) {
      this.shade = 0;
      this.isflash = true;
      this.targetY -= 6;
      this.tracer = false;
      this.offsprings = 0;
      this.mag = offsprings;
    }
  }
  update() {
    if (this.dead) return;

    let xDiff = this.targetX - this.x;
    let yDiff = this.targetY - this.y;
    if (Math.abs(xDiff) > 5 || Math.abs(yDiff) > 5) {
      // is still moving
      this.x += xDiff / 20;
      this.y += yDiff / 20;
      if (this.tracer) {
        this.targetY += 2.5;
        if (this.targetY > this.height * 1.25) {
          this.dead = true;
        }
      }
      this.history.push({
        x: this.x,
        y: this.y
      });

      if (this.history.length > 10) this.history.shift();
    } else {
      if (this.offsprings > 0 && !this.madeChilds) {
        let sparks = this.offsprings / 10;
        var hastracers = random(0, 23) > 19;
        var isflash = random(0, 30) > 29;
        for (let i = 0; i < sparks; i++) {
          let targetX =
            (this.x +
              this.offsprings * Math.cos(Math.PI * 2 * i / sparks) * 2) |
            0;
          let targetY =
            (this.y +
              this.offsprings * Math.sin(Math.PI * 2 * i / sparks) * 2) |
            0;

          if (hastracers) {
            birthday.fireworks.push(
              new Firework(
                this.x,
                this.y,
                targetX,
                targetY,
                this.shade,
                0,
                true
              )
            );
          } else {
            if (isflash) {
              this.dead = true;
              birthday.fireworks.push(
                new Firework(
                  this.x,
                  this.y,
                  this.x,
                  this.y,
                  this.shade,
                  -1.25,
                  true
                )
              );
            } else {
              birthday.fireworks.push(
                new Firework(
                  this.x,
                  this.y,
                  targetX,
                  targetY,
                  this.shade,
                  0,
                  false
                )
              );
                            this.dead = true;
              birthday.fireworks.push(
                new Firework(
                  this.x,
                  this.y,
                  this.x,
                  this.y,
                  this.shade,
                  -10,
                  true
                )
              );
            }
          }
        }
      }
      this.madeChilds = true;
      this.history.shift();
    }

    if (this.history.length === 0) this.dead = true;
    else if (this.offsprings)
      for (let i = 0; this.history.length > i; i++) {
        let point = this.history[i];
        ctx.beginPath();
        ctx.fillStyle = "hsl(" + this.shade + ",100%," + i + "%)";
        ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2, false);
        ctx.fill();
      }
    else {
      ctx.beginPath();
      if (this.isflash) {
        for (let j = 0; j < 15; j++) {
          ctx.arc(this.x, this.y, Math.abs(this.mag) + j * j * j, 0, 2 * Math.PI);
          ctx.fillStyle = "hsla(0,100%,100%," + 1 / (j * j * Math.abs(this.mag)) + ")";
          ctx.fill();
        }

        this.dead = true;
      } else if (this.tracer) {
        this.lifetime += 0.15;
        ctx.arc(this.x, this.y, this.lifetime, 0, 2 * Math.PI);
        ctx.strokeStyle =
          "hsla(" +
          this.shade +
          ",150%,50%," +
          (1.75 - this.lifetime / 10) +
          ")";
        ctx.stroke();
      } else {
        ctx.fillStyle = "hsl(" + this.shade + ",150%,50%)";
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2, false);
        ctx.fill();
      }
    }
  }
}

let canvas = document.getElementById("birthday");
let ctx = canvas.getContext("2d");

let birthday = new Birthday();
window.onresize = () => birthday.resize();
document.onclick = evt => birthday.onClick(evt);
document.ontouchstart = evt => birthday.onClick(evt);
(function update() {
  requestAnimationFrame(update);
  birthday.update();
})();
