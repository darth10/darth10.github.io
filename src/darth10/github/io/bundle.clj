(ns darth10.github.io.bundle
  (:require
   [clojure.java.shell :as shell]
   [taoensso.telemere :as tel]))

(defn bun-installed? []
  (let [result (shell/sh "bun" "--version" :dir "web")]
    (or (zero? (:exit result))
        (throw (ex-info "Could not run bun" result)))))

(defn run-build! []
  (tel/log! "running bun build")
  (when (bun-installed?)
    (let [result (shell/sh "bun" "run" "build" :dir "web")]
      (if (zero? (:exit result))
        (tel/log! (:out result))
        (do
          (tel/log! {:level :error
                     :data (select-keys result [:out :err])}
                    "bun build failed")
          (throw (ex-info "bun build failed" result)))))))
