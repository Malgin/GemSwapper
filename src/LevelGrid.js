import math.geom.intersect as intersect;

import src.models.gem.Gem as Gem;
import src.models.gem.GemPool as GemPool;

const ROWS_PER_LEVEL = 9;
const COLS_PER_LEVEL = 9;

const DISTANCE_BETWEEN_GEMS = 5;
const TOP_PADDING = 340;
const LEFT_PADDING = 45;

exports = Class(function() {

  this.init = function(opts) {

    this._container = opts.container;


    this._gemColors = ['blue', 'green', 'purple', 'red', 'yellow'];
    this._gemPool = new GemPool();
    this._gemGrid = [];
    this._gemHighestZIndex = 0;

    this._build();
  };

  this._build = function() {

    for (var row = 0; row < ROWS_PER_LEVEL; row++) {

      this._gemGrid[row] = [];

      for (var col = 0; col < COLS_PER_LEVEL; col++) {

        var xPosition = LEFT_PADDING + DISTANCE_BETWEEN_GEMS * this._gemGrid[row].length + Gem.GEM_WIDTH * this._gemGrid[row].length;
        var yPosition = TOP_PADDING + DISTANCE_BETWEEN_GEMS * (this._gemGrid.length - 1) + Gem.GEM_HEIGHT * (this._gemGrid.length - 1);

        var gem = this._gemPool.obtainGem(this._gemColors[Math.floor(Math.random() * this._gemColors.length + 1)]); // TODO: obtain gem from gemPool randomly

        gem.updateOpts({
          superview: this._container,
          x: xPosition,
          y: yPosition,
          visible: true
        });

        gem.on('DragStart', bind(this, function(dragEvt) {

          dragEvt.target.updateOpts({
            zIndex: ++this._gemHighestZIndex
          });

          this._container.emit('gem:DragStart');
        }));

        gem.on('Drag', bind(this, function(startEvt, dragEvt, delta) {

          this._container.emit('gem:Drag', startEvt, dragEvt, delta);
        }));

        gem.on('DragStop', bind(this, function() {

          this._container.emit('gem:DragStop');
        }));

        gem.setGridPosition({ row, col });

        this._gemGrid[row][col] = gem;

        this._gemHighestZIndex += 1;
      }
    }
  };

  /**
   *
   * @param direction One of ['LEFT', 'UP', 'RIGHT', 'DOWN']
   * @return {boolean}
   */
  this.gemPresentToDirection = function(gem, direction) {

    var gemGridPosition = gem.getGridPosition();

    switch(direction) {
      case exports.DIRECTION_LEFT:
        if (gemGridPosition.col === 0) return false;
        break;

      case exports.DIRECTION_UP:
        if (gemGridPosition.row === 0) return false;
        break;

      case exports.DIRECTION_RIGHT:
        if (gemGridPosition.col === this._gemGrid[gemGridPosition.row].length - 1) return false;
        break;

      case exports.DIRECTION_DOWN:
        if (gemGridPosition.row === this._gemGrid.length - 1) return false;
        break;
    }

    // if we're not dragging towards the edges of a game field, we should've a gem there
    return true;
  };

  /**
   * Detects if dragged gem collided with one in dragging direction
   * Otherwise, returns null
   */
  this.getTargetGem = function(origGem, direction) {

    var origGemGridPos = origGem.getGridPosition();
    var targetGem = null;

    switch(direction) {
      case exports.DIRECTION_LEFT:
        targetGem = this._gemGrid[origGemGridPos.row][origGemGridPos.col - 1];
        break;

      case exports.DIRECTION_UP:
        targetGem = this._gemGrid[origGemGridPos.row - 1][origGemGridPos.col];
        break;

      case exports.DIRECTION_RIGHT:
        targetGem = this._gemGrid[origGemGridPos.row][origGemGridPos.col + 1];
        break;

      case exports.DIRECTION_DOWN:
        targetGem = this._gemGrid[origGemGridPos.row + 1][origGemGridPos.col];
        break;
    }

    if (intersect.rectAndRect(origGem.getCollisionBox(), targetGem.getCollisionBox())) {
      return targetGem;
    }

    return null;
  };
});

exports.DIRECTION_LEFT = 'LEFT';
exports.DIRECTION_UP = 'UP';
exports.DIRECTION_RIGHT = 'RIGTH';
exports.DIRECTION_DOWN = 'DOWN';
