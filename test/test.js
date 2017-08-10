// @flow

import assert from 'assert';
import jsdom from 'jsdom-global';
import {after, before, describe, it} from 'mocha';
import {querySelector, querySelectorAll} from '../index';

describe('typed selector queries', function() {
  before(function() {
    this.cleanup = jsdom();

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
});
