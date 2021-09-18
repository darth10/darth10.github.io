(ns darth10.github.io.markup
  (:require
   [clojure.string :as s]
   [cryogen-core.markup :as m]
   [markdown.core :refer [md-to-html-string]])
  (:import
   java.util.Collections
   org.asciidoctor.Asciidoctor$Factory))

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
