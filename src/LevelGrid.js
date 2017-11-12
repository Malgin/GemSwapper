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

const GEM_SWAP_ANIMATION_DURATION = 300;
const GEM_BASE_ANIMATION_DURATION = 150;
const GEM_FALLING_ANIMATION_DURATION = 100;

exports = Class(EventEmitter, function(supr) {

  this.init = function(opts) {

    this._container = opts.container;

    this._gemColors = ['blue', 'green', 'purple', 'red', 'yellow'];
    this._gemPool = new GemPool();
    this._gemGridLayout = opts.gridLayout;
    this._gemGrid = [];

    /**
     * Contains an array of 2-gem arrays, each indicating gems which could be swapped to get a hit
     *
     * @type {Array}
     * @private
     */
    this._possibleSwaps = [];

    supr(this, 'init', [opts]);
  };

  /**
   *
   * @param gem Gem
   * @param direction String One of ['LEFT', 'UP', 'RIGHT', 'DOWN']
   * @return {boolean}
   */
  this.gemPresentToDirection = function(gem, direction) {

    const gemGridPosition = gem.getGridPosition();

    switch(direction) {
      case exports.DIRECTION_LEFT:
        if (
            gemGridPosition.col === 0 || // dragging toward left edge of the field
            this._gemGrid[gemGridPosition.row][gemGridPosition.col - 1] === null // gem is not present in level layout
        ) return false;
        break;

      case exports.DIRECTION_UP:
        if (
            gemGridPosition.row === 0 ||
            this._gemGrid[gemGridPosition.row - 1][gemGridPosition.col] === null
        ) return false;
        break;

      case exports.DIRECTION_RIGHT:
        if (
            gemGridPosition.col === this._gemGrid[gemGridPosition.row].length - 1 ||
            this._gemGrid[gemGridPosition.row][gemGridPosition.col + 1] === null
        ) return false;
        break;

      case exports.DIRECTION_DOWN:
        if (
            gemGridPosition.row === this._gemGrid.length - 1 ||
            this._gemGrid[gemGridPosition.row + 1][gemGridPosition.col] === null
        ) return false;
        break;
    }

    // if we're not dragging towards the edges of a game field, we should've a gem there
    return true;
  };

  this.getGemByCoords = function(point) {

    let gemCol = Math.ceil((point.x - LEFT_PADDING) / (DISTANCE_BETWEEN_GEMS + Gem.GEM_WIDTH)) - 1;
    let gemRow = Math.ceil((point.y - TOP_PADDING) / (DISTANCE_BETWEEN_GEMS + Gem.GEM_HEIGHT)) - 1;

    return this._gemGrid[gemRow][gemCol];
  };

  /**
   * Returns a gem with wich origGem should swap, or null, if no gem present
   */
  this.getTargetGem = function(origGem, direction) {

    if (!this.gemPresentToDirection(origGem, direction)) return null;

    const origGemGridPos = origGem.getGridPosition();
    let targetGem = null;

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

    origGem.updateOpts({ opacity: 1 });
    targetGem.updateOpts({ opacity: 1 });

    const origGemGridPos = origGem.getGridPosition();
    const targetGemGridPos = targetGem.getGridPosition();

    origGem.setGridPosition(targetGemGridPos);
    targetGem.setGridPosition(origGemGridPos);

    this._gemGrid[origGemGridPos.row][origGemGridPos.col] = targetGem;
    this._gemGrid[targetGemGridPos.row][targetGemGridPos.col] = origGem;

    const origGemCoords = new Point(origGem.style.x, origGem.style.y);
    const targetGemCoords = new Point(targetGem.style.x, targetGem.style.y);

    animate(origGem).now({ x: targetGemCoords.x, y: targetGemCoords.y }, GEM_SWAP_ANIMATION_DURATION);
    animate(targetGem)
        .now({ x: origGemCoords.x, y: origGemCoords.y }, GEM_SWAP_ANIMATION_DURATION)
        .then(bind(this, function() {

          this.emit('GemSwapComplete');
        }));
  };

  this.swapPossibleFor = function(origGem, targetGem) {

    for (let i = 0, length = this._possibleSwaps.length; i < length; i++) {

      let swap = this._possibleSwaps[i];

      if ((swap[0] === origGem && swap[1] === targetGem) || (swap[1] === origGem && swap[0] === targetGem)) return true;
    }

    return false;
  };

  this.hasDeletableSequences = function() {

    const horizSequences = this.detectHorizontalSequences();
    const vertSequences = this.detectVerticalSequences();

    return horizSequences.length > 0 || vertSequences.length > 0;
  };

  this.detectHorizontalSequences = function() {

    const horizSequences = [];

    // detect horizontal sequences
    for (let row = 0, rowsNum = this._gemGrid.length; row < rowsNum; row++) {

      for (let col = 0, colsNum = this._gemGrid[row].length; col < colsNum - 2; col++) {

        if (this._gemGrid[row][col] !== null &&
            this._gemGrid[row][col + 1] !== null &&
            this._gemGrid[row][col + 2] !== null &&
            this._gemGrid[row][col].color === this._gemGrid[row][col + 1].color &&
            this._gemGrid[row][col].color === this._gemGrid[row][col + 2].color) {

          let sequence = [this._gemGrid[row][col]];

          while (
              col < colsNum - 1 && // not over right edge of a field
              this._gemGrid[row][col + 1] !== null && // gem present in level layout
              this._gemGrid[row][col].color === this._gemGrid[row][col + 1].color
          ) {

            sequence.push(this._gemGrid[row][++col]);
          }

          horizSequences.push(sequence);
        }
      }
    }

    return horizSequences;
  };

  this.detectVerticalSequences = function() {

    const vertSequences = [];

    for (let col = 0; col < COLS_PER_LEVEL; col++) {

      for (let row = 0; row < ROWS_PER_LEVEL - 2; row++) {

        if (this._gemGrid[row][col] !== null &&
            this._gemGrid[row + 1][col] !== null &&
            this._gemGrid[row + 2][col] !== null &&
            this._gemGrid[row][col].color === this._gemGrid[row + 1][col].color &&
            this._gemGrid[row][col].color === this._gemGrid[row + 2][col].color) {

          let sequence = [this._gemGrid[row][col]];

          while (
              row + 1 < ROWS_PER_LEVEL &&
              this._gemGrid[row + 1][col] !== null &&
              this._gemGrid[row][col].color === this._gemGrid[row + 1][col].color
          ) {

            sequence.push(this._gemGrid[++row][col]);
          }

          vertSequences.push(sequence);
        }
      }
    }

    return vertSequences;
  };

  this.deleteSequences = function({ horizSequences, vertSequences }) {

    for (let i = 0, seqNum = horizSequences.length; i < seqNum; i++) {

      for (let j = 0, gemNum = horizSequences[i].length; j < gemNum; j++) {

        this._animateDestroyGem(horizSequences[i][j]);
      }
    }

    for (let i = 0, seqNum = vertSequences.length; i < seqNum; i++) {

      for (let j = 0, gemNum = vertSequences[i].length; j < gemNum; j++) {

        this._animateDestroyGem(vertSequences[i][j]);
      }
    }

    this.emit('DeleteSequencesComplete');
  };

  this.detectGapsAndMoveUpperGems = function() {

    let animator = null;

    for (let row = this._gemGrid.length - 1; row >= 0; row--) {

      for (let col = this._gemGrid[row].length - 1; col >= 0; col--) {

        const gem = this._gemGrid[row][col];

        if (row > 0 && gem === null && this._gemGridLayout[row][col] === 1) {

          // go up until you find any gem or hit ceiling
          let trackRow = row;
          let trackGem = null;

          while (--trackRow >= 0 && trackGem === null) {

            trackGem = this._gemGrid[trackRow][col];

            if (trackGem !== null) {

              // update gem position in grid
              this._gemGrid[trackGem.getGridPosition().row][trackGem.getGridPosition().col] = null;
              this._gemGrid[row][col] = trackGem;
              trackGem.setGridPosition({ row, col });

              let animationLength = (row - trackRow) * GEM_FALLING_ANIMATION_DURATION;

              animator = this._animateFallingGem(trackGem, animationLength);
            }
          }
        }
      }
    }

    this.emit('GapsDetectionComplete');
  };

  this.spawnNewGems = function() {

    // generate new gems and fall them from the sky
    let columnsOfNewGems = this._generateNewGems();

    let animator = null;
    let longestAnimationTime = 0;

    // animate new gems
    for (let col = 0, colsLen = columnsOfNewGems.length; col < colsLen; col++) {

      for (let gemsLen = columnsOfNewGems[col].length, row = gemsLen - 1; row >= 0; row--) {

        let gem = columnsOfNewGems[col][row];

        let animationDelay = 100 + (gemsLen - row) * GEM_BASE_ANIMATION_DURATION;

        let animationLength = GEM_BASE_ANIMATION_DURATION * (gem.getGridPosition().row + 1);

        if (longestAnimationTime < animationDelay + animationLength) {

          longestAnimationTime = animationDelay + animationLength;
          animator = this._animateNewGem(gem, animationDelay, animationLength);
        } else {

          this._animateNewGem(gem, animationDelay, animationLength);
        }
      }
    }

    animator.then(bind(this, function() {

      this._generatePossibleSwapsList();
      this.emit('GemSpawnComplete');
    }));
  };

  this.releaseGem = function(gem) {

    this._gemGrid[gem.getGridPosition().row][gem.getGridPosition().col] = null;
    this._gemPool.releaseView(gem);
  };

  this.resetGemGrid = function() {

    this._gemPool.releaseAllViews();
    this._buildGrid();
  };

  this.getRandomPossibleSwap = function() {

    return this._possibleSwaps[Math.floor(Math.random() * this._possibleSwaps.length)];
  };

  this._buildGrid = function() {

    let longestAnimationTime = 0;
    let animator = null;

    this._gemGrid = [];

    for (let row = this._gemGridLayout.length - 1; row >= 0; row--) {

      this._gemGrid[row] = [];

      for (let col = 0; col < this._gemGridLayout[row].length; col++) {

        if (this._gemGridLayout[row][col] === 0) {

          // empty grid square
          this._gemGrid[row][col] = null;
          continue;
        }

        let gemColor = null;
        let gemFormsSequenceInCol = false;
        let gemFormsSequenceInRow = false;

        do {

          gemColor = this._gemColors[Math.floor(Math.random() * this._gemColors.length)];
        } while (
            (row < ROWS_PER_LEVEL - 2 &&
            this._gemGrid[row + 1][col] !== null &&
            this._gemGrid[row + 2][col] !== null &&
            this._gemGrid[row + 1][col].color === gemColor &&
            this._gemGrid[row + 2][col].color === gemColor) ||
            (col >= 2 &&
            this._gemGrid[row][col - 1] !== null &&
            this._gemGrid[row][col - 2] !== null &&
            this._gemGrid[row][col - 1].color === gemColor &&
            this._gemGrid[row][col - 2].color === gemColor)
        );

        let gem = this._gemPool.obtainGem(gemColor);

        gem.updateOpts({
          superview: this._container
        });

        gem.setGridPosition({ row, col });

        this._gemGrid[row][col] = gem;

        let animationDelay = 100 + (ROWS_PER_LEVEL - row - 1) * GEM_BASE_ANIMATION_DURATION;
        let animationLength = GEM_BASE_ANIMATION_DURATION * (gem.getGridPosition().row + 1);

        if (longestAnimationTime < animationDelay + animationLength) {

          longestAnimationTime = animationDelay + animationLength;
          animator = this._animateNewGem(gem, animationDelay, animationLength);
        } else {

          this._animateNewGem(gem, animationDelay, animationLength);
        }
      }
    }

    animator.then(bind(this, function() {

      this._generatePossibleSwapsList();
      this.emit('BuildLevelFinished');
    }));
  };

  this._generatePossibleSwapsList = function() {

    this._possibleSwaps = [];

    let gem = null;

    for (let row = 0; row < this._gemGrid.length; row++) {

      for (let col = 0; col < this._gemGrid[row].length; col++) {

        gem = this._gemGrid[row][col];

        if (gem === null) continue;

        let notLastRow = (row !== this._gemGrid.length - 1);

        if (notLastRow && this.gemPresentToDirection(gem, exports.DIRECTION_DOWN)) {

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

        let notLastCol = col !== this._gemGrid[row].length - 1;

        if (notLastCol && this.gemPresentToDirection(gem, exports.DIRECTION_RIGHT)) {

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

    const gem = this._gemGrid[row][col];
    let curCheckRow = null;
    let curCheckCol = null;
    let sequenceLength = 1;

    // go left and check for a sequence
    curCheckRow = row;
    curCheckCol = col - 1;

    while (
        curCheckCol >= 0 && // not over left edge of the field
        this._gemGrid[curCheckRow][curCheckCol] !== null && // gem is present in level layout
        this._gemGrid[curCheckRow][curCheckCol].color === gem.color // colors match
    ) {

      curCheckCol -=  1;
      sequenceLength += 1;
    }

    // go right and check for a sequence
    curCheckCol = col + 1;

    while (
        curCheckCol < this._gemGrid[curCheckRow].length && // not over right edge of the field
        this._gemGrid[curCheckRow][curCheckCol] !== null && // gem is present in level layout
        this._gemGrid[curCheckRow][curCheckCol].color === gem.color
    ) {

      curCheckCol += 1;
      sequenceLength += 1;
    }

    if (sequenceLength >= 3) return true;

    // go up and check for a sequence
    sequenceLength = 1;
    curCheckRow = row - 1;
    curCheckCol = col;

    while (
        curCheckRow >= 0 && // not over top edge of the field
        this._gemGrid[curCheckRow][curCheckCol] !== null &&
        this._gemGrid[curCheckRow][curCheckCol].color === gem.color
    ) {

      curCheckRow -= 1;
      sequenceLength += 1;
    }

    // go down and check for a sequence
    curCheckRow = row + 1;

    while (
        curCheckRow < this._gemGrid.length && // not over bottom edge of the field
        this._gemGrid[curCheckRow][curCheckCol] !== null &&
        this._gemGrid[curCheckRow][curCheckCol].color === gem.color
    ) {

      curCheckRow += 1;
      sequenceLength += 1;
    }

    return (sequenceLength >= 3);
  };

  this._generateNewGems = function() {

    let columnsOfGems = [];
    let prevGemColor = null;

    for (let col = 0; col < COLS_PER_LEVEL; col++) {

      let columnOfGems = [];

      for (let row = 0; row < ROWS_PER_LEVEL; row++) {

        if (this._gemGrid[row][col] !== null) break;
        if (this._gemGrid[row][col] === null && this._gemGridLayout[row][col] === 0) continue;

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

  this._animateDestroyGem = function(gem) {

    gem.updateOpts({
      visible: false,
      width: 0,
      height: 0
    });

    this.emit('GemDestroyed', gem);
  };

  this._animateFallingGem = function(gem, animationLength) {

    const newXPos = gem.style.x;
    const newYPos = TOP_PADDING + gem.getGridPosition().row * (DISTANCE_BETWEEN_GEMS + Gem.GEM_HEIGHT);

    return animate(gem)
        .now({
          x: newXPos,
          y: newYPos
        }, animationLength, animate.easeOutBounce);
  };

  this._animateNewGem = function(gem, animationDelay, animationLength) {

    let xStartingPosition = LEFT_PADDING + gem.getGridPosition().col * (DISTANCE_BETWEEN_GEMS + Gem.GEM_WIDTH);
    let yStartingPosition = TOP_PADDING + (-0.5) * (DISTANCE_BETWEEN_GEMS + Gem.GEM_HEIGHT);

    let xFinalPosition = LEFT_PADDING + gem.getGridPosition().col * (DISTANCE_BETWEEN_GEMS + Gem.GEM_WIDTH);
    let yFinalPosition = TOP_PADDING + gem.getGridPosition().row * (DISTANCE_BETWEEN_GEMS + Gem.GEM_HEIGHT);

    return animate(gem)
        .wait(animationDelay)
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
        }, animationLength, animate.easeOutExpo);
  };
});

exports.DIRECTION_LEFT = 'LEFT';
exports.DIRECTION_UP = 'UP';
exports.DIRECTION_RIGHT = 'RIGTH';
exports.DIRECTION_DOWN = 'DOWN';
