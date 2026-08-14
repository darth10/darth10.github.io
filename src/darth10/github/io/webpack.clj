(ns darth10.github.io.webpack
  (:require
   [clojure.java.shell :as shell]
   [taoensso.telemere :as tel]))

(defn webpack-installed? []
  (let [result (shell/sh "npx" "webpack" "--version" :dir "web")]
    (or (zero? (:exit result))
        (throw (ex-info "Could not run webpack" result)))))

(defn run-webpack! []
  (tel/log! "running webpack")
  (when (webpack-installed?)
    (let [result (shell/sh "npx" "webpack" :dir "web")]
      (if (zero? (:exit result))
        (tel/log! (:out result))
        (do
          (tel/log! {:level :error
                     :data (select-keys result [:out :err])}
                    "webpack failed")
          (throw (ex-info "webpack failed" result)))))))
