import uniqueSelector from 'unique-selector';

export function getDomNodePath(el){
  if (!( el.nodeName && el.parentNode )){
    return null; 
  }

  return uniqueSelector(el);
}
