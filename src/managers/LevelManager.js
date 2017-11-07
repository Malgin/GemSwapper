import src.LevelGrid as LevelGrid;

/**
 * Level Manager
 *
 * Manages level grids, initiates new levels
 */
exports = Class(function() {

  this.init = function(opts) {

    this._container = opts.container;
  };

  this.initLevel = function() {

    this._levelGrid = new LevelGrid({
      container: this._container
    });

    return this._levelGrid;
  }
});
