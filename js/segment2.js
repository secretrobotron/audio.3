SegmentList.addSegment(function () {
  var START_TIME = 48;

  var audioEngine;
  var audioBuffer, fft;
  var popcorn;
  var scene, animkit, bf3d;

  var cameraTarget = [0,0,0],
      cameraMode = 0,
      cameraPosition = [0,0,0];

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
      bf3d = options.bf3d;
      animkit = options.animKit;

      var boxMaterial = new CubicVR.Material({
        color: [0.3,0.4,0.9],
        specular: [1,1,1],
        shininess: 0.9,
        textures: {
          envsphere: new CubicVR.Texture("img/fract_reflections.jpg")
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

      animkit.transition(START_TIME+0, 10, 2, boxObject, "spiral");
      animkit.transition(START_TIME+15, 40, 2, boxObject, "explode","out");
      animkit.transition(START_TIME+20, 10, 2, boxObject, "random");
      animkit.transition(START_TIME+28, 50, 2, boxObject, "spiral","out");
      animkit.transition(START_TIME+48, 40, 2, boxObject, "explode");


      popcorn.code({
        start: START_TIME+21,
        end: START_TIME+43,
        onStart: function (options) {
          var bfStr = bf3d.genString('humph');
          bfStr.position = [-3, 3, -8];
          var startTime = START_TIME + 20;
          var mot = bfStr.motion = new CubicVR.Motion();
          mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.X, startTime, bfStr.position[0]);
          mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.X, startTime+3, bfStr.position[0]+2);
          mot.setBehavior(CubicVR.enums.motion.ROT, CubicVR.enums.motion.Y, CubicVR.enums.envelope.behavior.CONSTANT, CubicVR.enums.envelope.behavior.CONSTANT);
          options.bfStr = bfStr;
          animkit.transition(START_TIME+40, 40, 2, bfStr, "explode", 'out');
          scene.bindSceneObject(bfStr);
        },
        onEnd: function (options) {
          scene.removeSceneObject(options.bfStr);
        },
      });

      popcorn.code({
        start: START_TIME+21,
        end: START_TIME+43,
        onStart: function (options) {
          var bfStr = bf3d.genString('& corban');
          bfStr.position = [2, 2, -8];
          var startTime = START_TIME + 20;
          var mot = bfStr.motion = new CubicVR.Motion();
          mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.X, startTime, bfStr.position[0]);
          mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.X, startTime+3, bfStr.position[0]+2);
          mot.setBehavior(CubicVR.enums.motion.ROT, CubicVR.enums.motion.Y, CubicVR.enums.envelope.behavior.CONSTANT, CubicVR.enums.envelope.behavior.CONSTANT);
          options.bfStr = bfStr;
          animkit.transition(START_TIME+41, 40, 2, bfStr, "explode", 'out');
          scene.bindSceneObject(bfStr);
        },
        onEnd: function (options) {
          scene.removeSceneObject(options.bfStr);
        },
      });

    },
    load: function () {
      scene.bindSceneObject(boxObject);
    },
    unload: function () {
      scene.removeSceneObject(boxObject);
    },
    update: function (timer) {
      var seconds = timer.getSeconds();
      scene.camera.position[0] = 5 * Math.sin(seconds / 5) + Math.cos(seconds / 2) * 3.5;
      scene.camera.position[2] = 5 * Math.cos(seconds / 5) + Math.cos(seconds / 2) * 3.5;
      //scene.camera.target[0] = (scene.camera.target[0] - cameraTarget[0]) *.85;
      //scene.camera.target[1] = (scene.camera.target[1] - cameraTarget[1]) *.85;
      //scene.camera.target[2] = (scene.camera.target[2] - cameraTarget[2]) *.85;
    },
  });

}());
 
