const LB_REAL = 200;
const LB_NIL = 201;
const LB_FALSE = 202;
const LB_TRUE = 203;
const LB_FIBER = 204;
const LB_INTEGER = 205;
const LB_STRING = 206;
const LB_SYMBOL = 207;
const LB_KEYWORD = 208;
const LB_ARRAY = 209;
const LB_TUPLE = 210;
const LB_TABLE = 211;
const LB_TABLE_PROTO = 212;
const LB_STRUCT = 213;
// const LB_BUFFER = 214;
const LB_FUNCTION = 215;
const LB_REGISTRY = 216;
// const LB_ABSTRACT = 217;
const LB_REFERENCE = 218;
const LB_FUNCENV_REF = 219;
const LB_FUNCDEF_REF = 220;
// const LB_UNSAFE_CFUNCTION = 221;
// const LB_UNSAFE_POINTER = 222;
// const LB_STRUCT_PROTO = 223;

const JOP_RETURN = 3;
const JOP_RETURN_NIL = 4;
const JOP_ADD_IMMEDIATE = 5;
const JOP_ADD = 6;
const JOP_MOVE_NEAR = 25;
const JOP_JUMP = 26;
const JOP_JUMP_IF_NOT = 28;
const JOP_LESS_THAN = 33;
const JOP_LESS_THAN_IMMEDIATE = 34;
const JOP_EQUALS = 35;
const JOP_EQUALS_IMMEDIATE = 36;
const JOP_LOAD_NIL = 38;
const JOP_LOAD_TRUE = 39;
const JOP_LOAD_FALSE = 40;
const JOP_LOAD_INTEGER = 41;
const JOP_LOAD_CONSTANT = 42;
const JOP_LOAD_UPVALUE = 43;
const JOP_LOAD_SELF = 44;
const JOP_CLOSURE = 46;
const JOP_PUSH = 47;
const JOP_PUSH_2 = 48;
const JOP_PUSH_3 = 49;
const JOP_PUSH_ARRAY = 50;
const JOP_CALL = 51;
const JOP_TAILCALL = 52;
const JOP_RESUME = 53;
const JOP_SIGNAL = 54;
const JOP_GET = 57;
const JOP_PUT = 58;
const JOP_GET_INDEX = 59;
const JOP_LENGTH = 61;
const JOP_MAKE_ARRAY = 62;
const JOP_MAKE_TABLE = 66;
const JOP_MAKE_TUPLE = 67;

const JANET_MAX_Q_CAPACITY = 0x7FFFFFF; // max size of any queue

const JANET_RESUME_VALUE_NULL = new Object();

/* Basic types for all Janet Values */
const JANET_NUMBER = 0;
const JANET_NIL = 1;
const JANET_BOOLEAN = 2;
const JANET_FIBER = 3;
const JANET_STRING = 4;
const JANET_SYMBOL = 5;
const JANET_KEYWORD = 6;
const JANET_ARRAY = 7;
const JANET_TUPLE = 8;
const JANET_TABLE = 9;
const JANET_STRUCT = 10;
const JANET_BUFFER = 11;
const JANET_FUNCTION = 12;
const JANET_CFUNCTION = 13;
// const JANET_ABSTRACT = 14;
// const JANET_POINTER = 15;


// #define JANET_TFLAG_NIL (1 << JANET_NIL)
// #define JANET_TFLAG_BOOLEAN (1 << JANET_BOOLEAN)
// #define JANET_TFLAG_FIBER (1 << JANET_FIBER)
// #define JANET_TFLAG_NUMBER (1 << JANET_NUMBER)
// #define JANET_TFLAG_STRING (1 << JANET_STRING)
// #define JANET_TFLAG_SYMBOL (1 << JANET_SYMBOL)
// #define JANET_TFLAG_KEYWORD (1 << JANET_KEYWORD)
// #define JANET_TFLAG_ARRAY (1 << JANET_ARRAY)
// #define JANET_TFLAG_TUPLE (1 << JANET_TUPLE)
// #define JANET_TFLAG_TABLE (1 << JANET_TABLE)
// #define JANET_TFLAG_STRUCT (1 << JANET_STRUCT)
// #define JANET_TFLAG_BUFFER (1 << JANET_BUFFER)
// #define JANET_TFLAG_FUNCTION (1 << JANET_FUNCTION)
// #define JANET_TFLAG_CFUNCTION (1 << JANET_CFUNCTION)
// #define JANET_TFLAG_ABSTRACT (1 << JANET_ABSTRACT)
// #define JANET_TFLAG_POINTER (1 << JANET_POINTER)

// #define JANET_TFLAG_BYTES (JANET_TFLAG_STRING | JANET_TFLAG_SYMBOL | JANET_TFLAG_BUFFER | JANET_TFLAG_KEYWORD)
// #define JANET_TFLAG_INDEXED (JANET_TFLAG_ARRAY | JANET_TFLAG_TUPLE)
// #define JANET_TFLAG_DICTIONARY (JANET_TFLAG_TABLE | JANET_TFLAG_STRUCT)
// #define JANET_TFLAG_LENGTHABLE (JANET_TFLAG_BYTES | JANET_TFLAG_INDEXED | JANET_TFLAG_DICTIONARY)
// #define JANET_TFLAG_CALLABLE (JANET_TFLAG_FUNCTION | JANET_TFLAG_CFUNCTION | \
//         JANET_TFLAG_LENGTHABLE | JANET_TFLAG_ABSTRACT)

function janet_type(x) {
    const typeof_x = typeof x;
    if (typeof_x == 'number') {
        return JANET_NUMBER;
    } else if (x instanceof JanetArray) {
        return JANET_ARRAY;
    } else if (x instanceof JanetTuple) {
        return JANET_TUPLE;
    } else if (x instanceof JanetString) {
        return JANET_STRING;
    } else if (x instanceof JanetKeyword) {
        return JANET_KEYWORD;
    } else if (x instanceof JanetTable) {
        return JANET_TABLE;
    }
    console.log("TODO janet_type", x);
    throw new Error("TODO janet_type"+ x);
}


class JanetTable extends Map {
    jt_proto = null;

    get(k) {
        return super.get(k) || (this.jt_proto ? this.jt_proto.get(k) : null) ;
    }
    set(k, v) {
        if (v) {
            return super.set(k,v);
        } else {
            super.delete(k);
            return this;
        }
    }
};

class JanetTuple extends Array {
    jt_closed = false;
    jt_tuple_brackets = false; // bracket or not

    set(k, v) {
        if (!this.jt_closed) {
            super.set(k, v);
        } else {
            throw new Error("can't set closed tuple");
        }
    }
    push(v) {
        if (!this.jt_closed) {
            super.push(v);
        } else {
            throw new Error("can't push closed tuple");
        }
    }
}
function janet_tuple_start(len) {
    // TODO use len for init length
    return new JanetTuple();
}
function janet_tuple_end(jtuple) {
    jtuple.jt_closed = true;
    return jtuple;
}

class JanetStruct extends Map {
    js_closed = false;

    set(k, v) {
        if (!this.js_closed) {
            super.set(k, v);
        } else {
            throw new Error("can't set closed struct");
        }
    }
}
function janet_struct_start(length) {
    // TODO actually init the struct size
    return new JanetStruct();
}
function janet_struct_end(jstruct) {
    jstruct.js_closed = true;
    return jstruct;
}

class JanetArray extends Array {};

class JanetString extends String {};

const SYM_CACHE = new Map();
class JanetSymbol extends String {};
function janet_symbol(name) {
    let obj = SYM_CACHE.get(name);
    if (obj){
        return obj;
    } else {
        obj = new JanetSymbol(name);
        SYM_CACHE.set(name, obj);
        return obj;
    }
}

const KW_CACHE = new Map();
class JanetKeyword extends String {};
function janet_keyword(name) {
    let obj = KW_CACHE.get(name);
    if (obj){
        return obj;
    } else {
        obj = new JanetKeyword(name);
        KW_CACHE.set(name, obj);
        return obj;
    }
}

class JanetFuncDef {
    name;
    source;
    closure_bitset;
    defs;
    environments;
    constants;
    bytecode;
    sourcemap;

    flags;
    slotcount;
    arity; /* not including varargs */
    min_arity; /* including varargs */
    max_arity; /* including varargs */
}

class JanetFuncEnv {
    //length = null; // is length of as_values or of fiber data
    offset = null; // TODO offset is always 0 as both as_values and fiber envs are slots array?
    as_values = [];
}

class JanetFunction {
    def = null;
    envs = [];
}
function janet_function() {
    return new JanetFunction();
}

var expectedi1 = new JanetTable();
expectedi1.set(janet_keyword("a1"), 42);
expectedi1.set("lol", true);



console.log("janet map: ", expectedi1);

function readint(bytes_in, unmarshal_state) {
    // todo handle ints larger than 128
    const data = bytes_in[unmarshal_state.at];
    if (data < 128) {
        unmarshal_state.at++;
        return data;
    } else if (data < 192) {
        const b0 = bytes_in[unmarshal_state.at];
        const b1 = bytes_in[unmarshal_state.at + 1];
        unmarshal_state.at += 2
        var i = ((b0 & 0x3F) << 8) + b1;
        i |= (i >> 13) ? 0xFFFFC000 : 0;
        // 191 + 255 => -1
        return i;
    } else if (data == LB_INTEGER) {
        unmarshal_state.at++;
        const b0 = bytes_in[unmarshal_state.at++];
        const b1 = bytes_in[unmarshal_state.at++];
        const b2 = bytes_in[unmarshal_state.at++];
        const b3 = bytes_in[unmarshal_state.at++];
        const i = b3 | (b2 << 8) | (b1 << 16) | (b0 << 24);
        return i;
    } else {
        throw new Error("Expected integer, got byte "+ bytes_in[unmarshal_state.at] + " at index " + unmarshal_state.at);
        return 0;
    }
}

function readnat(bytes_in, unmarshal_state) {
    const n = readint(bytes_in, unmarshal_state);
    if (n < 0) {
        throw new Error("readnat expected 0 =< got: "+ n);
    }
    return n;
}

function unmarshal_u32s(bytes_in, unmarshal_state, bytecode_length) {
    const arr = new Uint32Array(bytecode_length);

    for (var i = 0; i < bytecode_length; i++) {
        const b0 = bytes_in[unmarshal_state.at++];
        const b1 = bytes_in[unmarshal_state.at++];
        const b2 = bytes_in[unmarshal_state.at++];
        const b3 = bytes_in[unmarshal_state.at++];

        const ui = b0 | (b1 << 8) | (b2 << 16) | (b3 << 24);

        arr[i] = ui;
    }
    return arr;
}

const JANET_FUNCDEF_FLAG_VARARG = 0x10000;
const JANET_FUNCDEF_FLAG_NEEDSENV = 0x20000;
const JANET_FUNCDEF_FLAG_HASNAME = 0x80000;
const JANET_FUNCDEF_FLAG_HASSOURCE = 0x100000;
const JANET_FUNCDEF_FLAG_HASDEFS = 0x200000;
const JANET_FUNCDEF_FLAG_HASENVS = 0x400000;
const JANET_FUNCDEF_FLAG_HASSOURCEMAP = 0x800000;
const JANET_FUNCDEF_FLAG_STRUCTARG = 0x1000000;
const JANET_FUNCDEF_FLAG_HASCLOBITSET = 0x2000000;
const JANET_FUNCDEF_FLAG_TAG = 0xFFFF;

const JANET_FIBER_FLAG_HASCHILD = (1 << 29);
const JANET_FIBER_FLAG_HASENV = (1 << 30);
const JANET_STACKFRAME_HASENV = 0x80000000;

function janet_verify() {
    // TODO
    console.log("janet_verify TODO");
    const has_errors = false;
    return has_errors;
}

function unmarshal_one_def(bytes_in, unmarshal_state) {
    const first_byte = bytes_in[unmarshal_state.at];

    if (first_byte == LB_FUNCDEF_REF) {
        unmarshal_state.at++;
        const idx = readint(bytes_in, unmarshal_state);
        if (idx < 0 || idx >= unmarshal_state.lookup_defs.length) {
            throw new Error("invalid funcdef reference "+ idx);
        }
        return unmarshal_state.lookup_defs[index];
    } else {
        const def = new JanetFuncDef();
        unmarshal_state.lookup_defs.push(def);
        def.flags = readint(bytes_in, unmarshal_state);
        def.slotcount = readnat(bytes_in, unmarshal_state);
        def.arity = readnat(bytes_in, unmarshal_state);
        def.min_arity = readnat(bytes_in, unmarshal_state);
        def.max_arity = readnat(bytes_in, unmarshal_state);

        const constants_length = readnat(bytes_in, unmarshal_state);
        const bytecode_length = readnat(bytes_in, unmarshal_state);

        let environments_length;
        if (def.flags & JANET_FUNCDEF_FLAG_HASENVS) {
            environments_length = readnat(bytes_in, unmarshal_state);
        } else {
            environments_length = 0;
        }
        let defs_length;
        if (def.flags & JANET_FUNCDEF_FLAG_HASDEFS) {
            defs_length = readnat(bytes_in, unmarshal_state);
        } else {
            defs_length = 0;
        }
        /* check name and source (optional) */
        if (def.flags & JANET_FUNCDEF_FLAG_HASNAME) {
            const name = unmarshal_one(bytes_in, unmarshal_state);
            if (!(name instanceof JanetString)) {
                throw new Error("function name is not a string");
            }
            def.name = name;
        }
        if (def.flags & JANET_FUNCDEF_FLAG_HASSOURCE) {
            const source = unmarshal_one(bytes_in, unmarshal_state);
            if (!(source instanceof JanetString)) {
                throw new Error("function source is not a string");
            }
            def.source = source;
        }

        /* unmarshal constants */
        if (constants_length) {
            def.constants = [];
            for (var i = 0; i < constants_length; i++) {
                const con = unmarshal_one(bytes_in, unmarshal_state);
                def.constants.push(con);
            }
        }

        def.bytecode = unmarshal_u32s(bytes_in, unmarshal_state, bytecode_length);

        /* unmarshal environments */
        if (def.flags & JANET_FUNCDEF_FLAG_HASENVS) {
            def.environments = [];
            for (var i = 0; i < environments_length; i++) {
                const i = readint(bytes_in, unmarshal_state);
                def.environments.push(i);
            }
        }

        /* unmarshal sub funcdefs */
        if (def.flags & JANET_FUNCDEF_FLAG_HASDEFS) {
            def.defs = [];
            for (var i = 0; i < defs_length; i++) {
                const one_def = unmarshal_one_def(bytes_in, unmarshal_state);
                def.defs.push(one_def);
            }
        }

        /* unmarshal source maps if needed */
        if (def.flags & JANET_FUNCDEF_FLAG_HASSOURCEMAP) {
            var current = 0;
            def.sourcemap = [];
            for (var i = 0; i < bytecode_length; i++) {
                current += readint(bytes_in, unmarshal_state);
                const column = readint(bytes_in, unmarshal_state);
                const sm = {line: current,
                            column: column};
                def.sourcemap.push(sm);
            }
        }

        /* unmarshal closure bitset if needed */
        if (def.flags & JANET_FUNCDEF_FLAG_HASCLOBITSET) {
            const n = (def.slotcount + 31) >> 5;
            def.closure_bitset = unmarshal_u32s(bytes_in, unmarshal_state, n);
        }

        /* validate */
        if (janet_verify(def)) {
            throw new Error("funcdef has invalid bytecode");
        }

        return def;
    }
}

function unmarshal_one_env(bytes_in, unmarshal_state) {
    const first_byte = bytes_in[unmarshal_state.at];

    if (first_byte == LB_FUNCENV_REF) {
        unmarshal_state.at++;
        const idx = readint(bytes_in, unmarshal_state);
        if (idx < 0 || idx >= unmarshal_state.lookup_envs.length) {
            throw new Error("invalid funcenv reference "+ idx);
        }
        return unmarshal_state.lookup_envs[index];
    } else {
        const env = new JanetFuncEnv();
        unmarshal_state.lookup_envs.push(env);
        const offset = readnat(bytes_in, unmarshal_state);
        const length = readnat(bytes_in, unmarshal_state);

        if (offset > 0) {
            throw new Error("Todo unmarshal funcenv offset > 0 ", offset);
        } else {
            if (length == 0) {
                janet_panic("invalid funcenv length");
            }
            env.offset = 0;
            for (var i = 0; i < length; i++) {
                const data = unmarshal_one(bytes_in, unmarshal_state);
                env.as_values.push(data);
            }
            return env;
        }
    }
}

