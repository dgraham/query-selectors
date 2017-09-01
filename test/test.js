// @flow

import assert from 'assert';
import jsdom from 'jsdom-global';
import {after, before, describe, it} from 'mocha';
import {
  closest,
  query,
  querySelector,
  querySelectorAll,
  addClass,
  removeClass,
  toggleClass
} from '../index';
import {polyfill} from './closest';

describe('typed selector queries', function() {
  before(function() {
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
    `;
  });

  after(function() {
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
      const el = query(document, '.text', HTMLParagraphElement);
      assert.equal(el.textContent, 'one');
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
});
