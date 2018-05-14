(defproject darth10-github-io "1.0.0"
  :description "Code for site darth10.github.io"
  :url "https://github.com/darth10/darth10.github.io"
  :dependencies [[org.clojure/clojure "1.8.0"]
                 [ring/ring-devel "1.6.3"]
                 [compojure "1.6.1"]
                 [ring-server "0.5.0"]
                 [cryogen-markdown "0.1.4"]
                 [cryogen-core "0.1.46"]]
  :plugins [[lein-ring "0.9.7"]]
  :main darth10.github.io.core
  :ring {:init darth10.github.io.server/init
         :handler darth10.github.io.server/handler})