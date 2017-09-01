// @flow

import {type Option, None, Some} from 'option-type';

type Queryable = Document | DocumentFragment | Element;

export function query<T: Element>(
  context: Queryable,
  selectors: string,
  klass: Class<Element> = HTMLElement
): T {
  return querySelector(context, selectors, klass).expect(
    `Element not found: <${klass.name}> ${selectors}`
  );
}

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

export function closest<T: Element>(
  element: Element,
  selectors: string,
  klass: Class<Element> = HTMLElement
): Option<T> {
  const ancestor = element.closest(selectors);
  return ancestor instanceof klass ? Some(ancestor) : None;
}

export function addClass<T: Element>(...names: Array<string>): T => Option<T> {
  return (el: T) => {
    el.classList.add(...names);
    return Some(el);
  };
}

export function removeClass<T: Element>(
  ...names: Array<string>
): T => Option<T> {
  return (el: T) => {
    el.classList.remove(...names);
    return Some(el);
  };
}

export function toggleClass<T: Element>(
  name: string,
  force?: boolean
): T => Option<T> {
  return (el: T) => {
    el.classList.toggle(name, force);
    return Some(el);
  };
}
