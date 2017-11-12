import src.LevelGrid as LevelGrid;

/**
 * Level Manager
 *
 * Manages level grids, initiates new levels
 */
exports = Class(function() {

  this.init = function(opts) {

    this.currentLevelConfig = null;

    this._container = opts.container;
    this._levelGrid = null;
  };

  this.initLevel = function(level = 1) {

    this.currentLevelConfig = JSON.parse(CACHE[`resources/levels/${level}.json`]);

    if (this._levelGrid) {

      // TODO: pop all existing gems
      this._levelGrid.resetGemGrid();
    }

    this._levelGrid = new LevelGrid({
      container: this._container,
      gridLayout: this.currentLevelConfig.levelLayout
    });

    return this._levelGrid;
  }
});
