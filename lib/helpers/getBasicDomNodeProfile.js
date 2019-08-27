import { getDomNodeAttributes } from './getDomNodeAttributes';

const EXCLUDE_VALUE_REGEX = /^((?!value).)*$/;

function getAttr(el, name) {
  if (el.getAttribute) {
    return el.getAttribute(name);
  }
  return null;
}

export function getBasicDomNodeProfile(el) {
  return {
    class: getAttr(el, 'class') || null,
    href: el.href || null,
    id: getAttr(el, 'id') || null,
    name: getAttr(el, 'name') || null,
    all_attrs:  getDomNodeAttributes(el, EXCLUDE_VALUE_REGEX),
    node_name: el.nodeName,
    tag_name: el.tagName,
    text: getAttr(el, 'text'),
    title: el.title,
    type: el.type
  };
}
