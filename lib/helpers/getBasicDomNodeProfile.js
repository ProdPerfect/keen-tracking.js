import { getDomNodeAttributes } from './getDomNodeAttributes';

const EXCLUDE_VALUE_REGEX = /^((?!value).)*$/;

export function getBasicDomNodeProfile(el) {
  return {
    class: (el.getAttribute && el.getAttribute('class')) || null,
    href: el.href || null,
    id: (el.getAttribute && el.getAttribute('id')) || null,
    name: (el.getAttribute && el.getAttribute('name')) || null,
    all_attrs:  getDomNodeAttributes(el, EXCLUDE_VALUE_REGEX),
    node_name: el.nodeName,
    tag_name: el.tagName,
    text: el.text,
    title: el.title,
    type: el.type
  };
}
