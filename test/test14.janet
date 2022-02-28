(defn test []
  (def res (:js.fetch "http://localhost:8080/mock-endpoint?sleep=5&return=gogo"))
  (= (get res :body) "gogo"))
