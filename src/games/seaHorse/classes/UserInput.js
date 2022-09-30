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

export {InputHandler};
