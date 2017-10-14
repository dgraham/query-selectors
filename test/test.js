// @flow

import assert from 'assert';
import jsdom from 'jsdom-global';
import {afterEach, beforeEach, describe, it} from 'mocha';
import {
  addClass,
  after,
  append,
  before,
  closest,
  find,
  getAttribute,
  getValue,
  namedItem,
  nextSibling,
  parent,
  prepend,
  previousSibling,
  query,
  querySelector,
  querySelectorAll,
  remove,
  removeClass,
  replaceWith,
  setAttribute,
  setText,
  setValue,
  toggleClass
} from '../index';
import {polyfill} from './closest';

describe('typed selector queries', function() {
  beforeEach(function() {
    this.cleanup = jsdom();
    polyfill();

    if (!document.body) return;
    document.body.innerHTML = `
      <p class="text">one</p>
      <p class="text">two</p>
      <span class="text">three</span>
      <div class="parent">
        <div class="child">four</div>
      </div>
      <form>
        <input type="text" name="url" value="/hello">
        <input type="text" name="empty" value="">
      </form>
    `;
  });

  afterEach(function() {
    this.cleanup();
  });

  describe('query', function() {
    it('throws for failed selector match', function() {
      assert.throws(() => query(document, '.missing'));
    });

    it('throws for failed subclass filter', function() {
      assert.throws(() => query(document, '.text', HTMLButtonElement));
    });

    it('returns an element for matching subclass filter', function() {
      const el = query(document, '[name=url]', HTMLInputElement);
      assert.equal(el.value, '/hello');
    });
  });

  describe('querySelector', function() {
    it('returns none for failed subclass filter', function() {
      const el = querySelector(document, '.text', HTMLButtonElement);
      assert(el.isNone());
    });

    it('returns some for matching subclass filter', function() {
      const el = querySelector(document, '.text', HTMLParagraphElement);
      assert(el.isSome());
      assert.equal(el.unwrap().textContent, 'one');
    });

    it('returns some for default subclass filter', function() {
      const el = querySelector(document, '.text');
      assert(el.isSome());
      assert.equal(el.unwrap().textContent, 'one');
    });

    it('queries an element root', function() {
      const parent = querySelector(document, '.parent');
      assert(parent.isSome());

      const child = querySelector(parent.unwrap(), '.child');
      assert(child.isSome());
      assert.equal(child.unwrap().textContent, 'four');
    });

    it('queries a document fragment root', function() {
      const fragment = document.createDocumentFragment();
      const child = document.createElement('div');
      child.classList.add('child');
      fragment.appendChild(child);

      const el = querySelector(fragment, '.child');
      assert(el.isSome());
    });
  });

  describe('querySelectorAll', function() {
    it('finds all elements matching selector', function() {
      const found = querySelectorAll(document, '.text');
      assert.equal(found.length, 3);
      assert.equal(found[0].textContent, 'one');
      assert.equal(found[1].textContent, 'two');
      assert.equal(found[2].textContent, 'three');
    });

    it('finds only elements matching subclass filter', function() {
      const found = querySelectorAll(document, '.text', HTMLParagraphElement);
      assert.equal(found.length, 2);
      assert.equal(found[0].textContent, 'one');
      assert.equal(found[1].textContent, 'two');
    });
  });

  describe('closest', function() {
    it('finds parent by selector', function() {
      const child = querySelector(document, '.child');
      const parent = closest(child.unwrap(), '.parent');
      assert(parent.isSome());
    });

    it('returns none for no selector matches', function() {
      const child = querySelector(document, '.child');
      const parent = closest(child.unwrap(), '.missing');
      assert(parent.isNone());
    });

    it('returns none for selector match but type mismatch', function() {
      const child = querySelector(document, '.child');
      const parent = closest(child.unwrap(), '.parent', HTMLImageElement);
      assert(parent.isNone());
    });
  });

  describe('find', function() {
    it('returns none for failed subclass filter', function() {
      const el = querySelector(document, '.parent').andThen(
        find('.child', HTMLButtonElement)
      );
      assert(el.isNone());
    });

    it('returns some for matching subclass filter', function() {
      const el = querySelector(document, '.parent').andThen(
        find('.child', HTMLDivElement)
      );
      assert(el.isSome());
      assert.equal(el.unwrap().textContent, 'four');
    });

    it('returns some for default subclass filter', function() {
      const el = querySelector(document, '.parent').andThen(find('.child'));
      assert(el.isSome());
      assert.equal(el.unwrap().textContent, 'four');
    });
  });

  describe('parent', function() {
    it('returns none for failed subclass filter', function() {
      const el = querySelector(document, '.child').andThen(
        parent('.parent', HTMLButtonElement)
      );
      assert(el.isNone());
    });

    it('returns some for matching subclass filter', function() {
      const el = querySelector(document, '.child').andThen(
        parent('.parent', HTMLDivElement)
      );
      assert(el.isSome());
      assert(el.unwrap().classList.contains('parent'));
    });

    it('returns some for default subclass filter', function() {
      const el = querySelector(document, '.child').andThen(parent('.parent'));
      assert(el.isSome());
      assert(el.unwrap().classList.contains('parent'));
    });
  });

  describe('addClass', function() {
    it('adds class names', function() {
      const el = querySelector(document, '.text').andThen(addClass('a', 'b'));
      assert(el.isSome());
      assert(el.unwrap().classList.contains('a'));
      assert(el.unwrap().classList.contains('b'));
    });
  });

  describe('removeClass', function() {
    it('removes class names', function() {
      const el = querySelector(document, '.text')
        .andThen(addClass('a', 'b', 'c'))
        .andThen(removeClass('a', 'b'));
      assert(el.isSome());
      assert(!el.unwrap().classList.contains('a'));
      assert(!el.unwrap().classList.contains('b'));
      assert(el.unwrap().classList.contains('c'));
    });
  });

  describe('toggleClass', function() {
    it('toggles class name', function() {
      const el = querySelector(document, '.text').andThen(toggleClass('a'));
      assert(el.isSome());
      assert(el.unwrap().classList.contains('a'));

      el.andThen(toggleClass('a'));
      assert(!el.unwrap().classList.contains('a'));
    });

    it('toggles class name on', function() {
      const el = querySelector(document, '.text')
        .andThen(toggleClass('a', true))
        .andThen(toggleClass('a', true));
      assert(el.isSome());
      assert(el.unwrap().classList.contains('a'));
    });

    it('toggles class name off', function() {
      const el = querySelector(document, '.text')
        .andThen(addClass('a'))
        .andThen(toggleClass('a', false))
        .andThen(toggleClass('a', false));
      assert(el.isSome());
      assert(!el.unwrap().classList.contains('a'));
    });
  });

  describe('previousSibling', function() {
    it('returns some for default type match', function() {
      const el = querySelector(document, 'span.text').andThen(
        previousSibling('.text')
      );
      assert(el.isSome());
      assert.equal(el.unwrap().tagName, 'P');
    });

    it('returns some for type match', function() {
      const el = querySelector(document, 'span.text').andThen(
        previousSibling('.text', HTMLParagraphElement)
      );
      assert(el.isSome());
      assert.equal(el.unwrap().tagName, 'P');
    });

    it('returns none for no selector matches', function() {
      const el = querySelector(document, 'span.text').andThen(
        previousSibling('.missing')
      );
      assert(el.isNone());
    });

    it('returns none for selector match but type mismatch', function() {
      const el = querySelector(document, 'span.text').andThen(
        previousSibling('.text', HTMLFormElement)
      );
      assert(el.isNone());
    });
  });

  describe('nextSibling', function() {
    it('returns some for default type match', function() {
      const el = querySelector(document, '.text').andThen(nextSibling('.text'));
      assert(el.isSome());
      assert.equal(el.unwrap().tagName, 'P');
    });

    it('returns some for type match', function() {
      const el = querySelector(document, '.text').andThen(
        nextSibling('.text', HTMLSpanElement)
      );
      assert(el.isSome());
      assert.equal(el.unwrap().tagName, 'SPAN');
    });

    it('returns none for no selector matches', function() {
      const el = querySelector(document, '.text').andThen(
        nextSibling('.missing')
      );
      assert(el.isNone());
    });

    it('returns none for selector match but type mismatch', function() {
      const el = querySelector(document, '.text').andThen(
        nextSibling('.text', HTMLFormElement)
      );
      assert(el.isNone());
    });
  });

  describe('getAttribute', function() {
    it('returns none for missing attribute', function() {
      const value = querySelector(document, '.text').andThen(
        getAttribute('missing')
      );
      assert(value.isNone());
    });

    it('returns some for attribute', function() {
      const value = querySelector(document, '.text').andThen(
        getAttribute('class')
      );
      assert(value.isSome());
      assert.equal(value.unwrap(), 'text');
    });
  });

  describe('setAttribute', function() {
    it('sets an attribute value', function() {
      const value = querySelector(document, '.text')
        .andThen(setAttribute('alt', 'hello'))
        .andThen(getAttribute('alt'));
      assert(value.isSome());
      assert.equal(value.unwrap(), 'hello');
    });
  });

  describe('getValue', function() {
    it('returns none for empty value', function() {
      const value = querySelector(
        document,
        'input[name=empty]',
        HTMLInputElement
      ).andThen(getValue);
      assert(value.isNone());
    });

    it('returns some for value', function() {
      const value = querySelector(
        document,
        'input[name=url]',
        HTMLInputElement
      ).andThen(getValue);
      assert(value.isSome());
      assert.equal(value.unwrap(), '/hello');
    });
  });

  describe('setValue', function() {
    it('sets an input value', function() {
      const value = querySelector(document, 'input[name=url]', HTMLInputElement)
        .andThen(setValue('updated'))
        .andThen(getValue);
      assert(value.isSome());
      assert.equal(value.unwrap(), 'updated');
    });
  });

  describe('setText', function() {
    it('sets text content', function() {
      const el = querySelector(document, '.text').andThen(setText('updated'));
      assert(el.isSome());
      assert.equal(el.unwrap().textContent, 'updated');
    });
  });

  describe('append', function() {
    it('appends after last child', function() {
      const el = querySelector(document, '.text').andThen(
        append('hello', 'world')
      );
      assert(el.isSome());
      assert.equal(el.unwrap().textContent, 'onehelloworld');
    });
  });

  describe('prepend', function() {
    it('prepends before first child', function() {
      const el = querySelector(document, '.text').andThen(
        prepend('hello', 'world')
      );
      assert(el.isSome());
      assert.equal(el.unwrap().textContent, 'helloworldone');
    });
  });

  describe('after', function() {
    it('appends after the element', function() {
      const value = querySelector(document, '.text')
        .andThen(after('hello', 'world'))
        .map(el => el.nextSibling)
        .map(el => el.textContent);
      assert(value.isSome());
      assert.equal(value.unwrap(), 'hello');
    });
  });

  describe('before', function() {
    it('prepends before the element', function() {
      const value = querySelector(document, '.text')
        .andThen(before('hello', 'world'))
        .map(el => el.previousSibling)
        .map(el => el.textContent);
      assert(value.isSome());
      assert.equal(value.unwrap(), 'world');
    });
  });

  describe('replaceWith', function() {
    it('replaces the element with nodes', function() {
      const el = querySelector(document, '.child').andThen(
        replaceWith('hello', 'world')
      );
      assert(el.isSome());
      assert(querySelector(document, '.child').isNone());

      const parent = querySelector(document, '.parent').unwrap();
      assert.equal(parent.textContent.trim(), 'helloworld');
    });
  });

  describe('remove', function() {
    it('removes the element from the tree', function() {
      const el = querySelector(document, '.parent').andThen(remove);
      assert(el.isSome());
      assert(querySelector(document, '.parent').isNone());
    });
  });

  describe('namedItem', function() {
    it('returns some for matching input name', function() {
      const form = querySelector(document, 'form', HTMLFormElement);
      const el = form.andThen(namedItem('url'));
      assert(el.isSome());
      assert.equal(el.unwrap().value, '/hello');
    });

    it('returns none for missing input name', function() {
      const form = querySelector(document, 'form', HTMLFormElement);
      const el = form.andThen(namedItem('missing'));
      assert(el.isNone());
    });

    it('returns none for type mismatch', function() {
      const form = querySelector(document, 'form', HTMLFormElement);
      const el = form.andThen(namedItem('url', HTMLSelectElement));
      assert(el.isNone());
    });
  });
});
