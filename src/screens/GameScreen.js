import math.geom.Vec2D as Vec2D;
import math.geom.Point as Point;

import ui.ImageView as ImageView;

import src.managers.LevelManager as LevelManager;
import src.LevelGrid as LevelGrid;

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

      // check for collision with nearest blocks
      var origGem = startEvt.target;
      var direction = this._getDragDirection(delta);

      // get drag direction
      if (this._level.gemPresentToDirection(origGem, direction)) {

        var targetGem = this._level.getTargetGem(origGem, direction);

        if (targetGem !== null) {
          // if got a collision, decide whether to swap gems, or return to original position
          console.log(`direction is ${direction}, delta is x: ${ delta.x }, y: ${ delta.y }`);
          console.log('s');
        }
      } else {

        // return gem back to it's original position
      }
    }));

    this.on('gem:DragStop', bind(this, function() {

      console.log('GemDragStopped');
    }));
  };

  this._getDragDirection = function(dragDelta) {

    if (Math.abs(dragDelta.x) >= Math.abs(dragDelta.y)) {
      // horizontal drag
      if (dragDelta.x > 0) return LevelGrid.DIRECTION_RIGHT;
      else return LevelGrid.DIRECTION_LEFT;
    } else {
      // vertical drag
      if (dragDelta.y > 0) return LevelGrid.DIRECTION_DOWN;
      else return LevelGrid.DIRECTION_UP;
    }
  };

});
