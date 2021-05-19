export function getDomNodePath(el){
  // If this ain't a real node, don't try drawing a map to it.
  if (!el.nodeName) return '';

  var stack = [];
  while ( el.parentNode != null ) {
    // Leverage node IDs for targeting nodes directly where possible.
    if ( el.hasAttribute('id') && el.id != '' ) {
      stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
    } else {
      // Find the position of the target element relative to its siblings, and take note
      // of how many siblings it has. This lets us correctly identify a node among its
      // brethern later on.
      var sibCount = 0;
      var sibIndex = 0;
      for ( var i = 0; i < el.parentNode.childNodes.length; i++ ) {
        var sib = el.parentNode.childNodes[i];
        if ( sib.nodeName == el.nodeName ) {
          if ( sib === el ) {
            sibIndex = sibCount;
          }
          sibCount++;
        }
      }

      // If there is more than one element nearby of the same type as our target, select it
      // by relative index; otherwise, just select it by name and call it good.
      if ( sibCount > 1 ) {
        stack.unshift(el.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');
      } else {
        stack.unshift(el.nodeName.toLowerCase());
      }
    }
    el = el.parentNode;
  }

  // Create a valid jQuery selector (NOTE: not vanilla CSS) that points at the original target,
  // ignoring the root of the DOM (the '<HTML>' node).
  return stack.slice(1).join(' > ');
}


// via: http://stackoverflow.com/a/16742828/2511985
