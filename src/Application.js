import device;
import AudioManager;

import ui.TextView as TextView;
import ui.StackView as StackView;

import src.screens.MenuScreen as MenuScreen;
import src.screens.GameScreen as GameScreen;

const DEFAULT_HEIGHT = 1024;
const DEFAULT_WIDTH = 576;

exports = Class(GC.Application, function () {

  this.initUI = function () {

    this.engine.updateOpts({
      preload: ['resources/images']
    });

    this._music = new AudioManager({
      path: 'resources/sound/music',
      files: {
        main_theme: {
          volume: 0.1,
          background: true
        }
      }
    });

    this._music.play('main_theme');

    this._rootView = new StackView({
      superview: this,
      x: 0,
      y: 0,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      clip: true
    });

    // Initiate game screen
    this._gameScreen = new GameScreen({
      x: 0,
      y: 0,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT
    });

    this._gameScreen.on(this._gameScreen.EVENT_END_GAME, bind(this, this._onEndGame));

    this._onResize();
    device.screen.on('Resize', bind(this, this._onResize));

    this._rootView.push(this._gameScreen);
    this._gameScreen.emit(this._gameScreen.EVENT_RESET_GAME);
  };

  this.launchUI = function () {

  };

  this._onStartGame = function() {

    // TODO stop playing menu music
    // TODO start playing game music
  };

  this._onEndGame = function() {

    this._gameScreen.emit(this._gameScreen.EVENT_RESET_GAME);
    // TODO stop playing any music
    // TODO start playing menu music
  };
  
  this._onResize = function() {

    const scale = device.height / DEFAULT_HEIGHT;
    let rootViewXPos = 0;

    const iPhoneRatio = 16/9;
    const deviceRatio = device.height / device.width;
    const deviceRatioThreshold = deviceRatio * 0.05;
    const screenToWide = deviceRatio < iPhoneRatio - deviceRatioThreshold;

    if (screenToWide) {

      rootViewXPos = (device.width - DEFAULT_WIDTH * scale) / (2 * scale);
    }

    this.view.style.scale = scale;

    this._rootView.updateOpts({
      x: rootViewXPos
    });
  }

});
