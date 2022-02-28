(defn test []
  (def f1 (fn []
            (yield 42)))
  (def fib1 (fiber/new f1))
  (def a (resume fib1))
  (= a 42))
