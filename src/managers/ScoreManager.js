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
    this._gameScore = 0;

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

    this._scoreTextView = new TextView({
      superview: scoreView,
      width: scoreView.style.width / 1.5,
      height: scoreView.style.height / 3,
      autoFontSize: true,
      x: (scoreView.style.width - (scoreView.style.width / 1.5)) / 2, // center textView within score ImageView
      y: 80,
      verticalAlign: 'middle',
      horizontalAlign: 'center',
      color: '#fff'
    });

    this._scoreTextView.setText(`${ this._gameScore }`);
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
    this._scoreTextView.setText(this._gameScore);
  };

  this.getScores = function() {

    return this._gameScore;
  };

  this.resetScore = function() {

    this._gameScore = 0;
    this._scoreTextView.setText(this._gameScore);
  };

  this._getScoreForSequenceLength = function(length) {

    const baseScore = 90 + (Math.floor(Math.random() * 20));
    const bonusForLength = Math.pow(10, (length - 3));

    return baseScore + bonusForLength;
  };
});
