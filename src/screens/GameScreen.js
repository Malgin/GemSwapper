import ui.ImageView as ImageView;

import src.managers.LevelManager as LevelManager;

exports = Class(ImageView, function(supr) {

  this.init = function(opts) {

    this._levelManager = null;
    this.level = null;

    this.width = opts.width;
    this.height = opts.height;

    opts = merge(opts, {
      image: 'resources/images/ui/background.png'
    });

    supr(this, 'init', [opts]);

    this._build();
  };

  this._build = function() {

    // init level manager
    this._levelManager = new LevelManager({
      container: this
    });

    // init first level
    this._level = this._levelManager.initLevel();

    // TODO init scores manager

    this.on('gem:DragStart', bind(this, function() {

      console.log('GemDragStarted');
    }));

    this.on('gem:Drag', bind(this, function(startEvt, dragEvt, delta) {

      console.log('GemDrag');
    }));

    this.on('gem:DragStop', bind(this, function() {

      console.log('GemDragStopped');
    }));
  };

});
