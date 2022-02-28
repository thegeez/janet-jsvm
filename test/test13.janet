(defn test []
  (def c (ev/chan 10))
  (def a (ev/select [c 42]))
  (def [a_op a_chan] a)
  (def b_value (ev/take c))
  (and (= a_op :give)
       # (= a_chan c)
       (= b_value 42)
       ))
