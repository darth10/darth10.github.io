(function () {
  function initHighlighting() {
    if ((typeof Turbolinks === 'undefined') && initHighlighting.called)
      return;
    initHighlighting.called = true;

    var blocks = document.querySelectorAll('pre code');
    blocks.forEach.call(blocks, hljs.highlightBlock);
  };

  function addHighlightingListener(e) {
      document.addEventListener(e, initHighlighting, false);
  };

  addHighlightingListener('turbolinks:load');
  addHighlightingListener('turbolinks:render');
  addHighlightingListener('DOMContentLoaded');
  addHighlightingListener('load');
})();
