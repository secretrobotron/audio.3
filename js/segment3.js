SegmentList.addSegment(function () {
  var START_TIME = 126;

  var audioEngine;
  var audioBuffer, fft;
  var popcorn;
  var scene, animkit, bf3d;

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
          envsphere: new CubicVR.Texture("img/fract_reflections.jpg")
        }
      });
        
      var bfUV = new CubicVR.UVMapper({
        projectionMode: CubicVR.enums.uv.projection.CUBIC,
        scale: [1, 1, 1]
      });

      bf3d = new bitFont3D("box", bfMaterial, bfUV);
      bf3d.loadFont();

    },
    load: function () {
    },
    unload: function () {
    },
    update: function (timer) {
      var seconds = timer.getSeconds();
    },
  });

}());
 
