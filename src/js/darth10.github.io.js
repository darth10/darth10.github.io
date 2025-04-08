import './../scss/darth10.github.io.scss';

import turbolinks from 'turbolinks';

function initHighlighting() {
  var blocks = document.querySelectorAll('pre code');
  blocks.forEach.call(blocks, hljs.highlightBlock);
};

// This is a workaround for an issue with Turbolinks.
// See: https://github.com/turbolinks/turbolinks/issues/75
function checkAndPreventOnAnchor(event) {
  if (event.target.getAttribute('href').charAt(0) === '#') {
    setTimeout(function () {
      // This is needed to scroll in-page anchor links below the
      // Bootstrap NavBar.
      if (window.location.hash) {
        scrollBy(0, -66);
      }
    }, 10);
    return event.preventDefault();
  }
};

function addListeners(e, func) {
  document.addEventListener(e, func, false);
};

addListeners('turbolinks:load', initHighlighting);
addListeners('DOMContentLoaded', initHighlighting);

addListeners('turbolinks:click', checkAndPreventOnAnchor);

turbolinks.start();
