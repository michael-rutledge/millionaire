const Howl = require('howler').Howl;
const Howler = require('howler').Howler;

class AudioPlayer {

  constructor() {
    this.currentMusicSrc = undefined;
    this.currentMusic = undefined;
  }


  // PRIVATE METHODS

  // To be executed on playing of current music.
  _stopMusic(musicToStop) {
    if (musicToStop) {
      musicToStop.stop();
    }
  }


  // PUBLIC METHODS

  // Expected format of audioCommand: {
  //   string musicSrc
  //   string fxSrc
  //   boolean loop
  //   boolean stopPreviousSounds
  //   boolean stopAllSounds
  // }
  executeAudioCommand(audioCommand) {
    if (!audioCommand) return;

    if (audioCommand.fxSrc) {
      var sound = new Howl({
        src: audioCommand.fxSrc,
        html5: true,
        loop: false,
        onplay: () => {
          if (audioCommand.stopPreviousSounds) {
            this._stopMusic(this.currentMusic);
          }
        }
      });
      sound.play();
    }

    if (audioCommand.musicSrc && this.currentMusicSrc != audioCommand.musicSrc) {
      var musicToStop = this.currentMusic;
      this.currentMusic = new Howl({
        src: audioCommand.musicSrc,
        loop: audioCommand.loop,
        html5: true,
        onplay: () => { this._stopMusic(musicToStop); }
      });
      this.currentMusic.play();
      this.currentMusicSrc = audioCommand.musicSrc;
    }

    if (audioCommand.stopAllSounds) {
      Howler.stop();
    }
  }

  // Stops all currently playing sounds.
  stopAllSounds() {
    Howler.stop();
    this.currentMusicSrc = undefined;
    this.currentMusic = undefined;
  }
}

module.exports = AudioPlayer;