function unmarshal_one_fiber(bytes_in, unmarshal_state) {
    const fiber = new JanetFiber();

    unmarshal_state.lookup.push(fiber);

    const fiber_flags = readnat(bytes_in, unmarshal_state);
    const frame_offset = readnat(bytes_in, unmarshal_state)
    const fiber_stackstart = readnat(bytes_in, unmarshal_state)
    const fiber_stacktop = readnat(bytes_in, unmarshal_state)
    const fiber_maxstack = readnat(bytes_in, unmarshal_state)

    console.log("fiber_flags", fiber_flags);
    console.log("stack", stack);
    console.log("fiber_stackstart", fiber_stackstart);
    console.log("fiber_stacktop", fiber_stacktop);
    console.log("fiber_maxstack", fiber_maxstack);

    var stack = frame_offset; // 'stack' is pointer in stack of fiber to walk the frames
    while (stack > 0) { // frame offset in data means precense of a stackframe with a function
        const frameflags = readint(bytes_in, unmarshal_state);
        const prevframe = readnat(bytes_in, unmarshal_state);
        const pcdiff = readnat(bytes_in, unmarshal_state);

        const func = unmarshal_one(bytes_in, unmarshal_state); // JanetFunction

        const def = func.def

        /* get env */
        let env = null;
        if (frameflags & JANET_STACKFRAME_HASENV) {
            console.log("STACKFRAME HAS ENV!!!");
            frameflags &= ~JANET_STACKFRAME_HASENV;
            env = unmarshal_one_env(bytes_in, unmarshal_state);
        }

        const expected_framesize = def.slotcount;
        const stacktop = fiber_stackstart - 4; // 4 = JANET_FRAME_SIZE
        if (expected_framesize != stacktop - frame_offset) {
            // we don't have a stack in the fiber (instead there are slots in the frames), but we do check the numbers
            janet_panic("fiber stackframe size mismatch");
        }

        if (pcdiff >= def.bytecode.length) {
            janet_panic("fiber stackframe has invalid pc");
        }

        // skipping the part in janet proper checking if the next frame aligns with this one

        janet_fiber_funcframe(fiber, func);
        frame = fiber.frame;

        console.log("prevframe: "+ prevframe);
        
        /* get stack items */
        for (var i = 0; i < def.slotcount; i++) {
            const data = unmarshal_one(bytes_in, unmarshal_state);
            frame.slots[i] = data;
        }

        frame.env = env;
        frame.pc = pcdiff;
        frame.flags = frameflags;

        stack = prevframe; // will break loop
    }
    if (stack < 0) {
        janet_panic("fiber has too many stackframes");
    }

    let fiber_env = null;
    if (fiber_flags & JANET_FIBER_FLAG_HASENV) {
        console.log("unmarshal fiber has env");
        // TODO not checked if this works
        fiber_flags &= ~JANET_FIBER_FLAAG_HASENV;
        fiber_env = unmarshal_one(bytes_in, unmarshal_state);
        if (!(env instanceof JanetTable)){
            throw new Error("env should be table");
        }
        
    }

    if (fiber_flags & JANET_FIBER_FLAG_HASCHILD) {
        console.log("unmashal fiber has child");
        // TODO not checked if this works
        fiber_flags &= ~JANET_FIBER_FLAG_HASCHILD;
        const fiberv = unmarshal_one(bytes_in, unmarshal_state);
        if (!(fiberv instanceof JanetFiber)) { throw new Error("Fiber child is not a fiber"); }
        fiber.child = fiberv;
        
    }

    const last_value = unmarshal_one(bytes_in, unmarshal_state);
    
    fiber.flags = fiber_flags;
    fiber.last_value = last_value;
    fiber.env = fiber_env;

    const state = janet_fiber_status(fiber);
    if (status < 0 || status > JANET_STATUS_ALIVE) {
        janet_panic("invalid fiber status");
    }
    console.log("unm fiber", fiber);

    
    return fiber;
}

// does not handle reference
function unmarshal_one(bytes_in, unmarshal_state){
    const lead = bytes_in[unmarshal_state.at];
    if (lead == null) { throw new Error("Unmarshal missing first byte");}
    if (lead < LB_REAL) {
        const i = readint(bytes_in, unmarshal_state);
        return i;
    }
    switch (lead) {
    case LB_REAL: {
        // prob 0.5 or 0.25
        // 0.5 = 0 0 0 .. 0 224 63
        // 0.25 = 0 0 ... 0 208 63
        unmarshal_state.at++;
        const b0 = bytes_in[unmarshal_state.at++];
        const b1 = bytes_in[unmarshal_state.at++];
        const b2 = bytes_in[unmarshal_state.at++];
        const b3 = bytes_in[unmarshal_state.at++];
        const b4 = bytes_in[unmarshal_state.at++];
        const b5 = bytes_in[unmarshal_state.at++];
        const b6 = bytes_in[unmarshal_state.at++];
        const b7 = bytes_in[unmarshal_state.at++];
        const dv = new DataView(new Uint8Array([b0,b1,b2,b3,b4,b5,b6,b7]).buffer);
        const d = dv.getFloat64(0, true); // true == littleEndian

        unmarshal_state.lookup.push(d);
        return d;
    }

    case LB_NIL: {
        unmarshal_state.at++;
        return null;
    }
    case LB_FALSE: {
        unmarshal_state.at++;
        return false;
    }
    case LB_TRUE: {
        unmarshal_state.at++;
        return true;
    }
    case LB_FIBER: {
        unmarshal_state.at++;
        const fiber = unmarshal_one_fiber(bytes_in, unmarshal_state);
        return fiber;
    }

    case LB_INTEGER: {
        unmarshal_state.at++;
        const b0 = bytes_in[unmarshal_state.at++];
        const b1 = bytes_in[unmarshal_state.at++];
        const b2 = bytes_in[unmarshal_state.at++];
        const b3 = bytes_in[unmarshal_state.at++];
        const i = b3 | (b2 << 8) | (b1 << 16) | (b0 << 24);
        return i;
    }
    case LB_STRING: {
        unmarshal_state.at++;
        const len = readnat(bytes_in, unmarshal_state);
        const s_str = String.fromCharCode.apply(String, bytes_in.slice(unmarshal_state.at, unmarshal_state.at + len));
        const s = new JanetString(s_str);
        unmarshal_state.at += len;
        unmarshal_state.lookup.push(s);
        return s;
    }
    case LB_SYMBOL: {
        unmarshal_state.at++;
        const len = readnat(bytes_in, unmarshal_state);
        const symbol_str = String.fromCharCode.apply(String, bytes_in.slice(unmarshal_state.at, unmarshal_state.at + len));
        const symbol = janet_symbol(symbol_str);
        unmarshal_state.at += len;
        unmarshal_state.lookup.push(symbol);
        return symbol;
    }
    case LB_KEYWORD: {
        unmarshal_state.at++;
        const len = readnat(bytes_in, unmarshal_state);
        const keyword_str = String.fromCharCode.apply(String, bytes_in.slice(unmarshal_state.at, unmarshal_state.at + len));
        const kw = janet_keyword(keyword_str);
        unmarshal_state.at += len;
        unmarshal_state.lookup.push(kw);
        return kw;
    }
    case LB_REGISTRY: {
        unmarshal_state.at++;
        const len = readnat(bytes_in, unmarshal_state);
        var reg;
        if (unmarshal_state.reg) {
            const regkey = String.fromCharCode.apply(String, bytes_in.slice(unmarshal_state.at, unmarshal_state.at + len));
            const reg_class = unmarshal_state.reg[regkey];
            if (!reg_class) { throw new Error("Referenced registry not found: "+ regkey);}
            if (reg_class instanceof JanetTable) { // for root-env table
                reg = reg_class;
            } else{
                // for JanetLib_* to get new JanetLib_*();
                reg = reg_class.create_new();
            }
        } else {
            /* reg null */
        }
        unmarshal_state.at += len;
        unmarshal_state.lookup.push(reg);
        return reg;
    }
    case LB_ARRAY: {
        unmarshal_state.at++;
        const len = readnat(bytes_in, unmarshal_state);
        const arr = new JanetArray();
        unmarshal_state.lookup.push(arr);
        for (var i = 0; i < len; i++) {
            const data = unmarshal_one(bytes_in, unmarshal_state);
            arr.push(data);
        }
        return arr;
    }
    case LB_TUPLE: {
        // tuple is brackets or non-brackets
        unmarshal_state.at++;
        const len = readnat(bytes_in, unmarshal_state);

        const jt = janet_tuple_start(len);
        const bracket_flag = readint(bytes_in, unmarshal_state);

        // if (bracket_flag > 0) {
        //     jt.bracket_flag = true;
        // }
        for (var i = 0; i < len; i++) {
            const value = unmarshal_one(bytes_in, unmarshal_state);
            jt.push(value);
        }
        const jt_closed = janet_tuple_end(jt)
        unmarshal_state.lookup.push(jt_closed);
        return jt_closed;
    }
    case LB_STRUCT: {
        unmarshal_state.at++;
        const len = readnat(bytes_in, unmarshal_state);
        const jstruct = janet_struct_start(len);
        for (var i = 0; i < len; i++) {
            const key = unmarshal_one(bytes_in, unmarshal_state);
            const value = unmarshal_one(bytes_in, unmarshal_state);
            jstruct.set(key,value);
        }
        const jstruct_closed = janet_struct_end(jstruct);
        unmarshal_state.lookup.push(jstruct_closed);
        return jstruct_closed;
    }
    case LB_TABLE:
    case LB_TABLE_PROTO: {
        const jt = new JanetTable();
        unmarshal_state.at++;
        const len = readnat(bytes_in, unmarshal_state);
        // TODO MARSH_EOS check is stream contains at least len more bytes!
        unmarshal_state.lookup.push(jt);
        if (lead == LB_TABLE_PROTO) {
            const data = unmarshal_one(bytes_in, unmarshal_state);
            jt.jt_proto = data;
        }
        for (var i = 0; i < len; i++) {
            const key = unmarshal_one(bytes_in, unmarshal_state);
            const value = unmarshal_one(bytes_in, unmarshal_state);
            jt.set(key, value);
        }
        return jt;
    }
    case LB_REFERENCE: {
        unmarshal_state.at++;
        const idx = readnat(bytes_in, unmarshal_state);
        if (idx >= unmarshal_state.lookup.length) {
            throw new Error("unmarshall invalid reference: "+ idx);
        }
        return unmarshal_state.lookup[idx];
    }
    case LB_FUNCTION: {
        unmarshal_state.at++;
        const len = readnat(bytes_in, unmarshal_state);
        if (len > 255) {
            throw new Error("invalid function - too many environments " + len);
        }
        const func = janet_function();
        func.def = null;
        unmarshal_state.lookup.push(func);

        const def = unmarshal_one_def(bytes_in, unmarshal_state);
        func.def = def;
        for (var i = 0; i < len; i++){
            const env = unmarshal_one_env(bytes_in, unmarshal_state);
            func.envs.push(env);
        }
        return func;
    }
    default: {
        throw new Error("Unhandled unmarshal lead byte "+ lead + " at unmarshal_state.at " + unmarshal_state.at);
    }
    }
}

function unmarshal(bytes_in) {
    const root_env = new JanetTable();
    root_env.set("hello", "world");
    const unmarshal_state = {at: 0,
                             reg: {"root-env": root_env,
                                   "fiber/new": JanetLib_fiber_new, //new JanetLib_fiber_new(),
                                   "print": JanetLib_print, //new JanetLib_print()
                                   "ev/sleep": JanetLib_ev_sleep,
                                   "ev/go": JanetLib_ev_go,
                                   "ev/chan": JanetLib_ev_chan,
                                   "ev/select": JanetLib_ev_select,
                                   "ev/give": JanetLib_ev_give,
                                   "ev/take": JanetLib_ev_take,
                                   "ev/chan-close": JanetLib_ev_chan_close,
                                   "array/push": JanetLib_array_push,
                                   "string": JanetLib_string,
                                   "keys": JanetLib_keys
                                   
                                  }, // registry, root-env used, but not set
                             lookup: [],
                             lookup_defs: [],
                             lookup_envs: []
                            };
    return unmarshal_one(bytes_in, unmarshal_state);
}

function ts_now() {
    return Date.now();
}

class JanetFiber {
    flags;
    frame;

    next_slots = [];

    last_value;
    sched_id = 0; // should increment everytime this fiber is scheduled in a task, to track whether the fiber has progressed when it is scheduled to run

    supervisor_channel;
};

class JanetTimeout {
    when;
    fiber;
    //is_error;
    sched_id;
    curr_fiber;
}

/* Fiber signals */
const JANET_SIGNAL_OK = 0;
const JANET_SIGNAL_ERROR = 1;
const JANET_SIGNAL_DEBUG = 2;
const JANET_SIGNAL_YIELD = 3;
const JANET_SIGNAL_USER0 = 4;
const JANET_SIGNAL_USER1 = 5;
const JANET_SIGNAL_USER2 = 6;
const JANET_SIGNAL_USER3 = 7;
const JANET_SIGNAL_USER4 = 8;
const JANET_SIGNAL_USER5 = 9;
const JANET_SIGNAL_USER6 = 10;
const JANET_SIGNAL_USER7 = 11;
const JANET_SIGNAL_USER8 = 12;
const JANET_SIGNAL_USER9 = 13;

const JANET_SIGNAL_EVENT = JANET_SIGNAL_USER9;
const JANET_SIGNAL_INTERRUPT = JANET_SIGNAL_USER8;

const JANET_SIGNAL_FETCH = 255;
const JANET_AWAIT_FETCH = new Object();


/* Fiber signal masks. */
const JANET_FIBER_MASK_ERROR = 2;
//const JANET_FIBER_MASK_DEBUG = 4
const JANET_FIBER_MASK_YIELD = 8;

// #define JANET_FIBER_MASK_USER0 (16 << 0)
// #define JANET_FIBER_MASK_USER1 (16 << 1)
// #define JANET_FIBER_MASK_USER2 (16 << 2)
// #define JANET_FIBER_MASK_USER3 (16 << 3)
// #define JANET_FIBER_MASK_USER4 (16 << 4)
// #define JANET_FIBER_MASK_USER5 (16 << 5)
// #define JANET_FIBER_MASK_USER6 (16 << 6)
// #define JANET_FIBER_MASK_USER7 (16 << 7)
// #define JANET_FIBER_MASK_USER8 (16 << 8)
// #define JANET_FIBER_MASK_USER9 (16 << 9)

// #define JANET_FIBER_MASK_USERN(N) (16 << (N))
// #define JANET_FIBER_MASK_USER 0x3FF0

const JANET_FIBER_STATUS_MASK = 0x3F0000;
// #define JANET_FIBER_RESUME_SIGNAL 0x400000
const JANET_FIBER_FLAG_CANCELED = 0x400000;
const JANET_FIBER_STATUS_OFFSET = 16;

// #define JANET_FIBER_BREAKPOINT       0x1000000
// #define JANET_FIBER_RESUME_NO_USEVAL 0x2000000
// #define JANET_FIBER_RESUME_NO_SKIP   0x4000000
// #define JANET_FIBER_DID_LONGJUMP     0x8000000
// #define JANET_FIBER_FLAG_MASK        0xF000000

// WARNING these are on fiber.gc->flags in janet proper, but on fiber.flags here, make sure they don't collide with any other fiber flags
//const JANET_FIBER_EV_FLAG_CANCELLED = 0x10000
const JANET_FIBER_EV_FLAG_SUSPENDED = 0x20000;

