(ns darth10.github.io.scss
  (:require [clojure.java.io :as io]
            [clojure.java.shell :as shell]
            [text-decoration.core :as text]
            [cryogen-core.io :as cryogen-io]))

(defn sass-installed? []
  (zero? (:exit (shell/sh "sass" "--version"))))

(defn find-scss-files [dir ignored-files]
  (let [^java.io.FilenameFilter filename-filter
        (cryogen-io/match-re-filter #"(?i:s[ca]ss$)")]
    (->> (.listFiles (io/file "." dir) filename-filter)
         (filter #(not (.isDirectory ^java.io.File %)))
         (filter (cryogen-io/ignore ignored-files))
         (map #(.getName ^java.io.File %)))))

(defn compile-scss-dir! [sass-src-dir sass-dest-dir]
  (shell/sh "sass" "--style" "compressed" "--update" "--no-source-map"
            (str sass-src-dir ":" sass-dest-dir)))

(defn compile-scss->css! [{:keys [sass-src ignored-files] :as config}]
  (println (text/blue "compiling scss"))
  (if (and (seq sass-src)
           (not (sass-installed?)))
    (println
     (text/red (str "Sass not installed to compile files in " sass-src)))
    (doseq [sass-src-dir (map (partial cryogen-io/path "themes" (:theme config))
                              sass-src)]
      (let [sass-dest-dir (cryogen-io/path "public" "css")]
        (when (seq (find-scss-files sass-src-dir ignored-files))
          (println "\t" (text/cyan sass-src-dir) "-->"
                   (text/cyan sass-dest-dir))
          (let [result (compile-scss-dir! sass-src-dir sass-dest-dir)]
            (if-not (zero? (:exit result))
              (println (text/red (:err result))
                       (text/red (:out result))))))))))
