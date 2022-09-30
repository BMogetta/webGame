class Explosion {
    
  constructor(game, x, y) {
    this.game = game;
    this.frameX = 0;
    this.spriteWidth = 200;
    this.spriteHeight = 200;
    this.width = this.spriteWidth;
    this.height = this.spriteHeight;
    this.x = x - this.width * 0.5;
    this.y = y - this.height * 0.5;
    this.maxFrame = 8;
    this.fps = 25;
    this.timer = 0;
    this.interval = 1000/this.fps;
    this.markedForDeletion = false;
  }

  update(deltaTime) {
    
    this.x -= this.game.speed;

    if (this.timer > this.interval) {
      this.frameX++;
      this.timer = 0;
    } else {
      this.timer += deltaTime;
    }
    
    if (this.frameX > this.maxFrame) this.markedForDeletion = true;
  }

  draw(context){
    context.drawImage(
      this.image,
      this.frameX * this.spriteWidth, //source x
      0, //source y
      this.spriteWidth, //source width
      this.spriteHeight, //source height
      this.x, 
      this.y,
      this.width,
      this.height
    );
  }
}

class SmokeExplosion extends Explosion {
  
  constructor(game, x, y) {
    super(game, x, y);
    this.image = document.getElementById('smokeExplosion');
  }
}

class FireExplosion extends Explosion {
  
  constructor(game, x, y) {
    super(game, x, y);
    this.image = document.getElementById('fireExplosion');
  }
}

export {SmokeExplosion, FireExplosion};
