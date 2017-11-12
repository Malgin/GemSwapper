import ui.TextView as TextView;
import ui.StackView as StackView;

import src.screens.MenuScreen as MenuScreen;
import src.screens.GameScreen as GameScreen;

exports = Class(GC.Application, function () {

  this.initUI = function () {

    this.engine.updateOpts({
      preload: ['resources/images']
    });

    this._baseWidth = 576;
    this._baseHeight = 1024;

    this.view.style.scale = 1.3;

    this._rootView = new StackView({
      superview: this,
      x: 0,
      y: 0,
      width: this._baseWidth,
      height: this._baseHeight,
      clip: true
    });

    this._menuScreen = new MenuScreen({
      superview: this
    });

    this._menuScreen.on(this._menuScreen.EVENT_START_GAME, bind(this, this._onStartGame));

    this._menuScreen.show();

    // Initiate game screen
    this._gameScreen = new GameScreen({
      x: 0,
      y: 0,
      width: this._baseWidth,
      height: this._baseHeight
    });

    this._gameScreen.on(this._gameScreen.EVENT_END_GAME, bind(this, this._onEndGame));

    this._rootView.push(this._menuScreen);
    // this._rootView.push(gameScreen);
  };

  this.launchUI = function () {

  };

  this._onStartGame = function() {

    // TODO stop playing menu music
    // TODO start playing game music
    this._menuScreen.hide();
    this._rootView.push(this._gameScreen);
    this._gameScreen.emit(this._gameScreen.EVENT_RESET_GAME);
  };

  this._onEndGame = function() {

    // TODO stop playing any music
    // TODO start playing menu music
    this._rootView.pop();
    this._menuScreen.show();
  }

});
