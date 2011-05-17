function AnimationKit() {

    this.transition = function (start_time, distance, totaltime, bf_str, anim_method, in_out) {

        if (!bf_str.children) return;

        var strlen = bf_str.children.length;

        if (anim_method === "spiral") {
            for (var j = 0; j < strlen; j++) {
                if (!bf_str.children[j].motion) bf_str.children[j].motion = new CubicVR.Motion();
                var mot = bf_str.children[j].motion;
                var spintotal = 360.0 * 1.5;
                var spinstep = (360.0 / 5.0);
                var spincount = (spintotal / spinstep);
                var ystep = distance / spincount;
                var ypos = distance;

                var tofs = 0.1 * j;
                var c = 0;
                for (i = 0; i < spintotal - spinstep; i += spinstep) {
                    var t = (c / spincount) * totaltime + start_time + tofs;

                    mot.setKey(0, 0, t, distance * (1.0 - c / spincount) * Math.sin(i * (180.0 / M_PI)));
                    mot.setKey(0, 1, t, ypos);
                    mot.setKey(0, 2, t, distance * (1.0 - c / spincount) * Math.cos(i * (180.0 / M_PI)));

                    mot.setKey(1, 0, t, i + tofs);
                    mot.setKey(1, 2, t, -i + tofs);
                    ypos -= ystep;
                    c++;
                }

                mot.setKey(0, 0, start_time + totaltime + tofs, bf_str.children[j].position[0]);
                mot.setKey(0, 1, start_time + totaltime + tofs, bf_str.children[j].position[1]);
                mot.setKey(0, 2, start_time + totaltime + tofs, bf_str.children[j].position[2]);
                mot.setKey(1, 0, start_time + totaltime + tofs, 0);
                mot.setKey(1, 2, start_time + totaltime + tofs, 0);

            }

        }
        if (anim_method === "random") {
            for (var j = 0; j < strlen; j++) {
                if (!bf_str.children[j].motion) bf_str.children[j].motion = new CubicVR.Motion();
                var mot = bf_str.children[j].motion;

                var tofs = 0;
                for (i = 0; i < totaltime; i += totaltime / 5.0) {
                    var t = start_time + i;

                    mot.setKey(0, 0, t, (Math.random() - 0.5) * distance);
                    mot.setKey(0, 1, t, (Math.random() - 0.5) * distance);
                    mot.setKey(0, 2, t, (Math.random() - 0.5) * distance);

                    mot.setKey(1, 0, t, (Math.random() - 0.5) * 360);
                    mot.setKey(1, 2, t, (Math.random() - 0.5) * 360);
                }

                mot.setKey(0, 0, start_time + totaltime + tofs, bf_str.children[j].position[0]);
                mot.setKey(0, 1, start_time + totaltime + tofs, bf_str.children[j].position[1]);
                mot.setKey(0, 2, start_time + totaltime + tofs, bf_str.children[j].position[2]);
                mot.setKey(1, 0, start_time + totaltime + tofs, 0);
                mot.setKey(1, 2, start_time + totaltime + tofs, 0);

            }
        }
    }
}