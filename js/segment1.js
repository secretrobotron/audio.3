SegmentList.addSegment(function () {

  var audioEngine, audioBuffer, fft, popcorn;
  var scene, animKit, bf3d, bfMaterial, targetFOV = 80;
  var dateTextObjects = [], dirLight, spotLights = [];

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
        var newY = ring.baseY + fft.spectrum[2*(i)] * 40;
        if (ring.targetY < newY) {
          ring.targetY = newY;
          v = fft.spectrum[2*i] * 50;
        } //if
        ring.targetY = Math.max(ring.targetY - 0.1, ring.baseY);
      } //if
      if (floorColorMode === 0) {
        v = Math.min(0.5, v-0.05);
      }
      else if (floorColorMode === 1) {
        v = Math.max(0.5, v-0.05);
      }
      else if (floorColorMode === 2) {
        v = 1.0;
      } //if

      ring.position[1] -= (ring.position[1] - ring.targetY)*.25;
      ring.material.color = [Math.min(1, v*(Math.sin(seconds)*.5 + 1)*.9), Math.min(1, v*(Math.sin(seconds-1)*.5 + 1)*.9), Math.min(1, v*(Math.sin(seconds-2)*.5 + 1)*.9)];
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
      animKit = new AnimationKit();

      var spotLight;

      spotLight = new CubicVR.Light({
        type: CubicVR.enums.light.type.SPOT_SHADOW,
        specular: [0.4,0.4,0.4],
        diffuse: [1,1,1],
        intensity: .2,
        distance: 100,
        cutoff: 50,
        map_res: 1024,
        position: [-7,10,-5]
      });

      spotLight.lookat([0,0,0]);
      scene.bindLight(spotLight);
      spotLights.push(spotLight);

      spotLight = new CubicVR.Light({
        type: CubicVR.enums.light.type.SPOT_SHADOW,
        specular: [0.4,0.4,0.4],
        diffuse: [1,1,1],
        intensity: .3,
        distance: 100,
        cutoff: 300,
        map_res: 1024,
        position: [0, 8, 0],
      });

      spotLight.lookat([-2, 0, -4]);
      scene.bindLight(spotLight);
      spotLights.push(spotLight);


      dateTextObjects[0] = new CubicVR.SceneObject(CubicVR.primitives.plane({
        size: 8.0,
        material: new CubicVR.Material({
          textures: {
            color: new CubicVR.TextTexture('June', {font:'200pt Arial'}),
          }
        }),
        uvmapper: {
          projectionMode: CubicVR.enums.uv.projection.PLANAR,
          projectionAxis: CubicVR.enums.uv.axis.Z,
          scale: [1.2, 1.2, 1.2],
        },
      }).triangulateQuads().compile().clean());

      dateTextObjects[1] = new CubicVR.SceneObject(CubicVR.primitives.plane({
        size: 8.0,
        material: new CubicVR.Material({
          textures: {
            color: new CubicVR.TextTexture('18', {font:'200pt Arial'}),
          }
        }),
        uvmapper: {
          projectionMode: CubicVR.enums.uv.projection.PLANAR,
          projectionAxis: CubicVR.enums.uv.axis.Z,
          scale: [1.2, 1.2, 1.2],
        },
      }).triangulateQuads().compile().clean());

      bfMaterial = new CubicVR.Material({
        color: [0.8,0.3,0.2],
        specular: [1, 5, 0],
        shininess: 0.9,
        textures: {
          envsphere: new CubicVR.CanvasTexture(document.getElementById("img/fract_reflections.jpg"))
        }
      });
        
      var bfUV = new CubicVR.UVMapper({
        projectionMode: CubicVR.enums.uv.projection.CUBIC,
        scale: [1, 1, 1]
      });

      bf3d = new bitFont3D("box", bfMaterial, bfUV);
      bf3d.loadFont();

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
          animKit.transition(currentSeconds, 20, 3, options.bfStr, 'random', 'out');
          setTimeout(function(){
            scene.removeSceneObject(options.bfStr);
          }, 3000);
        },
      });

      popcorn.code({
        start: 15,
        end: 25,
        onStart: function (options) {
          var bfStr = bf3d.genString("Helsinki");
          animKit.transition(currentSeconds, 5, 3, bfStr, 'explode', 'in');
          options.bfStr = bfStr;
          bfStr.scale = [3, 3, 3];
          bfStr.position = [6, 2.8, -8];
          bfStr.rotation[1] = -45;
          scene.bindSceneObject(bfStr);
        },
        onEnd: function (options) {
          animKit.transition(currentSeconds, 20, 3, options.bfStr, 'random', 'out');
          setTimeout(function(){
            scene.removeSceneObject(options.bfStr);
          }, 3000);
        },
      });

      popcorn.code({
        start: 18,
        end: 28,
        onStart: function (options) {
          var bfStr = bf3d.genString("Finland");
          animKit.transition(currentSeconds, 5, 3, bfStr, 'explode', 'in');
          options.bfStr = bfStr;
          bfStr.scale = [3, 3, 3];
          bfStr.position = [-5, 3.8, -7];
          bfStr.rotation[1] = 45;
          scene.bindSceneObject(bfStr);
          spotLights[1].lookat(bfStr.position);
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
        end: 36,
        onStart: function (options) {
          for (var i=0; i<soundFloorRings.length; ++i) {
            var ring = soundFloorRings[i];
            ring.targetY = 1-i*1.5;
          } //for
          floorShapeMode = 1;
          floorColorMode = 2;

          spotLights[0].position = [2, 2, 35];
          spotLights[1].position = [-1, 10, 35];
          spotLights[0].lookat([1, 0, 0]);
          spotLights[1].lookat([0, 0, 0]);
          spotLights[0].cutoff = 400;
          spotLights[1].cutoff = 400;
          spotLights[0].intensity = .2;
          spotLights[1].intensity = .2;

          dateTextObjects[0].scale = [50, 40, 1];
          dateTextObjects[0].rotation[1] = 180;
          dateTextObjects[0].position = [-15, -2, -10];

          dateTextObjects[1].scale = [80, 100, 1];
          dateTextObjects[1].rotation[1] = 180;
          dateTextObjects[1].position = [30, -12, -15];

          var mot = dateTextObjects[1].motion = new CubicVR.Motion();
          mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.Y, currentSeconds, dateTextObjects[0].position[1]).tension=1;
          mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.Y, currentSeconds+25, dateTextObjects[0].position[1]-60).tension=1;
          mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.Y, currentSeconds+26, dateTextObjects[0].position[1]-420).tension=1;

          var mot = dateTextObjects[0].motion = new CubicVR.Motion();
          mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.X, currentSeconds, dateTextObjects[1].position[2]).tension=1;
          mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.X, currentSeconds+25, dateTextObjects[1].position[2]-60).tension=1;
          mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.X, currentSeconds+26, dateTextObjects[1].position[2]-420).tension=1;

          scene.bindSceneObject(dateTextObjects[0]);
          scene.bindSceneObject(dateTextObjects[1]);

        },
        onEnd: function (options) {
          targetFOV = 65;
        },
      });

      function curveLetters(bfStr) {
        var tilt = 70/bfStr.children.length;
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

      var words = [
        [bf3d.genString(' starring')],
        [bf3d.genString(' secret'),bf3d.genString(' robotron')],
        [bf3d.genString(' ccliffe')],
        [bf3d.genString(' humph')],
        [bf3d.genString(' corban')],
        [bf3d.genString(' cubicvr')],
        [bf3d.genString(' popcorn')],
      ];

      for (var i=0; i<words.length; ++i) {
        (function (bfStrs) {
          popcorn.code({
            start: 36+i*3,
            end: 40+i*3,
            onStart: function (options) {
              for (var j=0; j<bfStrs.length; ++j) {
                var bfStr = bfStrs[j];
                curveLetters(bfStr);
                options.bfStr = bfStr;
                setupLettersMotion(bfStr, currentSeconds, currentSeconds+3, [0, -3*j, 0]);
                bfStr.scale = [3, 3, 3];
                scene.bindSceneObject(bfStr);
              } //for
            },
            onEnd: function (options) {
              for (var j=0; j<bfStrs.length; ++j) {
                scene.removeSceneObject(bfStrs[j]);
              } //for
            },
          });
        })(words[i]);
      } //for

      var FINISH_FLOOR = 40 + words.length*3;

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

      dirLight = new CubicVR.Light({
        type: CubicVR.enums.light.type.DIRECTIONAL,
        specular: [1,1,1],
        intensity: .4,
        direction: CubicVR.vec3.normalize([0.5,-1,0.5])
      });
      scene.bindLight(dirLight);

    },
    load: function () {
      shaders['quarterbloom'].enabled = false;
      shaders['halfbloom'].enabled = true;
      shaders['dof'].enabled = false;
      shaders['ssao'].enabled = true;
      scene.bindSceneObject(soundFloorRingParent);
    },
    unload: function () {
      scene.removeLight(dirLight);
      scene.removeLight(spotLights[0]);
      scene.removeLight(spotLights[1]);
      scene.removeSceneObject(soundFloorRingParent);
      for (var i=0; i<dateTextObjects.length; ++i) {
        scene.removeSceneObject(dateTextObjects[i]);
      } //for
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
        scene.camera.position[0] -= (scene.camera.position[0] - 0)*.85;
        scene.camera.position[1] -= (scene.camera.position[1] - 0)*.85;
        scene.camera.position[2] -= (scene.camera.position[2] - 22)*.85;
        scene.camera.setFOV(scene.camera.fov - (scene.camera.fov - targetFOV)*.15);
      } //if

    },
  });
}());
