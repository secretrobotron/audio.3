SegmentList.addSegment(function () {

  var audioEngine;
  var audioBuffer, fft;
  var popcorn;
  var scene, animKit, bf3d;

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

  var floorUV = {
    projectionMode: CubicVR.enums.uv.projection.SPHERICAL,
    projectionAxis: CubicVR.enums.uv.axis.Y,
    scale: [1, 1, 1]
  };
  
  var SOUND_FLOOR_RINGS = 25,
      SOUND_FLOOR_Y = -5,
      SOUND_FLOOR_H = 2.0,
      SOUND_FLOOR_SPACING = 0.35,
      MAX_WIDTH = 45;

  var soundFloorRings = [];
  var soundFloorRingParent = new CubicVR.SceneObject(new CubicVR.Mesh());

  var floorBumpTexture, floorNormalTexture, floorMaterial,
      floorShapeMode = 0, floorColorMode = 0,
      currentSeconds;

  function updateSoundFloor(seconds) {
    for (var i=0; i<SOUND_FLOOR_RINGS; ++i) {
      var ring = soundFloorRings[i];
      var v = ring.material.color[0];
      if (floorShapeMode === 0) {
        var newY = ring.baseY + fft.spectrum[2*(i)] * 30;
        if (ring.targetY < newY) {
          ring.targetY = newY;
          v = fft.spectrum[2*i] * 10;
        } //if
        ring.targetY = Math.max(ring.targetY - 0.1, ring.baseY);
      } //if
      if (floorColorMode === 0) {
        v = Math.min(0.5, v-0.05);
      }
      else if (floorColorMode === 1) {
        v = Math.max(0.2, v-0.05);
      }
      else if (floorColorMode === 2) {
        v = 0.8;
      } //if

      ring.position[1] -= (ring.position[1] - ring.targetY)*.25;
      ring.material.color = [Math.min(1, v*(Math.sin(seconds)*.5 + 1)*.5), Math.min(1, v*(Math.sin(seconds-1)*.5 + 1)*.5), Math.min(1, v*(Math.sin(seconds-2)*.5 + 1)*.5)];
      if (floorShapeMode === 0) {
        ring.rotation[1] = Math.sin(seconds + (SOUND_FLOOR_RINGS-i)*0.1)*120;
      }
      else {
        ring.rotation[1] = seconds * 100 + 30*i;
      } //if
    } //for
    if (floorShapeMode === 1) {
      floorBumpTexture.update();
      floorNormalTexture.update();
    } //if
  }; //updateSoundFloor

  return new Segment({
    prepare: function (options) {

      audioEngine = options.audioEngine;
      popcorn = options.popcorn;
      scene = options.scene;
      bf3d = options.bf3d;
      animKit = options.animKit;

      floorBumpTexture = new CubicVR.CanvasTexture({
        update: function (canvas, ctx) {
          for (var i=0; i<10; ++i) {
            var radius = Math.round(Math.random()*3);
            ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
            ctx.beginPath();
            ctx.arc(Math.floor(Math.random()*256), Math.floor(Math.random()*256), radius, 0, Math.PI*2, true);
            ctx.fill();
          } //for
        },
        width: 256,
        height: 256,
      });

      floorNormalTexture = new CubicVR.NormalMapGen(floorBumpTexture, 256, 256);

      floorMaterial = new CubicVR.Material({
        color: [0.3, 0.3, 0.3],
        textures: {
          bump: floorBumpTexture,
          normal: floorNormalTexture,
        },
        opacity: 1,
      });

      for (var i=0; i<SOUND_FLOOR_RINGS; ++i) {
        var floorMaterial = new CubicVR.Material({
          color: [0.3, 0.3, 0.3],
          textures: {
            bump: floorBumpTexture,
            normal: floorNormalTexture,
          },
          opacity: 1,
        });
        var soundFloorMesh = new CubicVR.Mesh();
        makeCylinderLathe(soundFloorMesh, SOUND_FLOOR_H, i*MAX_WIDTH/SOUND_FLOOR_RINGS, (i+1)*MAX_WIDTH/SOUND_FLOOR_RINGS-SOUND_FLOOR_SPACING, 3, floorMaterial, floorUV);
        soundFloorMesh.triangulateQuads().compile().clean();
        var soundFloorObject = new CubicVR.SceneObject(soundFloorMesh);
        soundFloorRingParent.bindChild(soundFloorObject);
        soundFloorRings.push(soundFloorObject);
        soundFloorObject.targetY = SOUND_FLOOR_Y + i/3;
        soundFloorObject.baseY = SOUND_FLOOR_Y + i/3;
        soundFloorObject.rotation[1] = 3*i;
        soundFloorObject.material = floorMaterial;
      } //for

      popcorn.code({
        start: 1,
        end: 13,
        onStart: function (options) {
          var bfStr = bf3d.genString("#audio welcomes you");
          animKit.transition(currentSeconds, 5, 3, bfStr, "spiral");
          options.bfStr = bfStr;
          scene.bindSceneObject(bfStr);
        },
        onEnd: function (options) {
          animKit.transition(currentSeconds, 20, 3, options.bfStr, 'explode', 'out');
          setTimeout(function(){
            scene.removeSceneObject(options.bfStr);
          }, 3000);
        },
      });

      popcorn.code({
        start: 9,
        end: 24,
        onStart: function (options) {
          var bfStr = bf3d.genString("to flameparty!!");
          animKit.transition(currentSeconds, 5, 3, bfStr, "spiral");
          options.bfStr = bfStr;
          scene.bindSceneObject(bfStr);
        },
        onEnd: function (options) {
          animKit.transition(currentSeconds, 20, 3, options.bfStr, 'explode', 'out');
          setTimeout(function(){
            scene.removeSceneObject(options.bfStr);
          }, 3000);
        },
      });

      popcorn.code({
        start: 9,
        end: 11,
        onStart: function (options) {
          floorColorMode = 1;
        },
      });

      popcorn.code({
        start: 28,
        end: 29,
        onStart: function (options) {
          for (var i=0; i<soundFloorRings.length; ++i) {
            var ring = soundFloorRings[i];
            ring.targetY = 1-i*1.5;
          } //for
          floorShapeMode = 1;
          floorColorMode = 2;
          scene.camera.position[1] = 2;
        },
        onEnd: function (options) {
        },
      });

      function curveLetters(bfStr) {
        var tilt = 120/bfStr.children.length;
        for (var i=0; i<bfStr.children.length; ++i) {
          var letter = bfStr.children[i];
          var xofs = letter.position[0];
          letter.position[2] = bfStr.children.length/2+Math.cos(xofs/2);
          letter.rotation[1] = xofs * tilt;
        } //for
      }; //curveLetters

      function setupLettersMotion(bfStr, startTime, endTime, offset) {
        offset = offset || [0,0,0];
        bfStr.position = [0, -20, 0];
        var mot = bfStr.motion = new CubicVR.Motion();
        mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.Y, startTime, -20+offset[1]);
        mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.Y, startTime+.5, 0+offset[1]);
        mot.setKey(CubicVR.enums.motion.ROT, CubicVR.enums.motion.Y, startTime, -180).tension = 1;
        mot.setKey(CubicVR.enums.motion.ROT, CubicVR.enums.motion.Y, startTime+.5, 0).tension = 1;
        mot.setBehavior(CubicVR.enums.motion.ROT, CubicVR.enums.motion.Y, CubicVR.enums.envelope.behavior.CONSTANT, CubicVR.enums.envelope.behavior.CONSTANT);

        mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.Y, endTime, 0+offset[1]);
        mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.Y, endTime+.5, -20+offset[1]);
        mot.setKey(CubicVR.enums.motion.ROT, CubicVR.enums.motion.Y, endTime, 0).tension = 1;
        mot.setKey(CubicVR.enums.motion.ROT, CubicVR.enums.motion.Y, endTime+.5, 180).tension = 1;
        mot.setBehavior(CubicVR.enums.motion.ROT, CubicVR.enums.motion.Y, CubicVR.enums.envelope.behavior.CONSTANT, CubicVR.enums.envelope.behavior.CONSTANT);
 
      }; //setupLettersMotion

      popcorn.code({
        start: 29,
        end: 33,
        onStart: function (options) {
          var bfStr = bf3d.genString('starring');
          curveLetters(bfStr);
          options.bfStr = bfStr;
          setupLettersMotion(bfStr, currentSeconds, currentSeconds+3);
          bfStr.scale = [3, 3, 3];
          scene.bindSceneObject(bfStr);
        },
        onEnd: function (options) {
          scene.removeSceneObject(options.bfStr);
        },
      });

      popcorn.code({
        start: 35,
        end: 39,
        onStart: function (options) {
          var bfStr = [bf3d.genString('secret'), bf3d.genString('robotron')];
          curveLetters(bfStr[0]);
          curveLetters(bfStr[1]);
          options.bfStr = bfStr;
          setupLettersMotion(bfStr[0], currentSeconds, currentSeconds+3);
          setupLettersMotion(bfStr[1], currentSeconds, currentSeconds+3, [0,-3,0]);
          bfStr[0].scale = [3, 3, 3];
          bfStr[1].scale = [3, 3, 3];
          scene.bindSceneObject(bfStr[0]);
          scene.bindSceneObject(bfStr[1]);
        },
        onEnd: function (options) {
          scene.removeSceneObject(options.bfStr[0]);
          scene.removeSceneObject(options.bfStr[1]);
        },
      });

      popcorn.code({
        start: 40,
        end: 44,
        onStart: function (options) {
          var bfStr = bf3d.genString('ccliffe');
          curveLetters(bfStr);
          options.bfStr = bfStr;
          setupLettersMotion(bfStr, currentSeconds, currentSeconds+3);
          bfStr.scale = [3, 3, 3];
          scene.bindSceneObject(bfStr);
        },
        onEnd: function (options) {
          scene.removeSceneObject(options.bfStr);
        },
      });

      var FINISH_FLOOR = 47;

      var mot = soundFloorRingParent.motion = new CubicVR.Motion();
      mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.Y, FINISH_FLOOR, 0);
      mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.Y, FINISH_FLOOR + .2, 0.6).tension = 1;
      mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.Y, FINISH_FLOOR + 2, -100).tension = 1;
      mot.setBehavior(CubicVR.enums.motion.POS, CubicVR.enums.motion.Y, CubicVR.enums.envelope.behavior.CONSTANT, CubicVR.enums.envelope.behavior.CONSTANT);

      popcorn.code({
        start: FINISH_FLOOR+5,
        end: FINISH_FLOOR+6,
        onStart: function (options) {
          soundFloorRingParent.visible = false;
        }
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
      if (floorShapeMode === 0) {
        scene.camera.position[0] = 3 + 4 * Math.sin(currentSeconds/1.2) + Math.cos(currentSeconds/2) * 1.5;
        scene.camera.position[2] = 3 + Math.sin(currentSeconds/5) + Math.cos(currentSeconds/2) * 1.5;
      }
      else if (floorShapeMode === 1) {
        scene.camera.position[0] = (scene.camera.position[0] - 0)*.85;
        scene.camera.position[2] = (scene.camera.position[2] + 4)*.85;
      } //if
    },
  });
}());
