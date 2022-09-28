window.addEventListener('load', function() {
  //canvas setup
  const canvas = this.document.getElementById('canvas1');
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
    }

    update(){
      this.x += this.speedX;
      // deleting enemys that reach end screen
      if (this.x + this.width < 0) this.markedForDeletion = true;
    }

    draw(context) {
      context.fillStyle = 'red';
      context.fillRect = (this.x, this.y, this.width, this.height);
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

  class Layer {

  }

  class Background {

  }

  class UI {
    constructor(game){
      this.game = game;
      this.frontSize = 25;
      this.fontFamily = 'Helvetica';
      this.color = 'yellow';
    }

    draw(context){
      // ammo
      context.fillStyle = this.color;
      for (let i = 0; i < this.game.ammo; i++) {
        context.fillRect(20 + 5 * i , 50, 3, 20);
      }
    }
  }

  class Game {

    constructor(width, height) {
      this.width = width;
      this.height = height;
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
    }

    update(deltaTime) {
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
      });
      this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
      if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
        this.addEnemy();
        this.enemyTimer = 0;
      } else {
        this.enemyTimer += deltaTime;
      }
    }

    draw(context){
      this.player.draw(context)
      this.ui.draw(context)
      this.enemies.forEach(enemy => {
        enemy.draw(context);
      })
    }

    addEnemy(){
      this.enemies.push(new Angler1(this));
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