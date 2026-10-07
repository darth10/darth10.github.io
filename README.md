# darth10.github.io

To get started:

1. Install Nix (with flakes enabled) and `direnv`.
2. Install all dependencies. The Bun project lives in `web/`.
   ```sh
   bun install --cwd web
   clj -P
   ```
3. Start the development server by calling
   `darth10.github.io.server/start-server` through the REPL or the `clj -X:serve`
   command.

Pushes to `cryogen` are compiled and committed to `master` by the CI
workflow. Put `[no deploy]` in the head commit message to skip one, or set the
repository variable `DEPLOY_ENABLED` to `false` to pause deploys (Settings > Secrets and variables > Actions > Variables > Repository variables).

To update Clojure dependencies, run `clj -M:outdated` and `clj -M:upgrade`.

## License

There are multiple licenses in play, one per directory, plus third-party code
that retains its own license. [`LICENSE`](LICENSE) states the scope of each; the verbatim
texts are in [`LICENSES/`](LICENSES), named by SPDX identifier.

Each directory is licensed as a whole. Where more than one row below could
apply, the more specific one governs.

| What | License | Text |
|---|---|---|
| Generator - `src/`, `themes/`, `config/`, and the build files, dotfiles and README in the repository root | EPL-1.0 | [`EPL-1.0.txt`](LICENSES/EPL-1.0.txt) |
| Scripts, styles and Bun build config - `web/` | MIT | [`MIT.txt`](LICENSES/MIT.txt) |
| Posts, pages and images - everything under `content/` | CC BY-SA 4.0 | [`CC-BY-SA-4.0.txt`](LICENSES/CC-BY-SA-4.0.txt) |
| Fenced code blocks within posts and pages | MIT-0 | [`MIT-0.txt`](LICENSES/MIT-0.txt) |

The same scopes are expressed as SPDX tags in [`REUSE.toml`](REUSE.toml), so
`reuse lint` passes; `LICENSE` remains the authoritative statement.

`web/vendor/` holds third-party code that retains its own copyright, and the
generated `public/` mixes all of the above with bundled dependencies. The build
collects the notices for those into `public/THIRD-PARTY-NOTICES.txt` and
`public/fonts/LICENSE.txt`. See [`LICENSE`](LICENSE) for both statements.
