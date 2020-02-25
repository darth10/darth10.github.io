(ns darth10.github.io.server
  (:require [clojure.string :as string]
            [compojure.core :refer [GET defroutes]]
            [compojure.route :as route]
            [cryogen-core.compiler :refer [compile-assets-timed]]
            [cryogen-core.config :refer [resolve-config]]
            [cryogen-core.io :refer [path]]
            [cryogen-core.plugins :refer [load-plugins]]
            [cryogen-core.watcher :refer [start-watcher!]]
            [darth10.github.io.reload :refer [ws-handler reload-page]]
            [hawk.core :as hawk]
            [ring.util.response :refer [redirect file-response]]
            [ring.util.codec :refer [url-decode]]
            [ring.adapter.jetty9 :refer [run-jetty]]))

(defn init []
  (load-plugins)
  (compile-assets-timed)
  (let [ignored-files (-> (resolve-config) :ignored-files)
        compile-and-reload (fn []
                             (compile-assets-timed)
                             (reload-page))]
    (start-watcher! "content" ignored-files compile-and-reload)
    (start-watcher! "themes" ignored-files compile-and-reload)))

(defn wrap-subdirectories
  [handler]
  (fn [request]
    (let [{:keys [clean-urls blog-prefix public-dest]} (resolve-config)
          req-uri (.substring (url-decode (:uri request)) 1)
          res-path (if (or (.endsWith req-uri "/")
                           (.endsWith req-uri ".html")
                           (-> (string/split req-uri #"/")
                               last
                               (string/includes? ".")
                               not))
                     (condp = clean-urls
                       :trailing-slash (path req-uri "index.html")
                       :no-trailing-slash (if (or (= req-uri "")
                                                  (= req-uri "/")
                                                  (= req-uri
                                                     (if (string/blank? blog-prefix)
                                                       blog-prefix
                                                       (.substring blog-prefix 1))))
                                            (path req-uri "index.html")
                                            (path (str req-uri ".html")))
                       :dirty (path (str req-uri ".html")))
                     req-uri)]
      (or (file-response res-path {:root public-dest})
          (handler request)))))

(defroutes routes
  (GET "/" [] (redirect (let [config (resolve-config)]
                          (path (:blog-prefix config)
                                (when (= (:clean-urls config) :dirty)
                                  "index.html")))))
  (route/files "/")
  (route/not-found "Page not found"))

(def http-handler
  (wrap-subdirectories routes))

(defn reload-handler [_]
  {:body (slurp (path "content" "livereload.js"))
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
