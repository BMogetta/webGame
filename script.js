window.addEventListener('load', function() {
  //canvas setup
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 1500;
  canvas.height = 500;

  class InputHandler  {
    
    constructor(game){
      this.game = game;
      // user press a key
      window.addEventListener('keydown', (e) => {
        if (  // move up | down
          ((e.key === 'ArrowUp') || (e.key === 'ArrowDown') ) 
          && (this.game.keys.indexOf(e.key) === -1)
          ){
          this.game.keys.push(e.key);
        } else if ( e.key === ' ') { // shoot
          this.game.player.shootTop();
        } else if (e.key === 'd') { // enable | disable debug mode
          this.game.debug = !this.game.debug;
        }
      });

      // user let go the key
      window.addEventListener('keyup', (e) => {
        if (this.game.keys.indexOf(e.key) >  -1) {
          this.game.keys.splice(this.game.keys.indexOf(e.keys, 1));
        }
      })
    }
  }

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

  class Particle {
    
    constructor(game, x, y){
      this.game = game;
      this.x = x;
      this.y = y;
      this.image = document.getElementById('gears');
      this.frameX = Math.floor(Math.random() * 3); // random particle
      this.frameY = Math.floor(Math.random() * 3);
      this.spriteSize = 50;
      this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
      this.size = this.spriteSize * this.sizeModifier; // random particle size
      this.speedX = Math.random() * 6 - 3; // random left | right particle falldown
      this.speedY = Math.random() * -15;
      this.gravity = 0.5;
      this.markedForDeletion = false;
      this.angle = 0; // rotation angle for particles
      this.va = Math.random() * 0.2 - 0.1; // random angular velocity
      this.bounced = 0;
      this.bottomBounceBoundary = Math.random() * 80 + 60; // bouncing point for particles
    }

    update(){
      this.angle += this.va;
      this.speedY += this.gravity;
      this.x -= this.speedX + this.game.speed;
      this.y += this.speedY

      // delete particles that reach end of screen or fall down of screen
      if (this.y > this.game.height + this.size || this.x < 0 - this.size) this.markedForDeletion = true;
      
      // handling particle bouncing
      if( this.y > this.game.height - this.bottomBounceBoundary && this.bounced < 2) {
        this.bounced++;
        this.speedY *= -0.5;
      }
    }

    draw(context){
      
      // drawing particles
      context.save();
      context.translate(this.x, this.y);
      context.rotate(this.angle);
      context.drawImage(
        this.image,
        this.frameX * this.spriteSize, //source x
        this.frameY * this.spriteSize, //source y
        this.spriteSize, //source width
        this.spriteSize, //source height
        this.size * -0.5, 
        this.size * -0.5, 
        this.size,
        this.size
      );
      context.restore();
    }
  }

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
      this.y = Math.random() * (this.game.height * 0.9 - this.height);
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
      this.y = Math.random() * (this.game.height * 0.9 - this.height);
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
      this.y = Math.random() * (this.game.height * 0.9 - this.height);
      this.image = document.getElementById('lucky');
      this.frameY = Math.floor(Math.random() * 2); // select a random angler2 animation row
      this.lives = 3;
      this.score = 15;
      this.type = 'lucky';
    }
  }

  // Layer will handle the logic for each individual background layer object
  class Layer {
    
    constructor(game, image, speedModifier) {
      this.game = game;
      this.image = image;
      this.speedModifier = speedModifier;
      this.width = 1768;
      this.height = 500;
      this.x = 0;
      this.y = 0;
    }

    update(){
      if (this.x <= -this.width) this.x = 0; // background image as reach end of screen, scroll again
      this.x -= this.game.speed * this.speedModifier;
    }

    draw(context) {
      context.drawImage(this.image, this.x, this.y);
      // offset second layer to camouflage transition between image loops
      context.drawImage(this.image, this.x + this.width, this.y);
    }
  }

  // Background will handle all layers to create game's wolrd
  class Background {
    
    constructor(game){
      this.game = game;
      // images
      this.image1 = document.getElementById('layer1');
      this.image2 = document.getElementById('layer2');
      this.image3 = document.getElementById('layer3');
      this.image4 = document.getElementById('layer4');
      // layers
      this.layer1 = new Layer(this.game, this.image1, 0.2);
      this.layer2 = new Layer(this.game, this.image2, 0.4);
      this.layer3 = new Layer(this.game, this.image3, 1);
      this.layer4 = new Layer(this.game, this.image4, 1.5);
      this.layers = [this.layer1, this.layer2, this.layer3];
    }

    update(){
      this.layers.forEach(layer => layer.update());
    }

    draw(context){
      this.layers.forEach(layer => layer.draw(context));
    }
  }

  class UI {
    constructor(game){
      this.game = game;
      this.frontSize = 25;
      this.fontFamily = 'Bangers';
      this.bigFontFamily = 'Nabla';
      this.color = 'white';
    }

    draw(context){

      context.save();

      context.fillStyle = this.color;
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;
      context.shadowColor = 'black';
      context.font = `${this.frontSize}px ${this.fontFamily}`;
      
      // score
      context.fillText(`Score: ${this.game.score}`, 20, 40 )

      // timer 
      const formattedTime = (this.game.gameTime * 0.001 ).toFixed(1)
      context.fillText(`Timer: ${formattedTime}`, 20, 100);

      // game over messages
      if (this.game.gameOver) {
        context.textAlign = 'center';
        let message1;
        let message2;

        if (this.game.score > this.game.winningScore) {
          message1 = 'Victory';
          message2 = 'Enemies were owned!';
        } else {
          message1 = 'Defeat';
          message2 = 'Try again, if you dare';
        }
        // displaying gameOver messages
        context.font = `150px ${this.bigFontFamily}`;
        context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 45);
        context.font = `75px ${this.fontFamily}`;
        context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 60);
      }

      // ammo
      if (this.game.player.powerUp) context.fillStyle = 'red'
      for (let i = 0; i < this.game.ammo; i++) {
        context.fillRect(20 + 5 * i , 50, 3, 20);
      }

      context.restore();
    }
  }

  class Game {

    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.background = new Background(this);
      this.player = new Player(this);
      this.input = new InputHandler(this);
      this.ui = new UI(this);
      this.keys = []; // to track pressed keys
      this.enemies = []; // to track enemies
      this.particles = []; // to track particles
      this.enemyTimer = 0;
      this.enemyInterval = 1000; //enemy cooldown in ms
      this.ammo = 20; // initial ammo
      this.maxAmmo = 50;
      this.ammoTimer = 0;
      this.ammoInterval = 500; //ammo cooldown time in ms
      this.gameOver = false;
      this.score = 0; // player score
      this.winningScore = 10; //reach this to win, consider adding difficulty
      this.gameTime = 0;
      this.timeLimit = 50000;
      this.speed = 1; // centralize speed control
      this.debug = false;
    }

    update(deltaTime) {

      // keeping track of time in current game
      if (!this.gameOver) this.gameTime += deltaTime;

      if ( this.gameTime > this.timeLimit ) this.gameOver = true;
      
      // despanw enemies when game ends TODO: try to make them drop of screen instead of evaporating
      if (this.gameOver) {
        this.enemies.forEach(enemy => {
          enemy.markedForDeletion = true;
        })
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

      // handling enemy spanw
      this.enemies.forEach(enemy => {
        enemy.update();
        // despawning enemy that collide with the player
        if (this.checkCollision(this.player, enemy)) {
          enemy.markedForDeletion = true;
          // fallen particles after player/enemy crash
          for (let i = 0; i < 10; i++){
            this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
          }
          // handling collision with normal | lucky enemies
          if (enemy.type === 'lucky') this.player.enterPowerUp();
          else this.score--;
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
              for (let i = 0; i < 5; i++){
                this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
              }

              enemy.markedForDeletion = true;
              
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
      this.background.layer4.draw(context);
    }

    addEnemy(){

      const randomize = Math.random();
      // using random numbers to create random enemies
      if (randomize < 0.4) this.enemies.push(new Angler1(this));
      else if (randomize < 0.8) this.enemies.push(new Angler2(this));
      else this.enemies.push(new LuckyFish(this));
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

  const game = new Game(canvas.width, canvas.height);

  let lastTime = 0;

  // animation loop
  function animate(timeStamp) {

    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update(deltaTime);
    game.draw(ctx);
    requestAnimationFrame(animate);
  }

  animate(0); //pass 0 as initial timeStamp
})