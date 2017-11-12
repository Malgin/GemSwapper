import menus.views.MenuView as MenuView;
import menus.views.TextDialogView as TextDialogView;

import menus.constants.menuConstants as menuConstants;

exports = Class(MenuView, function (supr) {

  this.init = function (opts) {

    this.EVENT_START_GAME = 'StartGame';

    opts = merge(opts, {
      title: 'GemSwapper',
      items: [
        {
          item: 'Start game',
          action: this.EVENT_START_GAME
        },
        {
          item: 'Score',
          action: '' // TODO TBD
        }
      ],
      showTransitionMethod: menuConstants.transitionMethod.SCALE,
      hideTransitionMethod: menuConstants.transitionMethod.SCALE
    });

    supr(this, 'init', [opts]);
  };
});
