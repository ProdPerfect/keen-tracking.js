import uniqueSelector from 'unique-selector';

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

/**
 * This is a short, unique CSS selector for quickly grabbing this node from the DOM.
 * It serves a different purpose than a full node 'path', which potentially holds
 * much more information about the DOM structure.
 */
function generateUniqueSelector(el) {
  // NOTE(dabrady) The `unique-selector` library assumes the given node is part of a DOM, and will
  // throw errors if that's not true. So guarding against that here.
  if (document.contains(el)) {
    try {
      return uniqueSelector(el);
    } catch (TypeError) {
      // NOTE(dabrady) If the target element is not part of the DOM by the time `uniqueSelector`
      // tries to traverse the element's parent tree, it will throw a null-pointer exception. This
      // try-catch prevents those errors from bubbling up to our clients' applications.
      return null;
    }
  }
  return null;
}

export default function getBasicDomNodeProfile(el) {
  return {
    class: getAttr(el, 'class') || null,
    href: (typeof el.href === 'object' ? null : el.href) || null,
    id: getAttr(el, 'id') || null,
    name: getAttr(el, 'name') || null,
    all_attrs: {
      ...getDomNodeAttributes(el, EXCLUDE_VALUE_REGEX),
      /**
       * NOTE(dabrady) We are putting this in the `all_attrs` blob out of a variety of
       * concerns, but primarily because it will let us evalutate our use-case for this
       * data faster and with minimal effort.
       */
      // Don't include uniqueSelector if it couldn't be calculated.
      unique_selector: generateUniqueSelector(el) || undefined,
    },
    node_name: typeof el.nodeName === 'object' ? 'FORM' : el.nodeName,
    tag_name: typeof el.tagName === 'object' ? 'FORM' : el.tagName,
    text: getAttr(el, 'text'),
    title: getAttr(el, 'title'),
    type: getAttr(el, 'type'),
  };
}
