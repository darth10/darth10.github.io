## darth10.github.io

To get started:

1. Initialize the `public/` submodule.
   ``` sh
   git submodule init
   git submodule update
   ```

1. Install all dependencies.
   ```sh
   mise install
   npm install
   npm install -g sass # Required for cryogen
   clj -M:deps
   ```
1. Start the development server by calling
   `darth10.github.io.server/start-server`.

   Note that the `serve` command will not recompile assets.
