(ns darth10.github.io.webpack
  (:require [clojure.java.shell :as shell]
            [text-decoration.core :as text]))

(defn webpack-installed? []
  (zero? (:exit (shell/sh "npx" "webpack" "--version"))))

(defn run-webpack! []
  (println (text/blue "running webpack"))
  (if (not (webpack-installed?))
    (println
     (text/red "webpack not installed. Run `npm install`."))
    (let [result (shell/sh "npx" "webpack")]
      (if (zero? (:exit result))
        (println (text/cyan (:out result)))
        (println (text/red (:err result))
                 (text/red (:out result)))))))
