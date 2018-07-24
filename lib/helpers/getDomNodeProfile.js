import { getDomNodePath } from './getDomNodePath';

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
  return {
    action: el.action,
    class: el.className,
    href: el.href || null,
    id: el.id,
    method: el.method,
    name: el.name,
    ng_click: el.getAttribute('ng-click'),
    ng_model: el.getAttribute('ng-model'),
    node_name: el.nodeName,
    selector: getDomNodePath(el),
    tag_name: el.tagName,
    text: el.text,
    text_content: getTextContent(el, options),
    title: el.title,
    type: el.type,
    x_position: el.offsetLeft || el.clientLeft || null,
    y_position: el.offsetTop || el.clientTop || null
  };
}
