import {Projectile} from './Projectiles.js'

class Player {

  constructor(game) {
    this.game = game;
    this.width = 120;
    this.height = 190;
    this.x = 20;
    this.y = 100;
    this.frameX = 0; // cicle through the spritesheet horizontally
    this.frameY = 0; // determine spritesheet row
    this.maxFrame = 37;
    this.speedY = 0;
    this.maxSpeed = 2; //chaging this will change the speed of the player
    this.projectiles = [] //hold all current active projectiles
    this.image = document.getElementById('player');
    this.powerUp = false;
    this.powerUpTimer = 0;
    this.powerUpLimit = 10000; // changing this will change the power up duration
    this.markedForDeletion = false;
  }

  update(deltaTime){

    // managing player movement
    if (this.game.keys.includes('ArrowUp')){
      this.speedY = -this.maxSpeed;
    } else if (this.game.keys.includes('ArrowDown')){
      this.speedY = this.maxSpeed;
    } else {
      this.speedY = 0;
    }

    this.y += this.speedY;

    //  vertical boundaries
    if (this.y > this.game.height - this.height * 0.5) this.y = this.game.height - this.height * 0.5;
    else if (this.y < -this.height * 0.5) this.y = - this.height * 0.5;

    // handle projectiles
    this.projectiles.forEach( projectile => {
      projectile.update();
    });
    // deleting projectiles that reach screen threshold
    this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);

    // handle sprite animation
    if (this.frameX < this.maxFrame){
      this.frameX++;
    } else {
      this.frameX = 0;
    }

    // power up logic
    if (this.powerUp) {
      
      if (this.powerUpTimer > this.powerUpLimit) { // ending of power up state
        this.powerUpTimer = 0;
        this.powerUp = false;
        this.frameY = 0 ; // change to normal animation
      } else {
        this.powerUpTimer += deltaTime;
        this.frameY = 1; // change to power up animation
        this.game.ammo += 0.1; // ammo recharge faster
      }
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
    }

    // drawing projectiles
    this.projectiles.forEach( projectile => {
      projectile.draw(context);
    });

    // drawing player
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

  // attack comming from the mouth
  shootTop() {
    if (this.game.ammo > 0){ //shoot only when ammo if available
      this.projectiles.push( new Projectile(this.game, this.x + 80, this.y + 33));
      this.game.ammo--;
    }
    if (this.powerUp) this.shootBottom(); // shoot an additional projectile while in power up state
  }

  // second projectile logic
  shootBottom(){
    if (this.game.ammo > 0){ //shoot only when ammo if available
      this.projectiles.push( new Projectile(this.game, this.x + 85, this.y + 165));
    }
  }

  // set up power up state
  enterPowerUp(){
    this.powerUpTimer = 0; //refresh timmer if collide with another lucky enemy while in power up state
    this.powerUp = true;
    if (this.game.ammo < this.game.maxAmmo) this.game.ammo = this.game.maxAmmo;
  }
}

export {Player};
