import { getDomNodePath } from './getDomNodePath';
import { getDomNodeAttributes } from './getDomNodeAttributes';
import { getNParents } from './getNParents';

const getTextContent = (el, options) => {
  if(!options.recordTextContent || !el.textContent) {
    return null;
  }

  if(options.redactTextContent) {
    return '---REDACTED---';
  }

  return el.textContent;
}

export function getDomNodeProfile(el, options = {}) {
  let profile = {
    class: el.className,
    href: el.href || null,
    id: el.id,
    name: el.name,
    all_attrs:  getDomNodeAttributes(el, /^((?!value).)*$/),
    node_name: el.nodeName,
    tag_name: el.tagName,
    text: el.text,
    title: el.title,
    type: el.type
  };

  if (!options.basicProfile) {
    profile = {
      ...profile,
      action: el.action,
      method: el.method,
      n_parents: getNParents(el, options.nParents),
      selector: getDomNodePath(el),
      text_content: getTextContent(el, options),
      x_position: el.offsetLeft || el.clientLeft || null,
      y_position: el.offsetTop || el.clientTop || null
    };
  }

  return profile;
}
