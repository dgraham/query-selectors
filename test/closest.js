export function polyfill() {
  // Until this merges: https://github.com/tmpvar/jsdom/pull/1784
  if (!Element.prototype.closest) {
    Element.prototype.closest = function(selectors) {
      let el = this;

      while (el.nodeType === 1) {
        if (el.matches(selectors)) {
          return el;
        }
        el = el.parentNode;
      }

      return null;
    };
  }

  if (!Element.prototype.after) {
    Element.prototype.after = function() {
      this.parentNode.insertBefore(fragment(arguments), this.nextSibling);
    };
  }

  if (!Element.prototype.before) {
    Element.prototype.before = function() {
      this.parentNode.insertBefore(fragment(arguments), this);
    };
  }

  if (!Element.prototype.prepend) {
    Element.prototype.prepend = function() {
      this.insertBefore(fragment(arguments), this.firstChild);
    };
  }

  if (!Element.prototype.append) {
    Element.prototype.append = function() {
      this.appendChild(fragment(arguments));
    };
  }

  if (!Element.prototype.replaceWith) {
    Element.prototype.replaceWith = function() {
      if (this.parentNode) {
        this.parentNode.replaceChild(fragment(arguments), this);
      }
    };
  }
}

function fragment(nodes) {
  const root = document.createDocumentFragment();
  for (const node of nodes) {
    root.appendChild(
      node instanceof Node ? node : document.createTextNode(String(node))
    );
  }
  return root;
}
