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

          this._container.emit('gem:Drag');
        }));

        gem.on('DragStop', bind(this, function() {

          this._container.emit('gem:DragStop');
        }));

        this._gemGrid[row][col] = gem;

        this._gemHighestZIndex += 1;
      }
    }
  }
});
