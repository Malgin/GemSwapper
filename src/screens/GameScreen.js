import math.geom.Point as Point;

import animate;

import ui.ImageView as ImageView;

import src.managers.LevelManager as LevelManager;
import src.LevelGrid as LevelGrid;
import src.models.gem.Gem as Gem;

const SWAP_FORBIDDEN_ANIMATION_DURATION = 50;

exports = Class(ImageView, function(supr) {

  this.init = function(opts) {

    this._levelManager = null;
    this.level = null;
    this._dragStarted = false;
    this._userInteractionStopped = false;
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

      if (!this._dragStarted || this._userInteractionStopped) return;

      console.log('Input moved!!');

      var delta = { x: point.x - this._dragStartCoords.x, y: point.y - this._dragStartCoords.y };

      if (this._movedFarEnough(delta)) {

        // get drag direction
        var direction = this._getDragDirection(delta);

        if (this._level.gemPresentToDirection(this._origGem, direction)) {

          this._userInteractionStopped = true;

          var targetGem = this._level.getTargetGem(this._origGem, direction);

          if (this._level.swapPossibleFor(this._origGem, targetGem)) {

            console.log(`direction is ${ direction }, delta is x: ${ delta.x }, y: ${ delta.y }`);

            this._level.swapGems(this._origGem, targetGem);
          } else {

            // play animation, and don't move gems
            var origGemCoords = new Point(this._origGem.style.x, this._origGem.style.y);
            var targetGemCoords = new Point(targetGem.style.x, targetGem.style.y);

            animate(this._origGem)
                .now({ x: origGemCoords.x - 2, y: origGemCoords.y - 2}, SWAP_FORBIDDEN_ANIMATION_DURATION)
                .then({ x: origGemCoords.x + 2, y: origGemCoords.y + 2}, SWAP_FORBIDDEN_ANIMATION_DURATION)
                .then({ x: origGemCoords.x - 2, y: origGemCoords.y - 2}, SWAP_FORBIDDEN_ANIMATION_DURATION)
                .then({ x: origGemCoords.x, y: origGemCoords.y}, SWAP_FORBIDDEN_ANIMATION_DURATION);

            animate(targetGem)
                .now({ x: targetGemCoords.x - 2, y: targetGemCoords.y - 2}, SWAP_FORBIDDEN_ANIMATION_DURATION)
                .then({ x: targetGemCoords.x + 2, y: targetGemCoords.y + 2}, SWAP_FORBIDDEN_ANIMATION_DURATION)
                .then({ x: targetGemCoords.x - 2, y: targetGemCoords.y - 2}, SWAP_FORBIDDEN_ANIMATION_DURATION)
                .then({ x: targetGemCoords.x, y: targetGemCoords.y}, SWAP_FORBIDDEN_ANIMATION_DURATION)
                .then(bind(this, function() {

                  this._userInteractionStopped = false;
                }));
          }
        }
      } else {

        // continue dragging, we should hit a gem eventually
      }
    }));

    this.on('InputSelect', bind(this, function(event, point) {

      console.log('Input ended!!!');

      this._dragStarted = false;
      this._userInteractionStopped = false;
    }));

    this._level.on('GemSwapComplete', bind(this, function() {

      this._level.deleteSequences({
        horizSequences: this._level.detectHorizontalSequences(),
        vertSequences: this._level.detectVerticalSequences()
      });
    }));

    this._level.on('DeleteSequencesComplete', bind(this, function() {

      this._level.detectGapsAndMoveUpperGems();
    }));

    this._level.on('GapsDetectionComplete', bind(this, function() {

      this._level.spawnNewGems();
    }));

    this._level.on('GemSpawnComplete', bind(this, function() {

      if (this._level.hasDeletableSequences()) {
        this._level.deleteSequences({
          horizSequences: this._level.detectHorizontalSequences(),
          vertSequences: this._level.detectVerticalSequences()
        });
      } else {
        this._userInteractionStopped = false;
      }
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

    return Math.abs(delta.x) >= Gem.GEM_WIDTH / 2 || Math.abs(delta.y) >= Gem.GEM_HEIGHT / 2;
  };
});
