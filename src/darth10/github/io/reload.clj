(ns darth10.github.io.reload
    (:require [cheshire.core :as json]
              [ring.adapter.jetty9 :refer [send!]]))

(def hello-response {"command" "hello"
                     "serverName" "clj-live-reload"
                     "protocols" ["http://livereload.com/protocols/official-7"]})

(def sockets (atom #{}))

(def reload-map {:command "reload"
                 :liveCSS true })

(defn- on-ws-text [ws text-message]
  (when (= "hello" (get (json/parse-string text-message) "command"))
    (send! ws (json/generate-string hello-response))))

(def ws-handler {:on-connect (fn [ws]
                               (swap! sockets conj ws))
                 :on-close (fn [ws _ _]
                             (swap! sockets disj ws))
                 :on-text on-ws-text})

(defn reload-page []
  (doseq [ws @sockets]
    (send! ws (json/generate-string (merge reload-map {:path "."})))))
