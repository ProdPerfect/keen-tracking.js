import { getDomNodePath } from './getDomNodePath';
import { getBasicDomNodeProfile } from './getBasicDomNodeProfile';
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
  return {
    ...getBasicDomNodeProfile(el),
    action: el.action,
    method: el.method,
    n_parents: getNParents(el, options.nParents),
    selector: getDomNodePath(el),
    text_content: getTextContent(el, options),
    x_position: el.offsetLeft || el.clientLeft || null,
    y_position: el.offsetTop || el.clientTop || null
  };
}
