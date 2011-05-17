function bitFont3D(elementSource_in,material,uvmapper) {
  this.element_size = 1.0/8.0;
  this.elementSource = null;
  this.trans = new CubicVR.Transform();
  this.chars = [];
  this.material = new CubicVR.Material();
  
  this.genString = function (str_in) {
      var letters = [];
      var strlen = str_in.length;
      var spacing = 0.75;
      var ofs = -strlen / 2.0 * spacing;

      textObj = new CubicVR.SceneObject(null);

      for (var i = 0; i < strlen; i++) {
          var fontObj = new CubicVR.SceneObject({
              mesh: this.chars[str_in.charCodeAt(i)],
              position: [ofs + i * spacing, 0, 0],
              scale: [1, 1, 1]
          });

          textObj.bindChild(fontObj);
      }

      return textObj;
  }
  
  
  this.getElementSize = function() {
    return this.element_size;
  };
  
  this.setElementSource = function(obj_in) {
    this.elementSource = obj_in;
  }
  
  this.setElement = function(type_str,material,uvmapper,undef) {
    if (type_str === "box") {
      this.elementSource =  CubicVR.primitives.box({size:this.element_size,material:material?material:this.material,uvmapper:uvmapper?uvmapper:undef});
    } else if (type_str === "sphere") {
      this.elementSource =  CubicVR.primitives.sphere({radius:this.element_size/2.0,lon:10,lat:5,material:material?material:this.material,uvmapper:uvmapper?uvmapper:undef});
    } else {
      alert("unknown bf3d element type: "+type_str);
    }
  }
  
  this.genLetterMesh = function(lnum) {
    var bf = bitFont[lnum];
    trans = this.trans;

    var c = 0;
    for (var i = 0; i<64; i++) { c+=bf[i]; }
    if (!c) {
      return null;
    }

    var dest = new CubicVR.Mesh();

    for (var i = 0; i<8; i++) {
      for (var j = 0; j<8; j++) {
        var idx = j*8+i;

        if (bf[idx]===1) {
          trans.clearStack();
          trans.translate([-this.element_size*4.0+i*this.element_size,-this.element_size*4.0+(8-j)*this.element_size,0]);

          dest.booleanAdd(this.elementSource,trans);
        }
      }
    }

    return dest;
  }

  this.loadFont = function() {
    for (var i = 0; i < 255; i++) {
      this.chars[i] = this.genLetterMesh(i);
      
      // apply any material stuff here..
      
      if (this.chars[i]) {
        this.chars[i].triangulateQuads().calcNormals().compile().clean();
      }
    }
  }

  // if (typeof(elementSource_in) === 'object') {
  //   this.elementSource = elementSource_in;
  // } else if (typeof(elementSource_in) === 'string') {
    elementSource_in = this.setElement(elementSource_in,material,uvmapper);
  // }
}

