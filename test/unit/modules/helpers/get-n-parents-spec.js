import { getNParents } from '../../../../lib/helpers/getNParents';

describe('RecordingLibrary.helpers.getNParents', () => {
  const node = document.createElement('strong');
  const p1 = document.createElement('span');
  p1.setAttribute('class', 'span-class');

  const p2 = document.createElement('p');
  p2.setAttribute('id', 'pid');
  p2.text = 'ptext'

  const p3 = document.createElement('div');
  p3.setAttribute('name', 'divname');
  p3.name = 'divname'

  const p4 = document.createElement('a');
  p4.setAttribute('href', '#foo');
  p4.setAttribute('type', 'submit');

  const p5 = document.createElement('h1');
  p5.setAttribute('title', 'h1title');

  const p6 = document.createElement('body');

  p6.appendChild(p5);
  p5.appendChild(p4);
  p4.appendChild(p3);
  p3.appendChild(p2);
  p2.appendChild(p1);
  p1.appendChild(node);

  test('should return element attributes up 5 parents away if no limit is specified', () => {
    expect(getNParents(node)).toEqual([
      {
        class: 'span-class',
        id: null,
        name: null,
        all_attrs: { class: 'span-class' },
        node_name: 'SPAN',
        tag_name: 'SPAN',
        text: null,
        title: null,
        type: null,
        href: null,
        nth_parent: 1,
      },
      {
        class: null,
        id: 'pid',
        name: null,
        all_attrs: { id: 'pid' },
        node_name: 'P',
        tag_name: 'P',
        text: null,
        title: null,
        type: null,
        href: null,
        nth_parent: 2,
      },
      {
        class: null,
        id: null,
        name: 'divname',
        all_attrs: { name: 'divname' },
        node_name: 'DIV',
        tag_name: 'DIV',
        text: null,
        title: null,
        type: null,
        href: null,
        nth_parent: 3,
      },
      {
        class: null,
        id: null,
        name: null,
        all_attrs: { href: '#foo', type: 'submit' },
        node_name: 'A',
        tag_name: 'A',
        text: null,
        title: null,
        type: 'submit',
        href: 'http://localhost/#foo',
        nth_parent: 4,
      },
      {
        class: null,
        id: null,
        name: null,
        all_attrs: { title: 'h1title' },
        node_name: 'H1',
        tag_name: 'H1',
        text: null,
        title: 'h1title',
        type: null,
        href: null,
        nth_parent: 5,
      },
    ]);
  });

  test('should return n parent if the n_parents option is specified', () => {
    expect(getNParents(node, 1)).toEqual([
      {
        class: 'span-class',
        id: null,
        name: null,
        all_attrs: { class: 'span-class' },
        node_name: 'SPAN',
        tag_name: 'SPAN',
        text: null,
        title: null,
        type: null,
        href: null,
        nth_parent: 1,
      },
    ]);
  });

  test('should return an empty array if there are no parents', () => {
    expect(getNParents(p6)).toEqual([]);
  });

  test('should return all parents if there are less than n_parents present', () => {
    expect(getNParents(p5)).toEqual([
      {
        class: null,
        id: null,
        name: null,
        all_attrs: {},
        href: null,
        node_name: 'BODY',
        tag_name: 'BODY',
        text: null,
        title: null,
        type: null,
        nth_parent: 1,
      },
    ]);
  });

  test('should return correct attributes when edge case form/input elements exist', () => {
    const formEl = document.createElement('form');
    formEl.setAttribute('id', 'parent-form');
    formEl.setAttribute('type', 'form');
    formEl.setAttribute('class', 'some-class');

    const inputEl = document.createElement('input');
    inputEl.setAttribute('id', 'name');
    formEl.appendChild(inputEl);

    const inputEl2 = document.createElement('input');
    inputEl2.setAttribute('id', 'tagName');
    formEl.appendChild(inputEl2);

    const inputEl3 = document.createElement('input');
    inputEl3.setAttribute('id', 'id');
    formEl.appendChild(inputEl3);

    const inputEl4 = document.createElement('input');
    inputEl4.setAttribute('id', 'class');
    formEl.appendChild(inputEl4);

    expect(getNParents(inputEl)).toEqual([{
      class: 'some-class',
      id: 'parent-form',
      name: null,
      all_attrs: {
        class: 'some-class',
        id: 'parent-form',
        type: 'form',
      },
      href: null,
      node_name: 'FORM',
      tag_name: 'FORM',
      text: null,
      title: null,
      type: 'form',
      nth_parent: 1,
    }]);
  });
});
