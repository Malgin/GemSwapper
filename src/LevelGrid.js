import event.Emitter as EventEmitter;
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

const SWAP_ANIMATION_DURATION = 300;
const GEM_ANIMATION_LENGTH = 300;

exports = Class(EventEmitter, function(supr) {

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

    supr(this, 'init', [opts]);
  };

  this._build = function() {

    for (var row = 0; row < ROWS_PER_LEVEL; row++) {

      this._gemGrid[row] = [];

      for (var col = 0; col < COLS_PER_LEVEL; col++) {

        var xPosition = LEFT_PADDING + this._gemGrid[row].length * (DISTANCE_BETWEEN_GEMS + Gem.GEM_WIDTH);
        var yPosition = TOP_PADDING + (this._gemGrid.length - 1) * (DISTANCE_BETWEEN_GEMS + Gem.GEM_HEIGHT);

        let gemColor = null;

        do {

          gemColor = this._gemColors[Math.floor(Math.random() * this._gemColors.length)];
        } while (
            (row >= 2 &&
            this._gemGrid[row - 1][col].color === gemColor &&
            this._gemGrid[row - 2][col].color === gemColor) ||
            (col >= 2 &&
            this._gemGrid[row][col - 1].color === gemColor &&
            this._gemGrid[row][col - 2].color === gemColor)
        );

        let gem = this._gemPool.obtainGem(gemColor);

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

    animate(origGem).now({x: targetGemCoords.x, y: targetGemCoords.y}, SWAP_ANIMATION_DURATION);
    animate(targetGem)
        .now({x: origGemCoords.x, y: origGemCoords.y}, SWAP_ANIMATION_DURATION)
        .then(bind(this, function() {

          this.deleteSequences({
            horizSequences: this.detectHorizontalSequences(),
            vertSequences: this.detectVerticalSequences()
          });
        }));

    var origGemGridPos = origGem.getGridPosition();
    var targetGemGridPos = targetGem.getGridPosition();

    origGem.setGridPosition(targetGemGridPos);
    targetGem.setGridPosition(origGemGridPos);

    origGem.setOriginalPosition(targetGemCoords);
    targetGem.setOriginalPosition(origGemCoords);

    this._gemGrid[origGemGridPos.row][origGemGridPos.col] = targetGem;
    this._gemGrid[targetGemGridPos.row][targetGemGridPos.col] = origGem;

    this._generatePossibleSwapsList();
  };

  this.swapPossibleFor = function(origGem, targetGem) {

    for (var i = 0, length = this._possibleSwaps.length; i < length; i++) {

      var swap = this._possibleSwaps[i];

      if ((swap[0] === origGem && swap[1] === targetGem) || (swap[1] === origGem && swap[0] === targetGem)) return true;
    }

    return false;
  };

  this.detectHorizontalSequences = function() {

    var horizSequences = [];

    // detect horizontal sequences
    for (var row = 0, rowsNum = this._gemGrid.length; row < rowsNum; row++) {

      for (var col = 0, colsNum = this._gemGrid[row].length; col < colsNum - 2; col++) {

        if (this._gemGrid[row][col].color === this._gemGrid[row][col + 1].color &&
            this._gemGrid[row][col].color === this._gemGrid[row][col + 2].color) {

          var sequence = [this._gemGrid[row][col]];

          while (col + 1 < colsNum && this._gemGrid[row][col].color === this._gemGrid[row][col + 1].color) {

            col += 1;
            sequence.push(this._gemGrid[row][col]);
          }

          horizSequences.push(sequence);
        }
      }
    }

    return horizSequences;
  };

  this.detectVerticalSequences = function() {

    var vertSequences = [];

    for (var col = 0; col < COLS_PER_LEVEL; col++) {

      for (var row = 0; row < ROWS_PER_LEVEL - 2; row++) {

        if (this._gemGrid[row][col].color === this._gemGrid[row + 1][col].color &&
            this._gemGrid[row][col].color === this._gemGrid[row + 2][col].color) {

          var sequence = [this._gemGrid[row][col]];

          while (row + 1 < ROWS_PER_LEVEL && this._gemGrid[row][col].color === this._gemGrid[row + 1][col].color) {

            row += 1;
            sequence.push(this._gemGrid[row][col]);
          }

          vertSequences.push(sequence);
        }
      }
    }

    return vertSequences;
  };

  this.deleteSequences = function({ horizSequences, vertSequences }) {

    for (var i = 0, seqNum = horizSequences.length; i < seqNum; i++) {

      for (var j = 0, gemNum = horizSequences[i].length; j < gemNum; j++) {

        var gem = horizSequences[i][j];

        (bind(this, function(gem) {

          animate(gem, 'GemDestroy')
              .now({ width: 0, height: 0 })
              .then(bind(this, function() {

                this._releaseGem(gem)
              }));
        })(gem));
      }
    }

    for (var i = 0, seqNum = vertSequences.length; i < seqNum; i++) {

      for (var j = 0, gemNum = vertSequences[i].length; j < gemNum; j++) {

        var gem = vertSequences[i][j];

        (bind(this, function(gem) {

          animate(gem, 'GemDestroy')
              .now({ width: 0, height: 0 })
              .then(bind(this, function() {

                this._releaseGem(gem);
              }));
        })(gem));
      }
    }

    animate.getGroup('GemDestroy').on('Finish', bind(this, function() {

      // detect gaps and fill them
      for (let row = this._gemGrid.length - 1; row >= 0; row--) {

        for (let col = this._gemGrid[row].length - 1; col >= 0; col--) {

          const gem = this._gemGrid[row][col];

          if (row > 0 && gem === null) {

            // go up until you find any gem or hit ceiling
            let trackRow = row;
            let trackGem = null;

            while (--trackRow >= 0 && trackGem === null) {

              trackGem = this._gemGrid[trackRow][col];

              if (trackGem !== null) {

                this._gemGrid[trackGem.getGridPosition().row][trackGem.getGridPosition().col] = null;
                this._gemGrid[row][col] = trackGem;
                trackGem.setGridPosition({ row, col });

                (bind(this, function(trackGem) {

                  animate(trackGem)
                      .now({
                        x: trackGem.getOriginalPosition().x,
                        y: TOP_PADDING + trackGem.getGridPosition().row * (DISTANCE_BETWEEN_GEMS + Gem.GEM_HEIGHT)
                      }, 500, animate.easeOutBounce)
                      .then(bind(this, function() {

                        trackGem.setOriginalPosition(new Point(trackGem.style.x, trackGem.style.y));
                      }));
                })(trackGem));
              }
            }
          }
        }
      }

      // generate new gems and fall them from the sky
      let columnsOfNewGems = this._generateNewGems();
      // animate new gems
      for (let col = 0, colsLen = columnsOfNewGems.length; col < colsLen; col++) {

        for (let gemsLen = columnsOfNewGems[col].length, row = gemsLen - 1; row >= 0; row--) {
        // for (let gemsLen = columnsOfNewGems[col].length, row = 0; row < gemsLen; row++) {

          let gem = columnsOfNewGems[col][row];

          let delay = 100 + (gemsLen - row) * GEM_ANIMATION_LENGTH;

          this._animateNewGem(gem, delay);
        }
      }

      animate.getGroup('GemSpawn').on('Finish', bind(this, function() {

        this._generatePossibleSwapsList();
      }));
    }));
  };

  this._generatePossibleSwapsList = function() {

    var gem = null;

    for (var row = 0; row < this._gemGrid.length; row++) {

      for (var col = 0; col < this._gemGrid[row].length; col++) {

        gem = this._gemGrid[row][col];

        if (row !== this._gemGrid.length - 1) {

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

        if (col !== this._gemGrid[row].length - 1) {

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

    return (sequenceLength >= 3);
  };

  this._releaseGem = function(gem) {

      this._gemGrid[gem.getGridPosition().row][gem.getGridPosition().col] = null;
      this._gemPool.releaseView(gem);
  };

  this._generateNewGems = function() {

    let columnsOfGems = [];
    let prevGemColor = null;

    for (var col = 0; col < COLS_PER_LEVEL; col++) {

      let columnOfGems = [];

      for (var row = 0; row < ROWS_PER_LEVEL; row++) {

        if (this._gemGrid[row][col] !== null) break;

        let newGem = null;
        let gemColor = null;

        do {

          gemColor = this._gemColors[Math.floor(Math.random() * this._gemColors.length + 1)];
        } while (gemColor === prevGemColor);

        prevGemColor = gemColor;

        newGem = this._gemPool.obtainGem(gemColor);

        newGem.updateOpts({
          superview: this._container
        });

        newGem.setGridPosition({ row, col });

        this._gemGrid[row][col] = newGem;

        columnOfGems.push(newGem);
      }

      columnsOfGems.push(columnOfGems);
    }

    return columnsOfGems;
  };

  this._animateNewGem = function(gem, delay) {

    let animationLength = GEM_ANIMATION_LENGTH * (gem.getGridPosition().row + 1);

    let xStartingPosition = LEFT_PADDING + gem.getGridPosition().col * (DISTANCE_BETWEEN_GEMS + Gem.GEM_WIDTH);
    let yStartingPosition = TOP_PADDING + (-0.5) * (DISTANCE_BETWEEN_GEMS + Gem.GEM_HEIGHT);

    let xFinalPosition = LEFT_PADDING + gem.getGridPosition().col * (DISTANCE_BETWEEN_GEMS + Gem.GEM_WIDTH);
    let yFinalPosition = TOP_PADDING + gem.getGridPosition().row * (DISTANCE_BETWEEN_GEMS + Gem.GEM_HEIGHT);

    // properly animate gem
    animate(gem, 'GemSpawn')
        .wait(delay)
        .then(bind(this, function() {

          // put gem at starting position of animation
          gem.updateOpts({
            visible: true,
            x: xStartingPosition,
            y: yStartingPosition
          })
        }))
        .then({
          x: xFinalPosition,
          y: yFinalPosition
        }, animationLength, animate.easeOutBounce)
        .then(function() {

          gem.setOriginalPosition(new Point(gem.style.x, gem.style.y));
        });
  };
});

exports.DIRECTION_LEFT = 'LEFT';
exports.DIRECTION_UP = 'UP';
exports.DIRECTION_RIGHT = 'RIGTH';
exports.DIRECTION_DOWN = 'DOWN';
