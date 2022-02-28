(def outerfun (fn [x y]
                (def c (do
                         (def someval (+ 10 y))
                         (def ctemp (if x (fn [] someval) (fn [] y)))
                         ctemp
                         ))
                (+ 1 2 3 4 5 6 7)
                c))

(defn test []
  (and (= ((outerfun 1 2)) 12)
       (= ((outerfun nil 2)) 2)
       (= ((outerfun false 3)) 3))
  )

