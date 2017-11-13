import device;

import ui.TextView as TextView;
import ui.StackView as StackView;

import src.screens.MenuScreen as MenuScreen;
import src.screens.GameScreen as GameScreen;

exports = Class(GC.Application, function () {

  this.initUI = function () {

    this.engine.updateOpts({
      preload: ['resources/images']
    });

    const baseHeight = 1024;
    let baseWidth = 576;
    let rootViewXPos = (device.width - baseWidth) / 2;

    const iPhoneRatio = 16/9;
    const deviceRatio = device.height / device.width;
    const deviceRatioThreshold = deviceRatio * 0.05;

    if (deviceRatio < iPhoneRatio + deviceRatioThreshold && deviceRatio > iPhoneRatio - deviceRatioThreshold) {

      // it seems like this is iPhone
      // calculate width
      baseWidth = (baseHeight * device.width) / device.height;
      rootViewXPos = 0;
    }

    this.view.style.scale = device.height / baseHeight;

    this._rootView = new StackView({
      superview: this,
      x: rootViewXPos,
      y: 0,
      width: baseWidth,
      height: baseHeight,
      clip: true
    });

    this._menuScreen = new MenuScreen({
      superview: this
    });

    this._menuScreen.on(this._menuScreen.EVENT_START_GAME, bind(this, this._onStartGame));

    // this._menuScreen.show();

    // Initiate game screen
    this._gameScreen = new GameScreen({
      x: 0,
      y: 0,
      width: baseWidth,
      height: baseHeight
    });

    this._gameScreen.on(this._gameScreen.EVENT_END_GAME, bind(this, this._onEndGame));

    // this._rootView.push(this._menuScreen);
    this._rootView.push(this._gameScreen);
    this._gameScreen.emit(this._gameScreen.EVENT_RESET_GAME);
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
    // this._rootView.pop();
    // this._menuScreen.show();
  }

});
