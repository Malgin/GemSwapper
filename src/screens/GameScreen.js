import math.geom.Point as Point;

import ui.ImageView as ImageView;

import src.managers.LevelManager as LevelManager;
import src.LevelGrid as LevelGrid;
import src.models.gem.Gem as Gem;

exports = Class(ImageView, function(supr) {

  this.init = function(opts) {

    this._levelManager = null;
    this.level = null;
    this._dragStarted = false;
    this._swapStarted = false;
    this._dragStartCoords = null;

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

    this.on('InputStart', bind(this, function(event, point) {

      console.log('Input started!');

      this._dragStarted = true;
      this._dragStartCoords = point;
      this._origGem = this._level.getGemByCoords(point);
    }));

    this.on('InputMove', bind(this, function(event, point) {

      if (!this._dragStarted || this._swapStarted) return;

      console.log('Input moved!!');

      var delta = { x: point.x - this._dragStartCoords.x, y: point.y - this._dragStartCoords.y };

      if (this._movedFarEnough(delta)) {

        // get drag direction
        var direction = this._getDragDirection(delta);

        if (this._level.gemPresentToDirection(this._origGem, direction)) {

          var targetGem = this._level.getTargetGem(this._origGem, direction);

          if (this._shouldSwapGems(this._origGem, targetGem)) {

            this._swapStarted = true;

            console.log(`direction is ${ direction }, delta is x: ${ delta.x }, y: ${ delta.y }`);

            this._level.swapGems(this._origGem, targetGem);
            // destroy all lines and generate new gems while 3+ groups still present
          } else {

            // play animation, and don't move gems
          }
        } else {

          // return gem back to it's original position
        }
      } else {

        // continue dragging, we should hit a gem eventually
      }
    }));

    this.on('InputSelect', bind(this, function(event, point) {

      console.log('Input ended!!!');

      this._dragStarted = false;
      this._swapStarted = false;
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

  this._movedFarEnough = function(delta) {

    return Math.abs(delta.x) >= Gem.GEM_WIDTH || Math.abs(delta.y) >= Gem.GEM_HEIGHT;
  };

  this._shouldSwapGems = function() {

    // detect swap
    // check whether this swap is available in a swaplist
    // if so, return true
    return true;
  }

});
