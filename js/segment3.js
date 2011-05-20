SegmentList.addSegment(function () {
  var START_TIME = 126;
  //var START_TIME = 1;

  var audioEngine;
  var audioBuffer, fft;
  var popcorn;
  var scene, animkit, bf3d;

  var logoObject, words, wordsWidth, audioPlane, audioTexture;
  var canvas, links = [], mvc;
  var currentSeconds;
  var rootLinkObject;

  return new Segment({
    startTime: START_TIME,

    prepare: function (options) {
      audioEngine = options.audioEngine;
      popcorn = options.popcorn;
      scene = options.scene;
      canvas = options.canvas;
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

      audioTexture = new CubicVR.CanvasTexture({
        update: function (canvas, ctx) {
          ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
          ctx.fillRect(0, 0, 512, 512);
          ctx.strokeStyle = "rgb("+Math.floor(255*(Math.sin(currentSeconds/2)*.5+1))+", "+Math.floor(255*(Math.sin(currentSeconds/4)*.5+1))+", "+Math.floor(255*(Math.sin(currentSeconds/3)*.5+1))+")";
          ctx.moveTo(0, 128);
          ctx.lineWidth = 4;
          ctx.beginPath();
          for (var i=0; i<256 && i<audioBuffer.length; ++i) {
            ctx.lineTo(i, 128 + audioBuffer[i]*64);
          }//for
          ctx.stroke();
        },
        width: 256,
        height: 256,
      });

      var s = 50.0;
      audioPlane = new CubicVR.SceneObject(CubicVR.primitives.plane({
        size: s,
        material: new CubicVR.Material({
          textures: {
            color: audioTexture,
          }
        }),
        uvmapper: {
          projectionMode: CubicVR.enums.uv.projection.PLANAR,
          projectionAxis: CubicVR.enums.uv.axis.Z,
          scale: [s, s, s],
        },
      }).triangulateQuads().compile().clean());

      function makeLinkObject(text, link, color, position, scale, rotation) {
        var linkObject = new CubicVR.SceneObject(CubicVR.primitives.plane({
          size: 1,
          material: new CubicVR.Material({
            shininess: 2,
            specular: [1, 1, 1],
            diffuse: [1, 1, 1],
            textures: {
              color: new CubicVR.TextTexture(text, {font: '100pt Arial', color: color}),
            },
          }),
          uvmapper: {
            projectionMode: CubicVR.enums.uv.projection.PLANAR,
            projectionAxis: CubicVR.enums.uv.axis.Z,
            scale: [1, 1, 1],
          },
        }).triangulateQuads().compile().clean());

        linkObject.position = position;
        linkObject.rotation = rotation;
        linkObject.scale = scale;

        linkObject.href = link;

        links.push(linkObject);
      };

      makeLinkObject('mozillalabs.com/demoparty/helsinki', 'http://mozillalabs.com/demoparty/helsinki', '#ffaa00', [0, .8, 0], [1.1, .2, 1], [0, 0, 0]);
      makeLinkObject('github.com/cjcliffe/CubicVR.js', 'http://github.com/cjcliffe/CubicVR.js', '#ffffff', [-1, .4, 0], [.8, .2, 1], [0, -45, -10]);
      makeLinkObject('github.com/BillyWM/jsmodplayer', 'http://github.com/BillyWM/jsmodplayer', '#ffffff', [-1, -.4, 0], [.8, .2, 1], [0, -45, 10]);
      makeLinkObject('github.com/webmademovies/popcorn-js', 'http://github.com/webmademovies/popcorn-js', '#ffffff', [1, -.4, 0], [.8, .2, 1], [0, 45, -10]);
      makeLinkObject('github.com/secretrobotron/audio.3', 'http://github.com/secretrobotron/audio.3', '#00aaff', [1, .4, 0], [.9, .2, 1], [0, 45, 10]);

      audioPlane.position = [0, 0, 6];

      var logoMaterial = new CubicVR.Material({
        textures: {
          color: new CubicVR.CanvasTexture(document.getElementById("img/logo.jpg")),
          alpha: new CubicVR.CanvasTexture(document.getElementById("img/logo-alpha.jpg")),
        },
      });

      var logoMesh = CubicVR.primitives.plane({
        size: 5.0,
        material: logoMaterial,
        uvmapper: {
          projectionMode: CubicVR.enums.uv.projection.PLANAR,
          projectionAxis: CubicVR.enums.uv.axis.Z,
          scale: [5, 5, 5],
        }
      });

      logoMesh.triangulateQuads().compile().clean();

      logoObject = new CubicVR.SceneObject(logoMesh);

      logoObject.position = [0, 0, 3.5];
      logoObject.rotation[1] = 90;

      var mot = logoObject.motion = new CubicVR.Motion();
      mot.setKey(CubicVR.enums.motion.ROT, CubicVR.enums.motion.Y, START_TIME+1, 90).tension=1;
      mot.setKey(CubicVR.enums.motion.ROT, CubicVR.enums.motion.Y, START_TIME+3, 0).tension=1;
      mot.setBehavior(CubicVR.enums.motion.ROT, CubicVR.enums.motion.Y, CubicVR.enums.envelope.behavior.CONSTANT, CubicVR.enums.envelope.behavior.CONSTANT);

      var str = 'Register now!! June 18th, Helsinki, Finland. Mozilla Labs, Alternative Party and DOT present: Demo Art on the Open Web Platform; THE FLAME PARTY!!   --   Thanks to jsmodplayer, popcorn.js, cubicvr.js, for driving this thing, and xtd/mystic & pulse for the tunes. #audio expects you to show your stuff at FlameParty. -- ';
      words = bf3d.genString(str);

      words.position = [0, -1.5, 2];
      words.rotation = [0, 180, 0];
      wordsWidth = str.length;
      mot = words.motion = new CubicVR.Motion();
      mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.X, START_TIME, -str.length/2).tension=0;
      mot.setKey(CubicVR.enums.motion.POS, CubicVR.enums.motion.X, START_TIME+90, str.length/2).tension=0;
      mot.setBehavior(CubicVR.enums.motion.POS, CubicVR.enums.motion.X, CubicVR.enums.envelope.behavior.REPEAT, CubicVR.enums.envelope.behavior.REPEAT);

      for (var i=0; i<links.length; ++i) {
        links[i].restingScale = [links[i].scale[0], links[i].scale[1], links[i].scale[2]];
        links[i].targetScale = [links[i].scale[0], links[i].scale[1], links[i].scale[2]];
        links[i].activeScale = [links[i].scale[0]*2, links[i].scale[1]*2, links[i].scale[2]*2];
      } //for

      rootLinkObject = new CubicVR.SceneObject(null);
      for (var i=0; i<links.length; ++i) {
        rootLinkObject.bindChild(links[i]);
      } //for

      animkit.transition(START_TIME+3, 20, 3, rootLinkObject, "spiral");

    },
    load: function () {
      shaders['ssao'].enabled = true;
      shaders['halfbloom'].enabled = true;
      scene.camera.position = [0, 0, -1.5];
      scene.camera.target = [0, 0, 0];
      scene.camera.setFOV(80);
      scene.bindSceneObject(audioPlane);
      scene.bindSceneObject(rootLinkObject, true);
      scene.bindSceneObject(logoObject);
      scene.bindSceneObject(words);
      var spotLight = (new CubicVR.Light({
        type: CubicVR.enums.light.type.SPOT_SHADOW,
        specular: [1 ,1, 1],
        diffuse: [1, 1, 1],
        intensity: .2,
        distance: 35,
        cutoff: 200,
        map_res: 1024,
        position: [0, -2, -3],
      }));
      spotLight.lookat([0, 0, 0]);
      scene.bindLight(spotLight);

      var pLight = new CubicVR.Light({
        type: CubicVR.enums.light.type.POINT,
        specular: [1, 1, 1],
        diffuse: [1, 1, 1],
        intensity: .6,
        distance: 20,
        position: [0, 0, -2],
      });
      scene.bindLight(pLight);

      mvc = new CubicVR.MouseViewController(canvas, scene.camera);
      canvas.addEventListener('click', function (e) {
        for (var i=0; i<links.length; ++i) {
          if (links[i].mouseOver) {
            window.open(links[i].href, '_blank');
          } //if
        } //for
      }, false);
    },
    unload: function () {
    },
    update: function (timer) {
      currentSeconds = timer.getSeconds();

      var wordsPos = words.position;
      for (var i=0; i<words.children.length; ++i) {
        var child = words.children[i];
        var childPos = child.position[0] - wordsPos[0];
        if (childPos < -20 || childPos > 20) {
          child.visible = false;
        }
        else {
          child.visible = true;
        } //if
      } //for

      var rayTest = scene.bbRayTest(scene.camera.position, mvc.getMousePosition(), 3);
      if (rayTest.length > 0) {
        var objs = [];
        var cursor = 'default';
        for (var i=0; i<rayTest.length; ++i) {
          objs.push(rayTest[i].obj);
        } //for
        for (var i=0; i<links.length; ++i) {
          if (objs.indexOf(links[i]) > -1) {
            cursor = 'pointer';
            links[i].targetScale = links[i].activeScale;
            links[i].mouseOver = true;
          }
          else {
            links[i].targetScale = links[i].restingScale;
            links[i].mouseOver = false;
          } //if
        } //for
        document.body.style.cursor = cursor;
      }
      else {
        document.body.style.cursor = 'default';
        for (var i=0; i<links.length; ++i) {
          links[i].targetScale = links[i].restingScale;
          links[i].mouseOver = false;
        } //for
      } //if

      for (var i=0; i<links.length; ++i) {
        var scale = links[i].scale;
        var tScale = links[i].targetScale;
        scale[0] -= (scale[0] - tScale[0]) * .85;
        scale[1] -= (scale[1] - tScale[1]) * .85;
        scale[2] -= (scale[2] - tScale[2]) * .85;
        links[i].scale = scale;
      } //for

      audioBuffer = audioEngine.audioBuffer;
      if (audioBuffer) {
        audioTexture.update();
      } //if
    },
  });

}());
 
