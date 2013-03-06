(def fibo-seq
  (map first 
    (iterate (fn [[a b]] [b (+ a b)]) [0N 1N])))

(defn fibo-list [n]
  (take n fibo-seq))

(defn fibo-last [n]
  (last (fibo-list n)))
