// Until this merges: https://github.com/tmpvar/jsdom/pull/1784
export function polyfill() {
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
}
