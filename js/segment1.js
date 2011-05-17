SegmentList.addSegment(function () {

  var audioEngine;
  var audioBuffer, fft;
  var popcorn;

  function makeCylinderLathe(mesh, height, inner_radius, outer_radius, res, material, uvmapper) {
    var pointList = new Array();
    var thick = outer_radius-inner_radius;
    var radius = inner_radius+(thick)/2.0;
    var transform;

    pointList.push([inner_radius, 0, 0]);
    pointList.push([inner_radius+thick, 0, 0]);
    pointList.push([inner_radius+thick, height, 0]);
    pointList.push([inner_radius, height, 0]);
    pointList.push([inner_radius, 0, 0]);

    CubicVR.genLatheObject(mesh, pointList, res, material, transform, uvmapper);
  };

  var uvplanar = {
    projectionMode: CubicVR.enums.uv.projection.CUBIC,
    projectionAxis: CubicVR.enums.uv.axis.X,
    scale: [3, 3, 1]
  };
  
  var SOUND_FLOOR_RINGS = 25,
      SOUND_FLOOR_Y = -5,
      SOUND_FLOOR_H = 2.0,
      SOUND_FLOOR_SPACING = 0.35,
      MAX_WIDTH = 45;

  var soundFloorRings = [];
  var soundFloorRingParent = new CubicVR.SceneObject(new CubicVR.Mesh());

  var floorBumpTexture, floorNormalTexture, floorMaterial,
      currentSeconds;

  function updateSoundFloor(seconds) {
    for (var i=0; i<SOUND_FLOOR_RINGS; ++i) {
      var ring = soundFloorRings[i];
      var newY = ring.baseY + fft.spectrum[2*(i)] * 20;
      if (ring.targetY < newY) {
        ring.targetY = newY;
      } //if
      ring.position[1] -= (ring.position[1] - ring.targetY)*.25;
      ring.targetY = Math.max(ring.targetY - 0.1, ring.baseY);
      //ring.rotation[1] -= (SOUND_FLOOR_RINGS - i) * 0.05;
      ring.rotation[1] = Math.sin(seconds + (SOUND_FLOOR_RINGS-i)*0.1)*120;
    } //for
    floorBumpTexture.update();
    //floorNormalTexture.update();
  }; //updateSoundFloor

  return new Segment({
    prepare: function (options) {

      audioEngine = options.audioEngine;
      popcorn = options.popcorn;

      floorBumpTexture = new CubicVR.CanvasTexture({
        update: function (canvas, ctx) {
          var s = currentSeconds;
          ctx.fillStyle = "#802005";
          ctx.fillRect(0, 0, 256, 256);
          ctx.strokeStyle = "#903006";
          ctx.moveTo(0, 128);
          ctx.beginPath();
          for (var i=0; i<256; ++i) {
            ctx.lineTo(i, Math.min(256, (256+audioBuffer[i]*500)));
          } //for
          ctx.stroke();
        },
        width: 256,
        height: 256,
      });

      //floorNormalTexture = new CubicVR.NormalMapGen(floorBumpTexture);

      floorMaterial = new CubicVR.Material({
        color: [0.2, 0.3, 0],
        textures: {
          bump: floorBumpTexture,
          //normal: floorNormalTexture,
        },
        opacity: 1,
      });

      for (var i=0; i<SOUND_FLOOR_RINGS; ++i) {
        var soundFloorMesh = new CubicVR.Mesh();
        makeCylinderLathe(soundFloorMesh, SOUND_FLOOR_H, i*MAX_WIDTH/SOUND_FLOOR_RINGS, (i+1)*MAX_WIDTH/SOUND_FLOOR_RINGS-SOUND_FLOOR_SPACING, 3, floorMaterial, uvplanar);
        soundFloorMesh.triangulateQuads().compile().clean();
        var soundFloorObject = new CubicVR.SceneObject(soundFloorMesh);
        soundFloorRingParent.bindChild(soundFloorObject);
        soundFloorRings.push(soundFloorObject);
        soundFloorObject.targetY = SOUND_FLOOR_Y + i/3;
        soundFloorObject.baseY = SOUND_FLOOR_Y + i/3;
        soundFloorObject.rotation[1] = 3*i;
      } //for

      popcorn.code({
        start: 1,
        end: 2,
        onStart: function (options) {
          bfstr = ta.genString("#audio welcomes you");
          ta.animateString(ml.getTimerSeconds(), 5, 3, bfstr, "spiral");
        },
      });

      popcorn.code({
        start: 6,
        end: 7,
        onStart: function (options) {
          for (var i = 0, iMax = bfstr.length; i < iMax; i++) {
            scene.removeSceneObject(bfstr[i]);
          }
          bfstr = ta.genString("to flameparty");
          ta.animateString(ml.getTimerSeconds(), 5, 3, bfstr, "spiral");
        },
      });

    },
    load: function () {
      scene.bindSceneObject(soundFloorRingParent);
    },
    unload: function () {
      scene.removeSceneObject(soundFloorRingParent);
    },
    update: function (timer) {
      audioBuffer = audioEngine.audioBuffer;
      fft = audioEngine.fft;
      currentSeconds = timer.getSeconds();
      if (audioBuffer) {
        updateSoundFloor(currentSeconds);
      } //if
    },
  });
}());
