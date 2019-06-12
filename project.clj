(defproject darth10-github-io "1.0.0"
  :description "Code for site darth10.github.io"
  :url "https://github.com/darth10/darth10.github.io"
  :dependencies [[org.clojure/clojure "1.10.0"]
                 [info.sunng/ring-jetty9-adapter "0.12.3"]
                 [ring/ring-devel "1.7.1"]
                 [cheshire "5.8.1"]
                 [compojure "1.6.1"]
                 [cryogen-core "0.1.66"]
                 [cryogen-markdown "0.1.7"]
                 [hawk "0.2.11"]
                 [ring-server "0.5.0"]]
  :plugins [[lein-ring "0.12.5"]]
  :main darth10.github.io.core
  :ring {:init darth10.github.io.server/init
         :handler darth10.github.io.server/http-handler})
