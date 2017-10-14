// @flow

import {type Option, None, Some} from 'option-type';

type Queryable = Document | DocumentFragment | Element;

export function query<T: Element>(
  context: Queryable,
  selectors: string,
  klass: Class<T>
): T {
  klass = klass || HTMLElement;
  return querySelector(context, selectors, klass).expect(
    `Element not found: <${klass.name}> ${selectors}`
  );
}

export function querySelector<T: Element>(
  context: Queryable,
  selectors: string,
  klass: Class<T>
): Option<T> {
  klass = klass || HTMLElement;
  const el = context.querySelector(selectors);
  return el instanceof klass ? Some(el) : None;
}

export function querySelectorAll<T: Element>(
  context: Queryable,
  selectors: string,
  klass: Class<T>
): Array<T> {
  klass = klass || HTMLElement;
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
  klass: Class<T>
): Option<T> {
  klass = klass || HTMLElement;
  const ancestor = element.closest(selectors);
  return ancestor instanceof klass ? Some(ancestor) : None;
}

export function find<T: Element>(
  selectors: string,
  klass: Class<T>
): Queryable => Option<T> {
  klass = klass || HTMLElement;
  return function descendant(el: Queryable): Option<T> {
    return querySelector(el, selectors, klass);
  };
}

export function parent<T: Element>(
  selectors: string,
  klass: Class<T>
): Element => Option<T> {
  klass = klass || HTMLElement;
  return function ancestor(el: Element): Option<T> {
    const node = el.parentElement;
    if (!node) return None;
    if (node instanceof klass && node.matches(selectors)) {
      return Some(node);
    }
    return ancestor(node);
  };
}

export function addClass<T: Element>(...names: Array<string>): T => Option<T> {
  return function add(el: T): Option<T> {
    el.classList.add(...names);
    return Some(el);
  };
}

export function removeClass<T: Element>(
  ...names: Array<string>
): T => Option<T> {
  return function remove(el: T): Option<T> {
    el.classList.remove(...names);
    return Some(el);
  };
}

export function toggleClass<T: Element>(
  name: string,
  force?: boolean
): T => Option<T> {
  return function toggle(el: T): Option<T> {
    el.classList.toggle(name, force);
    return Some(el);
  };
}

export function previousSibling<T: Element>(
  selectors: string,
  klass: Class<T>
): Element => Option<T> {
  klass = klass || HTMLElement;
  return function previousElement(el: Element): Option<T> {
    const sibling = el.previousElementSibling;
    if (!sibling) {
      return None;
    }

    if (sibling instanceof klass && sibling.matches(selectors)) {
      return Some(sibling);
    }

    return previousElement(sibling, selectors, klass);
  };
}

export function nextSibling<T: Element>(
  selectors: string,
  klass: Class<T>
): Element => Option<T> {
  klass = klass || HTMLElement;
  return function nextElement(el: Element): Option<T> {
    const sibling = el.nextElementSibling;
    if (!sibling) {
      return None;
    }

    if (sibling instanceof klass && sibling.matches(selectors)) {
      return Some(sibling);
    }

    return nextElement(sibling, selectors, klass);
  };
}

export function getAttribute(name: string): Element => Option<string> {
  return function get(el: Element): Option<string> {
    const value = el.getAttribute(name);
    return value == null ? None : Some(value);
  };
}

export function setAttribute<T: Element>(
  name: string,
  value: string
): T => Option<T> {
  return function set(el: T): Option<T> {
    el.setAttribute(name, value);
    return Some(el);
  };
}

type Valuable =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLButtonElement
  | HTMLSelectElement
  | HTMLOptionElement;

export function getValue(el: Valuable): Option<string> {
  return el.value ? Some(el.value) : None;
}

export function setValue<T: Valuable>(value: string): T => Option<T> {
  return function set(el: T): Option<T> {
    el.value = value;
    return Some(el);
  };
}

export function setText<T: Node>(value: string): T => Option<T> {
  return function set(el: T): Option<T> {
    el.textContent = value;
    return Some(el);
  };
}

export function append<T: Element>(
  ...nodes: Array<string | Node>
): T => Option<T> {
  return function appendTo(el: T): Option<T> {
    el.append(...nodes);
    return Some(el);
  };
}

export function prepend<T: Element>(
  ...nodes: Array<string | Node>
): T => Option<T> {
  return function prependTo(el: T): Option<T> {
    el.prepend(...nodes);
    return Some(el);
  };
}

export function after<T: Element>(
  ...nodes: Array<string | Node>
): T => Option<T> {
  return function addAfter(el: T): Option<T> {
    el.after(...nodes);
    return Some(el);
  };
}

export function before<T: Element>(
  ...nodes: Array<string | Node>
): T => Option<T> {
  return function addBefore(el: T): Option<T> {
    el.before(...nodes);
    return Some(el);
  };
}

export function replaceWith<T: Element>(
  ...nodes: Array<string | Node>
): T => Option<T> {
  return function replace(el: T): Option<T> {
    el.replaceWith(...nodes);
    return Some(el);
  };
}

export function remove<T: Element>(el: T): Option<T> {
  el.remove();
  return Some(el);
}

export function namedItem<T: HTMLElement>(
  name: string,
  klass: Class<T>
): HTMLFormElement => Option<T> {
  klass = klass || HTMLInputElement;
  return function named(form: HTMLFormElement) {
    const el = form.elements.namedItem(name);
    return el instanceof klass ? Some(el) : None;
  };
}
