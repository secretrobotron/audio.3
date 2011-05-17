function AnimationKit() {

    this.transition = function (start_time, distance, totaltime, sceneObj, anim_method, in_out) {

        if (!in_out) in_out = "in";
        if (!sceneObj.children) return;

        var nchild = sceneObj.children.length;

        if (anim_method === "spiral") {            
            for (var j = 0; j < nchild; j++) {
                if (!sceneObj.children[j].motion) sceneObj.children[j].motion = new CubicVR.Motion();
                var mot = sceneObj.children[j].motion;
                var spintotal = 360.0 * 1.5;
                var spinstep = (360.0 / 5.0);
                var spincount = (spintotal / spinstep);
                var ystep = distance / spincount;
                var ypos = distance;

                var t;
                var tofs = 0.1 * j;
                var c = 0;
                
                if (in_out == "in") {
                  for (i = 0; i < spintotal - spinstep; i += spinstep) {
                      t = (c / spincount) * totaltime + start_time + tofs;

                      mot.setKey(0, 0, t, distance * (1.0 - c / spincount) * Math.sin(i * (180.0 / M_PI)));
                      mot.setKey(0, 1, t, ypos);
                      mot.setKey(0, 2, t, distance * (1.0 - c / spincount) * Math.cos(i * (180.0 / M_PI)));

                      mot.setKey(1, 0, t, i + tofs);
                      mot.setKey(1, 2, t, -i + tofs);
                      ypos -= ystep;
                      c++;
                  }

                  t = start_time + totaltime + tofs;

                  mot.setKey(0, 0, t, sceneObj.children[j].position[0]);
                  mot.setKey(0, 1, t, sceneObj.children[j].position[1]);
                  mot.setKey(0, 2, t, sceneObj.children[j].position[2]);
                  mot.setKey(1, 0, t, 0);
                  mot.setKey(1, 2, t, 0);
                } 
                else { // end: if in
                  mot.setKey(0, 0, start_time, sceneObj.children[j].position[0]);
                  mot.setKey(0, 1, start_time, sceneObj.children[j].position[1]);
                  mot.setKey(0, 2, start_time, sceneObj.children[j].position[2]);
                  mot.setKey(1, 0, start_time, 0);
                  mot.setKey(1, 2, start_time, 0);

                  ypos = 0;

                  for (i = spinstep; i < spintotal; i += spinstep) {
                      t = 1.0+(c / spincount) * totaltime + start_time + tofs;

                      mot.setKey(0, 0, t, distance * (c / spincount) * Math.sin(i+90 * (180.0 / M_PI)));
                      mot.setKey(0, 1, t, ypos);
                      mot.setKey(0, 2, t, distance * (c / spincount) * Math.cos(i+90 * (180.0 / M_PI)));

                      mot.setKey(1, 0, t, i + tofs);
                      mot.setKey(1, 2, t, -i + tofs);
                      ypos += ystep;
                      c++;
                  }
                } // end: if out
            } // end: for (j)

        } // end: anim method 'spiral'
        if (anim_method === "random") {
            for (var j = 0; j < nchild; j++) {
                if (!sceneObj.children[j].motion) sceneObj.children[j].motion = new CubicVR.Motion();
                var mot = sceneObj.children[j].motion;
               var t;
                
                if (in_out==="in") {
                  for (i = 0; i < totaltime; i += totaltime / 5.0) {
                      t = start_time + i;

                      mot.setKey(0, 0, t, (Math.random() - 0.5) * distance);
                      mot.setKey(0, 1, t, (Math.random() - 0.5) * distance);
                      mot.setKey(0, 2, t, (Math.random() - 0.5) * distance);

                      mot.setKey(1, 0, t, (Math.random()) * 360);
                      mot.setKey(1, 2, t, (Math.random()) * 360);
                  }

                  t = start_time + totaltime

                  mot.setKey(0, 0, t, sceneObj.children[j].position[0]);
                  mot.setKey(0, 1, t, sceneObj.children[j].position[1]);
                  mot.setKey(0, 2, t, sceneObj.children[j].position[2]);
                  mot.setKey(1, 0, t, 0);
                  mot.setKey(1, 2, t, 0);
                } else {  // end: if 'in'
                  
                  mot.setKey(0, 0, start_time, sceneObj.children[j].position[0]);
                  mot.setKey(0, 1, start_time, sceneObj.children[j].position[1]);
                  mot.setKey(0, 2, start_time, sceneObj.children[j].position[2]);
                  mot.setKey(1, 0, start_time, 0);
                  mot.setKey(1, 2, start_time, 0);

                  for (i = 1; i < totaltime; i += totaltime / 5.0) {
                      t = start_time + i;

                      mot.setKey(0, 0, t, (Math.random() - 0.5) * distance);
                      mot.setKey(0, 1, t, (Math.random() - 0.5) * distance);
                      mot.setKey(0, 2, t, (Math.random() - 0.5) * distance);

                      mot.setKey(1, 0, t, (Math.random()) * 360);
                      mot.setKey(1, 2, t, (Math.random()) * 360);
                  }
                  
                  t = start_time+totaltime+totaltime/5.0;

                  var r = CubicVR.vec3.normalize([(Math.random()-0.5)*2.0,(Math.random()-0.5)*2.0,(Math.random()-0.5)*2.0]);
                  mot.setKey(0, 0, t, distance*r[0]);
                  mot.setKey(0, 1, t, distance*r[1]);
                  mot.setKey(0, 2, t, distance*r[2]);
                  mot.setKey(1, 0, t, Math.random()*360.0);
                  mot.setKey(1, 2, t, Math.random()*360.0);

                } // end: if 'out'
            } // end: for (j)
        } // end: anim method 'random'
        if (anim_method === "explode") {
            for (var j = 0; j < nchild; j++) {
                if (!sceneObj.children[j].motion) sceneObj.children[j].motion = new CubicVR.Motion();
                var mot = sceneObj.children[j].motion;
               var t;
                
                if (in_out==="in") {
                  t = start_time;

                  var r = CubicVR.vec3.normalize([(Math.random()-0.5)*2.0,(Math.random()-0.5)*2.0,(Math.random()-0.5)*2.0]);
                  mot.setKey(0, 0, t, distance*r[0]);
                  mot.setKey(0, 1, t, distance*r[1]);
                  mot.setKey(0, 2, t, distance*r[2]);

                  mot.setKey(1, 0, t, (Math.random()) * 360);
                  mot.setKey(1, 2, t, (Math.random()) * 360);

                  mot.setKey(1, 0, start_time+totaltime/2.0, (Math.random()) * 360);
                  mot.setKey(1, 2, start_time+totaltime/2.0, (Math.random()) * 360);

                  t = start_time + totaltime

                  mot.setKey(0, 0, t, sceneObj.children[j].position[0]);
                  mot.setKey(0, 1, t, sceneObj.children[j].position[1]);
                  mot.setKey(0, 2, t, sceneObj.children[j].position[2]);
                  mot.setKey(1, 0, t, 0);
                  mot.setKey(1, 2, t, 0);

                } else {  // end: if 'in'
                  t = start_time;

                  mot.setKey(0, 0, t, sceneObj.children[j].position[0]);
                  mot.setKey(0, 1, t, sceneObj.children[j].position[1]);
                  mot.setKey(0, 2, t, sceneObj.children[j].position[2]);
                  mot.setKey(1, 0, t, 0);
                  mot.setKey(1, 2, t, 0);

                  mot.setKey(1, 0, start_time+totaltime/2.0, Math.random()*360.0);
                  mot.setKey(1, 2, start_time+totaltime/2.0, Math.random()*360.0);

                  t = start_time+totaltime;

                  var r = CubicVR.vec3.normalize([(Math.random()-0.5)*2.0,(Math.random()-0.5)*2.0,(Math.random()-0.5)*2.0]);
                  mot.setKey(0, 0, t, distance*r[0]);
                  mot.setKey(0, 1, t, distance*r[1]);
                  mot.setKey(0, 2, t, distance*r[2]);
                  mot.setKey(1, 0, t, Math.random()*360.0);
                  mot.setKey(1, 2, t, Math.random()*360.0);

                } // end: if 'out'
            } // end: for (j)
        } // end: anim method 'explode'
 
    }
}