(ns darth10.github.io.server
  (:require [compojure.core :refer [GET defroutes]]
            [compojure.route :as route]
            [cryogen-core.compiler :refer [compile-assets-timed read-config]]
            [cryogen-core.io :refer [path]]
            [cryogen-core.plugins :refer [load-plugins]]
            [cryogen-core.watcher :refer [start-watcher!]]
            [darth10.github.io.reload :refer [ws-handler reload-page]]
            [hawk.core :as hawk]
            [ring.util.response :refer [redirect resource-response]]
            [ring.util.codec :refer [url-decode]]
            [ring.adapter.jetty9 :refer [run-jetty]]))

(defn init []
  (load-plugins)
  (compile-assets-timed)
  (let [ignored-files (-> (read-config) :ignored-files)]
    (start-watcher!
     "resources/templates" ignored-files
     (fn []
       (compile-assets-timed)
       (reload-page)))))

(defn wrap-subdirectories
  [handler]
  (fn [request]
    (let [req-uri (.substring (url-decode (:uri request)) 1)
          res-path (if (or (= req-uri "") (= req-uri "/"))
                     (path "/index.html")
                     (path (str req-uri ".html")))]
      (or (resource-response res-path {:root "public"})
          (handler request)))))

(defroutes routes
  (GET "/" [] (redirect
               (let [config (read-config)]
                 (path (:blog-prefix config)
                       (when-not (:clean-urls? config) "index.html")))))
  (route/resources "/")
  (route/not-found "Page not found"))

(def http-handler
  (wrap-subdirectories routes))

(defn reload-handler [_]
  {:body (slurp (clojure.java.io/resource "livereload.js"))
   :status 200})

(defonce server (atom []))

(defn start-server [& {:keys [port]
                       :or {port 4000}}]
  (let [file-watcher    (init)
        http-instance   (run-jetty http-handler
                                   {:port port
                                    :join? false})
        reload-instance (run-jetty reload-handler
                                   {:port 35729
                                    :websockets {"/livereload" ws-handler}
                                    :allow-null-path-info true
                                    :join? false})]
    (swap! server conj file-watcher http-instance reload-instance)))

(defn stop-server []
  (when-let [[file-watcher http-instance reload-instance] (seq @server)]
    (hawk/stop! file-watcher)
    (.stop http-instance)
    (.stop reload-instance)
    (swap! server empty)))

;; (start-server)
;; (stop-server)
