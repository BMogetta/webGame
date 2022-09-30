class Enemy {

  constructor(game){
    this.game = game;
    this.x = this.game.width;
    this.speedX = Math.random() * -1.5 - 0.5; //horizontal speed of enemys
    this.markedForDeletion = false;
    this.frameX = 0;
    this.frameY = 0;
    this.maxFrame = 37;
  }

  update(){

    // moving speed
    this.x += this.speedX - this.game.speed;

    // deleting enemys that reach end screen
    if (this.x + this.width < 0) this.markedForDeletion = true;

    // handle sprite animation
    if (this.frameX < this.maxFrame){
      this.frameX++;
    } else {
      this.frameX = 0;
    }
  }

  draw(context) {
    // display hitbox in debug mode
    if (this.game.debug) {
      context.strokeRect(
        this.x,
        this.y,
        this.width,
        this.height
      );
      context.font = '20px Helvetica';
      context.fillText(this.lives, this.x, this.y);
    }
    context.drawImage(
      this.image,
      this.frameX * this.width, //source x
      this.frameY * this.height, //source y
      this.width, //source width
      this.height, //source height
      this.x, 
      this.y,
      this.width,
      this.height
    );
  }
}

class Angler1 extends Enemy {
  
  constructor(game){
    super(game);
    this.width = 228;
    this.height = 169;
    // starting of enemy position between 0 and 90%, offset by the height of the asset
    this.y = Math.random() * (this.game.height * 0.95 - this.height);
    this.image = document.getElementById('angler1');
    this.frameY = Math.floor(Math.random() * 3); // select a random angler1 animation row
    this.lives = 2;
    this.score = this.lives;
  }
}

class Angler2 extends Enemy {
  
  constructor(game){
    super(game);
    this.width = 213;
    this.height = 165;
    // starting of enemy position between 0 and 90%, offset by the height of the asset
    this.y = Math.random() * (this.game.height * 0.95 - this.height);
    this.image = document.getElementById('angler2');
    this.frameY = Math.floor(Math.random() * 2); // select a random angler2 animation row
    this.lives = 3;
    this.score = this.lives;
  }
}

class LuckyFish extends Enemy {
  
  constructor(game){
    super(game);
    this.width = 99;
    this.height = 95;
    // starting of enemy position between 0 and 90%, offset by the height of the asset
    this.y = Math.random() * (this.game.height * 0.95 - this.height);
    this.image = document.getElementById('lucky');
    this.frameY = Math.floor(Math.random() * 2); // select a random angler2 animation row
    this.lives = 3;
    this.score = 15;
    this.type = 'lucky';
  }
}

class HiveWhale extends Enemy {
  
  constructor(game){
    super(game);
    this.width = 400;
    this.height = 227;
    // starting of enemy position between 0 and 90%, offset by the height of the asset
    this.y = Math.random() * (this.game.height * 0.95 - this.height);
    this.image = document.getElementById('hivewhale');
    this.frameY = 0;
    this.lives = 15;
    this.score = this.lives;
    this.type = 'hive';
    this.speedX = Math.random() * -1.2 -0.2;
  }
}

class Drone extends Enemy {
  
  constructor(game, x, y){
    super(game);
    this.width = 115;
    this.height = 95;
    // starting of enemy position between 0 and 90%, offset by the height of the asset
    this.x = x;
    this.y = y;
    this.image = document.getElementById('drone');
    this.frameY = Math.floor(Math.random() * 2);
    this.lives = 3;
    this.score = this.lives;
    this.type = 'drone';
    this.speedX = Math.random() * -4.2 -0.5;
  }
}

export {Angler1, Angler2, LuckyFish, HiveWhale, Drone};
