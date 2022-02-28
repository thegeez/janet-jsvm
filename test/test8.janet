(defn f1 []
  (def f2 (fn []
            (yield 42)))
  (def fib2 (fiber/new f2))
  (resume fib2))

(defn test []
  (def fib1 (fiber/new f1))
  (def a (resume fib1))
  (print "got: " a)
  (= a 42))
