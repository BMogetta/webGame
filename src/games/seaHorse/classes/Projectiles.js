class Projectile {

  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 3;
    this.speed = 3; //projectile speed
    this.markedForDeletion = false;
    this.image = document.getElementById('projectile');
  }

  update(){
    this.x += this.speed;
    if (this.x > this.game.width * 0.8) { //projectiles will be destroyed when they reach 80% of th screen
      this.markedForDeletion = true;
    }
  }

  draw(context) {
    
    // drawing projectile
    context.drawImage(
      this.image,
      this.x, 
      this.y
    );
  }
}

export {Projectile};
