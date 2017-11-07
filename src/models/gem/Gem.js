import ui.ImageView as ImageView;

exports = Class(ImageView, function(supr) {

  this.init = function(opts) {

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
  }


});

exports.GEM_WIDTH = 50;
exports.GEM_HEIGHT = 50;
