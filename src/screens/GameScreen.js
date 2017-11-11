import math.geom.Point as Point;

import animate;

import ui.ParticleEngine as ParticleEngine;

import ui.ImageView as ImageView;

import src.managers.LevelManager as LevelManager;
import src.managers.ScoreManager as ScoreManager;
import src.LevelGrid as LevelGrid;
import src.models.gem.Gem as Gem;

const SWAP_FORBIDDEN_ANIMATION_DURATION = 50;
const SWAP_CLUE_ANIMATION_DURATION = 600;
const SWAP_CLUE_ANIMATION_PAUSE = 300;

exports = Class(ImageView, function(supr) {

  this.init = function(opts) {

    this._levelManager = null;
    this._level = null;
    this._dragStarted = false;
    this._userInteractionStopped = true;
    this._dragStartCoords = null;

    this._initialClueTimer = null;
    this._clueTimer = null;
    this._clueSwapGems = null;

    this._forbiddenSwapTimer = null;

    this.width = opts.width;
    this.height = opts.height;

    opts = merge(opts, {
      image: 'resources/images/ui/background.png'
    });

    supr(this, 'init', [opts]);

    this._build();
  };

  this._build = function() {

    this._pEngine = new ParticleEngine({
      superview: this,
      width: 1,
      height: 1,
      initCount: 1000,
      zIndex: 1000
    });

    // init level manager
    this._levelManager = new LevelManager({
      container: this
    });

    this._scoreManager = new ScoreManager({
      container: this
    });

    // init first level
    this._level = this._levelManager.initLevel();

    this._level.on('BuildLevelFinished', bind(this, function() {

      this._enableUserInteraction();
      this._fireUpClueAnimation();
    }));

    this.on('InputStart', bind(this, function(event, point) {

      this._dragStarted = true;
      this._dragStartCoords = point;
      this._origGem = this._level.getGemByCoords(point);
    }));

    this.on('InputMove', bind(this, function(event, point) {

      if (!this._dragStarted || this._userInteractionStopped) return;

      var delta = { x: point.x - this._dragStartCoords.x, y: point.y - this._dragStartCoords.y };

      if (this._movedFarEnough(delta)) {

        // get drag direction
        var direction = this._getDragDirection(delta);

        if (this._level.gemPresentToDirection(this._origGem, direction)) {

          this._userInteractionStopped = true;

          var targetGem = this._level.getTargetGem(this._origGem, direction);

          if (this._level.swapPossibleFor(this._origGem, targetGem)) {

            console.log(`direction is ${ direction }, delta is x: ${ delta.x }, y: ${ delta.y }`);

            this._clearClue();

            this._level.swapGems(this._origGem, targetGem);
          } else {

            // swap is forbidden, play animation, and don't move gems
            var origGemCoords = new Point(this._origGem.style.x, this._origGem.style.y);
            var targetGemCoords = new Point(targetGem.style.x, targetGem.style.y);

            animate(this._origGem)
                .now ({ x: origGemCoords.x - 2, y: origGemCoords.y - 2}, SWAP_FORBIDDEN_ANIMATION_DURATION)
                .then({ x: origGemCoords.x + 2, y: origGemCoords.y + 2}, SWAP_FORBIDDEN_ANIMATION_DURATION)
                .then({ x: origGemCoords.x - 2, y: origGemCoords.y - 2}, SWAP_FORBIDDEN_ANIMATION_DURATION)
                .then({ x: origGemCoords.x, y: origGemCoords.y}, SWAP_FORBIDDEN_ANIMATION_DURATION);

            animate(targetGem)
                .now ({ x: targetGemCoords.x - 2, y: targetGemCoords.y - 2}, SWAP_FORBIDDEN_ANIMATION_DURATION)
                .then({ x: targetGemCoords.x + 2, y: targetGemCoords.y + 2}, SWAP_FORBIDDEN_ANIMATION_DURATION)
                .then({ x: targetGemCoords.x - 2, y: targetGemCoords.y - 2}, SWAP_FORBIDDEN_ANIMATION_DURATION)
                .then({ x: targetGemCoords.x, y: targetGemCoords.y}, SWAP_FORBIDDEN_ANIMATION_DURATION)
                .then(bind(this, this._enableUserInteraction));
          }
        }
      }
    }));

    this.on('InputSelect', bind(this, function(event, point) {

      this._dragStarted = false;
    }));

    this._level.on('GemSwapComplete', bind(this, function() {

      let sequences = {
        horizSequences: this._level.detectHorizontalSequences(),
        vertSequences: this._level.detectVerticalSequences()
      };

      this._scoreManager.addScoreForSequences(sequences);
      this._level.deleteSequences(sequences);
    }));

    this._level.on('GemDestroyed', bind(this, function(gem) {

      let particleObjects = this._pEngine.obtainParticleArray(10);

      for (let i = 0; i < 10; i++) {

        let pObj = particleObjects[i];

        pObj.x = gem.style.x;
        pObj.y = gem.style.y;

        pObj.dx = Math.random() * -100 * (Math.random() > 0.5 ? 1 : -1);
        pObj.dy = Math.random() * -100 * (Math.random() > 0.5 ? 1 : -1);
        pObj.ttl = 600;
        pObj.opacity = 1;
        pObj.dopacity = -1;
        pObj.width = 50;
        pObj.height = 50;
        pObj.image = `resources/images/particles/gleam_${ gem.color }.png`;
      }

      this._pEngine.emitParticles(particleObjects);

      this._level.releaseGem(gem);
    }));

    this._level.on('DeleteSequencesComplete', bind(this, function() {

      this._level.detectGapsAndMoveUpperGems();
    }));

    this._level.on('GapsDetectionComplete', bind(this, function() {

      this._level.spawnNewGems();
    }));

    this._level.on('GemSpawnComplete', bind(this, function() {

      if (this._level.hasDeletableSequences()) {

        let sequences = {
          horizSequences: this._level.detectHorizontalSequences(),
          vertSequences: this._level.detectVerticalSequences()
        };

        this._scoreManager.addScoreForSequences(sequences);
        this._level.deleteSequences(sequences);
      } else {

        this._enableUserInteraction();

        if (this._initialClueTimer === null && this._clueTimer === null) {

          this._fireUpClueAnimation();
        }
      }
    }));
  };

  this.tick = function(dt) {

    this._pEngine.runTick(dt);
  };

  this._getDragDirection = function(dragDelta) {

    if (Math.abs(dragDelta.x) >= Math.abs(dragDelta.y)) {
      // horizontal drag
      if (dragDelta.x > 0) return LevelGrid.DIRECTION_RIGHT;
      else return LevelGrid.DIRECTION_LEFT;
    } else {
      // vertical drag
      if (dragDelta.y > 0) return LevelGrid.DIRECTION_DOWN;
      else return LevelGrid.DIRECTION_UP;
    }
  };

  this._movedFarEnough = function(delta) {

    return Math.abs(delta.x) >= Gem.GEM_WIDTH / 2 || Math.abs(delta.y) >= Gem.GEM_HEIGHT / 2;
  };

  this._fireUpClueAnimation = function() {

    // start timer for a clue on swapping gems
    this._initialClueTimer = setTimeout(bind(this, function() {

      this._clueTimer = setInterval(bind(this, this._animateClue), SWAP_CLUE_ANIMATION_DURATION + SWAP_CLUE_ANIMATION_PAUSE);
    }), 3000);
  };

  this._animateClue = function() {

    if (this._clueSwapGems === null) {
      this._clueSwapGems = this._level.getRandomPossibleSwap();
    }

    const [gem1, gem2] = this._clueSwapGems;

    animate(gem1)
        .now({ opacity: 0.8 }, SWAP_CLUE_ANIMATION_DURATION / 2)
        .then({ opacity: 1 }, SWAP_CLUE_ANIMATION_DURATION / 2);

    animate(gem2)
        .now({ opacity: 0.8 }, SWAP_CLUE_ANIMATION_DURATION / 2)
        .then({ opacity: 1 }, SWAP_CLUE_ANIMATION_DURATION / 2);
  };

  this._clearClue = function() {

    clearInterval(this._initialClueTimer);
    clearInterval(this._clueTimer);

    this._initialClueTimer = null;
    this._clueTimer = null;
    this._clueSwapGems = null;
  };

  this._enableUserInteraction = function() {

    this._forbiddenSwapTimer = setTimeout(bind(this, function enableUserInteraction() {

      if (!this._dragStarted) {

        // unblock user interaction if user stopped dragging
        this._userInteractionStopped = false;
        clearInterval(this._forbiddenSwapTimer);
      } else {

        // renew the check if uesr is still dragging
        this._forbiddenSwapTimer = setTimeout(bind(this, enableUserInteraction, 100));
      }
    }), 100);
  };
});
