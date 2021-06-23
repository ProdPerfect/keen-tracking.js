import generateUniqueSelector from 'unique-selector';

import { getDomNodeAttributes } from './getDomNodeAttributes';

// We don't want to capture any value-like attributes, to avoid
// inadvertently grabbing PII.
const EXCLUDE_VALUE_REGEX = /^((?!value).)*$/;

function getAttr(el, name) {
  if (el.getAttribute) {
    return el.getAttribute(name);
  }
  return null;
}

export default function getBasicDomNodeProfile(el) {
  let allNodeAttributes = getDomNodeAttributes(el, EXCLUDE_VALUE_REGEX);

  /**
   * This is a short, unique CSS selector for quickly grabbing this node from the DOM.
   * It serves a different purpose than a full node 'path', which potentially holds
   * much more information about the DOM structure.
   *
   * NOTE(dabrady) We are putting this in the `all_attrs` blob out of a variety of
   * concerns, but primarily because it will let us evalutate our use-case for this
   * data faster and with minimal effort.
   */
  const uniqueSelector = generateUniqueSelector(el);
  if (uniqueSelector) {
    // Don't include uniqueSelector if it doesn't have a value.
    allNodeAttributes = { ...allNodeAttributes, unique_selector: uniqueSelector };
  }

  return {
    class: getAttr(el, 'class') || null,
    href: (typeof el.href === 'object' ? null : el.href) || null,
    id: getAttr(el, 'id') || null,
    name: getAttr(el, 'name') || null,
    all_attrs: allNodeAttributes,
    node_name: typeof el.nodeName === 'object' ? 'FORM' : el.nodeName,
    tag_name: typeof el.tagName === 'object' ? 'FORM' : el.tagName,
    text: getAttr(el, 'text'),
    title: getAttr(el, 'title'),
    type: getAttr(el, 'type'),
  };
}
