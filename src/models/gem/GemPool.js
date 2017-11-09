import ui.ViewPool as ViewPool;
import event.input.drag as dragEvent;

import src.models.gem.Gem as Gem;

exports = Class(ViewPool, function(supr) {

  this.init = function(opts) {

      opts = merge(opts, {
      ctor: Gem,
      initCount: opts && opts.initCount || 200
    });

    supr(this, 'init', [opts]);
  };

  this.obtainGem = function(color) {

    if (['blue', 'green', 'purple', 'red', 'yellow'].indexOf(color) === -1) {

      color = 'blue';
    }

    var gem = this.obtainView();

    gem.updateOpts({
      color: color,
      image: `resources/images/gems/${color}.png`
    });

    return gem;
  };
});
