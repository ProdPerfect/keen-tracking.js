export function getDomNodeAttributes(element,filter) {
  let i,
    attributeNodes = element.attributes || {},
    length = attributeNodes.length,
    attrs = {};

  for ( i = 0; i < length; i++ ){
    if(filter == '' || filter.test(attributeNodes[i].name) == true) {
     attrs[attributeNodes[i].name] = attributeNodes[i].value;
    }
  }

  return attrs;
}
