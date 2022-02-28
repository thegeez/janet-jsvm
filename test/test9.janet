(defn mystring [& args]
  (string (splice args)))

(defn test []
  (def a (string "bob" " is " "working"))
  (def b (mystring "bob" " " "is" " " "working"))
  (print "a" a "b" b)
  (= a b))

# repl:4:> (disasm (get-in e ['test :value]))
# {:arity 0 :bytecode @[
# 0  (lds 0)
# 1  (ldc 1 0)
# 2  (ldc 2 1)
# 3  (ldc 3 2)
# 4  (push3 1 2 3)
# 5  (ldc 2 3)
# 6  (call 1 2)
# 7  (movn 2 1)
# 8  (ldc 3 0)
# 9  (ldc 4 4)
# 10 (ldc 5 5)
# 11 (push3 3 4 5)
# 12 (ldc 3 4)
# 13 (ldc 4 2)
# 14 (push2 3 4)
# 15 (ldc 4 6)
# 16 (call 3 4)
# 17(movn 4 3)
# 18(ldc 5 7)
# 19(ldc 6 8)
# 20(push3 5 2 6)
# 21(push 4)
# 22(ldc 6 9)
# 23(call 5 6)
# 24(eq 6 2 4)
# 25(ret 6)
# ] :constants @[ "bob" " is " "working" <cfunction string> " " "is" <function mystring> "a" "b" <cfunction print>] :defs @[] :environments @[] :max-arity 0 :min-arity 0 :name "test" :slotcount 7 :source "test/test9.janet" :sourcemap @[ (36 1) (37 10) (37 10) (37 10) (37 10) (37 10) (37 10) (37 3) (38 10) (38 10) (38 10) (38 10) (38 10) (38 10) (38 10) (38 10) (38 10) (38 3) (39 3) (39 3) (39 3) (39 3) (39 3) (39 3) (40 3) (40 3)] :vararg false}

# repl:6:> (disasm (get-in e ['mystring :value]))
# {:arity 0 :bytecode @[
# 0 (lds 1)
# 1 (pusha 0)
# 2 (ldc 2 0)
# 3 (tcall 2)
# ] :constants @[<cfunction string>] :defs @[] :environments @[] :max-arity 2147483647 :min-arity 0 :name "mystring" :slotcount 3 :source "test/test9.janet" :sourcemap @[(33 1) (34 3) (34 3) (34 3)] :vararg true}
# repl:7:>
