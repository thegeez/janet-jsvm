# jsvm v0.1
A partial implementation of a Janet bytecode VM in Javascript.

The following code works in the browser:

```janet
(defn worker
  "Does some work."
  [chan name n]
  (for i 0 n
    (ev/give chan (string name " working " i "..."))
    (if (= i 3)
      (:js.fetch "http://localhost:8080/mock-endpoint?sleep=0.5")
      (ev/sleep 0.5)))
  (ev/give chan (string name " is done!"))
  (ev/chan-close chan))

(defn go []
  (def bob-chan (ev/chan 1))
  (def sally-chan (ev/chan 1))

  (def output-arr @[])
  
  (ev/go (fiber/new (fn []
                      (def chans @{bob-chan true
                                   sally-chan true})

                      (forever
                       (def [res-op res-chan res-value] (ev/select (splice (keys chans))))
                       (if (= res-op :take)
                         (array/push output-arr res-value) # [:take chan value]
                         (put chans res-chan nil) # [:close chan]
                         )

                       (if (= (length chans) 0)
                         (break))
                       ))))
  
  # Start bob working in a new task with ev/call
  (ev/go (fiber/new (fn [] (worker bob-chan "bob" 5))))

  (ev/sleep 0.25)

  
  # Start sally working in a new task with ev/go
  (ev/go (fiber/new |(worker sally-chan "sally" 10)))

  (:js.fetch "http://localhost:8080/mock-endpoint?sleep=6")
  (array/push output-arr "Everyone should be done by now!")

  output-arr)


(defn test []
  (def output-arr (go))

  (def [l0 l1 l2 l3 l4 l5 l6 l7 l8 l9
        l10 l11 l12 l13 l14 l15 l16 l17] output-arr)
  (and (= l0 "bob working 0...")
       (= l1 "sally working 0...")
       (= l2 "bob working 1...")
       (= l3 "sally working 1...")
       (= l4 "bob working 2...")
       (= l5 "sally working 2...")
       (= l6 "bob working 3...")
       (= l7 "sally working 3...")
       (= l8 "bob working 4...")
       (= l9 "sally working 4...")
       (= l10 "bob is done!")
       (= l11 "sally working 5...")
       (= l12 "sally working 6...")
       (= l13 "sally working 7...")
       (= l14 "sally working 8...")
       (= l15 "sally working 9...")
       (= l16 "sally is done!")
       (= l17 "Everyone should be done by now!")
       ))
```

# About
jsvm is a partial implementation of the Janet bytecode VM in Javascript. This is mostly meant as an exercise to figure out how the event system and channels work in Janet proper.

Features:
- Event loop with fibers, channels and timeouts
- Resume, yield and signals
- Support for Javascript `fetch` in event loop
- GC (completely deferred to the Javascript GC)

Everything in a test in the `test/` directory should work. If it isn't in a test it probably isn't implemented.


# Run locally
`janet server.janet`

Open `http://localhost:8080/test`

# License
MIT, same as Janet

Gijs Stuurman / https://thegeez.net / twitter.com/thegeez
