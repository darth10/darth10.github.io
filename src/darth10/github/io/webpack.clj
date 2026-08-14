(ns darth10.github.io.webpack
  (:require
   [clojure.java.shell :as shell]
   [taoensso.telemere :as tel]))

(defn webpack-installed? []
  (zero? (:exit (shell/sh "npx" "webpack" "--version" :dir "web"))))

(defn run-webpack! []
  (tel/log! "running webpack")
  (if (not (webpack-installed?))
    (tel/log! :error "webpack not installed. Run `npm install --prefix web`.")
    (let [result (shell/sh "npx" "webpack" :dir "web")]
      (if (zero? (:exit result))
        (tel/log! (:out result))
        (do
          (tel/log! {:level :error
                     :data (select-keys result [:out :err])}
                    "Error running webpack")
          (throw (ex-info "Error running webpack" result)))))))
