(ns darth10.github.io.compile
  (:require
   [cryogen-core.plugins :refer [load-plugins]]
   [darth10.github.io.logging :as logging]
   [darth10.github.io.server :refer [compile-all-assets]]))

(defn compile-all [& _]
  (logging/init!)
  (load-plugins)
  (compile-all-assets {:reload? false})
  (System/exit 0))