/* Fiber statuses - mostly corresponds to signals. */
const JANET_STATUS_DEAD = 0;
const JANET_STATUS_ERROR = 1;
const JANET_STATUS_DEBUG = 2;
const JANET_STATUS_PENDING = 3;
const JANET_STATUS_USER0 = 4;
const JANET_STATUS_USER1 = 5;
const JANET_STATUS_USER2 = 6;
const JANET_STATUS_USER3 = 7;
const JANET_STATUS_USER4 = 8;
const JANET_STATUS_USER5 = 9;
const JANET_STATUS_USER6 = 10;
const JANET_STATUS_USER7 = 11;
const JANET_STATUS_USER8 = 12;
const JANET_STATUS_USER9 = 13;
const JANET_STATUS_NEW = 14;
const JANET_STATUS_ALIVE = 15;

function janet_fiber_status(fiber) {
    // TODO move status into proper field
    return ((fiber.flags & JANET_FIBER_STATUS_MASK) >> JANET_FIBER_STATUS_OFFSET);
}

class JanetStackFrame {
    func;
    pc; // this is 0-based in bytecode of func, not a pointer to start/a place in of bytecode! (diff from Janet proper)
    env;
    prevframe;
    flags;

    slots = []; // different from janet proper
}

/* push a stack frame to a fiber */
function janet_fiber_funcframe(fiber, func) {
    const newframe = new JanetStackFrame();

    // no need for these checks as we size slots to fit it
    //if (next_arity < func.def.min_arity) throw new Error("no space for min_arity on stack");
    //if (next_arity > func.def.max_arity) throw new Error("next arity larger than max_arity");

    newframe.prevframe = fiber.frame;
    
    newframe.pc = 0;
    newframe.func = func;
    newframe.env = null;
    newframe.flags = 0;

    // TODO do we need to address fiber.next_slots here?
    newframe.slots = new Array(func.def.slotcount);

    fiber.frame = newframe;

    if (func.def.flags & JANET_FUNCDEF_FLAG_VARARG) {
        // collapse the varargs into next_slots[arity] = tuple of varargs
        //throw new Error("TODO implement varargs for stack frame");
        if (func.def.flags & JANET_FUNCDEF_FLAG_STRUCTARG) {
            throw new Error("TODO implement varargs for stack frame for STRUCT ARGS");
        }
        const varargs_length = (fiber.next_slots.length - func.def.arity);
        
        const varargs = fiber.next_slots.splice(func.def.arity, varargs_length);
        //

        const tuple_varargs = janet_tuple_start(varargs_length);
        tuple_varargs.splice(0,0, ...varargs);

        fiber.next_slots[func.def.arity] = janet_tuple_end(tuple_varargs);
        //console.log("FIB next_slots", fiber.next_slots, func.def.arity, varargs, tuple_varargs);

        //throw new Error("SET VARARGS");
    }

    return; // NOTE the frame is set on the fiber, it is not returned
}

// function janet_fiber(callee, argv) {
//     /* fiber alloc */
//     const fiber = new JanetFiber();

//     /* fiber reset */
//     // TODO

//     /* janet_fiber_reset */

//     /* fill frame with callee function */
//     janet_fiber_funcframe(fiber, callee);
//     const frame = fiber.frame;
//     frame.slots.splice(0, argv.length, ...argv);

//     return fiber;
// };

class JanetLibFunction {
    lib_call(argv) {}
};
class JanetLib_fiber_new extends JanetLibFunction {
    static create_new() { return new JanetLib_fiber_new() };

    lib_call(...argv) {
        const f = argv[0];
        if (!f || !(f instanceof JanetFunction)) {
            janet_panic("fiber/new needs a function as the first argument");
        }
        const opt_flags = argv[1];
        if (opt_flags && !(opt_flags instanceof JanetKeyword)) {
            janet_panic("fiber/new opt_flags needs to be a keyword");
        }
        const flags = opt_flags || janet_keyword("y");
        //const flags = janet_keyword("e"); // TEMP DEV


        console.log("MAking fiber wrapping function: ", f); 
        //const fiber = janet_fiber(f, []);

        const fiber = new JanetFiber();

        /* fiber reset */
        // TODO
        
        /* janet_fiber_reset */
        
        /* fill frame with callee function */
        janet_fiber_funcframe(fiber, f);
        // TODO f always takes 0 args?
        // const frame = fiber.frame;
        // frame.slots.splice(0, argv.length, ...argv);

        
        console.log("made fiber: ", fiber);
        console.log("__________________________________________HMM", fiber.frame.func);
        console.log("f", f);
        
        for (let c of flags) {
            console.log("fiber_flag c", c, 'e' == c);
            switch (c) {
            default: janet_panic("flag for fiber not supported: "+ c);
            case 'e': {
                fiber.flags |= JANET_FIBER_MASK_ERROR;
                continue;
            };
            case 'y': {
                fiber.flags |= JANET_FIBER_MASK_YIELD;
                continue;
            }
            }
        }
        console.log("fiber_flag fiber", fiber);
        return {retval: fiber};
    }
};

class JanetLib_array_push extends JanetLibFunction {
    static create_new() { return new JanetLib_array_push() };

    lib_call(...argv) {

        const arr = argv[0];
        if (!arr || !(arr instanceof JanetArray)) {
            janet_panic("array/push needs an array as the first argument");
        }
        const x = argv[1];

        arr.push(x);
        
        return {retval: arr};
    }
};

class JanetLib_string extends JanetLibFunction {
    static create_new() { return new JanetLib_string() };

    lib_call(...argv) {

        const s = argv.join("");
        const js = new JanetString(s);
        return {retval: js};
    }
};

// TODO should be janet function, but is a lib function while we don't have 'next' support yet
class JanetLib_keys extends JanetLibFunction {
    static create_new() { return new JanetLib_keys() };

    lib_call(...argv) {
        const jtable = argv.length > 0 ? argv[0] : null;
        if (!(jtable instanceof JanetTable)) {
            console.log("argv", argv);
            janet_panic("keys first argument needs to be a table");
        }
        const arr = new JanetArray();
        for (const key of jtable.keys()) {
            arr.push(key);
        }
        return {retval: arr};
    }
};


function janet_fiber(callee) {
    const {retval: retval} = new JanetLib_fiber_new().lib_call(callee);
    return retval;
}

class JanetLib_print extends JanetLibFunction {
    static create_new() { return new JanetLib_print(); }

    lib_call(...argv) {
        console.log("PRINT>",argv.join(""));
        console.log("PRINT RAW>",...argv);
        console.log("PRINT VM>", VM);
        return {retval: null};
    }
};

class JanetLib_ev_sleep extends JanetLibFunction {
    static create_new() { return new JanetLib_ev_sleep() };

    lib_call(...argv) {
        const sleep_seconds = argv[0];

        if (!(typeof sleep_seconds === 'number')) {
            throw new Error("ev/sleep needs seconds as argument");
        }
        const to = new JanetTimeout();
        to.when = ts_now() + (sleep_seconds * 1000);
        to.fiber = VM.root_fiber;
        //to.is_error = 0;
        to.sched_id = to.fiber.sched_id;
        to.curr_fiber = null;

        to.TEMP_DEV_sleep_seconds = sleep_seconds;
        
        // addTimeout(to)
        VM.timeouts.push(to);
        VM.timeouts.sort(function (left, right) {
            if (left.when < right.when) {
                return -1;
            } else if (left.when > right.when) {
                return 1;
            } else {
                left > right;
            }
        });

        return {signal: JANET_SIGNAL_EVENT,
                retval: null};
    }
};

class JanetLib_ev_go extends JanetLibFunction {
    static create_new() { return new JanetLib_ev_go() };

    lib_call(...argv) {
        console.log("TODO ev/go add to", VM.spawn.length);
        console.log("argv", ...argv);
        const fiber = argv[0];
        if (!(fiber instanceof JanetFiber)) {
            janet_panic("ev/go argument is not a fiber");
        }
        if (argv.length > 1) {
            throw new Error("TODO implement ev/go value & supervisor_channel arguments");
        }
        const value = null

        janet_schedule_signal(fiber, value, JANET_SIGNAL_OK);

        return {retval: fiber};
    }
};

class JanetChannel {
    limit;
    closed;
    items = [];
    read_pending = [];
    write_pending = [];

    // is_threaded // N/A
    // lock // N/A
}

class JanetChannelPending {
    fiber;
    sched_id;
    is_choice; // part of ev_select (which needs a tuple wrap for results)
}

class JanetLib_ev_chan extends JanetLibFunction {
    static create_new() { return new JanetLib_ev_chan() };

    lib_call(...argv) {
        const limit = (argv.length > 0) ? argv[0] : 0;
        if (!Number.isInteger(limit)) {
            janet_panic("ev/chan needs integer as argument");
        }
        const chan = new JanetChannel();
        chan.limit = limit;
        return {retval: chan};
    }
};


function make_close_result(channel) {
    const close_result_value_open = janet_tuple_start(2);
    close_result_value_open.push(janet_keyword("close"));
    close_result_value_open.push(channel);
    const close_result_value = janet_tuple_end(close_result_value_open);
    return close_result_value;
}

function make_write_result(channel) {
    const write_result_value_open = janet_tuple_start(2);
    write_result_value_open.push(janet_keyword("give"));
    write_result_value_open.push(channel);
    const write_result_value = janet_tuple_end(write_result_value_open);
    return write_result_value;
}

function make_read_result(channel,value) {
    const read_result_value_open = janet_tuple_start(3);
    read_result_value_open.push(janet_keyword("take"));
    read_result_value_open.push(channel);
    read_result_value_open.push(value);
    const read_result_value = janet_tuple_end(read_result_value_open);
    return read_result_value;
}

function janet_channel_pop(channel, is_choice) {
    if (channel.closed) {
        return {filled: true, item: null};
    }
    const popped_item = channel.items.shift();
    if (!popped_item) { // channel.items is empty
        /* register the current fiber as a pending reader */
        const pending = new JanetChannelPending();
        pending.fiber = VM.root_fiber;
        pending.sched_id = VM.root_fiber.sched_id;
        pending.is_choice = is_choice;
        channel.read_pending.push(pending);
        console.log("__REFCOUNT__INC__channel_pop");
        
        return {filled: false};
    } else {
        // check if a writer is waiting to write to the empty space in the channel
        const pending_writer = channel.write_pending.shift();
        if (pending_writer) {
            if (pending_writer.is_choice) {
                // wrap in tuple as return for ev/select
                const write_result_value = make_write_result(channel);
                janet_schedule_signal(pending_writer, write_result_value, JANET_SIGNAL_OK);
            } else {
                janet_schedule_signal(pending_writer, channel, JANET_SIGNAL_OK);
            }
        }
        
        return {filled: true,
                item: popped_item};
    } 

}

function janet_channel_push(channel, value, is_choice) {
    if (channel.closed) {
        janet_panic("cannot write to closed channel");
        return;
    }
    let pending_reader = null;
    while (true) {
        pending_reader = channel.read_pending.shift();
        console.log("PRINT_DEBUG pending_reader", pending_reader);
        
        if (pending_reader && (pending_reader.sched_id != pending_reader.fiber.sched_id)) {
            // purge pending readers in fibers that have moved on
            // discarding expired reader
            continue;
        } else {
            break;
        }
    }
    
    
    if (!pending_reader) {
        channel.items.push(value);
        if (channel.items.count > JANET_MAX_Q_CAPACITY) {
            janet_panic("channel overflow: ", value);
        } else if (channel.items.count > channel.limit) {
            /* no pending reader */
            const pending = new JanetChannelPending();
            pending.fiber = VM.root_fiber;
            pending.sched_id = VM.root_fiber.sched_id;
            pending.is_choice = is_choice;
            channel.write_pending.push(pending);
        }
    } else {
        // pending reader

        if (pending_reader.is_choice) {
            const read_result_value = make_read_result(channel, value);

            janet_schedule_signal(pending_reader.fiber, read_result_value, JANET_SIGNAL_OK);
        } else {
            janet_schedule_signal(pending_reader.fiber, value, JANET_SIGNAL_OK);
        }
    }
    return {filled:true, item: value};
}

class JanetLib_ev_select extends JanetLibFunction {
    static create_new() { return new JanetLib_ev_select() };

    lib_call(...argv) {
        const chan = argv.length > 1 ? argv[0] : null;
        
        /* Check channels for immediate reads and writes */
        for (let clause of argv) {

            if (clause.length && clause.length == 2) { // write tuple [chan val]
                const chan = clause[0];
                if (!(chan instanceof JanetChannel)) {
                    janet_panic("ev/select arg needs to be a channel");
                }
                if (chan.closed) {
                    return {retval: make_close_result(chan)};
                }
                if (chan.items.length < chan.limit) {
                    const value = clause[1];
                    const pushed_item = janet_channel_push(chan, value, true);
                    const write_result_value = make_write_result(chan);
                    return {retval: write_result_value};
                }
            } else {
                // read from channel
                const chan = clause;
                console.log("clause...", clause);
                if (!(chan instanceof JanetChannel)) {
                    janet_panic("ev/select arg needs to be a channel");
                }
                if (chan.closed) {
                    return {retval: make_close_result(chan)};
                }
                if (chan.items.length > 0) {
                    const {filled: filled, item: item} = janet_channel_pop(chan, true);
                    const retval = make_read_result(chan, item);
                    return {retval: retval};
                }
            }
        }


        
        /* wait for all writers and readers */
        for (let clause of argv) {
            if (clause.length && clause.length == 2) { // write tuple [chan val]
                const chan = clause[0];
                if (!(chan instanceof JanetChannel)) {
                    janet_panic("ev/select arg needs to be a channel");
                }
                if (chan.closed) { continue; }
                throw new Error("TODO select on write");
            } else {
                // read from channel
                const chan = clause;
                if (!(chan instanceof JanetChannel)) {
                    janet_panic("ev/select arg needs to be a channel");
                }
                if (chan.closed) { continue; }
                const {filled: filled, item: item} = janet_channel_pop(chan, true);
            }
        }
        
        //throw new Error("TODO ev/select");
        // janet_await()
        return {signal: JANET_SIGNAL_EVENT,
                retval: null};
    }
};

class JanetLib_ev_give extends JanetLibFunction {
    static create_new() { return new JanetLib_ev_give() };

    lib_call(...argv) {
        const chan = argv.length > 0 ? argv[0] : null;
        if (!(chan instanceof JanetChannel)) {
            janet_panic("ev/give arg needs to be a channel");
        }
        const value = argv.length > 1 ? argv[1] : null;
        if (!value) {
            janet_panic("ev/give value arg must not be null");
        }
        const pushed_item = janet_channel_push(chan, value, false);
        console.log("PRINT_DEBUG pushed_item", pushed_item);
        
        const {filled: filled, item: item} = pushed_item;
        if (!filled) {
            //janet_await();
            return {signal: JANET_SIGNAL_EVENT,
                    retval: null};
        } else {
            return {retval: chan};
        }
    }
};

class JanetLib_ev_take extends JanetLibFunction {
    static create_new() { return new JanetLib_ev_take() };

    lib_call(...argv) {
        const chan = argv.length > 0 ? argv[0] : null;
        if (!(chan instanceof JanetChannel)) {
            janet_panic("ev/give arg needs to be a channel");
        }

        const {filled: filled, item: item} = janet_channel_pop(chan, false);
        if (!filled) {
            //janet_await();
            return {signal: JANET_SIGNAL_EVENT,
                    retval: null};
        } else {
            return {retval: item};
        }
    }
};

class JanetLib_ev_chan_close extends JanetLibFunction {
    static create_new() { return new JanetLib_ev_chan_close() };

