function AudioEngine ( updateFunction ) {

  var modPlayer;
  var playing = false;
  var channels = 2;	//stereo
  var sampleRate = 44100;
  var bufferSize = 2048 * channels; 
  var prebufferSize = 12 * channels * 1024; // defines the latency
  var outputAudio = new Audio();
  var currentWritePosition = 0;
  var lastSampleOffset = 0;

  this.audioObject = outputAudio;

  function play() {
    playing = true;
  }; //play

  function stop() {
    playing = false;
  }; //stop

  function writeAudio() {
    if (!playing) { return; }
    var currentSampleOffset = outputAudio.mozCurrentSampleOffset();
    var playHasStopped = currentSampleOffset == lastSampleOffset; // if audio stopped playing, just send data to trigger it to play again.
    while (currentSampleOffset + prebufferSize >= currentWritePosition || playHasStopped ) {
      // generate audio
      var audioData = modPlayer.getSamples(bufferSize);

      // write audio	
      var written = outputAudio.mozWriteAudio(audioData);
      currentWritePosition += written;	//portionSize;
      currentSampleOffset = outputAudio.mozCurrentSampleOffset();
      playHasStopped = 0;
      updateFunction(audioData);
      if (written < audioData.length) { // firefox buffer is full, stop writing
        return;
      }
    }
    lastSampleOffset = outputAudio.mozCurrentSampleOffset();

  }; //writeAudio

  function loadRemote(path) {
    var fetch = new XMLHttpRequest();
    fetch.open('GET', path);
    fetch.overrideMimeType("text/plain; charset=x-user-defined");
    fetch.onreadystatechange = function() {
      if(this.readyState == 4) {
        /* munge response into a binary string */
        var t = this.responseText || "" ;
        var ff = [];
        var mx = t.length;
        var scc= String.fromCharCode;
        for (var z = 0; z < mx; z++) {
          ff[z] = scc(t.charCodeAt(z) & 255);
        }
        var binString = ff.join("");
      
        var modFile = new ModFile(binString);
        modPlayer = new ModPlayer(modFile, 44100);
        play();
      }
    }
    fetch.send();
  }; //loadRemote

  this.playMod = function (modFileName) {
    if (outputAudio.mozSetup) {
      outputAudio.mozSetup(2, sampleRate);
      writeAudio();
      var writeInterval = Math.floor(1000 * bufferSize / sampleRate);
      setInterval(writeAudio, writeInterval);
    } //if
    loadRemote(modFileName);
  };

}; //ModPlayer
