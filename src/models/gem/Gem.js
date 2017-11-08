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

    this._build();
  };

  this._build = function() {

    this.on('DragStart', bind(this, function() {

      this.emit('gem:DragStart');
    }));

    this.on('Drag', bind(this, function(startEvt, dragEvt, delta) {

      this.emit('gem:Drag');
    }));

    this.on('DragStop', bind(this, function() {

      this.emit('gem:DragStop');
    }));
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
