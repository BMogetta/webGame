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

export {UI};
