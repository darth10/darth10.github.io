import './../scss/darth10.github.io.scss';
import 'highlight.js/styles/base16/solarized-dark.css';

import '@hotwired/turbo';
import hljs from 'highlight.js/lib/core';
import c from 'highlight.js/lib/languages/c';
import python from 'highlight.js/lib/languages/python';
import csharp from 'highlight.js/lib/languages/csharp';
import javascript from 'highlight.js/lib/languages/javascript';
import java from 'highlight.js/lib/languages/java';
import clojure from 'highlight.js/lib/languages/clojure';
import scala from 'highlight.js/lib/languages/scala';
import haskell from 'highlight.js/lib/languages/haskell';
import lisp from 'highlight.js/lib/languages/lisp';
import nix from 'highlight.js/lib/languages/nix';
import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('c', c);
hljs.registerLanguage('python', python);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('java', java);
hljs.registerLanguage('clojure', clojure);
hljs.registerLanguage('scala', scala);
hljs.registerLanguage('haskell', haskell);
hljs.registerLanguage('lisp', lisp);
hljs.registerLanguage('nix', nix);
hljs.registerLanguage('xml', xml);
hljs.registerAliases(['elisp', 'emacs-lisp'], { languageName: 'lisp' });

function initHighlighting() {
  document.querySelectorAll('pre code:not([data-highlighted])').forEach((block) => hljs.highlightElement(block));
};

function excludeAnchorsFromTurbo() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.setAttribute('data-turbo', 'false'));
};

function initDisqus() {
  const thread = document.getElementById('disqus_thread');
  if (!thread) return;

  const { disqusShortname, disqusUrl, disqusIdentifier } = thread.dataset;

  const config = function () {
    this.page.url = disqusUrl;
    this.page.identifier = disqusIdentifier;
  };

  if (window.DISQUS) {
    window.DISQUS.reset({ reload: true, config });
  } else {
    window.disqus_config = config;
    const dsq = document.createElement('script');
    dsq.src = `https://${disqusShortname}.disqus.com/embed.js`;
    dsq.defer = true;
    (document.head || document.body).appendChild(dsq);
  }
};

function addListeners(e, func) {
  document.addEventListener(e, func, false);
};

addListeners('turbo:load', initHighlighting);
addListeners('DOMContentLoaded', initHighlighting);

addListeners('turbo:load', excludeAnchorsFromTurbo);

addListeners('turbo:load', initDisqus);
