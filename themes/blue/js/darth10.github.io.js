(function () {
  function initHighlighting() {
    if ((typeof Turbolinks === 'undefined') && initHighlighting.called)
      return;
    initHighlighting.called = true;

    var blocks = document.querySelectorAll('pre code');
    blocks.forEach.call(blocks, hljs.highlightBlock);
  };

  function addListeners(e) {
    document.addEventListener(e, initHighlighting, false);
  };

  addListeners('turbolinks:load');
  addListeners('DOMContentLoaded');
})();
