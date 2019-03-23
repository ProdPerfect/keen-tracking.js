import { getDomNodeAttributes } from './getDomNodeAttributes';

const EXCLUDE_VALUE_REGEX = /^((?!value).)*$/;

export function getBasicDomNodeProfile(el) {

  return {
    class: el.className,
    href: el.href || null,
    id: el.id,
    name: el.name,
    all_attrs:  getDomNodeAttributes(el, EXCLUDE_VALUE_REGEX),
    node_name: el.nodeName,
    tag_name: el.tagName,
    text: el.text,
    title: el.title,
    type: el.type
  };
}
