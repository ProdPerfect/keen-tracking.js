import { getDomNodeAttributes } from './getDomNodeAttributes';

const EXCLUDE_VALUE_REGEX = /^((?!value).)*$/;

function getAttr(el, name) {
  if (el.getAttribute) {
    return el.getAttribute(name);
  }
  return null;
}

export default function getBasicDomNodeProfile(el) {
  return {
    class: getAttr(el, 'class') || null,
    href: (typeof el.href === 'object' ? null : el.href) || null,
    id: getAttr(el, 'id') || null,
    name: getAttr(el, 'name') || null,
    all_attrs: getDomNodeAttributes(el, EXCLUDE_VALUE_REGEX),
    node_name: typeof el.nodeName === 'object' ? 'FORM' : el.nodeName,
    tag_name: typeof el.tagName === 'object' ? 'FORM' : el.tagName,
    text: getAttr(el, 'text'),
    title: getAttr(el, 'title'),
    type: getAttr(el, 'type'),
  };
}
