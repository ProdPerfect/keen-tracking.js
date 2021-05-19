export function getDomNodePath(targetNode){
  // If this ain't a real node, don't try drawing a map to it.
  if (!targetNode.nodeName) return '';

  var parentSelectors = [];
  while ( targetNode.parentNode != null ) {
    // Leverage node IDs for targeting nodes directly where possible.
    if ( targetNode.hasAttribute('id') && targetNode.id != '' ) {
      parentSelectors.unshift(targetNode.nodeName.toLowerCase() + '#' + targetNode.id);
    } else {
      // Find the position of the target element relative to its siblings, and take note
      // of how many siblings it has. This lets us correctly identify a node among its
      // bretheren later on.
      var siblingCount = 0;
      var targetNodePosition = 0;
      for ( var i = 0; i < targetNode.parentNode.childNodes.length; i++ ) {
        var sibling = targetNode.parentNode.childNodes[i];
        if ( sibling.nodeName == targetNode.nodeName ) {
          // Take note of our target node's position relative to its bretheren.
          if ( sibling === targetNode ) {
            targetNodePosition = siblingCount;
          }
          siblingCount++;
        }
      }

      // If there is more than one element nearby of the same type as our target, select it
      // by relative index; otherwise, just select it by name and call it good.
      if ( siblingCount > 1 ) {
        parentSelectors.unshift(targetNode.nodeName.toLowerCase() + ':eq(' + targetNodePosition + ')');
      } else {
        parentSelectors.unshift(targetNode.nodeName.toLowerCase());
      }
    }
    targetNode = targetNode.parentNode;
  }

  // Create a valid jQuery selector (NOTE: not vanilla CSS) that points at the original target,
  // ignoring the root of the DOM (the '<HTML>' node).
  return parentSelectors.slice(1).join(' > ');
}


// via: http://parentSelectorsoverflow.com/a/16742828/2511985