    lib_call(...argv) {
        const chan = argv.length > 0 ? argv[0] : null;
        if (!(chan instanceof JanetChannel)) {
            janet_panic("ev/chan-close arg needs to be a channel");
        }
        if (!(chan.closed == true)) {
            chan.closed = true;

            for (let pending_writer of chan.write_pending) {
                if (!pending_writer.is_choice) {
                    const close_result_value = make_close_result(channel);
                    janet_schedule_signal(pending_writer, close_result_value, JANET_SIGNAL_OK);
                } else {
                    janet_schedule_signal(pending_writer, JANET_RESUME_VALUE_NULL, JANET_SIGNAL_OK);
                }

            }
            for (let pending_reader of chan.read_pending) {
                if (!pending_reader.is_choice) {
                    const close_result_value = make_close_result(channel);
                    janet_schedule_signal(pending_reader, close_result_value, JANET_SIGNAL_OK);
                } else {
                    janet_schedule_signal(pending_writer, JANET_RESUME_VALUE_NULL, JANET_SIGNAL_OK);
                }

            }
            
        }
        return {retval: chan};
    }
};

class JanetLib_js_fetch extends JanetLibFunction {
    static create_new() { return new JanetLib_js_fetch() };

    lib_call(...argv) {
        if (argv.length < 1) {
            janet_panic("js.fetch needs url as first argument");
        }
        const url = argv[0];
        const fiber = VM.root_fiber;
        fetch(url)
            .then(function (response) {
                return response.text();
            })
            .then(function (response_text) {

                console.log("FETCH THEN", response_text);
                const jt = new JanetTable();
                jt.set(janet_keyword("result"), janet_keyword("response"));
                jt.set(janet_keyword("body"), new JanetString(response_text));
                janet_schedule_signal(fiber, jt, JANET_SIGNAL_OK);
                ensure_janet_loop();
            })
            .catch(function (reponse) {
                console.log("FETCH CATCH", response);
                const jt = new JanetTable();
                jt.set(janet_keyword("result"), janet_keyword("error"));
                janet_schedule_signal(fiber, jt, JANET_SIGNAL_OK);
                ensure_janet_loop();
            })
        return {signal: JANET_SIGNAL_FETCH,
                retval: null};
    }
};


function janet_truthy(val) {
    return !((val == null) || (val == false) || (val == undefined));
}

function janet_get(ds, key) {
    const jtype = janet_type(ds);
    switch (jtype) {
    case JANET_TABLE: {
        return (ds.get(key) || null);
    }
    default: {
        janet_panic("get not implemented for "+ ds);
    }
    }
}

function janet_getindex(ds, index) {

    if (index < 0) {
        janet_panic("expected non-negative index");
    }
    const jtype = janet_type(ds);

    switch (jtype) {
    case JANET_ARRAY: {
        if (index >= ds.length) {
            return null;
        } else {
            return ds[index];
        }
    }
    case JANET_TUPLE: {
        return ds[index];
    }
    default: {
        console.log("ds", ds, "index", index);
        throw new Error("todo implement janet_getindex");
    }
    }
}

