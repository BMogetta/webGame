import {Angler1, Angler2, LuckyFish, HiveWhale, Drone, SmokeExplosion, FireExplosion, Player, Background, Particle, UI, InputHandler} from '../index.js'

class Game {

  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.background = new Background(this);
    this.player = new Player(this);
    this.input = new InputHandler(this);
    this.ui = new UI(this);
    //this.player = []; TODO: despawn enemies
    this.keys = []; // to track pressed keys
    this.enemies = []; // to track enemies
    this.particles = []; // to track particles
    this.explosions = []; // to track explosions
    this.enemyTimer = 0;
    this.enemyInterval = 2000; //enemy cooldown in ms
    this.ammo = 20; // initial ammo
    this.maxAmmo = 50;
    this.ammoTimer = 0;
    this.ammoInterval = 350; //ammo cooldown time in ms
    this.gameOver = false;
    this.score = 0; // player score
    this.winningScore = 100; //reach this to win, consider adding difficulty
    this.gameTime = 0;
    this.timeLimit = 15000;
    this.speed = 1; // centralize speed control
    this.debug = false;
  }

  update(deltaTime) {

    /*
    if (this.player.length === 0) {
      this.player.push(new Player(this))
    }*/

    // adding lossing condition when score try to go negative
    if (this.score < 0) {
      this.gameOver = true;
      this.score = 0;
    }

    // keeping track of time in current game
    if (!this.gameOver) this.gameTime += deltaTime;

    if ( this.gameTime > this.timeLimit ) this.gameOver = true;
    
    // despanw enemies when game ends and player win
    if (this.gameOver && this.score >= this.winningScore) {
      this.enemies.forEach(enemy => {
        this.addExplosion(enemy);
        for (let i = 0; i < enemy.score; i++){
          this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
        }
        enemy.markedForDeletion = true;
      })
    }

    if (this.gameOver && this.score < this.winningScore) {
      
      this.player.markedForDeletion = true;
    }

    this.background.layer4.update();
    this.background.update();

    this.player.update(deltaTime);

    // handling ammo time base recharge
    if ( this.ammoTimer > this.ammoInterval) {
      if (this.ammo < this.maxAmmo ) this.ammo++;
      this.ammoTimer = 0;
    } else {
      this.ammoTimer += deltaTime;
    }

    // handling particles
    this.particles.forEach(particle => particle.update());
    this.particles = this.particles.filter(particle => !particle.markedForDeletion);

    // handling explosions
    this.explosions.forEach(explosion => explosion.update(deltaTime));
    this.explosions = this.explosions.filter(explosion => !explosion.markedForDeletion);

    // handling enemy spanw
    this.enemies.forEach(enemy => {
      enemy.update();
      // despawning enemy that collide with the player
      if (this.checkCollision(this.player, enemy)) {
        enemy.markedForDeletion = true;
        this.addExplosion(enemy);
        // fallen particles after player/enemy crash
        for (let i = 0; i < enemy.score; i++){
          this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
        }
        // handling collision with normal | lucky enemies
        if (enemy.type === 'lucky') this.player.enterPowerUp();
        else if (!this.gameOver) this.score--;
      }

      // implementing projectile damage to enemies
      this.player.projectiles.forEach(projectile => {
        
        if ( this.checkCollision(projectile, enemy)) {
          
          enemy.lives--;
          projectile.markedForDeletion = true;
          // fallen particles after enemy is hiten
          this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
          
          // despawning enemy whos live reach 0 and adding player score
          if (enemy.lives <= 0) {

            // fallen particles after player/enemy crash
            for (let i = 0; i < enemy.score; i++){
              this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
            }

            enemy.markedForDeletion = true;
            this.addExplosion(enemy);

            if (enemy.type === 'hive') {
              for (let i = 0; i < 5; i++) {
                this.enemies.push(
                  new Drone(
                    this, 
                    enemy.x + Math.random() * enemy.width, 
                    enemy.y + 0.5 * enemy.height
                  )
                );
              }
            }
            
            if (!this.gameOver) this.score += enemy.score; // different enemies give different points
            if (this.score > this.winningScore) this.gameOver = true; // winning condition
          }
        }
      })
    });

    this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
    if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
      this.addEnemy();
      this.enemyTimer = 0;
    } else {
      this.enemyTimer += deltaTime;
    }
  } //end of update method

  draw(context){
    this.background.draw(context);
    this.ui.draw(context);
    this.player.draw(context);
    this.particles.forEach(particle => particle.draw(context));
    this.enemies.forEach(enemy => enemy.draw(context));
    this.explosions.forEach(explosion => explosion.draw(context));
    this.background.layer4.draw(context);
  }

  addEnemy(){

    const randomize = Math.random();
    // using random numbers to create random enemies
    if (randomize < 0.3) this.enemies.push(new Angler1(this));
    else if (randomize < 0.6) this.enemies.push(new Angler2(this));
    else if (randomize < 0.8) this.enemies.push(new HiveWhale(this));
    else this.enemies.push(new LuckyFish(this));
  }

  addExplosion(enemy){
    const randomize = Math.random();
    // using random numbers to create random explosion
    if (randomize < 0.5) this.explosions.push(new SmokeExplosion(this, enemy.x + 0.5 * enemy.width, enemy.y + 0.5 * enemy.height));
    else this.explosions.push(new FireExplosion(this, enemy.x + 0.5 * enemy.width, enemy.y + 0.5 * enemy.height));
  }

  checkCollision(rect1, rect2){ 
    return ( //if at least 1 statement if false, there is no collision
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y 
    )
  }
}

export {Game};
