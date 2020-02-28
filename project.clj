(defproject darth10-github-io "1.0.0"
  :description "Code for darth10.github.io"
  :url "https://github.com/darth10/darth10.github.io"
  :source-paths ["src/clj"]
  :dependencies [[org.clojure/clojure "1.10.1"]
                 [info.sunng/ring-jetty9-adapter "0.12.5"]
                 [ring/ring-devel "1.8.0"]
                 [cheshire "5.10.0"]
                 [compojure "1.6.1"]
                 [cryogen-core "0.3.1"]
                 [cryogen-markdown "0.1.11"]
                 [hawk "0.2.11"]
                 [ring-server "0.5.0"]]
  :plugins [[lein-ring "0.12.5"]]
  :main darth10.github.io.core
  :ring {:init darth10.github.io.server/init
         :handler darth10.github.io.server/http-handler})
