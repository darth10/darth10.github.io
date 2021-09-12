{:title "A lesson from ownership in open-source software"
 :date "2021-05-05"
 :layout :post}

I've always tried to contribute to open source software whenever I've seen the
opportunity, but becoming a maintainer of an open source library gave me some
completely new perspectives.

I've used Emacs for almost a decade, and I used Vim before that. Maybe the fact
that vi key bindings are just another package in Emacs, called [Evil][evil], was
one of the reasons I switched to Emacs. I like modal editing, but I don't use
Evil. Instead, I use [God mode][god-mode] with Emacs key bindings.

At some point, I discovered [Doom Emacs][doom-emacs], which packed a lot of
functionality that interested me compared to other Emacs distributions.

<!--more-->

I moved all of my personal Emacs configuration to Doom Emacs, which resulted in
less code in my personal configuration. I still had a decent amount of code to
personalise God mode, and someone suggested that I should make it a part of Doom
Emacs. And so I did - I authored a [God module in Doom Emacs][god-module].
Almost all of my personal configuration for God mode was moved to this module,
and my personal Emacs configuration shrank even more.

Things were going great, until there were too many itches in God mode to
scratch. Contributors would have submitted pull requests to God mode, but the
repository [was archived][archived]. [Chris Done][chrisdone], the original
author of God mode, had moved on to bigger things, and didn't have enough time
to maintain God mode. I volunteered to maintain it, and had the repository
[transferred to Emacs Orphanage][transferred] where it would be actively
maintained. That way, there would be more eyes on the repository and I wouldn't
become a bottleneck in the future.

I started improving things at a small scale, such as:
- Reducing boilerplate configuration needed for God mode.
- Improving test coverage.
- Improving documentation.
- Making versioning consistent (in [MELPA stable][melpa-stable]).

Most of the code for configuring God mode shifted from the module in Doom Emacs to God mode itself.
Contributions started pouring in, and I started doing things that a maintainer should be doing, such as:
- Investigating test failures in older versions of Emacs.
- Deprecating support for _really_ old versions of Emacs.
- Improving naming conventions of methods and customisable variables, without breaking existing configurations.
- Organising issues using labels.
- Closing stale issues that would never be implemented in God mode.

I was essentially supporting contributors who wanted to add features to God
mode. The most significant feature, in my opinion, was allowing God mode to work
in tandem with Evil (see [#113][113]). More people started using God mode -
[stars on GitHub][stars] went up, and [downloads on MELPA][melpa] went up. You
could see how much people enjoyed using it through their comments on issues and
pull requests.

From [#118][118]:
> _"... I feel like god-mode has filled a massive hole in my emacs config."_


From [#125][125]:
> _"... A week ago, after using Vim for around 20 years, I have decided to_
_try Emacs. I had tried Emacs multiple times in the past, but every time I would_
_run away (screaming) due to its poor ergonomics ... I would like to thank the_
_developers of God mode. Without you, I would not be using Emacs."_


This points to a fundamental principle:

> _Improving the developer experience of an API indirectly improves user_
_experience of both the API and products consuming the API, presumably on a_
_larger scale._

Call me old fashioned, but the term API here doesn't refer exclusively to hosted services - libraries and frameworks provide APIs too.

The line between users and developers is blurry in the context of Emacs packages.
However, providing package users with guardrails to contribute, such as documentation and good automated test coverage, nudges them to
contribute and become developers.

[archived]: https://github.com/hlissner/doom-emacs/issues/2236
[chrisdone]: https://github.com/chrisdone
[doom-emacs]: https://github.com/hlissner/doom-emacs
[evil]: https://github.com/emacs-evil/evil
[god-mode]: https://github.com/emacsorphanage/god-mode
[god-module]: https://github.com/hlissner/doom-emacs/commits/develop/modules/editor/god
[melpa-stable]: https://stable.melpa.org/#/god-mode
[melpa]: https://melpa.org/#/god-mode
[stars]: https://github.com/emacsorphanage/god-mode/stargazers
[transferred]: https://github.com/melpa/melpa/pull/6642
[113]: https://github.com/emacsorphanage/god-mode/pull/113
[118]: https://github.com/emacsorphanage/god-mode/pull/118#issuecomment-654114564
[125]: https://github.com/emacsorphanage/god-mode/issues/125#issue-873891840

