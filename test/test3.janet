(def fib (do (var fib nil) (set fib (fn [n] (if (< n 2) n (+ (fib (- n 1)) (fib (- n 2))))))))

(def fib2 (fn fib2 [n] (if (< n 2) n (+ (fib2 (- n 1)) (fib2 (- n 2))))))

(defn test []
  (and
    (= (fib 0) (fib2 0) 0)
    (= (fib 1) (fib2 1) 1)
    (= (fib 2) (fib2 2) 1)
    (= (fib 3) (fib2 3) 2)
    (= (fib 4) (fib2 4) 3)
    (= (fib 5) (fib2 5) 5)
    ### (= (fib 6) (fib2 6) 8)
    ### (= (fib 7) (fib2 7) 13)
    ### (= (fib 8) (fib2 8) 21)
    ### (= (fib 9) (fib2 9) 34)
    ### (= (fib 10) (fib2 10) 55)
    ))
