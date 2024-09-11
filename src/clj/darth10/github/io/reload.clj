(ns darth10.github.io.reload
    (:require
     [cheshire.core :as json]
     [ring.websocket :as ring-ws]))

(defonce sockets (atom #{}))

(defn ws-handler [upgrade-request]
  {:ring.websocket/listener {:on-open (fn [ws]
                                        (swap! sockets conj ws))
                             :on-close (fn [ws _ _]
                                         (swap! sockets disj ws))
                             :on-message (fn on-ws-message [ws text-message]
                                           (when (= "hello" (get (json/parse-string text-message) "command"))
                                             (ring-ws/send ws (json/generate-string {"command" "hello"
                                                                                     "serverName" "clj-live-reload"
                                                                                     "protocols" ["http://livereload.com/protocols/official-7"]}))))}
   :ring.websocket/protocol (-> upgrade-request :websocket-subprotocols first)})

(defn reload-page []
  (doseq [ws @sockets]
    (ring-ws/send ws (json/generate-string (merge {:command "reload"
                                                   :liveCSS true
                                                   :path "."})))))
