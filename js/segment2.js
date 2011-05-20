SegmentList.addSegment(function () {
  var START_TIME = 65;

  var audioEngine;
  var audioBuffer, fft;
  var popcorn;
  var scene, animkit, bf3d;

  var spotLight, pointLight;

  var cameraTarget = [0,0,0],
      cameraMode = 0,
      cameraPosition = [0,0,0];

  var boxRotation = 0;

  function makeWireBoxObject(boxObject,boxSize,boxMesh) {
    for (var i = 1; i <= boxSize; i++) {
      boxObject.bindChild(new CubicVR.SceneObject({position:[-boxSize/2+i,boxSize/2,boxSize/2],mesh:boxMesh}));
      boxObject.bindChild(new CubicVR.SceneObject({position:[-boxSize/2+i,-boxSize/2,boxSize/2],mesh:boxMesh}));
                 
      boxObject.bindChild(new CubicVR.SceneObject({position:[-boxSize/2+i,boxSize/2,-boxSize/2],mesh:boxMesh}));                 
      boxObject.bindChild(new CubicVR.SceneObject({position:[-boxSize/2+i,-boxSize/2,-boxSize/2],mesh:boxMesh}));
                 
      boxObject.bindChild(new CubicVR.SceneObject({position:[-boxSize/2,boxSize/2,-boxSize/2+i],mesh:boxMesh}));
      boxObject.bindChild(new CubicVR.SceneObject({position:[-boxSize/2,-boxSize/2,-boxSize/2+i],mesh:boxMesh}));
                 
      boxObject.bindChild(new CubicVR.SceneObject({position:[boxSize/2,boxSize/2,-boxSize/2+i],mesh:boxMesh}));
      boxObject.bindChild(new CubicVR.SceneObject({position:[boxSize/2,-boxSize/2,-boxSize/2+i],mesh:boxMesh}));
                 
      boxObject.bindChild(new CubicVR.SceneObject({position:[boxSize/2,-boxSize/2+i,boxSize/2],mesh:boxMesh}));
      boxObject.bindChild(new CubicVR.SceneObject({position:[boxSize/2,-boxSize/2+i,-boxSize/2],mesh:boxMesh}));
                 
      boxObject.bindChild(new CubicVR.SceneObject({position:[-boxSize/2,-boxSize/2+i,boxSize/2],mesh:boxMesh}));
      boxObject.bindChild(new CubicVR.SceneObject({position:[-boxSize/2,-boxSize/2+i,-boxSize/2],mesh:boxMesh}));
    }

    boxObject.bindChild(new CubicVR.SceneObject({position:[-boxSize/2,-boxSize/2,-boxSize/2],mesh:boxMesh}));
  }; //makeWireBoxObject

  var boxObject;

  return new Segment({
    startTime: START_TIME,

    prepare: function (options) {
      audioEngine = options.audioEngine;
      popcorn = options.popcorn;
      scene = options.scene;
      animkit = new AnimationKit();

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

      var boxMaterial = new CubicVR.Material({
        color: [0.3,0.4,0.9],
        specular: [1,1,1],
        shininess: 0.9,
        textures: {
          envsphere: new CubicVR.CanvasTexture(document.getElementById("img/fract_reflections.jpg"))
        }
      });

      var boxMesh = CubicVR.primitives.box({
        size: 1.0,
        material: boxMaterial,
        uvmapper: {
          projectionMode: CubicVR.enums.uv.projection.CUBIC,
          scale: [1,1,1]
        }
      });

      boxMesh.triangulateQuads().compile().clean();

      boxObject = new CubicVR.SceneObject(null);

      makeWireBoxObject(boxObject,7,boxMesh);
      makeWireBoxObject(boxObject,3,boxMesh);

      animkit.transition(START_TIME+0, 10, 2, boxObject, "spiral2");
      animkit.transition(START_TIME+15, 40, 2, boxObject, "explode","out");
      animkit.transition(START_TIME+20, 10, 2, boxObject, "random");
      animkit.transition(START_TIME+28, 50, 2, boxObject, "spiral2","out");
      animkit.transition(START_TIME+48, 40, 2, boxObject, "explode");

      spotLight = new CubicVR.Light({
        type: CubicVR.enums.light.type.SPOT,
        specular: [0.4,0.4,0.4],
        diffuse: [1,1,1],
        intensity: .3,
        distance: 200,
        cutoff: 400,
        //map_res: 1024,
        position: [0, 8, -8],
      });

      pointLight = new CubicVR.Light({
        type: CubicVR.enums.light.type.POINT,
        specular: [1,1,1],
        intensity: .5,
        distance: 100,
        position: [0, 2, 0],
      });

      spotLight.lookat([0, 0, 0]);

      var words = [
        bf3d.genString('Moz Labs'),
        bf3d.genString('Alternative Party'),
        bf3d.genString('& DOT'),
        bf3d.genString('Present:'),
      ];

      for (var j=0; j<words.length; ++j) {
        (function (bfStr, i) {
          popcorn.code({
            start: START_TIME+21+i/2,
            end: START_TIME+43+i/2,
            onStart: function (options) {
              bfStr.position = [-3+5*i, 3-i, -8];
              var startTime = START_TIME + 20;
              var mot = bfStr.motion = new CubicVR.Motion();
              mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.X, startTime, bfStr.position[0]);
              mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.X, startTime+3, bfStr.position[0]+2);
              mot.setBehavior(CubicVR.enums.motion.ROT, CubicVR.enums.motion.Y, CubicVR.enums.envelope.behavior.CONSTANT, CubicVR.enums.envelope.behavior.CONSTANT);
              options.bfStr = bfStr;
              animkit.transition(START_TIME+40+i/2, 40, 2, bfStr, "explode", 'out');
              scene.bindSceneObject(bfStr);
            },
            onEnd: function (options) {
              scene.removeSceneObject(options.bfStr);
            },
          });

          popcorn.code({
            start: START_TIME+27+i*2,
            end: START_TIME+27.5+i*2,
            onStart: function (options) {
              cameraTarget = bfStr.position;
              cameraPosition = [bfStr.position[0]+2, bfStr.position[1]-1.3, bfStr.position[2]+2.5];
            },
          });
        })(words[j], j);
      } //for

      popcorn.code({
        start: START_TIME+25.5,
        end: START_TIME+26,
        onStart: function (options) {
          cameraMode = 1;
          cameraPosition = [4, 2, 5];
        },
      });

      popcorn.code({
        start: START_TIME+35,
        end: START_TIME+50,
        onStart: function (options) {
          spotLight.position = [0, 8, 0];
          cameraPosition = [2, 5, -9];
          cameraTarget = [0, 3, 8];
          var bfStrs = [
            bf3d.genString('Demo Art'),
            bf3d.genString('on the'),
            bf3d.genString('Open Web platform'),
          ];

          bfStrs[0].scale = [5, 5, 5];
          bfStrs[0].position = [-5, 5.5, 9];
          bfStrs[0].rotation[1] = 170;
          bfStrs[1].scale = [1, 1, 1];
          bfStrs[1].position = [0, 0, 10];
          bfStrs[1].rotation[1] = 180;
          bfStrs[2].scale = [4, 4, 4];
          bfStrs[2].position = [-11, -4.5, 11.5];
          bfStrs[2].rotation[1] = 190;

          var bfStr = bfStrs[0];
          var mot = bfStr.motion = new CubicVR.Motion();
          mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.X, START_TIME+35, bfStr.position[0]);
          mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.X, START_TIME+50, bfStr.position[0]+1);
          mot.setBehavior(CubicVR.enums.motion.POS, CubicVR.enums.motion.X, CubicVR.enums.envelope.behavior.CONSTANT, CubicVR.enums.envelope.behavior.CONSTANT);
          bfStr = bfStrs[1];
          mot = bfStr.motion = new CubicVR.Motion();
          mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.Y, START_TIME+35, bfStr.position[1]);
          mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.Y, START_TIME+50, bfStr.position[1]-1);
          mot.setBehavior(CubicVR.enums.motion.POS, CubicVR.enums.motion.Y, CubicVR.enums.envelope.behavior.CONSTANT, CubicVR.enums.envelope.behavior.CONSTANT);
          bfStr = bfStrs[2];
          mot = bfStr.motion = new CubicVR.Motion();
          mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.Z, START_TIME+35, bfStr.position[2]);
          mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.Z, START_TIME+50, bfStr.position[2]+1);
          mot.setBehavior(CubicVR.enums.motion.POS, CubicVR.enums.motion.Z, CubicVR.enums.envelope.behavior.CONSTANT, CubicVR.enums.envelope.behavior.CONSTANT);

          scene.bindSceneObject(bfStrs[0]);
          scene.bindSceneObject(bfStrs[1]);
          scene.bindSceneObject(bfStrs[2]);

          animkit.transition(START_TIME+47, 40, 3, bfStrs[0], "explode", "out");
          animkit.transition(START_TIME+47, 40, 3, bfStrs[1], "explode", "out");
          animkit.transition(START_TIME+47, 40, 3, bfStrs[2], "explode", "out");

          spotLight.lookat(bfStrs[1].position);
         
          options.bfStrs = bfStrs;
        },
        onEnd: function (options) {
          scene.removeSceneObject(options.bfStrs[0]);
          scene.removeSceneObject(options.bfStrs[1]);
          scene.removeSceneObject(options.bfStrs[2]);
        },
      });

      popcorn.code({
        start: START_TIME+50,
        end: START_TIME+53,
        onStart: function (options) {
          cameraTarget = [0, 0, 0];
          cameraPosition = [10, 10, 10];
        },
        onEnd: function (options) {
          boxRotation = 1;
        },
      });

      popcorn.code({
        start: START_TIME+57,
        end: START_TIME+60,
        onStart: function (options) {
          animkit.transition(START_TIME+57, 300, 3, boxObject, "explode", "out");
        },
      });

    },
    load: function () {
      shaders['ssao'].enabled = false;
      scene.bindLight(spotLight);
      scene.bindLight(pointLight);
      scene.bindSceneObject(boxObject);
      scene.camera.target = [0,0,0];
      cameraTarget = [0,0,0];
    },
    unload: function () {
      scene.removeLight(spotLight);
      scene.removeLight(pointLight);
      scene.removeSceneObject(boxObject);
    },
    update: function (timer) {
      var seconds = timer.getSeconds();

      boxRotation *= 1.07;
      boxObject.rotation[1] += boxRotation;

      if (cameraMode === 0) {
        scene.camera.position[0] = 5 * Math.sin(seconds / 5) + Math.cos(seconds / 2) * 3.5;
        scene.camera.position[2] = 5 * Math.cos(seconds / 5) + Math.cos(seconds / 2) * 3.5;
      }
      else if (cameraMode === 1) {
        scene.camera.target[0] -= (scene.camera.target[0] - cameraTarget[0]) *.35;
        scene.camera.target[1] -= (scene.camera.target[1] - cameraTarget[1]) *.35;
        scene.camera.target[2] -= (scene.camera.target[2] - cameraTarget[2]) *.35;
        scene.camera.position[0] -= (scene.camera.position[0] - cameraPosition[0]) *.35;
        scene.camera.position[1] -= (scene.camera.position[1] - cameraPosition[1]) *.35;
        scene.camera.position[2] -= (scene.camera.position[2] - cameraPosition[2]) *.35;
      } //if
    },
  });

}());
 
