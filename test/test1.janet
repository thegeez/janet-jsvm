(defn myadd [a b]
  (+ a b))

(defn myfn1 [a]
  (def p (myadd a 42))
  (myadd p 999))

(defn test []
  (= (myfn1 1000) (+ 1000 42 999)))
