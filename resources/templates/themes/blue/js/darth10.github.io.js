(function () {
  function initHighlighting() {
    if ((typeof Turbolinks === 'undefined') && initHighlighting.called)
      return;
    initHighlighting.called = true;

    var blocks = document.querySelectorAll('pre code');
    blocks.forEach.call(blocks, hljs.highlightBlock);
  };

  function initDarkMode() {
    var options = {
      label: '🌗'
    };

    var darkmode = new Darkmode(options);
    darkmode.showWidget();
  };

  function addListeners(e) {
    document.addEventListener(e, initHighlighting, false);
    document.addEventListener('turbolinks:load', initDarkMode, false);
  };

  addListeners('turbolinks:load');
  addListeners('DOMContentLoaded');
})();
