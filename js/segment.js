function Segment (options) {
  this.active = false;
  this.startTime = options.startTime || 0;
  this.update = options.update || function (timer) {};
  this.updateFunction = function (timer) {
    if (this.active) {
      this.update(timer);
    } //if
  };
  this.prepare = options.prepare || function (prepareOptions) {};
  this.load = options.load || function () {};
  this.unload = options.unload || function () {};
}; //Segment

var SegmentList = new function () {
  this.segments = [];
  this.currentSegment = undefined;

  this.addSegment = function (segment) {
    this.segments.push(segment);
  };

  this.updateSegments = function (timer) {
    for (var i=0, l=this.segments.length; i<l; ++i) {
      this.segments[i].updateFunction(timer);
    } //for
  };

  this.prepareSegments = function (options) {
    for (var i=0, l=this.segments.length; i<l; ++i) {
      this.segments[i].prepare(options);
    } //for
  };

  this.nextSegment = function (lastSceneTimeout) {
    lastSegment = this.currentSegment;

    if (this.currentSegment === undefined) {
      this.currentSegment = this.segments[0];
    }
    else {
      this.currentSegment = this.segments[this.segments.indexOf(this.currentSegment)+1];
    } //if

    this.currentSegment.load();
    this.currentSegment.active = true;

    if (lastSegment) {
      var time = lastSceneTimeout || 0;
      setTimeout(function () {
        lastSegment.active = false;
        lastSegment.unload();
      }, time);
    } //if
  };

}; //SegmentList
