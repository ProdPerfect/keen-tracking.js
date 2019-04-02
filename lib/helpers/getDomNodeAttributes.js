export function getDomNodeAttributes(el, filter) {
  let i,
    attributeNodes = el.attributes || {},
    length = attributeNodes.length,
    attrs = {};

  for ( i = 0; i < length; i++ ){
    const node = attributeNodes[i];

    if(filter == '' || filter.test(node.name)) {
     attrs[node.name] = node.value;
    }
  }

  return attrs;
}
