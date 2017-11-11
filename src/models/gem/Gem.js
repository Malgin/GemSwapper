import math.geom.Rect as Rectangle;
import math.geom.Point as Point;
import ui.ImageView as ImageView;

exports = Class(ImageView, function(supr) {

  this.init = function(opts) {

    /**
     * Contains two properties: row and col
     *
     * @type {Object}
     * @private
     */
    this._gridPosition = null;

    opts = merge(opts, {
      width: exports.GEM_WIDTH,
      height: exports.GEM_HEIGHT
    });

    supr(this, 'init', [opts]);
  };

  this.updateOpts = function(opts) {

    if (opts.color) {
      this.color = opts.color;
    }

    supr(this, 'updateOpts', [opts]);
  };

  /**
   *
   * @param gridPosition {row: <Number>, col: <Number>}
   */
  this.setGridPosition = function(gridPosition) {

    this._gridPosition = gridPosition;
  };

  this.getGridPosition = function() {

    return this._gridPosition;
  };
});

exports.GEM_WIDTH = 50;
exports.GEM_HEIGHT = 50;

exports.GEM_COLOR_BLUE = 'blue';
exports.GEM_COLOR_GREEN = 'green';
exports.GEM_COLOR_PURPLE = 'purple';
exports.GEM_COLOR_RED = 'red';
exports.GEM_COLOR_YELLOW = 'yellow';
