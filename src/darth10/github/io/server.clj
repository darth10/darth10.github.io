(ns darth10.github.io.server
  (:require [compojure.core :refer [GET defroutes]]
            [compojure.route :as route]
            [ring.util.response :refer [redirect resource-response]]
            [ring.util.codec :refer [url-decode]]
            [ring.adapter.jetty :refer [run-jetty]]
            [cryogen-core.watcher :refer [start-watcher!]]
            [cryogen-core.plugins :refer [load-plugins]]
            [cryogen-core.compiler :refer [compile-assets-timed read-config]]
            [cryogen-core.io :refer [path]]))

(defn init []
  (load-plugins)
  (compile-assets-timed)
  (let [ignored-files (-> (read-config) :ignored-files)]
    (start-watcher! "resources/templates" ignored-files compile-assets-timed)))

(defn wrap-subdirectories
  [handler]
  (fn [request]
    (let [req-uri (.substring (url-decode (:uri request)) 1)
          res-path (path req-uri (when (:clean-urls? (read-config)) "index.html"))]
      (or (resource-response res-path {:root "public"})
          (handler request)))))

(defroutes routes
  (GET "/" [] (redirect (let [config (read-config)]
                          (path (:blog-prefix config) "/"
                                (when-not (:clean-urls? config) "index.html")))))
  (route/resources "/")
  (route/not-found "Page not found"))

(def handler
  (wrap-subdirectories routes))

(defonce server (atom []))

(defn start-server [& {:keys [port]
                       :or {port 4000}}]
  (let [_ (init)
        instance (run-jetty handler {:port port
                                     :join? false})]
    (swap! server conj instance)))

(defn stop-server []
  (when-let [[instance] (seq @server)]
    (.stop instance)
    (swap! server empty)))

;; (compile-assets-timed)
;; (start-server)
;; (stop-server)
