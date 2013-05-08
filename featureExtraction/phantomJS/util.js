/**
 * @author 
 */

/* from mache util.js */
var equals = function(obj, x)
{
  for(var p in obj)
  {
      if (obj[p])
      {
      	if(x[p])
      	{
          switch(typeof(obj[p])) {
              case 'object':
                  if (!equals(obj[p], x[p])) { return false; } break;
              case 'function':
                  if (typeof(x[p])=='undefined' ||
                      (p != 'equals' && obj[p].toString() != x[p].toString()))
                      return false;
                  break;
              default:
                  if (obj[p] != x[p]) { return false; }
          }
        }
        else
        {
        	return false;
        }
      }
      else
      {
          if (x[p])
              return false;
      }
  }
  return true;
};

var print = function(obj) {
	var str = "{";
	for (prop in obj)
	{
		str += prop + ': ' + obj[prop] + '\n';
	}
	str += "}";
	console.log(str);
};

var rgb2hsv = function(r, g, b) {
    var min = Math.min(r, g, b);
    var max = Math.max(r, g, b);
    var delta = max - min;
    var h, s, v = max;

    v = Math.floor(max / 255 * 100);
    if ( max != 0 )
        s = Math.floor(delta / max * 100);
    else {
        // black
        return [0, 0, 0];
    }

    if( r == max )
        h = ( g - b ) / delta;         // between yellow & magenta
    else if( g == max )
        h = 2 + ( b - r ) / delta;     // between cyan & yellow
    else
        h = 4 + ( r - g ) / delta;     // between magenta & cyan

    h = Math.floor(h * 60);            // degrees
    if( h < 0 ) h += 360;

    return [h, s, v];
};