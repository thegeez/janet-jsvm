(import halo2)
(import ./test/serve :as test-serve)

(defn handler [request]
  (let [{:uri uri
         :path path} request]
    (cond
      (= uri "/")
      (let [response {:status 200
                      :headers {"Content-Type" "text/html"}
                      :body (slurp "index.html")
                      }]
        #(printf "invocation/next response %p" response)
        response)

      (= uri "/vm.js")
      (let [response {:status 200
                      :headers {"Content-Type" "application/javascript"}
                      :body (slurp "vm.js")
                      }]
        #(printf "invocation/next response %p" response)
        response)

      (= "/test" path)
      (test-serve/index request)

      (and (string/has-prefix? "/test/test_compile/" uri)
           (string/has-suffix? ".js" uri))
      (let [response {:status 200
                      :headers {"Content-Type" "application/javascript"}
                      :body (slurp (string/slice uri 1))
                      }]
        #(printf "invocation/next response %p" response)
        response)

      (= "/mock-endpoint" path)
      (let [query-params (let [[uri q] (string/split "?" uri)]
                           (when q
                             (let [pairs (string/split "&" q)]
                               (table (splice (mapcat (fn [ps] (string/split "=" ps)) pairs))))))

            _ (when-let [sleep (get query-params "sleep")]
                (ev/sleep (scan-number sleep)))
            
            response {:status 200
                      :headers {"Content-Type" "application/javascript"}
                      :body (->> (if-let [return (get query-params "return")]
                                   return
                                   (string/format "%p\n" request)))
                      }]
        response)
      )))




(def f
  (ev/spawn-thread
   (def host "localhost")
   (def max-size
     # 8192
     (* 1024 1024)              # also serving files
     )
   (def port 8080)

   (print "Running dev server on " host ":" port)
   (let [port (string port)
         socket (net/server host port)]
     (forever
      (when-let [conn (:accept socket)]
        (let [# wrap-handler fixes "abstract type in thread" error
              wrap-handler (fn [req]
                             (handler req))]
          (ev/call (halo2/connection-handler wrap-handler max-size) conn))
        ))
     )
   ))
