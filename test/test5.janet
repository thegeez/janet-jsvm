(defn f1 []
  (yield 1000)
  (yield 2000)
  (yield 3000))

(def fib (fiber/new f1))

(defn test []
  (def r1 (resume fib))
  (def r2 (resume fib))
  (def r3 (resume fib))
  (= (+ r1 r2 r3) 6000)
  )
