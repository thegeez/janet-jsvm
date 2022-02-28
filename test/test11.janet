(def prns @[])

(defn collect-print [& args]
  (array/push prns (string (splice args))))

(defn worker
  "Does some work."
  [name n]
  (for i 0 n
    (collect-print name " working " i "...")
    (ev/sleep 0.5))
  (collect-print name " is done!"))

(defn go [] 
  # Start bob working in a new task with ev/call
  (ev/go (fiber/new (fn [] (worker "bob" 5))))

  (ev/sleep 0.25)

  # Start sally working in a new task with ev/go
  (ev/go (fiber/new |(worker "sally" 10)))

  (ev/sleep 6)
  (collect-print "Everyone should be done by now!"))


(defn test []
  (go)

  (def [l0 l1 l2 l3 l4 l5 l6 l7 l8 l9
        l10 l11 l12 l13 l14 l15 l16 l17
       ] prns)
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

# repl:7:> (disasm (get-in e ['go :value]))
# {:arity 0 :bytecode @[
#  0 (lds 0)
#  1 (clo 1 0)
#  2 (push 1)
#  3 (ldc 3 0)
#  4 (call 2 3)
#  5 (push 2)
#  6 (ldc 3 1)
#  7 (call 1 3)
#  8 (ldc 2 2)
#  9 (push 2)
# 10 (ldc 3 3)
# 11 (call 2 3)
# 12 (clo 3 1)
# 13 (push 3)
# 14 (ldc 5 0)
# 15 (call 4 5)
# 16 (push 4)
# 17 (ldc 5 1)
# 18 (call 3 5)
# 19 (ldi 4 11)
# 20 (push 4)
# 21 (ldc 5 3)
# 22 (call 4 5)
# 23 (ldc 5 4)
# 24 (push 5)
# 25 (ldc 5 5)
# 26 (tcall 5)
# ] :constants @[<cfunction fiber/new> <cfunction ev/go> 0.25 <cfunction ev/sleep> "Everyone should be done by now!" <function print>] :defs @[{:arity 0 :bytecode @[
# 0 (ldc 0 0)
# 1 (ldi 1 10)
# 2 (push2 0 1)
# 3 (ldc 0 1)
# 4 (tcall 0)
# ] :constants @["bob" <function worker>] :defs @[] :environments @[] :max-arity 0 :min-arity 0 :slotcount 2 :source "test/test11.janet" :sourcemap @[(16 28) (16 28) (16 28) (16 28) (16 28)] :vararg false}
# {:arity 0 :bytecode @[
# 0  (ldc 0 0)
# 1  (ldi 1 20)
# 2  (push2 0 1)
# 3  (ldc 0 1)
# 4  (tcall 0)
# ] :constants @["sally" <function worker>] :defs @[] :environments @[] :max-arity 0 :min-arity 0 :slotcount 2 :source "test/test11.janet" :sourcemap @[(21 21) (21 21) (21 21) (21 21) (21 21)] :vararg false}] :environments @[] :max-arity 0 :min-arity 0 :name "go" :slotcount 6 :source "test/test11.janet" :sourcemap @[ (14 1) (16 21) (16 10) (16 10) (16 10) (16 3) (16 3) (16 3) (18 3) (18 3) (18 3) (18 3) (21 21) (21 10) (21 10) (21 10) (21 3) (21 3) (21 3) (23 3) (23 3) (23 3) (23 3) (24 3) (24 3) (24 3) (24 3)] :vararg false}

# repl:8:> (disasm (get-in e ['worker :value]))
# {:arity 2 :bytecode @[
#  0 (lds 2)
#  1 (ldi 3 0)
#  2 (movn 4 1)
#  3 (lt 5 3 4)
#  4 (jmpno 5 14)
#  5 (movn 6 3)
#  6 (ldc 7 0)
#  7 (push3 0 7 6)
#  8 (ldc 7 1)
#  9 (push 7)
# 10 (ldc 8 2)
# 11 (call 7 8)
# 12 (ldc 7 3)
# 13 (push 7)
# 14 (ldc 8 4)
# 15 (call 7 8)
# 16 (addim 3 3 1)
# 17 (jmp -14)
# 18 (ldc 3 5)
# 19 (push2 0 3)
# 20 (ldc 3 2)
# 21 (tcall 3)
# 22 ] :constants @[" working " "..." <function print> 0.5 <cfunction ev/sleep> " is done!"] :defs @[] :environments @[] :max-arity 2 :min-arity 2 :name "worker" :slotcount 9 :source "test/test11.janet" :sourcemap @[ (6 1) (9 3) (9 3) (9 3) (9 3) (9 3) (10 5) (10 5) (10 5) (10 5) (10 5) (10 5) (11 5) (11 5) (11 5) (11 5) (9 3) (9 3) (12 3) (12 3) (12 3) (12 3)] :vararg false}

# repl:9:> (disasm (get-in e ['test :value]))
# {:arity 0 :bytecode @[
# 0 (lds 0)
# 1 (ldc 2 0)
# 2 (call 1 2)
# 3 (ldc 3 1)
# 4 (geti 2 3 0)
# 5 (movn 3 2)
# 6 (ldc 4 2)
# 7 (eq 2 3 4)
# 8 (ret 2)
# ] :constants @[<function go> @[] "bob working 0 ..."] :defs @[] :environments @[] :max-arity 0 :min-arity 0 :name "test" :slotcount 5 :source "test/test11.janet" :sourcemap @[(26 1) (27 3) (27 3) (28 3) (28 3) (28 3) (29 3) (29 3) (29 3)] :vararg false}
