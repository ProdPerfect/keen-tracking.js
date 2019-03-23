import { getBasicDomNodeProfile } from './getBasicDomNodeProfile';

export function getNParents(element, nParents = 5, parents = []) {
  let parent = element.parentNode;

  if (nParents === 0 || !parent) {
    return parents;
  }

  return getNParents(
    parent,
    nParents - 1,
    parents.concat({
      ...getBasicDomNodeProfile(parent),
      nth_parent: parents.length + 1
    })
  )
}
