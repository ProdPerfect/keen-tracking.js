import { getDomNodeProfile } from './getDomNodeProfile';

export function getNParents(element, nParents = 5, parents = []) {
  let parent = element.parentNode;

  if (nParents === 0 || !parent) {
    return parents;
  }

  return getNParents(
    parent,
    nParents - 1,
    parents.concat({
      ...getDomNodeProfile(parent, { basicProfile: true }),
      nth_parent: parents.length + 1
    })
  )
}
