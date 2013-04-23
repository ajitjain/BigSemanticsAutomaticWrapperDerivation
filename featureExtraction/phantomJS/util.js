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
}

var print = function(obj) {
	var str = "{";
	for (prop in obj)
	{
		str += prop + ': ' + obj[prop] + '\n';
	}
	str += "}";
	console.log(str);
}