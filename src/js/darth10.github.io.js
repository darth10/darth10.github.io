import './../scss/darth10.github.io.scss';

import turbolinks from 'turbolinks';

function initHighlighting() {
  var blocks = document.querySelectorAll('pre code');
  blocks.forEach.call(blocks, hljs.highlightBlock);
};

function addListeners(e) {
  document.addEventListener(e, initHighlighting, false);
};

addListeners('turbolinks:load');
addListeners('DOMContentLoaded');

turbolinks.start();
