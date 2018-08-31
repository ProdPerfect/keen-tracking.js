import { getDomNodeProfile } from '../../../../lib/helpers/getDomNodeProfile';

describe('Keen.helpers.getDomNodeProfile', () => {
  const element = {
    action: '/submit',
    className: 'styled',
    clientTop: 2,
    href: '#foo',
    id: 'myID',
    method: 'post',
    name: 'testEl',
    'ng-click': 'ngClickAttr',
    'ng-model': 'ngModelAttr',
    nodeName: 'myNode',
    offsetLeft: 1,
    parentNode: null,
    tagName: 'form',
    text: 'myText',
    textContent: 'myTextContent',
    title: 'myTitle',
    type: 'myType',
    getAttribute: function(attr) {
      return this[attr];
    }
  }

  test('should return relevant properties of the passed element, without text_content when not requested', () => {
    expect(getDomNodeProfile(element)).toEqual({
      action: element.action,
      class: element.className,
      href: element.href,
      id: element.id,
      method: element.method,
      name: element.name,
      ng_click: element['ng-click'],
      ng_model: element['ng-model'],
      node_name: element.nodeName,
      selector: '',
      tag_name: element.tagName,
      text: element.text,
      text_content: null,
      title: element.title,
      type: element.type,
      x_position: element.offsetLeft,
      y_position: element.clientTop
    })
  });

  test('should return textContent when text content is requested', () => {
    expect(getDomNodeProfile(element, { recordTextContent: true }).text_content).toEqual(element.textContent);
  });

  test('should return redacted textContent when text content redaction is requested', () => {
    expect(getDomNodeProfile(element, {
      recordTextContent: true,
      redactTextContent: true
    }).text_content).toEqual('---REDACTED---');
  });

});
