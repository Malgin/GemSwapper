import math.geom.intersect as intersect;
import math.geom.Point as Point;

import animate;

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

    /**
     * Contains an array of 2-gem arrays, each indicating gems which could be swapped to get a hit
     *
     * @type {Array}
     * @private
     */
    this._possibleSwaps = [];

    this._build();
  };

  this._build = function() {

    for (var row = 0; row < ROWS_PER_LEVEL; row++) {

      this._gemGrid[row] = [];

      for (var col = 0; col < COLS_PER_LEVEL; col++) {

        var xPosition = LEFT_PADDING + this._gemGrid[row].length * (DISTANCE_BETWEEN_GEMS + Gem.GEM_WIDTH);
        var yPosition = TOP_PADDING + (this._gemGrid.length - 1) * (DISTANCE_BETWEEN_GEMS + Gem.GEM_HEIGHT);

        // TODO obtain gem without creating chains of 3+ gems
        var gem = this._gemPool.obtainGem(this._gemColors[Math.floor(Math.random() * this._gemColors.length + 1)]);

        gem.updateOpts({
          superview: this._container,
          x: xPosition,
          y: yPosition,
          visible: true
        });

        gem.setGridPosition({ row, col });
        gem.setOriginalPosition(new Point(gem.style.x, gem.style.y));

        this._gemGrid[row][col] = gem;
      }
    }

    // TODO generate swap list
    this._generatePossibleSwapsList();
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

  this.getGemByCoords = function(point) {

    var gemCol = Math.ceil((point.x - LEFT_PADDING) / (DISTANCE_BETWEEN_GEMS + Gem.GEM_WIDTH)) - 1;
    var gemRow = Math.ceil((point.y - TOP_PADDING) / (DISTANCE_BETWEEN_GEMS + Gem.GEM_HEIGHT)) - 1;

    console.log(`OrigGem row: ${gemRow}, col: ${gemCol}`);

    return this._gemGrid[gemRow][gemCol];
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

    return targetGem;
  };

  this.swapGems = function(origGem, targetGem) {

    // change gems position with animation
    var origGemCoords = origGem.getOriginalPosition();
    var targetGemCoords = new Point(targetGem.style.x, targetGem.style.y);

    animate(origGem, 'gem-swap-animation').now({x: targetGemCoords.x, y: targetGemCoords.y});
    animate(targetGem, 'gem-swap-animation').now({x: origGemCoords.x, y: origGemCoords.y});

    var origGemGridPos = origGem.getGridPosition();
    var targetGemGridPos = targetGem.getGridPosition();

    origGem.setGridPosition(targetGemGridPos);
    targetGem.setGridPosition(origGemGridPos);

    origGem.setOriginalPosition(targetGemCoords);
    targetGem.setOriginalPosition(origGemCoords);

    this._gemGrid[origGemGridPos.row][origGemGridPos.col] = targetGem;
    this._gemGrid[targetGemGridPos.row][targetGemGridPos.col] = origGem;

    /*animate.getGroup('gem-swap-animation').on('Finish', function() {

      // emit event to animate scored gems
    });*/

    // update gems position in grid
    // update grid with new gems
    // TODO re-generate swap list
  };

  this._generatePossibleSwapsList = function() {

    var gem = null;

    for (var row = 0; row < this._gemGrid.length; row++) {

      for (var col = 0; col < this._gemGrid[row].length; col++) {

        gem = this._gemGrid[row][col];

        if (row != this._gemGrid.length - 1) {

          // not the last row, so checking if we'll get hit after swapping gem with the one below it
          // "phantom" swap gems
          this._gemGrid[row][col] = this._gemGrid[row + 1][col];
          this._gemGrid[row + 1][col] = gem;

          // detect sequence
          if (this._hasSequenceAtRowAndCol(row, col) || this._hasSequenceAtRowAndCol(row + 1, col)) {

            // add to swaplist if any
            this._possibleSwaps.push([this._gemGrid[row][col], this._gemGrid[row + 1][col]]);
          }

          // "phantom" swap gems back
          this._gemGrid[row + 1][col] = this._gemGrid[row][col];
          this._gemGrid[row][col] = gem;
        }

        if (col != this._gemGrid[row].length - 1) {

          // not the last one col, so checking if we'll get hit after swapping gem with the one to the right
          // "phantom" swap gems
          this._gemGrid[row][col] = this._gemGrid[row][col + 1];
          this._gemGrid[row][col + 1] = gem;

          // detect sequence
          if (this._hasSequenceAtRowAndCol(row, col) || this._hasSequenceAtRowAndCol(row, col + 1)) {

            // add to swaplist if any
            this._possibleSwaps.push([this._gemGrid[row][col], this._gemGrid[row][col + 1]]);
          }

          // "phantom" swap gems back
          this._gemGrid[row][col + 1] = this._gemGrid[row][col];
          this._gemGrid[row][col] = gem;
        }
      }
    }
  };

  this._hasSequenceAtRowAndCol = function(row, col) {

    var gem = this._gemGrid[row][col];
    var curCheckRow = null;
    var curCheckCol = null;
    var sequenceLength = 1;

    // go left and check for a sequence
    curCheckRow = row;
    curCheckCol = col - 1;

    while (curCheckCol >= 0 && this._gemGrid[curCheckRow][curCheckCol].color === gem.color) {

      curCheckCol -=  1;
      sequenceLength += 1;
    }

    // go right and check for a sequence
    curCheckCol = col + 1;

    while (curCheckCol < this._gemGrid[curCheckRow].length && this._gemGrid[curCheckRow][curCheckCol].color === gem.color) {

      curCheckCol += 1;
      sequenceLength += 1;
    }

    if (sequenceLength >= 3) return true;

    // go up and check for a sequence
    sequenceLength = 1;
    curCheckRow = row - 1;
    curCheckCol = col;

    while (curCheckRow >= 0 && this._gemGrid[curCheckRow][curCheckCol].color === gem.color) {

      curCheckRow -= 1;
      sequenceLength += 1;
    }

    // go down and check for a sequence
    curCheckRow = row + 1;

    while (curCheckRow < this._gemGrid.length && this._gemGrid[curCheckRow][curCheckCol].color === gem.color) {

      curCheckRow += 1;
      sequenceLength += 1;
    }

    if (sequenceLength >= 3) return true;

    return false;
  }
});

exports.DIRECTION_LEFT = 'LEFT';
exports.DIRECTION_UP = 'UP';
exports.DIRECTION_RIGHT = 'RIGTH';
exports.DIRECTION_DOWN = 'DOWN';
