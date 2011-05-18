SegmentList.addSegment(function () {
  var START_TIME = 48;

  var audioEngine;
  var audioBuffer, fft;
  var popcorn;
  var scene, animkit, bf3d;

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
    },
  });

}());
 
