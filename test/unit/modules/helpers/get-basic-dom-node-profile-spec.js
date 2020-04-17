import getBasicDomNodeProfile from '../../../../lib/helpers/getBasicDomNodeProfile';

describe('ProdPerfectRecorder.helpers.getBasicDomNodeProfile', () => {
  const elP = document.createElement('p');
  elP.setAttribute('aria-foo', 'yes');
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
    text: null,
    textContent: 'myTextContent',
    title: 'myTitle',
    type: null,
  };

  const elSelect = document.createElement('select');
  const option1 = document.createElement('option');
  option1.value = 'barval';
  option1.text = 'Bar Text';
  option1.selected = true;
  elSelect.appendChild(option1);

  test('should return a small dom node profile', () => {
    expect(getBasicDomNodeProfile(elP)).toEqual({
      class: expectedP.className,
      href: expectedP.href,
      id: expectedP.id,
      name: expectedP.name,
      all_attrs: {
        'aria-foo': expectedP['aria-foo'],
        class: expectedP.className,
        for: expectedP.for,
        id: expectedP.id,
        name: expectedP.name,
        "ng-click": expectedP['ng-click'],
        "ng-model": expectedP['ng-model'],
        style: `cursor: ${expectedP.cursor};`,
        title: expectedP.title,
      },
      node_name: expectedP.nodeName,
      tag_name: expectedP.tagName,
      text: expectedP.text,
      title: expectedP.title,
      type: expectedP.type,
    })
  })

  test('should exclude value from all_attrs', () => {
    expect(getBasicDomNodeProfile(elSelect).value).toEqual(undefined)
  })
});
