import getDomNodeProfile from '../../../../lib/helpers/getDomNodeProfile';

describe('ProdPerfectRecorder.helpers.getDomNodeProfile', () => {
  const elP = document.createElement('p');
  elP.setAttribute('aria-foo', 'yes')
  elP.setAttribute('class', 'styled');
  elP.setAttribute('for', 'ProdPerfectRecorder');
  elP.setAttribute('id', 'myID');
  elP.setAttribute('ng-click', 'ngClickAttr');
  elP.setAttribute('ng-model', 'ngModelAttr');
  elP.setAttribute('title', 'myTitle');
  elP.setAttribute('name', 'testEl');
  elP.name = 'testEl';
  elP.text = 'myText';
  elP.textContent = 'myTextContent';
  elP.style.cursor = 'pointer';

  const expectedP = {
    action: undefined,
    'aria-foo': 'yes',
    className: 'styled',
    clientTop: null, // requires hack that I couldn't get working to work with JSDom
    cursor: 'pointer',
    href: null,
    for: 'ProdPerfectRecorder',
    id: 'myID',
    method: undefined,
    name: 'testEl',
    'ng-click': 'ngClickAttr',
    'ng-model': 'ngModelAttr',
    nodeName: 'P',
    offsetLeft: null, // requires hack that I couldn't get working to work with JSDom
    parentNode: null,
    tagName: 'P',
    text: 'myText',
    textContent: 'myTextContent',
    title: 'myTitle',
    type: null,
  };

  const elA = document.createElement('a');
  elA.setAttribute('href', '#foo');
  elA.setAttribute('title', 'myATitle');
  elA.setAttribute('type', 'submit');
  elA.setAttribute('value', 'myAVal');
  elA.method = 'post';
  elA.action = '/my_action';
  elA.style.cursor = 'foo';
  elA.name = 'testA';
  elA.textContent ='myATextContent';

  const expectedA = {
    action: '/my_action',
    className: null,
    clientTop: null, // requires hack that I couldn't get working to work with JSDom
    cursor: 'foo',
    href: 'http://localhost/#foo',
    href_short: '#foo',
    id: null,
    method: 'post',
    name: 'testA',
    'ng-click': null,
    'ng-model': null,
    nodeName: 'A',
    offsetLeft: null, // requires hack that I couldn't get working to work with JSDom
    parentNode: null,
    tagName: 'A',
    text: 'myATextContent',
    textContent: 'myATextContent',
    title: 'myATitle',
    type: 'submit',
    valueAttr: 'myAVal'
  }

  test('should return relevant properties of the passed element, without textContent when not requested', () => {
    const expectedProfile = {
      action: expectedP.action,
      all_attrs: {
        'aria-foo': expectedP['aria-foo'],
        class: expectedP.className,
        for: expectedP.for,
        id: expectedP.id,
        name: expectedP.name,
        'ng-click': expectedP['ng-click'],
        'ng-model': expectedP['ng-model'],
        style: `cursor: ${expectedP.cursor};`,
        title: expectedP.title,
      },
      class: expectedP.className,
      cursor: 'pointer',
      href: expectedP.href,
      id: expectedP.id,
      method: expectedP.method,
      name: expectedP.name,
      n_parents: [],
      node_name: expectedP.nodeName,
      selector: '',
      tag_name: expectedP.tagName,
      text: expectedP.text,
      text_content: null,
      title: expectedP.title,
      type: expectedP.type,
      x_position: expectedP.offsetLeft,
      y_position: expectedP.clientTop,
    };

    expect(getDomNodeProfile(elP)).toEqual(expectedProfile);
  });

  test('should return textContent when text content is requested', () => {
    expect(getDomNodeProfile(elP, { recordTextContent: true }).text_content).toEqual(expectedP.textContent);
  });

  test('should return redacted textContent when text content redaction is requested', () => {
    expect(getDomNodeProfile(elP, {
      recordTextContent: true,
      redactTextContent: true
    }).text_content).toEqual('---REDACTED---');
  });

  test('should return relevant properties of the passed a tag, without textContent when not requested', () => {
    expect(getDomNodeProfile(elA)).toEqual({
      action: expectedA.action,
      class: expectedA.className,
      cursor: 'foo',
      href: expectedA.href,
      id: expectedA.id,
      method: expectedA.method,
      name: expectedA.name,
      all_attrs: {
        href: expectedA.href_short,
        name: expectedA.name,
        style: 'cursor: foo;',
        title: expectedA.title,
        type: expectedA.type

      },
      n_parents: [],
      node_name: expectedA.nodeName,
      selector: '',
      tag_name: expectedA.tagName,
      text: expectedA.text,
      text_content: null,
      title: expectedA.title,
      type: expectedA.type,
      x_position: expectedA.offsetLeft,
      y_position: expectedA.clientTop
    });
  });
});
