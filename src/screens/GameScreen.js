import math.geom.Vec2D as Vec2D;

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
      var direction = this._getDragDirection(startEvt, dragEvt);

      // get drag direction
      if (this._level.gemPresentToDirection(origGem, direction)) {

        var targetGem = this._level.getTargetGem(origGem, direction);

        if (targetGem !== null) {
          // if got a collision, decide whether to swap gems, or return to original position
          console.log("COLLIDED!");
        }
      } else {

        // return gem back to it's original position
      }
    }));

    this.on('gem:DragStop', bind(this, function() {

      console.log('GemDragStopped');
    }));
  };

  this._getDragDirection = function(startEvt, dragEvt) {

    // TODO Implement this
    // get drag vector
    var dragVector = (new Vec2D({ x: dragEvt.srcPt.x - startEvt.srcPt.x, y: dragEvt.srcPt.y - startEvt.srcPt.y })).getUnitVector();

    // figure out which way it is dragged by scalar multiptlication
    // start from left
    var directionLeftVector = new Vec2D({ x: -1, y: 0 });
    var scalarWithLeftVector = dragVector.x * directionLeftVector.x + dragVector.y * directionLeftVector.y;

    if (scalarWithLeftVector >= 0.5) {
      return LevelGrid.DIRECTION_LEFT;
    }

    // up
    var directionUpVector = new Vec2D({ x: 0, y: -1 });
    var scalarWithUpVector = dragVector.x * directionUpVector.x + dragVector.y * directionUpVector.y;

    if (scalarWithUpVector >= 0.5) {
      return LevelGrid.DIRECTION_UP;
    }

    // right
    var directionRightVector = new Vec2D({ x: 1, y: 0 });
    var scalarWithRightVector = dragVector.x * directionRightVector.x + dragVector.y * directionRightVector.y;

    if (scalarWithRightVector >= 0.5) {
      return LevelGrid.DIRECTION_RIGHT;
    }

    // down
    var directionDownVector = new Vec2D({ x: 0, y: 1 });
    var scalarWithDownVector = dragVector.x * directionDownVector.x + dragVector.y * directionDownVector.y;

    if (scalarWithDownVector >= 0.5) {
      return LevelGrid.DIRECTION_DOWN;
    }
  };

});
