(defn f1 []
  (def a (yield 10000))
  (def b (yield a))
  (yield b))

(def fib (fiber/new f1))

(defn test []
  (def r1 (resume fib))
  (def r2 (resume fib (+ 10000 r1)))
  (def r3 (resume fib (+ 10000 r2)))
  (= (+ r1 r2 r3) 60000))
