import { getDomNodeAttributes } from './getDomNodeAttributes';

const EXCLUDE_VALUE_REGEX = /^((?!value).)*$/;

function getAttributeFromEl(el){
  if (el.getAttribute) {
    return function(name){
      return el.getAttribute(name)
    }
  } else {
    return function(name){
      return null;
    }
  }
}

export function getBasicDomNodeProfile(el) {
  const getAttr = getAttributeFromEl(el);
  return {
    class: getAttr('class') || null,
    href: el.href || null,
    id: getAttr('id') || null,
    name: getAttr('name') || null,
    all_attrs:  getDomNodeAttributes(el, EXCLUDE_VALUE_REGEX),
    node_name: el.nodeName,
    tag_name: el.tagName,
    text: getAttr('text'),
    title: el.title,
    type: el.type
  };
}
