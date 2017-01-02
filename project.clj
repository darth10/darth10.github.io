(defproject darth10-github-io "1.0.0"
  :description "Code for site darth10.github.io"
  :url "https://github.com/darth10/darth10.github.io"
  :dependencies [[org.clojure/clojure "1.8.0"]
                 [ring/ring-devel "1.5.0"]
                 [compojure "1.5.1"]
                 [ring-server "0.4.0"]
                 [cryogen-markdown "0.1.4"]
                 [cryogen-core "0.1.46"]]
  :plugins [[lein-ring "0.9.7"]]
  :main cryogen.core
  :ring {:init cryogen.server/init
         :handler cryogen.server/handler})
