(ns darth10.github.io.reuse
  (:require
   [clojure.java.shell :as shell]
   [taoensso.telemere :as tel]))

(defn reuse-installed? []
  (let [result (shell/sh "reuse" "--version")]
    (or (zero? (:exit result))
        (throw (ex-info "Could not run reuse" result)))))

(defn run-reuse-lint! []
  (tel/log! "running reuse lint")
  (when (reuse-installed?)
    (let [result (shell/sh "reuse" "lint")]
      (if (zero? (:exit result))
        (tel/log! (:out result))
        (do
          (tel/log! {:level :error
                     :data (select-keys result [:out :err])}
                    "reuse lint failed")
          (throw (ex-info "reuse lint failed" result)))))))
