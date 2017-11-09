import math.geom.Rect as Rectangle;
import math.geom.Point as Point;
import ui.ImageView as ImageView;

exports = Class(ImageView, function(supr) {

  this.init = function(opts) {

    this._collisionBox = new Rectangle();
    this._originalPosition = new Point();

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

  this.getCollisionBox = function() {

    this._collisionBox.x = this.style.x;
    this._collisionBox.y = this.style.y;
    this._collisionBox.width = this.style.width;
    this._collisionBox.height = this.style.height;

    return this._collisionBox;
  };

  this.setOriginalPosition = function(point) {

    this._originalPosition = point;
  };

  this.getOriginalPosition = function() {

    return this._originalPosition;
  };
});

exports.GEM_WIDTH = 50;
exports.GEM_HEIGHT = 50;

exports.GEM_COLOR_BLUE = 'blue';
exports.GEM_COLOR_GREEN = 'green';
exports.GEM_COLOR_PURPLE = 'purple';
exports.GEM_COLOR_RED = 'red';
exports.GEM_COLOR_YELLOW = 'yellow';
