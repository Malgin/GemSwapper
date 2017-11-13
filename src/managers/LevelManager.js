import src.LevelGrid as LevelGrid;

/**
 * Level Manager
 *
 * Manages level grids, initiates new levels
 */
exports = Class(function() {

  this.init = function(opts) {

    this.LEVEL_TYPE_POINTS_PER_SWAPS = 'pointsPerSwaps';

    this.currentLevelConfig = null;

    this._container = opts.container;
    this._levelGrid = null;
  };

  this.initLevel = function(level = 1) {

    this.currentLevelConfig = JSON.parse(CACHE[`resources/levels/${level}.json`]);

    if (!this._levelGrid) {

      this._levelGrid = new LevelGrid({
        container: this._container,
        gridLayout: this.currentLevelConfig.levelLayout
      });
    } else {

      this._levelGrid.setLayout(this.currentLevelConfig.levelLayout);
      // TODO: pop all existing gems
      // this._levelGrid.resetGemGrid();
    }

    this._levelGrid.resetGemGrid();

    return this._levelGrid;
  };

  this.levelCompleted = function(swapsLeft, currentScore) {

    const levelCompletionConditions = this.currentLevelConfig.levelCompletionConditions;

    switch (levelCompletionConditions.type) {

      case this.LEVEL_TYPE_POINTS_PER_SWAPS:

        if (swapsLeft > 0 && currentScore >= levelCompletionConditions.numberOfPoints) {
          return true;
        }
        break;
    }

    return false;
  };

  this.levelLost = function(swapsLeft, currentScore) {

    const levelCompletionConditions = this.currentLevelConfig.levelCompletionConditions;

    switch (levelCompletionConditions.type) {

      case this.LEVEL_TYPE_POINTS_PER_SWAPS:

        if (swapsLeft <= 0 && currentScore < levelCompletionConditions.numberOfPoints) {
          return true;
        }
        break;
    }

    return false;
  };

  this.hasNextLevel = function() {

    return this.currentLevelConfig.nextLevel !== null;
  };

  this.initNextLevel = function() {

    this.initLevel(this.currentLevelConfig.nextLevel);
  };

  this.getLevelSwapsAmount = function() {

    if (this.currentLevelConfig.levelCompletionConditions.type !== this.LEVEL_TYPE_POINTS_PER_SWAPS) return false;

    return this.currentLevelConfig.levelCompletionConditions.numberOfSwaps;
  }
});
