// @flow

import {type Option, None, Some} from 'option-type';

type Queryable = Document | DocumentFragment | Element;

export function querySelector<T: Element>(
  context: Queryable,
  selectors: string,
  klass: Class<Element> = HTMLElement
): Option<T> {
  const el = context.querySelector(selectors);
  return el instanceof klass ? Some(el) : None;
}

export function querySelectorAll<T: Element>(
  context: Queryable,
  selectors: string,
  klass: Class<Element> = HTMLElement
): Array<T> {
  const found = [];
  for (const el of context.querySelectorAll(selectors)) {
    if (el instanceof klass) {
      found.push(el);
    }
  }
  return found;
}
