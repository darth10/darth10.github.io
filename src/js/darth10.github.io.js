import './../scss/darth10.github.io.scss';
import 'highlight.js/styles/base16/solarized-dark.css';

import turbolinks from 'turbolinks';
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
hljs.registerLanguage('xml', xml);
hljs.registerAliases(['elisp', 'emacs-lisp'], { languageName: 'lisp' });

function initHighlighting() {
  document.querySelectorAll('pre code').forEach((block) => hljs.highlightElement(block));
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
