(defn test []
  (def c (ev/chan 1))
  (ev/give c 42)
  (def a (ev/select c))
  (print "AAAA" a)
  (def [a_op a_chan a_value] a)
  (and (= a_op :take)
       # (= a_chan c)
       (= a_value 42))
  )
