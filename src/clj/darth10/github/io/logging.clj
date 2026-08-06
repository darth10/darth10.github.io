(ns darth10.github.io.logging
  "Console logging setup, loaded for side effects by the compile and serve
  entry points."
  (:require
   [taoensso.telemere :as tel]
   [taoensso.telemere.utils :as tel-utils]
   [text-decoration.core :as text]))

(defn- terse-preamble
  "Renders our own signals as a single coloured line, matching the console
  messages cryogen-core prints alongside them. Java library logging keeps
  Telemere's default preamble, where the timestamp and logger name are useful."
  [default-preamble]
  (fn [{:keys [kind level msg_] :as signal}]
    (if (= kind :log)
      (let [msg (force msg_)]
        (case level
          (:error :fatal) (text/red msg)
          :warn (text/yellow msg)
          (text/blue msg)))
      (default-preamble signal))))

(defn init! []
  (tel/set-min-level! :slf4j :warn)
  (tel/add-handler! :default/console
                    (tel/handler:console
                     {:output-fn (tel/format-signal-fn
                                  {:preamble-fn (terse-preamble (tel-utils/signal-preamble-fn))})})
                    {:async nil}))
