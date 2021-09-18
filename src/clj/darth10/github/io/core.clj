(ns darth10.github.io.core
  (:require
   [cryogen-core.plugins :refer [load-plugins]]
   [darth10.github.io.server :refer [compile-all-assets]]))

(defn compile [& _]
  (load-plugins)
  (compile-all-assets :reload? false)
  (System/exit 0))
