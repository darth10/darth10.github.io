## darth10.github.io

To get started:

1. Install Nix flakes and `direnv`.
1. Initialize the `public/` submodule.
   ``` sh
   git submodule init
   git submodule update
   ```

1. Install all dependencies.
   ```sh
   npm install
   clj -M:deps
   ```
1. Start the development server by calling
   `darth10.github.io.server/start-server` through the REPL or the `clj
   -X:serve` command.

To update Clojure dependencies, run `clj -M:outdated` and `clj -M:upgrade`.

## License

[`LICENSE`](LICENSE) states the scope of each; the verbatim texts are in
[`LICENSES/`](LICENSES), named by SPDX identifier.

Where more than one of the rows below could apply to a file, the more specific
one governs.

| What | License | Text |
|---|---|---|
| Site harness - `src/`, build config including `content/config.edn` | GPLv2 | [`GPL-2.0-only.txt`](LICENSES/GPL-2.0-only.txt) |
| Themes - `themes/` | EPL-1.0 | [`EPL-1.0.txt`](LICENSES/EPL-1.0.txt) |
| Posts, pages and images - everything under the content/ directory except `config.edn` | CC BY-SA 4.0 | [`CC-BY-SA-4.0.txt`](LICENSES/CC-BY-SA-4.0.txt) |
| Code snippets within posts and pages, plus the post scripts in `src/js/posts/` | MIT-0 | [`MIT-0.txt`](LICENSES/MIT-0.txt) |

`src/js/jquery.flot.orderBars.js` is third-party code, copyright &copy; 2010
Benjamin Buffet, released under the MIT License, and none of the above applies
to it. See the Licensing section of [`LICENSE`](LICENSE) for the full statement.
