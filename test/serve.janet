(defn index [request]
  (let [index-html (slurp "test/index.html")

        _ (os/mkdir "test/test_compile")

        test-file-names (seq [file-name :in (os/dir "test/")
                              :when (and (string/has-prefix? "test" file-name)
                                         (string/has-suffix? ".janet" file-name))]
                             file-name)

        #test-file-names ["test5.janet"]

        single-test-selection (when (not= (get request :uri)
                                        (get request :path))
                                (string/slice (get request :uri)
                                              (+ (length (get request :path))
                                                 (length "?single="))))
        
        test-file-names (if single-test-selection
                          [(string single-test-selection ".janet")]
                          test-file-names)
        
        tests-arr (seq [file-name :in test-file-names]
                       (let [test-name (string/replace ".janet" "" file-name)
                             test-image (string/format "%s.jimage" test-name)
                             test-js (string/format "%s.js" test-name)]
                         (print "compile res" (os/execute ["janet" "-c" (string "test/" file-name) (string "test/test_compile/" test-image)] :p))
                         (let [image (slurp (string "test/test_compile/" test-image))]
                           (spit (string "test/test_compile/" test-js)
                                 (string/format "var uimage = new Uint8Array([%s]);"
                                                (string/join (map string image) ", "))))
                         test-name))

        _ (printf "tests-arr: %p" tests-arr)
        
        # %p prints parentheses instead of brackets
        tests-arr-str (string/format "[%s]"
                                     (string/join (map (fn [test-name]
                                                         (string "\"" test-name "\""))
                                                       tests-arr) ", "))
        index-html (string/replace "TESTS_ARR_PLACEHOLDER"
                                   tests-arr-str
                                   index-html)
        
        response {:status 200
                  :headers {"Content-Type" "text/html"}
                  :body index-html
                  }]
    
    response))
