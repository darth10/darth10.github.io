(ns darth10.github.io.server
  (:require [clojure.string :as string]
            [compojure.core :refer [GET defroutes]]
            [compojure.route :as route]
            [cryogen-core.compiler :refer [compile-assets]]
            [cryogen-core.config :refer [resolve-config]]
            [cryogen-core.io :refer [path]]
            [cryogen-core.plugins :refer [load-plugins]]
            [cryogen-core.watcher :refer [start-watcher!]]
            [darth10.github.io.reload :refer [ws-handler reload-page]]
            [darth10.github.io.scss :refer [compile-scss->css!]]
            [darth10.github.io.webpack :refer [run-webpack!]]
            [hawk.core :as hawk]
            [ring.util.response :refer [redirect file-response]]
            [ring.util.codec :refer [url-decode]]
            [ring.adapter.jetty9 :refer [run-jetty]]))

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
  ;; Serve livereload.js from npm modules.
  {:body (slurp (path "node_modules" "livereload-js" "dist"
                      "livereload.min.js"))
   :status 200})

(defonce plugins-loaded? (atom false))

(defn compile-all-assets [& {:keys [reload?] :or {reload? true}}]
  (let [config (resolve-config)
        create-dir #(->> % (path "themes" (:theme config))
                         java.io.File. .mkdir)]
    ;; Directories themes/*/css and themes/*/js need to be
    ;; created or compile-assets will fail.
    (create-dir "css")
    (create-dir "js")
    (compile-assets config)
    (compile-scss->css! config)
    (run-webpack!)
    (when reload? (reload-page))))

(defn init []
  (let [ignored-files (:ignored-files (resolve-config))]
    (when (not @plugins-loaded?)
      (load-plugins)
      (swap! plugins-loaded? not))
    (compile-all-assets :reload? false)
    [(start-watcher! "content" ignored-files compile-all-assets)
     (start-watcher! "themes" ignored-files compile-all-assets)]))

(defonce server (atom []))

(defn start-server [& {:keys [port]
                       :or {port 4000}}]
  (let [file-watchers   (init)
        http-instance   (run-jetty http-handler
                                   {:port port
                                    :join? false})
        reload-instance (run-jetty reload-handler
                                   {:port 35729
                                    :websockets {"/livereload" ws-handler}
                                    :allow-null-path-info true
                                    :join? false})]
    (swap! server conj file-watchers http-instance reload-instance)))

(defn stop-server []
  (when-let [[[& file-watchers]
              http-instance reload-instance] (seq @server)]
    (doseq [w file-watchers]
      (hawk/stop! w))
    (.stop http-instance)
    (.stop reload-instance)
    (swap! server empty)))

;; (start-server)
;; (stop-server)