function janet_equals(left, right){

    if (typeof left == 'number') {
        if (typeof right == 'number') {
            if (left != right) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    } else if (left instanceof JanetString) {
        if (right instanceof JanetString) {
            console.log("STRE CHECK", left, right, (left.valueOf() == right.valueOf()));
            return (left.valueOf() == right.valueOf());
        } else {
            return false;
        }
    } else if (left instanceof JanetKeyword) {
        if (right instanceof JanetKeyword) {
            return left == right;
        } else {
            return false;
        }
    } else {
        throw new Error("TODO janet_equals for " + left + " = " + right );
    }
    
}

class VMState {
    //pending = [];
    //signal;
    //retval;

    spawn = []; // queue of tasks to schedule
    root_fiber;
    timeouts = []; // keep sorted by soonest
    extra_listeners = 0; // pending read/writes on channels to track keeping the ev loop alive
}

function janet_ev_inc_refcount() {
    VM.extra_listeners++;
    console.log("___REFCOUNT INC__", VM.extra_listeners);
}

function janet_ev_dec_refcount() {
    VM.extra_listeners--;
    console.log("___REFCOUNT DEC__", VM.extra_listeners);
}

function vm_init() {
    return new VMState();
}

function vm_reset() {
    VM = vm_init();
}

/* virtual registers from instructions */
function Areg(bytecode) {
    return ((bytecode >> 8) & 0xFF);
}
function Breg(bytecode) {
    return ((bytecode >> 16) & 0xFF);
}
function Creg(bytecode) {
    return (bytecode >> 24);
}
function CSreg(bytecode) { 
    return ((bytecode >> 24) >> 0); // TODO check if this works (>> 0 from uint to int signed)
}
function Dreg(bytecode) {
    return (bytecode >> 8);
}
function DSreg(bytecode) {
    return ((bytecode >> 8) >> 0); // TODO check if this works (>> 0 from uint to int signed)
}
function Ereg(bytecode) {
    return (bytecode >> 16);
}
function ESreg(bytecode) {
    return ((bytecode >> 16) >> 0); // TODO check if this works (>> 0 from uint to int signed)
}

function janet_panic(e) {
    // TODO should be signal
    throw new Error(e);
}

var saw_run_vm = 0;

function run_vm(fiber, opt_value, opt_signal) {

    var resume_value = opt_value || null;
    var resume_signal = opt_signal || JANET_SIGNAL_OK;

    var stackframe = fiber.frame;
    var pc = stackframe.pc;
    var slots = stackframe.slots;

    console.log("VM slots at start: ", slots);
    var func = stackframe.func;
    const first_opcode = func.def.bytecode[pc] & 0xFF;

    console.log("so", stackframe, pc, func, first_opcode);

    if (++saw_run_vm == 2) {
       // throw new Error("TEMP_2222");
    }
    
    var done = false;
    var STOP = 0;

    var opcode = first_opcode;
    var bytecode;
    while (!done) {
        if (STOP++ > 10000) throw new Error("STOP");

        // if (saw_run_vm == 2 && pc == 12) {
        //     console.log("VM", VM);
        //    throw new Error("TEMP_pc cutoff")};

        // if (pc == 26) {
        //     console.log("__________________________GO END");
        //     console.log("VM",VM);
        // }
        
        bytecode = func.def.bytecode[pc];

        opcode = func.def.bytecode[pc] & 0xFF;

        console.log("loop1 stackframe", stackframe);
        console.log("loop1 pc", pc);
        console.log("loop1 func", func);
        console.log("loop1 fiber", fiber);
        console.log("loop1 bytecode & opcode", bytecode, opcode);
        
        console.log("slots data", [...slots.slice(0,10)]);
        console.log("next_slots", [...fiber.next_slots]);
        
        switch (opcode) {

        case JOP_RETURN: {
            const D = Dreg(bytecode);
            const retval = slots[D];
            // TODO if stackframe.prevframe == null -> we are at root frame
            if (stackframe.prevframe == null) {
                const signal = JANET_SIGNAL_OK;
                //throw new Error("We will return: "+ retval + " D" +  D);
                console.log("fiber at return: ", fiber);
                console.log("VM Return:", signal, retval);
                return {signal: signal, retval: retval};
            } else {

                console.log("RETURN: ", retval, " fiber ", fiber);
                // janet fiber popframe
                fiber.frame = fiber.frame.prevframe;
                //TODO unset slots in discarded frame
                stackframe = fiber.frame;
                pc = stackframe.pc;

                slots = stackframe.slots;
                func = stackframe.func;

                bytecode = func.def.bytecode[pc]; // Todo the bytecode should always be a CALL?
                opcode = bytecode & 0xFF;
                if (!(opcode == JOP_CALL)){
                    throw new Error("assert fail op for retval slot is not JOP_CALL: " + opcode);
                }
                const A = Areg(bytecode);
                slots[A] = retval;

                pc++; // continue after call instruction to which we returned

                continue;
            }
        }

        case JOP_RETURN_NIL: {
            const retval = null;
            // TODO if stackframe.prevframe == null -> we are at root frame
            if (stackframe.prevframe == null) {
                const signal = JANET_SIGNAL_OK;
                //throw new Error("We will return: "+ retval + " D" +  D);
                return {signal: signal, retval: retval};
            } else {

                // janet fiber popframe
                fiber.frame = fiber.frame.prevframe;
                //TODO unset slots in discarded frame
                stackframe = fiber.frame;
                pc = stackframe.pc;

                slots = stackframe.slots;
                func = stackframe.func;

                bytecode = func.def.bytecode[pc]; // Todo the bytecode should always be a CALL?
                opcode = bytecode & 0xFF;
                if (!(opcode == JOP_CALL)){
                    throw new Error("assert fail op for retval slot is not JOP_CALL: " + opcode);
                }
                const A = Areg(bytecode);
                slots[A] = retval;

                pc++; // continue after call instruction to which we returned

                continue;
            }
        }

        case JOP_ADD_IMMEDIATE: {
            const A = Areg(bytecode);
            const B = Breg(bytecode);
            const CS = CSreg(bytecode);
            const op1 = slots[B];
            slots[A] = op1 + CS;
            pc++;
            continue;
        }

        case JOP_ADD: {
            const A = Areg(bytecode);
            const B = Breg(bytecode);
            const C = Creg(bytecode);
            const op1 = slots[B];
            const op2 = slots[C];
            slots[A] = op1 + op2;
            pc++;
            continue;
        }

        case JOP_MOVE_NEAR: {
            const A = Areg(bytecode);
            const E = Ereg(bytecode);
            slots[A] = slots[E];
            
            pc++;
            continue;
        }

        case JOP_JUMP: {
            const DS = DSreg(bytecode);
            pc += DS;
            continue;
        }
            
        case JOP_JUMP_IF_NOT: {
            const A = Areg(bytecode);
            const offset = ESreg(bytecode);
            if (janet_truthy(slots[A])) {
                pc++;
            } else {
                pc += offset;
            }
            continue;
        }

        case JOP_LESS_THAN: {
            const A = Areg(bytecode);
            const B = Breg(bytecode);
            const C = Creg(bytecode);
            const op1 = slots[B];
            const op2 = slots[C];
            slots[A] = op1 < op2;

            pc++;
            continue;
        }
            
        case JOP_LESS_THAN_IMMEDIATE: {
            const A = Areg(bytecode);
            const B = Breg(bytecode);
            const CS = Creg(bytecode);
            const op1 = slots[B];
            slots[A] = op1 < CS;

            pc++;
            continue;
        }

        case JOP_EQUALS: {
            const A = Areg(bytecode);
            const B = Breg(bytecode);
            const C = Creg(bytecode);
            slots[A] = janet_equals(slots[B],slots[C]);
            pc++;
            continue;
        }

        case JOP_EQUALS_IMMEDIATE: {
            const A = Areg(bytecode);
            const B = Breg(bytecode);
            const CS = CSreg(bytecode);
            slots[A] = (slots[B] == CS);
            pc++;
            continue;
        }
            
        case JOP_LOAD_NIL: {
            const D = Dreg(bytecode);
            slots[D] = null;
            pc++;
            continue;
        }

        case JOP_LOAD_TRUE: {
            const D = Dreg(bytecode);
            slots[D] = true;
            pc++;
            continue;
        }

        case JOP_LOAD_FALSE: {
            const D = Dreg(bytecode);
            slots[D] = false;
            pc++;
            continue;
        }

        case JOP_LOAD_INTEGER: {
            const A = Areg(bytecode);
            const ES = ESreg(bytecode);
            slots[A] = ES;
            pc++;
            continue;
        }

        case JOP_LOAD_CONSTANT: {
            const cindex = Ereg(bytecode);
            if (!(cindex <= func.def.constants.length)) {
                janet_panic("invalid constant");
            }
            const A = Areg(bytecode);
            slots[A] = func.def.constants[cindex];

            pc++;
            continue;
        }

        case JOP_LOAD_UPVALUE: {
            const eindex = Breg(bytecode);
            const vindex = Creg(bytecode);
            if (!(eindex < func.def.environments.length)) { throw new Error("invalid upvalue environment");}
            const env = func.envs[eindex];
            if (env.offset > 0) {
                throw new Error("JOP_LOAD_UPVALUE on stack");
                //stack[A] = env->as.fiber->data[env->offset + vindex];
            } else {
                const A = Areg(bytecode);
                slots[A] = env.as_values[vindex];
            }
            pc++;
            continue;
        }

        case JOP_LOAD_SELF: {
            const D = Dreg(bytecode);
            slots[D] = func;
            pc++;
            continue;
        }

        case JOP_CLOSURE: {
            const defindex = Ereg(bytecode);
            if (!(defindex < func.def.defs.length)) { throw new Error ("invalid funcdef"); }
            const fd = func.def.defs[defindex];
            const fn = new JanetFunction();
            fn.def = fd;

            const elen = fd.environments ? fd.environments.length : 0;
            for (var i = 0; i < elen; ++i) {
                const inherit = fd.environments[i];
                if (inherit == -1) {
                    if (!stackframe.env) {
                        /* set the current stack frame as env */
                        const env = new JanetFuncEnv();
                        env.offset = 0;
                        env.as_values = stackframe.slots; // ARRAY by reference for read&write
                        stackframe.env = env;
                    }
                    fn.envs[i] = stackframe.env
                } else {
                    fn.envs[i] = func.envs[inherit];
                }
            }
            const A = Areg(bytecode);
            slots[A] = fn;
            pc++;
            continue;
        }

        case JOP_PUSH: {
            const D = Dreg(bytecode);
            const slot_idx = fiber.next_slots.length;
            fiber.next_slots[slot_idx] = slots[D];

            pc++;
            continue;
        }

        case JOP_PUSH_2: {
            const A = Areg(bytecode);
            const E = Ereg(bytecode);
            const slot_idx = fiber.next_slots.length;
            fiber.next_slots[slot_idx + 0] = slots[A];
            fiber.next_slots[slot_idx + 1] = slots[E];
            pc++;
            continue;
        }

        case JOP_PUSH_3: {
            const A = Areg(bytecode);
            const B = Breg(bytecode);
            const C = Creg(bytecode);

            const slot_idx = fiber.next_slots.length;
            fiber.next_slots[slot_idx + 0] = slots[A];
            fiber.next_slots[slot_idx + 1] = slots[B];
            fiber.next_slots[slot_idx + 2] = slots[C];
            
            pc++;
            continue;
        }

        case JOP_PUSH_ARRAY: {
            const D = Dreg(bytecode);

            fiber.next_slots.splice(fiber.next_slots.length, 0, ...slots[D]);

            pc++;
            continue;
        }
            
        case JOP_CALL: {
            const E = Ereg(bytecode);

            // dest is A, used in return
            // TODO callee is function or keyword (or non fn????)
            const callee = slots[E];
            if (callee instanceof JanetFunction) {

                stackframe.pc = pc; // slots has been by reference so is in sync, need to do pc manually
                janet_fiber_funcframe(fiber, callee);

                //TODO unset slots in discarded frame
                stackframe = fiber.frame;
                stackframe.slots = fiber.next_slots;
                fiber.next_slots = [];

                pc = stackframe.pc;
                slots = stackframe.slots;
                func = stackframe.func;

                continue;
            } else if (callee instanceof JanetLibFunction) {
                // TODO add in TAILCALL


                if (resume_value && resume_signal != null) {
                    resume_value = (resume_value == JANET_RESUME_VALUE_NULL) ? null : resume_value;
                    const A = Areg(bytecode);
                    slots[A] = resume_value;
                    resume_value = null;
                    resume_signal = null;

                    pc++;
                    continue;
                    


                } else {
                    const {signal: signal, retval: retval} = callee.lib_call(...(fiber.next_slots));

                    fiber.next_slots = [];

                    if (signal == null || signal == JANET_SIGNAL_OK) {

                        const A = Areg(bytecode);

                        slots[A] = retval;

                        pc++;
                        continue;
                    } else {
                        //pc++; // DO NOT inc the pc, so the resume returns to this instruction
                        stackframe.pc = pc; // slots has been by reference so is in sync, need to do pc manually

                        return {signal: signal, retval: retval};
                    }
                }
            } else if (callee instanceof JanetKeyword && callee.valueOf().startsWith("js.fetch")) {
                 if (resume_value && resume_signal != null) {
                    resume_value = (resume_value == JANET_RESUME_VALUE_NULL) ? null : resume_value;
                    const A = Areg(bytecode);
                    slots[A] = resume_value;
                    resume_value = null;
                    resume_signal = null;

                    pc++;
                    continue;
                 } else {
                     const js_fetch_fn = JanetLib_js_fetch.create_new();
                     const {signal: signal, retval: retval} = js_fetch_fn.lib_call(...(fiber.next_slots));

                     if (!(signal == JANET_SIGNAL_FETCH)) {
                         throw new Error("js.fetch wrong signal");
                     }
                     
                     fiber.next_slots = [];
                     
                     //pc++; // DO NOT inc the pc, so the resume returns to this instruction
                     stackframe.pc = pc; // slots has been by reference so is in sync, need to do pc manually

                     return {signal: signal, retval: retval};
                 }
                
            } else if (callee instanceof JanetKeyword && callee.valueOf().startsWith("js/")) {
                const fnparams = fiber.next_slots;
                const fn_name = callee.valueOf().substring(3);
                const fn = window[fn_name];
                var retval = null;
                if (typeof fn === "function") {
                    retval = fn.apply(null, fnparams);
                } else {
                    throw new Error("Unknown js interop"+callee.valueOf());
                }
                if (retval) {
                    retval = new JanetString(retval);
                }
                fiber.next_slots = [];

                const A = Areg(bytecode);
                slots[A] = retval;

                pc++;
                continue;
                
            } else {

                throw new Error("TODO implement call calling non-janet function");

            }

        }


        case JOP_TAILCALL: {
            const D = Dreg(bytecode);

            // TODO callee is function or keyword (or non fn????)
            const callee = slots[D];
            if (callee instanceof JanetFunction) {
                janet_fiber_funcframe(fiber, callee);
                
                // remove prev frame
                fiber.frame.prevframe = fiber.frame.prevframe.prevframe;
                //TODO unset slots in discarded frame
                stackframe = fiber.frame;
                stackframe.slots = fiber.next_slots;
                fiber.next_slots = [];
                
                pc = stackframe.pc;

                slots = stackframe.slots;
                func = stackframe.func;

                continue;
            } else if (callee instanceof JanetLibFunction) {
                
                if (resume_value && resume_signal != null) {
                    resume_value = (resume_value == JANET_RESUME_VALUE_NULL) ? null : resume_value;
                    // TODO check this resume branch for correctness
                    
                    const A = Areg(bytecode);

                    slots[A] = resume_value;
                    resume_value = null;
                    resume_signal = null;

                    if (fiber.frame) {
                        stackframe = fiber.frame;
                        fiber.next_slots = [];

                        pc = stackframe.pc;
                        slots = stackframe.slots;
                        func = stackframe.func;

                        continue;
                    } else {
                        fiber.next_slots = [];
                        // tailcall on the root frame means we are the return
                        return {signal: JANET_SIGNAL_OK,
                                retval: retval};
                    }

                } else {
                    // remove prev frame
                    fiber.frame = fiber.frame.prevframe;
                    
                    const {signal: signal,
                           retval: retval} = callee.lib_call(...(fiber.next_slots));


                    if (signal == null || signal == JANET_SIGNAL_OK) {
                        if (fiber.frame) {
                            stackframe = fiber.frame;
                            fiber.next_slots = [];
                            
                            pc = stackframe.pc;
                            slots = stackframe.slots;
                            func = stackframe.func;

                            // get retreg from caller
                            const retreg_bytecode = func.def.bytecode[pc];
                            const retreg = Areg(retreg_bytecode);
                            slots[retreg] = retval;

                            pc++;
                            continue;
                        } else {
                            fiber.next_slots = [];
                            // tailcall on the root frame means we are the return
                            return {signal: JANET_SIGNAL_OK,
                                    retval: retval};
                        }
                    } else {
                        // TODO double check if this is correct
                        console.log("TAIL CALL SIGNAL: ", fiber, signal, retval);
                        return {signal: signal, retval: retval};
                    }
                }
                // TODO align with call
            // } else if (callee instanceof JanetKeyword) {
            //     fiber.frame = fiber.frame.prevframe;

            //     const {signal: signal,
            //            retval: retval} = {retval: "TODO"};

            //     if (fiber.frame) {
            //         stackframe = fiber.frame;
            //         fiber.next_slots = [];
                    
            //         pc = stackframe.pc;
            //         slots = stackframe.slots;
            //         func = stackframe.func;
                    
            //         // get retreg from caller
            //         const retreg_bytecode = func.def.bytecode[pc];
            //         const retreg = Areg(retreg_bytecode);
            //         slots[retreg] = retval;
                    
            //         pc++;
            //         continue;
            //     } else {
            //         fiber.next_slots = [];
            //         // tailcall on the root frame means we are the return
            //         return {signal: JANET_SIGNAL_OK,
            //                 retval: retval};
            //     }
                
                
            } else {
                throw new Error("TODO implement tailcall calling non-janet function (keyword fn or cfunction)");
            }
            
            janet_fiber_funcframe(fiber, callee);

            // remove prev frame
            fiber.frame.prevframe = fiber.frame.prevframe.prevframe;
            //TODO unset slots in discarded frame
            stackframe = fiber.frame;
            stackframe.slots = fiber.next_slots;
            fiber.next_slots = [];

            pc = stackframe.pc;
            slots = stackframe.slots;
            func = stackframe.func;

            continue;
        }

        case JOP_RESUME: {
            const B = Breg(bytecode);
            const resume_fiber = slots[B];

            const C = Creg(bytecode);
            const resume_fiber_arg = slots[C];
            if (resume_fiber_arg) { // resume arg is not null
                const resume_fiber_frame_pc = resume_fiber.frame.pc - 1;

                const signal_bytecode = resume_fiber.frame.func.def.bytecode[resume_fiber_frame_pc];
                const signal_opcode = signal_bytecode & 0xFF;
                if (!(signal_opcode == JOP_SIGNAL)) {
                    throw new Error("Resume with non-nil to non-signal bytecode");
                }
                const signal_dest_index = Areg(signal_bytecode);

                resume_fiber.frame.slots[signal_dest_index] = resume_fiber_arg;
            }
            const ret = run_vm(resume_fiber);
            const {signal, retval} = ret;
            //console.log("ret: ", retval, "signal", signal);
            // TODO return if not OK or untrapped signal
            //console.log("resume_fiber", resume_fiber);
            //console.log("child.flags",resume_fiber.flags);
            if (signal != JANET_SIGNAL_OK && !(resume_fiber.flags & (1 << signal))) {
                return ret;
            }

            const A = Areg(bytecode);
            slots[A] = retval;
            pc++;
            continue;
        }

        case JOP_SIGNAL: {
            const C = Creg(bytecode);
            var signal = C;
            if (signal > JANET_SIGNAL_USER9) {
                signal = JANET_SIGNAL_USER9;
            } else if (signal < 0) {
                signal = 0;
            }
            const B = Breg(bytecode);
            const retval = slots[B];
            pc++;
            stackframe.pc = pc; // slots has been by reference so is in sync, need to do pc manually

            return {signal: signal, retval: retval};
        }
        case JOP_GET: {
            const A = Areg(bytecode);
            const B = Breg(bytecode);
            const C = Creg(bytecode);

            slots[A] = janet_get(slots[B], slots[C]);

            pc++;
            continue;
        }
            
        case JOP_PUT: {
            const A = Areg(bytecode);
            const B = Breg(bytecode);
            const C = Creg(bytecode);

            slots[A] = slots[A].set(slots[B], slots[C]);

            pc++;
            continue;
        }

            
        case JOP_GET_INDEX: {
            const A = Areg(bytecode);
            const B = Breg(bytecode);
            const C = Creg(bytecode);

            slots[A] = janet_getindex(slots[B], C);
            
            pc++;
            continue;
        }

        case JOP_LENGTH: {
            const A = Areg(bytecode);
            const E = Ereg(bytecode);

            const jobj = slots[E];
            if (jobj instanceof JanetTable) {
                slots[A] = jobj.size;
                pc++;
                continue;
            } else if (jobj instanceof JanetArray) {
                slots[A] = jobj.length;
                pc++;
                continue;
            } else {
                throw new Error("length only implemented for table and array")
            }
        }
        case JOP_MAKE_ARRAY: {
            const D = Dreg(bytecode);
            const arr = new JanetArray(); // of length fiber.next_slots.length
            arr.splice(0,0,...fiber.next_slots);
            fiber.next_slots = [];
            slots[D] = arr;

            pc++;
            continue;
        }
        case JOP_MAKE_TABLE: {
            const D = Dreg(bytecode);
            const jtable = new JanetTable(); // of length fiber.next_slots.length
            if ((fiber.next_slots.length % 2) != 0) {
                janet_panic("expected even number of arguments to table constructor, got "+ fiber.next_slots.length);
            }
            for (let i = 0; i < fiber.next_slots.length; i += 2) {
                jtable.set(fiber.next_slots[i], fiber.next_slots[i + 1]);
            }
            fiber.next_slots = [];
            slots[D] = jtable;

            pc++;
            continue;
        }
        case JOP_MAKE_TUPLE: {
            const D = Dreg(bytecode);
            const jt = janet_tuple_start(fiber.next_slots.length);
            jt.splice(0,0, ...fiber.next_slots);
            fiber.next_slots = [];
            slots[D] = janet_tuple_end(jt);

            pc++;
            continue;
        }
            
            
        default: { throw new Error("unimplemented opcode "+ opcode + " from bytecode "+ bytecode + " hmm " + (bytecode & 0xFF)); }
        }
    }

}

function janet_continue_vm(fiber, opt_value, opt_signal) {
    // TODO check fiber status for resume
    VM.root_fiber = fiber; // TODO check if this is correct
    return run_vm(fiber, opt_value, opt_signal);
}

// VM event loop

class JanetTask {
    constructor(fiber, value, signal, expected_sched_id) {
        this.fiber = fiber;
        this.value = value;
        this.signal = signal;
        this.expected_sched_id = expected_sched_id; // the sched_id the fiber had when this task was created, used to check if has progressed since then, thus making this task obsolete
        this.loop_awaited = false; // this task is used for awaiting the recurring of the janet_loop make sure to always run it (its when might be just after ts_now())
    }
};


function janet_schedule_signal(fiber, value, signal) {
    if (fiber.flags & JANET_FIBER_FLAG_CANCELED) {
        console.log("Not scheduling cancelled fiber");
    }
    fiber.sched_id++
    const task = new JanetTask(fiber, value, signal, fiber.sched_id);
    // TODO check this later
    // if (signal == JANET_SIGNAL_ERROR) { fiber.flags |= JANET_FIBER_FLAG_CANCELED; }
    VM.spawn.push(task);
}

function janet_loop_done() {
    return VM.spawn.length == 0 && VM.timeouts.length == 0 && VM.extra_listeners == 0;
}

function janet_loop1() {

    console.log("__________JANET_LOOP1")
    console.log("VM", VM);
    
    // TODO timeouts
    const now_ms = ts_now();
    while (VM.timeouts.length > 0 && (VM.timeouts[0].when < now_ms || VM.timeouts[0].loop_awaited)) {

        const to = VM.timeouts.shift();

        if (to.curr_fiber != null) {
            // TODO handle deadlines (with-deadline etc);
            throw new Error("TODO implement fiber deadlines");
        } else {
            if (to.fiber.sched_id == to.sched_id) { // check if fiber is still waiting here
                // TODO handle to.is_error with janet_cancel
                console.log("TO SCHED: ", to, now_ms, now_ms);
                janet_schedule_signal(to.fiber, JANET_RESUME_VALUE_NULL, JANET_SIGNAL_OK);
            }
        }
    }

    let fetch_occured = false;
    
    /* Run scheduled fiber */
    while (VM.spawn.length > 0){ // loop to remove expired task
        const task = VM.spawn.shift();
        if (task.fiber.flags & JANET_FIBER_EV_FLAG_SUSPENDED) {
            janet_ev_dec_refcount();
            task.fiber.flags &= ~JANET_FIBER_EV_FLAG_SUSPENDED;
        }

        if (task.expected_sched_id != task.fiber.sched_id) {
            // task was stale/expired, try to find another one
            continue;
        }
        console.log("DOING task: ", task);
        console.log("VM", VM);


        //const res = janet_continue_signal(task.fiber, task.value, task.signal);
        const res = janet_continue_vm(task.fiber, task.value, task.signal);
        const {signal: signal, retval: retval} = res;
        task.fiber.last_value = retval;
        
        console.log("janet continue vm res: ", res);
        
        const is_suspended = (signal == JANET_SIGNAL_EVENT || signal == JANET_SIGNAL_YIELD || signal == JANET_SIGNAL_INTERRUPT || signal == JANET_SIGNAL_FETCH);

        if (is_suspended) {
            task.fiber.flags |= JANET_FIBER_EV_FLAG_SUSPENDED;
            janet_ev_inc_refcount();
        }

        if (signal == JANET_SIGNAL_FETCH) {
            fetch_occured = true;
        }

        const superviser_channel = task.fiber.superviser_channel;
        if (superviser_channel == null) {
            if (!is_suspended) {
                // some error happened in fiber, and we have no supervisor to send it to, dump as stacktrace:
                if (signal == JANET_SIGNAL_OK) {
                    // printstack trace of a successfully completed fiber prints nothing
                } else {
                    console.log("TODO STACKTRACE, non-suspension signal from fiber", task.fiber, res);
                }
            }
        } else if (signal == JANET_SIGNAL_OK || (task.fiber.flags & (1 << signal))) {
            // TODO push to supervisor channel
            throw new Error("TODO throws JANET_SIGNAL_OK to supervisor channel");
        } else if (!is_suspended) {
            if (signal == JANET_SIGNAL_OK) {
                // printstack trace of a successfully completed fiber prints nothing
            } else {
                console.log("TODO STACKTRACE, non-suspension signal from fiber", task.fiber, res)
            }
        }

        if (signal == JANET_SIGNAL_INTERRUPT) {
            /* on interrupts, return the interrupted fiber immediately */
            return task.fiber;
        }
    }

    /* poll for events/handle extra listeners */
    // TODO (might need to be moved to while loop to have access to setTimeout)

    console.log("janet_loop1() return null no interruption");
    /* Poll for events */
    // if (janet_vm.listener_count || janet_vm.tq_count || janet_vm.extra_listeners) {
    //     JanetTimeout to;
    //     memset(&to, 0, sizeof(to));
    //     int has_timeout;
    //     /* Drop timeouts that are no longer needed */
    //     while ((has_timeout = peek_timeout(&to)) && (to.curr_fiber == NULL) && to.fiber->sched_id != to.sched_id) {
    //         pop_timeout(0);
    //     }
    //     /* Run polling implementation only if pending timeouts or pending events */
    //     if (janet_vm.tq_count || janet_vm.listener_count || janet_vm.extra_listeners) {
    //         janet_loop1_impl(has_timeout, to.when);
    //     }
    // }
    // first timeout (as they are ordered)
    let await_msecs = null;
    let timeout_idx = 0;
    while (timeout_idx < VM.timeouts.length) {
        const to = VM.timeouts[timeout_idx];

        if (to == null) { break; } // should never happen
        if (to.fiber.sched_id != to.sched_id) {
            timeout_idx++;
            continue;
        }
        await_msecs = to.when - ts_now();
        to.loop_awaited = true;
        break;
    }
    if (await_msecs) {
        return await_msecs;
    } else if (fetch_occured) {
        return JANET_AWAIT_FETCH;
    } else {
        return null; // no fiber was interrupted & no timers to wait on
    }
}

let loop_timeout = null;
let loop_done_callback_resolve = null;
let loop_done_callback_reject = null;

function janet_loop() {
    try {
        if (loop_timeout) {
            window.clearTimeout(loop_timeout);
        }
        if (!janet_loop_done()) {
            const interrupted_fiber_or_await_msecs = janet_loop1();
            console.log("CHECK interrupted", interrupted_fiber_or_await_msecs);
            if (interrupted_fiber_or_await_msecs instanceof JanetFiber) {
                const interrupted_fiber = interrupted_fiber_or_await_msecs
                janet_schedule_signal(interrupted_fiber, null, JANET_SIGNAL_OK);
            } else if (interrupted_fiber_or_await_msecs == JANET_AWAIT_FETCH) {
                // fetch will restart the loop
                console.log("____FETCH LOOP___ await");
                
                
            } else if (!(interrupted_fiber_or_await_msecs == null)) {
                const await_msecs = interrupted_fiber_or_await_msecs;
                loop_timeout = window.setTimeout(janet_loop, await_msecs); // WIP
            } else {
                loop_timeout = window.setTimeout(janet_loop, 0);
            }
        } else {
            console.log("VM done");
            if (loop_done_callback_resolve) {
                loop_done_callback_resolve();
                loop_done_callback_resolve = null;
                loop_done_callback_reject = null;
            }
        }
    } catch (err) {
        console.log("VM error");
        console.error(err);
        if (loop_done_callback_reject) {
            loop_done_callback_reject(err);
            loop_done_callback_resolve = null;
            loop_done_callback_reject = null;
        }
    }
}

function ensure_janet_loop() {
    // if there is a timeout already, make sure to cancel it as well as requeue that timeout!
    if (loop_timeout) {
        // loop timeout is always on the first timeout queued
        if (VM.timeouts.length > 0) {
            VM.timeouts[0].loop_awaited = false;
        }
        clearTimeout(loop_timeout);
    }
    window.setTimeout(janet_loop, 0);
}

function janet_loop_with_callbacks(resolve, reject){
    loop_done_callback_resolve = resolve;
    loop_done_callback_reject = reject;
    janet_loop();
}

var STOP_ONE = 0;

// function janet_loop_await() {
//     while (!janet_loop_done()) {
//         if (STOP_ONE++ > 10000) { throw new Error("STOP"); }
//         const interrupted_fiber_or_await_msecs = janet_loop1();
//         console.log("CHECK interrupted", interrupted_fiber_or_await_msecs);
//         if (interrupted_fiber_or_await_msecs instanceof JanetFiber) {
//             const interrupted_fiber = interrupted_fiber_or_await_msecs;
//             janet_schedule_signal(interrupted_fiber, null, JANET_SIGNAL_OK);
//         } else if (!(interrupted_fiber_or_await_msecs == null)) {
//             const await_msecs = interrupted_fiber_or_await_msecs;
//             const wait_until = ts_now() + await_msecs;
//             //while (ts_now() < wait_until) {} // BUSY WAIT
//             if (await_msecs == null) {
//                 throw new Error("loop_await wait for "+ await_msecs);
//             }
//         }
//     }
// }






var i1 = new Uint8Array([212, 3, 216, 8, 114, 111, 111, 116, 45, 101, 110, 118, 207, 5, 109, 121, 109, 97, 112, 211, 2, 208, 10, 115, 111, 117, 114, 99, 101, 45, 109, 97, 112, 210, 3, 0, 206, 13, 115, 99, 114, 97, 116, 99, 104, 46, 106, 97, 110, 101, 116, 1, 1, 208, 5, 118, 97, 108, 117, 101, 213, 2, 206, 3, 108, 111, 108, 203, 208, 1, 97, 42, 208, 12, 99, 117, 114, 114, 101, 110, 116, 45, 102, 105, 108, 101, 218, 5, 208, 6, 115, 111, 117, 114, 99, 101, 218, 5]);

console.log("image length", i1.length);

var ui1 = unmarshal(i1);

console.log("unmarshalled: ", ui1);

console.log("from root-env: ", ui1.get("hello"));

console.log("find", ui1.get(janet_symbol("mymap")).get(janet_keyword("source-map"))[0]);


var i2 = new Uint8Array([212, 4, 216, 8, 114, 111, 111, 116, 45, 101, 110, 118, 207, 5, 109, 121, 102, 110, 49, 211, 3, 208, 10, 115, 111, 117, 114, 99, 101, 45, 109, 97, 112, 210, 3, 0, 206, 13, 115, 99, 114, 97, 116, 99, 104, 46, 106, 97, 110, 101, 116, 4, 1, 208, 5, 118, 97, 108, 117, 101, 215, 0, 205, 0, 152, 0, 0, 3, 1, 1, 1, 0, 3, 206, 5, 109, 121, 102, 110, 49, 218, 5, 44, 1, 0, 0, 5, 2, 0, 42, 3, 2, 0, 0, 4, 1, 1, 3, 0, 3, 208, 3, 100, 111, 99, 206, 11, 40, 109, 121, 102, 110, 49, 32, 97, 41, 10, 10, 208, 12, 99, 117, 114, 114, 101, 110, 116, 45, 102, 105, 108, 101, 218, 5, 208, 6, 115, 111, 117, 114, 99, 101, 218, 5, 208, 11, 109, 97, 99, 114, 111, 45, 108, 105, 110, 116, 115, 209, 0]);

const ui2 = unmarshal(i2);

console.log("unmarshalled: ", ui2);


const i3 = new Uint8Array([212, 5, 216, 8, 114, 111, 111, 116, 45, 101, 110, 118, 207, 5, 109, 121, 102, 110, 49, 211, 3, 208, 10, 115, 111, 117, 114, 99, 101, 45, 109, 97, 112, 210, 3, 0, 206, 13, 115, 99, 114, 97, 116, 99, 104, 46, 106, 97, 110, 101, 116, 7, 1, 208, 5, 118, 97, 108, 117, 101, 215, 0, 205, 0, 152, 0, 0, 3, 1, 1, 1, 1, 5, 206, 5, 109, 121, 102, 110, 49, 218, 5, 215, 0, 205, 0, 152, 0, 0, 4, 2, 2, 2, 0, 3, 206, 5, 109, 121, 97, 100, 100, 218, 5, 44, 2, 0, 0, 6, 3, 0, 1, 3, 3, 0, 0, 4, 1, 1, 3, 0, 3, 44, 1, 0, 0, 41, 2, 42, 0, 48, 0, 2, 0, 42, 2, 0, 0, 52, 2, 0, 0, 7, 1, 1, 3, 0, 3, 0, 3, 0, 3, 208, 3, 100, 111, 99, 206, 11, 40, 109, 121, 102, 110, 49, 32, 97, 41, 10, 10, 207, 5, 109, 121, 97, 100, 100, 211, 3, 218, 4, 210, 3, 0, 218, 5, 4, 1, 218, 7, 218, 10, 218, 12, 206, 13, 40, 109, 121, 97, 100, 100, 32, 97, 32, 98, 41, 10, 10, 208, 12, 99, 117, 114, 114, 101, 110, 116, 45, 102, 105, 108, 101, 218, 5, 208, 6, 115, 111, 117, 114, 99, 101, 218, 5, 208, 11, 109, 97, 99, 114, 111, 45, 108, 105, 110, 116, 115, 209, 0]);

const ui3 = unmarshal(i3);

console.log("unmarshalled: ", ui3);

const i4 = new Uint8Array([212, 5, 216, 8, 114, 111, 111, 116, 45, 101, 110, 118, 207, 5, 109, 121, 102, 110, 49, 211, 3, 208, 10, 115, 111, 117, 114, 99, 101, 45, 109, 97, 112, 210, 3, 0, 206, 13, 115, 99, 114, 97, 116, 99, 104, 46, 106, 97, 110, 101, 116, 7, 1, 208, 5, 118, 97, 108, 117, 101, 215, 0, 205, 0, 152, 0, 0, 5, 1, 1, 1, 1, 10, 206, 5, 109, 121, 102, 110, 49, 218, 5, 215, 0, 205, 0, 152, 0, 0, 4, 2, 2, 2, 0, 3, 206, 5, 109, 121, 97, 100, 100, 218, 5, 44, 2, 0, 0, 6, 3, 0, 1, 3, 3, 0, 0, 4, 1, 1, 3, 0, 3, 44, 1, 0, 0, 41, 2, 42, 0, 48, 0, 2, 0, 42, 3, 0, 0, 51, 2, 3, 0, 25, 3, 2, 0, 41, 4, 231, 3, 48, 3, 4, 0, 42, 4, 0, 0, 52, 4, 0, 0, 7, 1, 1, 10, 0, 10, 0, 10, 0, 10, 0, 3, 1, 3, 0, 3, 0, 3, 0, 3, 208, 3, 100, 111, 99, 206, 11, 40, 109, 121, 102, 110, 49, 32, 97, 41, 10, 10, 207, 5, 109, 121, 97, 100, 100, 211, 3, 218, 4, 210, 3, 0, 218, 5, 4, 1, 218, 7, 218, 10, 218, 12, 206, 13, 40, 109, 121, 97, 100, 100, 32, 97, 32, 98, 41, 10, 10, 208, 12, 99, 117, 114, 114, 101, 110, 116, 45, 102, 105, 108, 101, 218, 5, 208, 6, 115, 111, 117, 114, 99, 101, 218, 5, 208, 11, 109, 97, 99, 114, 111, 45, 108, 105, 110, 116, 115, 209, 0]);

const ui4 = unmarshal(i4);

console.log("unmarshalled: ", ui4);

const i5 = new Uint8Array([212, 3, 216, 8, 114, 111, 111, 116, 45, 101, 110, 118, 208, 12, 99, 117, 114, 114, 101, 110, 116, 45, 102, 105, 108, 101, 206, 13, 115, 99, 114, 97, 116, 99, 104, 46, 106, 97, 110, 101, 116, 208, 6, 115, 111, 117, 114, 99, 101, 218, 3, 207, 3, 102, 105, 98, 211, 2, 208, 10, 115, 111, 117, 114, 99, 101, 45, 109, 97, 112, 210, 3, 0, 218, 3, 59, 1, 208, 5, 118, 97, 108, 117, 101, 215, 1, 205, 0, 208, 0, 0, 6, 1, 1, 1, 0, 13, 1, 218, 3, 34, 1, 0, 2, 28, 1, 2, 0, 3, 0, 0, 0, 5, 2, 0, 255, 47, 2, 0, 0, 43, 4, 0, 0, 51, 3, 4, 0, 5, 2, 0, 254, 47, 2, 0, 0, 43, 5, 0, 0, 51, 4, 5, 0, 6, 2, 3, 4, 3, 2, 0, 0, 191, 255, 59, 49, 0, 45, 0, 45, 0, 67, 0, 62, 0, 62, 0, 62, 0, 81, 0, 76, 0, 76, 0, 76, 0, 59, 0, 59, 0, 3, 218, 10, 201, 201]);

const ui5 = unmarshal(i5);

// console.log("pp ui1");
// ui1.forEach(function(value, key, map){
//     return console.log(key, " => ", value);
// });

const i6 = new Uint8Array([212, 3, 216, 8, 114, 111, 111, 116, 45, 101, 110, 118, 207, 4, 102, 105, 98, 50, 211, 2, 208, 10, 115, 111, 117, 114, 99, 101, 45, 109, 97, 112, 210, 3, 0, 206, 13, 115, 99, 114, 97, 116, 99, 104, 46, 106, 97, 110, 101, 116, 63, 1, 208, 5, 118, 97, 108, 117, 101, 215, 0, 205, 0, 152, 0, 0, 6, 1, 1, 1, 0, 12, 206, 4, 102, 105, 98, 50, 218, 5, 44, 1, 0, 0, 34, 2, 0, 2, 28, 2, 2, 0, 3, 0, 0, 0, 5, 3, 0, 255, 47, 3, 0, 0, 51, 4, 1, 0, 5, 3, 0, 254, 47, 3, 0, 0, 51, 5, 1, 0, 6, 3, 4, 5, 3, 3, 0, 0, 63, 11, 0, 28, 0, 24, 0, 24, 0, 47, 0, 41, 0, 41, 0, 62, 0, 56, 0, 56, 0, 38, 0, 38, 208, 12, 99, 117, 114, 114, 101, 110, 116, 45, 102, 105, 108, 101, 218, 5, 208, 6, 115, 111, 117, 114, 99, 101, 218, 5]);

const ui6 = unmarshal(i6);

const i7 = new Uint8Array([212, 5, 216, 8, 114, 111, 111, 116, 45, 101, 110, 118, 208, 12, 99, 117, 114, 114, 101, 110, 116, 45, 102, 105, 108, 101, 206, 13, 115, 99, 114, 97, 116, 99, 104, 46, 106, 97, 110, 101, 116, 208, 6, 115, 111, 117, 114, 99, 101, 218, 3, 207, 2, 103, 111, 211, 3, 208, 10, 115, 111, 117, 114, 99, 101, 45, 109, 97, 112, 210, 3, 0, 218, 3, 77, 1, 208, 5, 118, 97, 108, 117, 101, 215, 0, 205, 0, 152, 0, 0, 5, 2, 2, 2, 1, 5, 206, 2, 103, 111, 218, 3, 215, 0, 205, 2, 178, 0, 0, 7, 2, 2, 2, 0, 19, 2, 218, 3, 41, 3, 10, 0, 6, 2, 3, 1, 25, 3, 2, 0, 28, 0, 4, 0, 46, 4, 0, 0, 25, 2, 4, 0, 26, 3, 0, 0, 46, 4, 1, 0, 25, 2, 4, 0, 25, 4, 2, 0, 25, 2, 4, 0, 41, 6, 1, 0, 5, 5, 6, 2, 5, 5, 5, 3, 5, 5, 5, 4, 5, 5, 5, 5, 5, 5, 5, 6, 5, 5, 5, 7, 3, 2, 0, 0, 205, 0, 208, 0, 0, 1, 0, 0, 0, 0, 2, 1, 218, 3, 43, 0, 0, 3, 3, 0, 0, 0, 191, 255, 71, 43, 0, 43, 205, 0, 208, 0, 0, 1, 0, 0, 0, 0, 2, 1, 218, 3, 43, 0, 0, 1, 3, 0, 0, 0, 191, 255, 71, 59, 0, 59, 70, 39, 0, 39, 0, 26, 1, 37, 0, 43, 0, 37, 0, 37, 0, 59, 0, 37, 0, 26, 191, 254, 17, 5, 17, 0, 17, 0, 17, 0, 17, 0, 17, 0, 17, 0, 17, 191, 250, 15, 10, 0, 0, 0, 44, 2, 0, 0, 48, 0, 1, 0, 42, 4, 0, 0, 51, 3, 4, 0, 52, 3, 0, 0, 77, 1, 1, 4, 0, 4, 0, 4, 0, 3, 208, 3, 100, 111, 99, 206, 10, 40, 103, 111, 32, 120, 32, 121, 41, 10, 10, 207, 8, 111, 117, 116, 101, 114, 102, 117, 110, 211, 2, 218, 7, 210, 3, 0, 218, 3, 68, 1, 218, 9, 218, 12, 208, 11, 109, 97, 99, 114, 111, 45, 108, 105, 110, 116, 115, 209, 0]);

const ui7 = unmarshal(i7);

const fib1 = new Uint8Array([212, 6, 216, 8, 114, 111, 111, 116, 45, 101, 110, 118, 208, 12, 99, 117, 114, 114, 101, 110, 116, 45, 102, 105, 108, 101, 206, 13, 115, 99, 114, 97, 116, 99, 104, 46, 106, 97, 110, 101, 116, 208, 6, 115, 111, 117, 114, 99, 101, 218, 3, 207, 3, 102, 105, 98, 211, 2, 208, 10, 115, 111, 117, 114, 99, 101, 45, 109, 97, 112, 210, 3, 0, 218, 3, 91, 1, 208, 5, 118, 97, 108, 117, 101, 204, 205, 6, 14, 0, 8, 4, 13, 13, 205, 127, 255, 255, 255, 2, 0, 0, 215, 0, 205, 0, 152, 0, 0, 5, 0, 0, 0, 0, 8, 206, 2, 102, 49, 218, 3, 44, 0, 0, 0, 41, 2, 232, 3, 54, 1, 2, 3, 41, 3, 208, 7, 54, 2, 3, 3, 41, 4, 184, 11, 54, 3, 4, 3, 3, 3, 0, 0, 86, 1, 1, 3, 0, 3, 1, 3, 0, 3, 1, 3, 0, 3, 0, 3, 201, 201, 201, 201, 201, 201, 207, 2, 103, 111, 211, 3, 218, 7, 210, 3, 0, 218, 3, 93, 1, 218, 9, 215, 0, 205, 0, 152, 0, 0, 8, 0, 0, 0, 1, 16, 206, 2, 103, 111, 218, 3, 218, 10, 44, 0, 0, 0, 42, 2, 0, 0, 38, 3, 0, 0, 53, 1, 2, 3, 25, 2, 1, 0, 42, 4, 0, 0, 38, 5, 0, 0, 53, 3, 4, 5, 25, 4, 3, 0, 42, 6, 0, 0, 38, 7, 0, 0, 53, 5, 6, 7, 25, 6, 5, 0, 6, 7, 2, 4, 6, 7, 7, 6, 3, 7, 0, 0, 93, 1, 1, 11, 0, 11, 0, 11, 0, 3, 1, 11, 0, 11, 0, 11, 0, 3, 1, 11, 0, 11, 0, 11, 0, 3, 1, 3, 0, 3, 0, 3, 208, 3, 100, 111, 99, 206, 6, 40, 103, 111, 41, 10, 10, 207, 2, 102, 49, 211, 3, 218, 7, 210, 3, 0, 218, 3, 86, 1, 218, 9, 218, 11, 218, 18, 206, 6, 40, 102, 49, 41, 10, 10, 208, 11, 109, 97, 99, 114, 111, 45, 108, 105, 110, 116, 115, 209, 0]);

const ufib1 = unmarshal(fib1);

const fib2 = new Uint8Array([212, 6, 216, 8, 114, 111, 111, 116, 45, 101, 110, 118, 208, 12, 99, 117, 114, 114, 101, 110, 116, 45, 102, 105, 108, 101, 206, 13, 115, 99, 114, 97, 116, 99, 104, 46, 106, 97, 110, 101, 116, 208, 6, 115, 111, 117, 114, 99, 101, 218, 3, 207, 3, 102, 105, 98, 211, 2, 208, 10, 115, 111, 117, 114, 99, 101, 45, 109, 97, 112, 210, 3, 0, 218, 3, 119, 1, 208, 5, 118, 97, 108, 117, 101, 204, 205, 6, 14, 0, 8, 4, 14, 14, 205, 127, 255, 255, 255, 2, 0, 0, 215, 0, 205, 0, 152, 0, 0, 6, 0, 0, 0, 0, 8, 206, 2, 102, 49, 218, 3, 44, 0, 0, 0, 41, 2, 16, 39, 54, 1, 2, 3, 25, 2, 1, 0, 54, 3, 2, 3, 25, 4, 3, 0, 54, 5, 4, 3, 3, 5, 0, 0, 114, 1, 1, 10, 0, 10, 0, 3, 1, 10, 0, 3, 1, 3, 0, 3, 201, 201, 201, 201, 201, 201, 201, 207, 2, 103, 111, 211, 3, 218, 7, 210, 3, 0, 218, 3, 121, 1, 218, 9, 215, 0, 205, 0, 152, 0, 0, 8, 0, 0, 0, 1, 18, 206, 2, 103, 111, 218, 3, 218, 10, 44, 0, 0, 0, 42, 2, 0, 0, 38, 3, 0, 0, 53, 1, 2, 3, 25, 2, 1, 0, 41, 4, 16, 39, 6, 3, 4, 2, 42, 5, 0, 0, 53, 4, 5, 3, 25, 3, 4, 0, 41, 6, 16, 39, 6, 5, 6, 3, 42, 7, 0, 0, 53, 6, 7, 5, 25, 5, 6, 0, 6, 7, 2, 3, 6, 7, 7, 5, 3, 7, 0, 0, 121, 1, 1, 11, 0, 11, 0, 11, 0, 3, 1, 23, 0, 23, 0, 11, 0, 11, 0, 3, 1, 23, 0, 23, 0, 11, 0, 11, 0, 3, 1, 3, 0, 3, 0, 3, 208, 3, 100, 111, 99, 206, 6, 40, 103, 111, 41, 10, 10, 207, 2, 102, 49, 211, 3, 218, 7, 210, 3, 0, 218, 3, 114, 1, 218, 9, 218, 11, 218, 18, 206, 6, 40, 102, 49, 41, 10, 10, 208, 11, 109, 97, 99, 114, 111, 45, 108, 105, 110, 116, 115, 209, 0]);

const ufib2 = unmarshal(fib2);

const fib3 = new Uint8Array([212, 4, 216, 8, 114, 111, 111, 116, 45, 101, 110, 118, 208, 12, 99, 117, 114, 114, 101, 110, 116, 45, 102, 105, 108, 101, 206, 13, 115, 99, 114, 97, 116, 99, 104, 46, 106, 97, 110, 101, 116, 208, 6, 115, 111, 117, 114, 99, 101, 218, 3, 207, 2, 103, 111, 211, 3, 208, 10, 115, 111, 117, 114, 99, 101, 45, 109, 97, 112, 210, 3, 0, 218, 3, 128, 136, 1, 208, 5, 118, 97, 108, 117, 101, 215, 0, 205, 0, 184, 0, 0, 7, 0, 0, 0, 1, 11, 1, 206, 2, 103, 111, 218, 3, 216, 9, 102, 105, 98, 101, 114, 47, 110, 101, 119, 44, 0, 0, 0, 46, 1, 0, 0, 25, 2, 1, 0, 47, 2, 0, 0, 42, 4, 0, 0, 51, 3, 4, 0, 25, 4, 3, 0, 38, 6, 0, 0, 53, 5, 4, 6, 25, 6, 5, 0, 3, 6, 0, 0, 205, 0, 144, 0, 0, 2, 0, 0, 0, 0, 3, 218, 3, 41, 1, 42, 0, 54, 0, 1, 3, 3, 0, 0, 0, 128, 138, 13, 0, 13, 0, 13, 128, 136, 1, 1, 11, 0, 3, 2, 13, 0, 13, 0, 13, 0, 3, 1, 10, 0, 10, 0, 3, 191, 252, 1, 208, 3, 100, 111, 99, 206, 6, 40, 103, 111, 41, 10, 10, 208, 11, 109, 97, 99, 114, 111, 45, 108, 105, 110, 116, 115, 209, 0]);

const ufib3 = unmarshal(fib3);

const fib4 = new Uint8Array([212, 5, 216, 8, 114, 111, 111, 116, 45, 101, 110, 118, 208, 12, 99, 117, 114, 114, 101, 110, 116, 45, 102, 105, 108, 101, 206, 13, 115, 99, 114, 97, 116, 99, 104, 46, 106, 97, 110, 101, 116, 208, 6, 115, 111, 117, 114, 99, 101, 218, 3, 207, 2, 103, 111, 211, 3, 208, 10, 115, 111, 117, 114, 99, 101, 45, 109, 97, 112, 210, 3, 0, 218, 3, 128, 154, 1, 208, 5, 118, 97, 108, 117, 101, 215, 0, 205, 0, 152, 0, 0, 6, 0, 0, 0, 4, 13, 206, 2, 103, 111, 218, 3, 215, 0, 205, 0, 184, 0, 0, 7, 0, 0, 0, 1, 10, 1, 206, 2, 102, 49, 218, 3, 216, 9, 102, 105, 98, 101, 114, 47, 110, 101, 119, 44, 0, 0, 0, 46, 1, 0, 0, 25, 2, 1, 0, 47, 2, 0, 0, 42, 4, 0, 0, 51, 3, 4, 0, 25, 4, 3, 0, 38, 6, 0, 0, 53, 5, 4, 6, 3, 5, 0, 0, 205, 0, 144, 0, 0, 2, 0, 0, 0, 0, 3, 218, 3, 41, 1, 42, 0, 54, 0, 1, 3, 3, 0, 0, 0, 128, 150, 13, 0, 13, 0, 13, 128, 148, 1, 1, 11, 0, 3, 2, 13, 0, 13, 0, 13, 0, 3, 1, 3, 0, 3, 0, 3, 218, 14, 206, 5, 103, 111, 116, 58, 32, 216, 5, 112, 114, 105, 110, 116, 44, 0, 0, 0, 42, 1, 0, 0, 47, 1, 0, 0, 42, 2, 1, 0, 51, 1, 2, 0, 25, 2, 1, 0, 38, 4, 0, 0, 53, 3, 2, 4, 25, 4, 3, 0, 42, 5, 2, 0, 48, 5, 4, 0, 42, 5, 3, 0, 52, 5, 0, 0, 128, 154, 1, 1, 13, 0, 13, 0, 13, 0, 13, 0, 3, 1, 10, 0, 10, 0, 3, 1, 3, 0, 3, 0, 3, 0, 3, 208, 3, 100, 111, 99, 206, 6, 40, 103, 111, 41, 10, 10, 207, 2, 102, 49, 211, 3, 218, 7, 210, 3, 0, 218, 3, 128, 148, 1, 218, 9, 218, 12, 218, 17, 206, 6, 40, 102, 49, 41, 10, 10, 208, 11, 109, 97, 99, 114, 111, 45, 108, 105, 110, 116, 115, 209, 0]);

const ufib4 = unmarshal(fib4);

const ev1 = new Uint8Array([212, 5, 216, 8, 114, 111, 111, 116, 45, 101, 110, 118, 208, 12, 99, 117, 114, 114, 101, 110, 116, 45, 102, 105, 108, 101, 206, 13, 115, 99, 114, 97, 116, 99, 104, 46, 106, 97, 110, 101, 116, 208, 6, 115, 111, 117, 114, 99, 101, 218, 3, 207, 2, 103, 111, 211, 3, 208, 10, 115, 111, 117, 114, 99, 101, 45, 109, 97, 112, 210, 3, 0, 218, 3, 128, 177, 1, 208, 5, 118, 97, 108, 117, 101, 215, 0, 205, 0, 184, 0, 0, 6, 0, 0, 0, 6, 27, 2, 206, 2, 103, 111, 218, 3, 216, 9, 102, 105, 98, 101, 114, 47, 110, 101, 119, 216, 5, 101, 118, 47, 103, 111, 200, 0, 0, 0, 0, 0, 0, 208, 63, 216, 8, 101, 118, 47, 115, 108, 101, 101, 112, 206, 31, 69, 118, 101, 114, 121, 111, 110, 101, 32, 115, 104, 111, 117, 108, 100, 32, 98, 101, 32, 100, 111, 110, 101, 32, 98, 121, 32, 110, 111, 119, 33, 216, 5, 112, 114, 105, 110, 116, 44, 0, 0, 0, 46, 1, 0, 0, 47, 1, 0, 0, 42, 3, 0, 0, 51, 2, 3, 0, 47, 2, 0, 0, 42, 3, 1, 0, 51, 1, 3, 0, 42, 2, 2, 0, 47, 2, 0, 0, 42, 3, 3, 0, 51, 2, 3, 0, 46, 3, 1, 0, 47, 3, 0, 0, 42, 5, 0, 0, 51, 4, 5, 0, 47, 4, 0, 0, 42, 5, 1, 0, 51, 3, 5, 0, 41, 4, 11, 0, 47, 4, 0, 0, 42, 5, 3, 0, 51, 4, 5, 0, 42, 5, 4, 0, 47, 5, 0, 0, 42, 5, 5, 0, 52, 5, 0, 0, 205, 0, 144, 0, 0, 2, 0, 0, 0, 2, 5, 218, 3, 206, 3, 98, 111, 98, 215, 0, 205, 0, 152, 0, 0, 9, 2, 2, 2, 6, 22, 206, 6, 119, 111, 114, 107, 101, 114, 218, 3, 206, 9, 32, 119, 111, 114, 107, 105, 110, 103, 32, 206, 3, 46, 46, 46, 218, 17, 200, 0, 0, 0, 0, 0, 0, 224, 63, 218, 15, 206, 9, 32, 105, 115, 32, 100, 111, 110, 101, 33, 44, 2, 0, 0, 41, 3, 0, 0, 25, 4, 1, 0, 33, 5, 3, 4, 28, 5, 14, 0, 25, 6, 3, 0, 42, 7, 0, 0, 49, 0, 7, 6, 42, 7, 1, 0, 47, 7, 0, 0, 42, 8, 2, 0, 51, 7, 8, 0, 42, 7, 3, 0, 47, 7, 0, 0, 42, 8, 4, 0, 51, 7, 8, 0, 5, 3, 3, 1, 26, 242, 255, 255, 42, 3, 5, 0, 48, 0, 3, 0, 42, 3, 2, 0, 52, 3, 0, 0, 128, 169, 1, 3, 3, 0, 3, 0, 3, 0, 3, 0, 3, 1, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 1, 5, 0, 5, 0, 5, 0, 5, 191, 254, 3, 0, 3, 3, 3, 0, 3, 0, 3, 0, 3, 42, 0, 0, 0, 41, 1, 10, 0, 48, 0, 1, 0, 42, 0, 1, 0, 52, 0, 0, 0, 128, 179, 28, 0, 28, 0, 28, 0, 28, 0, 28, 205, 0, 144, 0, 0, 2, 0, 0, 0, 2, 5, 218, 3, 206, 5, 115, 97, 108, 108, 121, 218, 19, 42, 0, 0, 0, 41, 1, 20, 0, 48, 0, 1, 0, 42, 0, 1, 0, 52, 0, 0, 0, 128, 184, 21, 0, 21, 0, 21, 0, 21, 0, 21, 128, 177, 1, 2, 21, 0, 10, 0, 10, 0, 10, 0, 3, 0, 3, 0, 3, 2, 3, 0, 3, 0, 3, 0, 3, 3, 21, 0, 10, 0, 10, 0, 10, 0, 3, 0, 3, 0, 3, 2, 3, 0, 3, 0, 3, 0, 3, 1, 3, 0, 3, 0, 3, 0, 3, 208, 3, 100, 111, 99, 206, 6, 40, 103, 111, 41, 10, 10, 208, 11, 109, 97, 99, 114, 111, 45, 108, 105, 110, 116, 115, 209, 0, 207, 6, 119, 111, 114, 107, 101, 114, 211, 3, 218, 7, 210, 3, 0, 218, 3, 128, 169, 1, 218, 9, 218, 19, 218, 26, 206, 32, 40, 119, 111, 114, 107, 101, 114, 32, 110, 97, 109, 101, 32, 110, 41, 10, 10, 68, 111, 101, 115, 32, 115, 111, 109, 101, 32, 119, 111, 114, 107, 46]);

const uev1 = unmarshal(ev1);

const c1 = new Uint8Array([212, 4, 216, 8, 114, 111, 111, 116, 45, 101, 110, 118, 208, 12, 99, 117, 114, 114, 101, 110, 116, 45, 102, 105, 108, 101, 206, 13, 115, 99, 114, 97, 116, 99, 104, 46, 106, 97, 110, 101, 116, 208, 6, 115, 111, 117, 114, 99, 101, 218, 3, 207, 2, 103, 111, 211, 3, 208, 10, 115, 111, 117, 114, 99, 101, 45, 109, 97, 112, 210, 3, 0, 218, 3, 128, 203, 1, 208, 5, 118, 97, 108, 117, 101, 215, 0, 205, 2, 186, 0, 0, 10, 0, 0, 0, 5, 36, 3, 206, 2, 103, 111, 218, 3, 216, 7, 101, 118, 47, 99, 104, 97, 110, 216, 9, 102, 105, 98, 101, 114, 47, 110, 101, 119, 216, 5, 101, 118, 47, 103, 111, 206, 7, 103, 111, 32, 100, 111, 110, 101, 216, 5, 112, 114, 105, 110, 116, 44, 0, 0, 0, 41, 1, 1, 0, 47, 1, 0, 0, 42, 2, 0, 0, 51, 1, 2, 0, 25, 2, 1, 0, 41, 3, 1, 0, 47, 3, 0, 0, 42, 4, 0, 0, 51, 3, 4, 0, 25, 4, 3, 0, 46, 5, 0, 0, 47, 5, 0, 0, 42, 7, 1, 0, 51, 6, 7, 0, 47, 6, 0, 0, 42, 7, 2, 0, 51, 5, 7, 0, 46, 6, 1, 0, 47, 6, 0, 0, 42, 8, 1, 0, 51, 7, 8, 0, 47, 7, 0, 0, 42, 8, 2, 0, 51, 6, 8, 0, 46, 7, 2, 0, 47, 7, 0, 0, 42, 9, 1, 0, 51, 8, 9, 0, 47, 8, 0, 0, 42, 9, 2, 0, 51, 7, 9, 0, 42, 8, 3, 0, 47, 8, 0, 0, 42, 8, 4, 0, 52, 8, 0, 0, 205, 0, 208, 0, 0, 6, 0, 0, 0, 4, 20, 1, 218, 3, 206, 6, 119, 97, 105, 116, 32, 97, 218, 16, 216, 9, 101, 118, 47, 115, 101, 108, 101, 99, 116, 206, 5, 103, 111, 116, 32, 97, 42, 0, 0, 0, 47, 0, 0, 0, 42, 1, 1, 0, 51, 0, 1, 0, 43, 1, 0, 2, 43, 2, 0, 4, 48, 1, 2, 0, 42, 2, 2, 0, 51, 1, 2, 0, 59, 2, 1, 0, 25, 3, 2, 0, 59, 2, 1, 1, 25, 4, 2, 0, 59, 2, 1, 2, 25, 5, 2, 0, 42, 2, 3, 0, 49, 2, 3, 4, 47, 5, 0, 0, 42, 2, 1, 0, 52, 2, 0, 0, 191, 255, 128, 208, 23, 0, 23, 0, 23, 0, 23, 1, 40, 0, 40, 0, 40, 0, 40, 0, 40, 0, 23, 0, 23, 0, 23, 0, 23, 0, 23, 0, 23, 1, 23, 0, 23, 0, 23, 0, 23, 0, 23, 205, 0, 208, 0, 0, 6, 0, 0, 0, 4, 20, 1, 218, 3, 206, 6, 119, 97, 105, 116, 32, 98, 218, 16, 218, 18, 206, 5, 103, 111, 116, 32, 98, 42, 0, 0, 0, 47, 0, 0, 0, 42, 1, 1, 0, 51, 0, 1, 0, 43, 1, 0, 2, 43, 2, 0, 4, 48, 1, 2, 0, 42, 2, 2, 0, 51, 1, 2, 0, 59, 2, 1, 0, 25, 3, 2, 0, 59, 2, 1, 1, 25, 4, 2, 0, 59, 2, 1, 2, 25, 5, 2, 0, 42, 2, 3, 0, 49, 2, 3, 4, 47, 5, 0, 0, 42, 2, 1, 0, 52, 2, 0, 0, 191, 255, 128, 213, 23, 0, 23, 0, 23, 0, 23, 1, 40, 0, 40, 0, 40, 0, 40, 0, 40, 0, 23, 0, 23, 0, 23, 0, 23, 0, 23, 0, 23, 1, 23, 0, 23, 0, 23, 0, 23, 0, 23, 205, 0, 208, 0, 0, 5, 0, 0, 0, 4, 18, 1, 218, 3, 206, 7, 103, 105, 118, 101, 32, 99, 49, 218, 16, 216, 7, 101, 118, 47, 103, 105, 118, 101, 206, 7, 103, 105, 118, 101, 32, 99, 50, 42, 0, 0, 0, 47, 0, 0, 0, 42, 1, 1, 0, 51, 0, 1, 0, 43, 1, 0, 2, 41, 2, 42, 0, 48, 1, 2, 0, 42, 2, 2, 0, 51, 1, 2, 0, 42, 2, 3, 0, 47, 2, 0, 0, 42, 3, 1, 0, 51, 2, 3, 0, 43, 3, 0, 4, 41, 4, 232, 3, 48, 3, 4, 0, 42, 3, 2, 0, 52, 3, 0, 0, 191, 255, 128, 217, 23, 0, 23, 0, 23, 0, 23, 1, 23, 0, 23, 0, 23, 0, 23, 0, 23, 1, 23, 0, 23, 0, 23, 0, 23, 1, 23, 0, 23, 0, 23, 0, 23, 0, 23, 128, 203, 1, 1, 11, 0, 11, 0, 11, 0, 11, 0, 3, 1, 11, 0, 11, 0, 11, 0, 11, 0, 3, 2, 21, 0, 10, 0, 10, 0, 10, 0, 3, 0, 3, 0, 3, 5, 21, 0, 10, 0, 10, 0, 10, 0, 3, 0, 3, 0, 3, 4, 21, 0, 10, 0, 10, 0, 10, 0, 3, 0, 3, 0, 3, 5, 3, 0, 3, 0, 3, 0, 3, 20, 0, 0, 0, 208, 3, 100, 111, 99, 206, 6, 40, 103, 111, 41, 10, 10, 208, 11, 109, 97, 99, 114, 111, 45, 108, 105, 110, 116, 115, 209, 0]);

const uc1 = unmarshal(c1);

const c2 = new Uint8Array([212, 4, 216, 8, 114, 111, 111, 116, 45, 101, 110, 118, 208, 12, 99, 117, 114, 114, 101, 110, 116, 45, 102, 105, 108, 101, 206, 13, 115, 99, 114, 97, 116, 99, 104, 46, 106, 97, 110, 101, 116, 208, 6, 115, 111, 117, 114, 99, 101, 218, 3, 207, 2, 103, 111, 211, 3, 208, 10, 115, 111, 117, 114, 99, 101, 45, 109, 97, 112, 210, 3, 0, 218, 3, 128, 232, 1, 208, 5, 118, 97, 108, 117, 101, 215, 0, 205, 2, 186, 0, 0, 10, 0, 0, 0, 5, 36, 3, 206, 2, 103, 111, 218, 3, 216, 7, 101, 118, 47, 99, 104, 97, 110, 216, 9, 102, 105, 98, 101, 114, 47, 110, 101, 119, 216, 5, 101, 118, 47, 103, 111, 206, 7, 103, 111, 32, 100, 111, 110, 101, 216, 5, 112, 114, 105, 110, 116, 44, 0, 0, 0, 41, 1, 1, 0, 47, 1, 0, 0, 42, 2, 0, 0, 51, 1, 2, 0, 25, 2, 1, 0, 41, 3, 1, 0, 47, 3, 0, 0, 42, 4, 0, 0, 51, 3, 4, 0, 25, 4, 3, 0, 46, 5, 0, 0, 47, 5, 0, 0, 42, 7, 1, 0, 51, 6, 7, 0, 47, 6, 0, 0, 42, 7, 2, 0, 51, 5, 7, 0, 46, 6, 1, 0, 47, 6, 0, 0, 42, 8, 1, 0, 51, 7, 8, 0, 47, 7, 0, 0, 42, 8, 2, 0, 51, 6, 8, 0, 46, 7, 2, 0, 47, 7, 0, 0, 42, 9, 1, 0, 51, 8, 9, 0, 47, 8, 0, 0, 42, 9, 2, 0, 51, 7, 9, 0, 42, 8, 3, 0, 47, 8, 0, 0, 42, 8, 4, 0, 52, 8, 0, 0, 205, 0, 208, 0, 0, 3, 0, 0, 0, 4, 13, 1, 218, 3, 206, 6, 119, 97, 105, 116, 32, 97, 218, 16, 216, 9, 101, 118, 47, 115, 101, 108, 101, 99, 116, 206, 5, 103, 111, 116, 32, 97, 42, 0, 0, 0, 47, 0, 0, 0, 42, 1, 1, 0, 51, 0, 1, 0, 43, 1, 0, 2, 43, 2, 0, 4, 48, 1, 2, 0, 42, 2, 2, 0, 51, 1, 2, 0, 42, 2, 3, 0, 48, 2, 1, 0, 42, 2, 1, 0, 52, 2, 0, 0, 191, 255, 128, 237, 23, 0, 23, 0, 23, 0, 23, 1, 38, 0, 38, 0, 38, 0, 38, 0, 38, 0, 23, 0, 23, 0, 23, 0, 23, 205, 0, 208, 0, 0, 3, 0, 0, 0, 4, 13, 1, 218, 3, 206, 6, 119, 97, 105, 116, 32, 98, 218, 16, 218, 18, 206, 5, 103, 111, 116, 32, 98, 42, 0, 0, 0, 47, 0, 0, 0, 42, 1, 1, 0, 51, 0, 1, 0, 43, 1, 0, 2, 43, 2, 0, 4, 48, 1, 2, 0, 42, 2, 2, 0, 51, 1, 2, 0, 42, 2, 3, 0, 48, 2, 1, 0, 42, 2, 1, 0, 52, 2, 0, 0, 191, 255, 128, 241, 23, 0, 23, 0, 23, 0, 23, 1, 38, 0, 38, 0, 38, 0, 38, 0, 38, 0, 23, 0, 23, 0, 23, 0, 23, 205, 0, 208, 0, 0, 5, 0, 0, 0, 4, 18, 1, 218, 3, 206, 7, 103, 105, 118, 101, 32, 99, 49, 218, 16, 216, 7, 101, 118, 47, 103, 105, 118, 101, 206, 7, 103, 105, 118, 101, 32, 99, 50, 42, 0, 0, 0, 47, 0, 0, 0, 42, 1, 1, 0, 51, 0, 1, 0, 43, 1, 0, 2, 41, 2, 42, 0, 48, 1, 2, 0, 42, 2, 2, 0, 51, 1, 2, 0, 42, 2, 3, 0, 47, 2, 0, 0, 42, 3, 1, 0, 51, 2, 3, 0, 43, 3, 0, 4, 41, 4, 232, 3, 48, 3, 4, 0, 42, 3, 2, 0, 52, 3, 0, 0, 191, 255, 128, 244, 23, 0, 23, 0, 23, 0, 23, 1, 23, 0, 23, 0, 23, 0, 23, 0, 23, 1, 23, 0, 23, 0, 23, 0, 23, 1, 23, 0, 23, 0, 23, 0, 23, 0, 23, 128, 232, 1, 1, 11, 0, 11, 0, 11, 0, 11, 0, 3, 1, 11, 0, 11, 0, 11, 0, 11, 0, 3, 2, 21, 0, 10, 0, 10, 0, 10, 0, 3, 0, 3, 0, 3, 4, 21, 0, 10, 0, 10, 0, 10, 0, 3, 0, 3, 0, 3, 3, 21, 0, 10, 0, 10, 0, 10, 0, 3, 0, 3, 0, 3, 5, 3, 0, 3, 0, 3, 0, 3, 20, 0, 0, 0, 208, 3, 100, 111, 99, 206, 6, 40, 103, 111, 41, 10, 10, 208, 11, 109, 97, 99, 114, 111, 45, 108, 105, 110, 116, 115, 209, 0]);

const uc2 = unmarshal(c2);

const t14 = new Uint8Array([212, 4, 216, 8, 114, 111, 111, 116, 45, 101, 110, 118, 208, 12, 99, 117, 114, 114, 101, 110, 116, 45, 102, 105, 108, 101, 206, 17, 116, 101, 115, 116, 47, 116, 101, 115, 116, 49, 52, 46, 106, 97, 110, 101, 116, 208, 6, 115, 111, 117, 114, 99, 101, 218, 3, 207, 4, 116, 101, 115, 116, 211, 3, 208, 10, 115, 111, 117, 114, 99, 101, 45, 109, 97, 112, 210, 3, 0, 218, 3, 1, 1, 208, 5, 118, 97, 108, 117, 101, 215, 0, 205, 0, 152, 0, 0, 5, 0, 0, 0, 3, 9, 206, 4, 116, 101, 115, 116, 218, 3, 206, 11, 104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 208, 8, 106, 115, 46, 102, 101, 116, 99, 104, 206, 4, 103, 111, 103, 111, 44, 0, 0, 0, 42, 1, 0, 0, 47, 1, 0, 0, 42, 2, 1, 0, 51, 1, 2, 0, 25, 2, 1, 0, 42, 4, 2, 0, 35, 3, 2, 4, 3, 3, 0, 0, 1, 1, 1, 12, 0, 12, 0, 12, 0, 12, 0, 3, 1, 3, 0, 3, 0, 3, 208, 3, 100, 111, 99, 206, 8, 40, 116, 101, 115, 116, 41, 10, 10, 208, 11, 109, 97, 99, 114, 111, 45, 108, 105, 110, 116, 115, 209, 0]);

const ut14 = unmarshal(t14);

//const func_start = ui4.get(janet_symbol("myfn1")).get(janet_keyword("value"));

//const func_start = ui5.get(janet_symbol("fib")).get(janet_keyword("value"));

//const func_start = ui6.get(janet_symbol("fib2")).get(janet_keyword("value"));

//const func_start = ui7.get(janet_symbol("go")).get(janet_keyword("value"));

//const func_start = ufib1.get(janet_symbol("go")).get(janet_keyword("value"));

//const func_start = ufib2.get(janet_symbol("go")).get(janet_keyword("value"));

//const func_start = ufib3.get(janet_symbol("go")).get(janet_keyword("value"));

//const func_start = ufib4.get(janet_symbol("go")).get(janet_keyword("value"));

//const func_start = uev1.get(janet_symbol("go")).get(janet_keyword("value"));

//const func_start = uc1.get(janet_symbol("go")).get(janet_keyword("value"));

//const func_start = uc2.get(janet_symbol("go")).get(janet_keyword("value"));
const func_start = ut14.get(janet_symbol("test")).get(janet_keyword("value"));

console.log("func_start: ", func_start);

// const VM = vm_init();

// const fiber_start = janet_fiber(func_start, []);
// console.log("fiber", fiber_start);

// janet_schedule_signal(fiber_start, null, JANET_SIGNAL_OK);
// //janet_loop();


// const done_callback = new Promise(function (resolve, reject) {
//     console.log("AWAIT VM");
//     janet_loop_with_callbacks(resolve,reject);
// }).then(function (response) {
//     console.log("AWAIT VM done");
// }).error(function (err) {
//     console.log("AWAIT VM err");
//});


// (def fib (do (var fib nil) (set fib (fn [n] (if (< n 2) n (+ (fib (- n 1)) (fib (- n 2))))))))
// (def fib2 (fn fib2 [n] (if (< n 2) n (+ (fib2 (- n 1)) (fib2 (- n 2))))))

// (assert (= (fib 0) (fib2 0) 0) "fib(0)")
// (assert (= (fib 1) (fib2 1) 1) "fib(1)")
// (assert (= (fib 2) (fib2 2) 1) "fib(2)")
// (assert (= (fib 3) (fib2 3) 2) "fib(3)")
// (assert (= (fib 4) (fib2 4) 3) "fib(4)")
// (assert (= (fib 5) (fib2 5) 5) "fib(5)")
// (assert (= (fib 6) (fib2 6) 8) "fib(6)")
// (assert (= (fib 7) (fib2 7) 13) "fib(7)")
// (assert (= (fib 8) (fib2 8) 21) "fib(8)")
// (assert (= (fib 9) (fib2 9) 34) "fib(9)")
// (assert (= (fib 10) (fib2 10) 55) "fib(10)")

// (def outerfun (fn [x y]
//                 (def c (do
//                          (def someval (+ 10 y))
//                          (def ctemp (if x (fn [] someval) (fn [] y)))
//                          ctemp
//                          ))
//                 (+ 1 2 3 4 5 6 7)
//                 c))

// (assert (= ((outerfun 1 2)) 12) "inner closure 1")
// (assert (= ((outerfun nil 2)) 2) "inner closure 2")
// (assert (= ((outerfun false 3)) 3) "inner closure 3")

// non event loop style:
// const ret = janet_continue_vm(fiber_start);
// console.log("VM ret", ret);
// console.log("VM after", VM);


// const fiber_start = janet_fiber(func_start, []);
// console.log("fiber", fiber_start);

// janet_schedule_signal(fiber_start, null, JANET_SIGNAL_OK);
// janet_loop();
// console.log("VM", VM);
// console.log("Done: ", " todo status ");


// fiber(func, 64, 0, NULL)
// JanetSignal sig = janet_continue(fiber, janet_wrap_nil, &ret)

// loop
// recursion through setTimeout with timeout shortest sleep or zero if any task due
