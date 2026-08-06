{:title "Evil by default"
 :date "2026-08-06"
 :layout :post
 :description "How I relapsed into vi key bindings, despite being the maintainer of God mode"}

<!-- TODO change date -->

A while ago I wrote about [becoming the maintainer of God mode][lesson], the
package that gives you modal editing in Emacs without giving up Emacs key
bindings. I still maintain it, but I no longer use it.

To be clear: I didn't leave [God mode][god-mode] because there's anything wrong
with it. I left because of where the rest of my configuration wanted to go. I'd
also used Vim for years before I switched to Emacs, so this was less a
conversion than a relapse.

<!--more-->

I stumbled across [Practical Vim][practical-vim] a couple of years ago, which
tempted me to daily drive vi key bindings in Emacs. Doom Emacs already had a
module for [Evil][evil], and with the `+everywhere` module flag I was able to
use Evil in modes where I'd had to disable God mode. Yes, I'm mostly talking
about [Magit][magit].

Switching [my Doom Emacs configuration][doom.d] to Evil
[removed more than twice as much configuration as it added][evil-commit].
That's not a criticism of God mode - it's just that almost all of Doom Emacs'
modules are designed around a leader key.

Then I discovered [`lispyville`][lispyville], which put the final nail in the
coffin of my God mode setup. I write a lot of Clojure and Emacs Lisp, and
structural editing that understands Evil states turned out to fit my hands
better than the paredit-themed [`lispy`][lispy] bindings I'd been using.

The obvious question is whether I should still be maintaining God mode. I
believe the answer is yes, and it's for the reason I wrote about last time: the
useful work of a maintainer is mostly not about having strong opinions on the
feature set. It's about getting out of the way of the people who _do_ use it
every day. It also feels like God mode is one of those packages that doesn't
need a lot of code churn since its core implementation is solid.

And it still has one advantage over Evil: its bindings _are_ Emacs bindings, so
there's less to learn up front, and the muscle memory works on any Emacs you sit
down at.

Modal editing in Emacs is not a competition. It's a preference, and you will
always have the freedom to choose your own.

[lesson]: ../../posts/a-lesson-from-open-source-software/
[god-mode]: https://github.com/emacsorphanage/god-mode
[practical-vim]: https://pragprog.com/titles/dnvim2/practical-vim-second-edition/
[evil]: https://github.com/emacs-evil/evil
[magit]: https://github.com/magit/magit
[evil-commit]: https://github.com/darth10/doom.d/commit/bf955e125e04632937cf676a8fa9ca606a1e4ce0
[doom.d]: https://github.com/darth10/doom.d
[lispy]: https://github.com/abo-abo/lispy
[lispyville]: https://github.com/noctuid/lispyville
