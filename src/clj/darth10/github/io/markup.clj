(ns darth10.github.io.markup
  (:require [markdown.core :refer [md-to-html-string]]
            [cryogen-core.markup :as m]
            [clojure.string :as s])
  (:import org.asciidoctor.Asciidoctor$Factory
           java.util.Collections))

(defn- markdown []
  (reify m/Markup
    (dir [this] "md")
    (ext [this] ".md")
    (render-fn [this]
      (fn [rdr]
        (md-to-html-string
         (->> (java.io.BufferedReader. rdr)
              (line-seq)
              (s/join "\n"))
         :heading-anchors true)))))

(defn- asciidoc []
  (reify Markup
    (dir [this] "asc")
    (ext [this] ".asc")
    (render-fn [this]
      (fn [rdr]
        (.convert (Asciidoctor$Factory/create)
                  (->> (java.io.BufferedReader. rdr)
                       (line-seq)
                       (s/join "\n"))
                  (Collections/emptyMap))))))

(defn markups []
  [(markdown) (asciidoc)])
