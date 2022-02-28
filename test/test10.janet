(defn test []
  (def arr @[100])
  (array/push arr 200)
  (array/push arr 300)
  (def [a b c] arr)
  (and (= a 100)
       (= b 200)
       (= c 300)))
