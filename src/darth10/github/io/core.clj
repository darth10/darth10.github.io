(ns darth10.github.io.core
  (:require [cryogen-core.plugins :refer [load-plugins]]
            [darth10.github.io.server :refer [compile-all-assets]]))

(defn -main []
  (load-plugins)
  (compile-all-assets)
  (System/exit 0))
