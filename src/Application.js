import ui.TextView as TextView;
import ui.StackView as StackView;

import src.screens.GameScreen as GameScreen;

exports = Class(GC.Application, function () {

  this.initUI = function () {

    this.engine.updateOpts({
      preload: ['resources/images']
    });

    this.baseWidth = 576;
    this.baseHeight = 1024;

    this.view.style.scale = 1.3;

    var rootView = new StackView({
      superview: this,
      x: 0,
      y: 0,
      width: this.baseWidth,
      height: this.baseHeight,
      clip: true
    });

    // Initiate game screen
    var gameScreen = new GameScreen({
      x: 0,
      y: 0,
      width: this.baseWidth,
      height: this.baseHeight
    });

    gameScreen.show();

    // rootView.push(menuScreen);
    rootView.push(gameScreen);
  };

  this.launchUI = function () {

  };

});
