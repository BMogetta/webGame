window.addEventListener('load', function() {
  //canvas setup
  const canvas = document.getElementById('canvas1'); //TODO: or try this.doc...
  const ctx = canvas.getContext('2d');
  canvas.width = 1500;
  canvas.height = 500;

  class InputHandler  {
    
    constructor(game){
      this.game = game;
      // user press a key
      window.addEventListener('keydown', (e) => {
        if (  
          ((e.key === 'ArrowUp') || (e.key === 'ArrowDown') ) 
          && (this.game.keys.indexOf(e.key) === -1)
          ){
          this.game.keys.push(e.key);
        } else if ( e.key === ' ') {
          this.game.player.shootTop();
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
    }

    update(){
      this.x += this.speed;
      if (this.x > this.game.width * 0.8) { //projectiles will be destroyed when they reach 80% of th screen
        this.markedForDeletion = true;
      }
    }

    draw(context) {
      context.fillStyle = 'yellow';
      context.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  class Particle {

  }

  class Player {

    constructor(game) {
      this.game = game;
      this.width = 120;
      this.height = 190;
      this.x = 20;
      this.y = 100;
      this.speedY = 0;
      this.maxSpeed = 2; //chaging this will change the speed of the player
      this.projectiles = [] //hold all current active projectiles
    }

    update(){

      // managing player movement
      if (this.game.keys.includes('ArrowUp')){
        this.speedY = -this.maxSpeed;
      } else if (this.game.keys.includes('ArrowDown')){
        this.speedY = this.maxSpeed;
      } else {
        this.speedY = 0;
      }

      this.y += this.speedY;

      // handle projectiles
      this.projectiles.forEach( projectile => {
        projectile.update();
      });
      // deleting projectiles that reach screen threshold
      this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
    }

    draw(context) {
      context.fillStyle = 'black';
      context.fillRect(
        this.x,
        this.y,
        this.width,
        this.height
      );
      //drawing projectiles
      this.projectiles.forEach( projectile => {
        projectile.draw(context);
      });
    }

    // attack comming from the mouth
    shootTop() {
      if (this.game.ammo > 0){ //shoot only when ammo if available
        this.projectiles.push( new Projectile(this.game, this.x + 30, this.y));
        console.log(this.projectiles);
        this.game.ammo--;
      }
    }
  }

  class Enemy {

    constructor(game){
      this.game = game;
      this.x = this.game.width;
      this.speedX = Math.random() * -1.5 - 0.5; //horizontal speed of enemys
      this.markedForDeletion = false;
      this.lives = 5;
      this.score = this.lives;
    }

    update(){
      this.x += this.speedX;
      // deleting enemys that reach end screen
      if (this.x + this.width < 0) this.markedForDeletion = true;
    }

    draw(context) {
      context.fillStyle = 'red';
      context.fillRect(this.x, this.y, this.width, this.height);
      context.fillStyle = 'black';
      context.font = '20px Helvetica';
      context.fillText(this.lives, this.x, this.y);
    }
  }

  class Angler1 extends Enemy {
    constructor(game){
      super(game);
      this.width = 228 * 0.2;
      this.height = 169 * 0.2;
      // starting of enemy position between 0 and 90%, offset by the height of the asset
      this.y = Math.random() * (this.game.height * 0.9 - this.height);
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
      this.fontFamily = 'Helvetica';
      this.color = 'white';
    }

    draw(context){

      context.save();

      context.fillStyle = this.color;
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;
      context.shadowColor = 'black';
      context.font = this.frontSize + 'px' + this.fontFamily;
      
      // score
      context.fillText(`Score: ${this.game.score}`, 20, 40 )
      
      // ammo
      for (let i = 0; i < this.game.ammo; i++) {
        context.fillRect(20 + 5 * i , 50, 3, 20);
      }

      // timer 
      const formattedTime = (this.game.gameTime * 0.001 ).toFixed(1)
      context.fillText(`Timer: ${formattedTime}`, 20, 100);

      // game over messages
      if (this.game.gameOver) {
        context.textAlign = 'center';
        let message1;
        let message2;

        if (this.game.score > this.game.winningScore) {
          message1 = 'You Win!';
          message2 = 'Well done!';
        } else {
          message1 = 'You Lose!';
          message2 = 'Try again!';
        }
        // displaying gameOver messages
        context.font = '50px' + this.fontFamily;
        context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 40);
        context.font = '25px' + this.fontFamily;
        context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 40);
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
      this.enemies = []; // to track enemies+
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
      this.timeLimit = 5000;
      this.speed = 1; // centralize speed control
    }

    update(deltaTime) {

      // keeping track of time in current game
      if (!this.gameOver) this.gameTime += deltaTime;

      if ( this.gameTime > this.timeLimit ) this.gameOver = true;

      this.background.layer4.update();
      this.background.update();

      this.player.update();

      // handling ammo time base recharge
      if ( this.ammoTimer > this.ammoInterval) {
        if (this.ammo < this.maxAmmo ) this.ammo++;
        this.ammoTimer = 0;
      } else {
        this.ammoTimer += deltaTime;
      }

      // handling enemy spanw
      this.enemies.forEach(enemy => {
        enemy.update();
        // despawning enemy that collide with the player
        if (this.checkCollision(this.player, enemy)) {
          enemy.markedForDeletion = true;
        }
        // implementing projectile damage to enemies
        this.player.projectiles.forEach(projectile => {
          if ( this.checkCollision(projectile, enemy)) {
            enemy.lives--;
            projectile.markedForDeletion = true;
            // despawning enemy whos live reach 0 and adding player score
            if (enemy.lives <= 0) {
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
      this.player.draw(context);
      this.ui.draw(context);
      this.enemies.forEach(enemy => {
        enemy.draw(context);
      });
      this.background.layer4.draw(context);
    }

    addEnemy(){
      this.enemies.push(new Angler1(this));
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