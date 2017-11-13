import ui.ImageView as ImageView;
import ui.TextView as TextView;

import animate;

/**
 * Score Manager
 *
 * Manages scoreboard, score calculation, etc
 */
exports = Class(function() {

  this.init = function(opts) {

    this._container = opts.container;

    this._scoreTextView = null;
    this._levelScoreTextView = null;
    this._gameScore = 0;
    this._levelScore = 0;

    this._highScore = 0;

    this._build();
  };

  this._build = function() {

    let scoreView = new ImageView({
      superview: this._container,
      width: 250,
      height: 166,
      x: this._container.style.width / 2 - 125,
      y: -166,
      image: 'resources/images/ui/header.png'
    });

    animate(scoreView).now({ y: 0 });

    this._levelScoreTextView = new TextView({
      superview: scoreView,
      width: scoreView.style.width / 1.5,
      height: scoreView.style.height / 3,
      autoFontSize: true,
      x: (scoreView.style.width - (scoreView.style.width / 1.5)) / 2, // center textView within score ImageView
      y: 90,
      verticalAlign: 'middle',
      horizontalAlign: 'center',
      color: '#fff'
    });

    this._scoreTextView = new TextView({
      superview: scoreView,
      width: scoreView.style.width / 4,
      height: scoreView.style.height / 8,
      autoFontSize: true,
      x: (scoreView.style.width - (scoreView.style.width / 4)) / 2, // center textView above scoreTextView
      y: 75,
      verticalAlign: 'middle',
      horizontalAlign: 'center',
      color: '#fff'
    });

    this._updateScoreViews();
  };

  this.addScoreForSequences = function({ horizSequences, vertSequences }) {

    let addScore = 0;

    for (let i = 0, seqNum = horizSequences.length; i < seqNum; i++) {

      if (horizSequences[i].length >= 3) {

        addScore += this._getScoreForSequenceLength(horizSequences[i].length);
      }
    }

    for (let i = 0, seqNum = vertSequences.length; i < seqNum; i++) {

      if (vertSequences[i].length >= 3) {

        addScore += this._getScoreForSequenceLength(vertSequences[i].length);
      }
    }

    this._gameScore += addScore;
    this._levelScore += addScore;

    this._updateScoreViews();

    if (this._gameScore > this._highScore) this._highScore = this._gameScore;
  };

  this.getScore = function() {

    return this._gameScore;
  };

  this.getLevelScore = function() {

    return this._levelScore;
  };

  this.getHighScore = function() {

    return this._highScore;
  };

  this.resetScore = function() {

    this._gameScore = 0;
    this._levelScore = 0;
    this._updateScoreViews();
  };

  this.resetLevelScore = function() {

    this._levelScore = 0;
    this._updateScoreViews();
  };

  this._getScoreForSequenceLength = function(length) {

    const baseScore = 90 + (Math.floor(Math.random() * 20));
    const bonusForLength = Math.pow(10, (length - 3));

    return baseScore + bonusForLength;
  };

  this._updateScoreViews = function() {

    this._scoreTextView.setText(this._gameScore);
    this._levelScoreTextView.setText(this._levelScore);
  };
});
