(ns darth10.github.io.server
  (:require
   [clojure.string :as string]
   [compojure.core :refer [GET defroutes]]
   [compojure.route :as route]
   [cryogen-core.compiler :refer [compile-assets]]
   [cryogen-core.config :refer [resolve-config]]
   [cryogen-core.io :refer [path]]
   [cryogen-core.plugins :refer [load-plugins]]
   [cryogen-core.watcher :as watcher]
   [darth10.github.io.bundle :refer [run-build!]]
   [darth10.github.io.logging :as logging]
   [darth10.github.io.reload :as reload]
   [darth10.github.io.reuse :refer [run-reuse-lint!]]
   [ring.adapter.jetty9 :as jetty :refer [run-jetty]]
   [ring.util.codec :refer [url-decode]]
   [ring.util.mime-type :refer [ext-mime-type]]
   [ring.util.response :refer [content-type file-response get-header redirect]]))

(def config (delay (resolve-config)))

(defn wrap-subdirectories
  [handler]
  (fn [request]
    (let [{:keys [clean-urls blog-prefix public-dest]} @config
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
  (GET "/" [] (redirect (let [{:keys [blog-prefix clean-urls]} @config]
                          (path blog-prefix
                                (when (= clean-urls :dirty)
                                  "index.html")))))
  (route/files "/")
  (route/not-found "Page not found"))

(defn wrap-file-content-type
  "Set content-type based on served file, rather than from the request URI.
  This is needed for serving JS module resources - `<script type=\"module\">`."
  [handler]
  (fn [request]
    (let [{:keys [body] :as response} (handler request)]
      (if-let [mime (and (instance? java.io.File body)
                         (nil? (get-header response "Content-Type"))
                         (ext-mime-type (.getName ^java.io.File body)))]
        (content-type response mime)
        response))))

(def http-handler
  (-> routes
      wrap-subdirectories
      wrap-file-content-type))

(defn reload-handler [request]
  (if (jetty/ws-upgrade-request? request)
    (reload/ws-handler request)
    ;; Serve livereload-js from npm modules.
    {:body (slurp (path "web" "node_modules" "livereload-js" "dist"
                        "livereload.min.js"))
     :headers {"Content-Type" "text/javascript"}
     :status 200}))

(defn compile-all-assets
  ([] (compile-all-assets {}))
  ([{:keys [reload?] :or {reload? true}}]
   (let [create-dir #(->> % (path "themes" (:theme @config))
                          java.io.File. .mkdir)]
     ;; Directories themes/*/css and themes/*/js need to be
     ;; created or compile-assets will fail.
     (create-dir "css")
     (create-dir "js")
     (when-not reload? (run-reuse-lint!))
     (compile-assets)
     (run-build!)
     (when reload? (reload/send!)))))

(defonce plugins-loaded? (atom false))

(defn init-server []
  (let [{:keys [ignored-files watch-dirs]} @config]
    (logging/init!)
    (when (not @plugins-loaded?)
      (load-plugins)
      (swap! plugins-loaded? not))
    (compile-all-assets {:reload? false})
    (mapv #(watcher/start-watcher! % ignored-files compile-all-assets)
          watch-dirs)))

(defonce server (atom []))

(defn start-server [& {:keys [port]
                       :or {port 4000}}]
  (when (empty? @server)
    (let [file-watchers   (init-server)
          http-instance   (run-jetty http-handler
                                     {:port port
                                      :join? false})
          reload-instance (run-jetty reload-handler
                                     {:port 35729
                                      :join? false})]
      (swap! server conj file-watchers http-instance reload-instance))))

(defn stop-server []
  (when-let [[[& file-watchers]
              http-instance reload-instance] (seq @server)]
    (doseq [^java.nio.file.WatchService w file-watchers]
      (.close w))
    (.stop http-instance)
    (.stop reload-instance)
    (swap! server empty)))

(comment
  (start-server)
  (stop-server))
