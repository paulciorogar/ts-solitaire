class Some<A> {

    readonly isValue = true

    private constructor(private val:A) {}

    static from<B>(val:B|null|void):Maybe<B> {
        if (val === null || val === undefined) return new Nothing()
        return new Some(val)
    }

    isNothing():this is Nothing<A> {
        return !this.isValue
    }

    bind<B>(bindFn:(val:A)=>Maybe<B>) {
        return bindFn(this.val)
    }

    map<B>(transformer:(value:A)=>B):Maybe<B> {
        return Some.from(transformer(this.val))
    }

    cata<B, C>(none:()=>B, some:(val:A)=>C) {
        return some(this.val)
    }

    fold<B>(defaultValue:B){
        return <C>(fn:(value:A)=>C):B|C => {
            return fn(this.val)
        }
    }

    catchMap<B>(fn:()=>Maybe<B>):Maybe<A>|Maybe<B> {
        return this
    }

    equals(other:Maybe<A>) {
        return other.fold(false)(val => val === this.val)
    }

    orElse<B>(data:B):A|B {
        return this.val
    }
}

class Nothing<A> {

    readonly isValue = false

    isNothing():this is Nothing<A> {
        return !this.isValue
    }

    bind():Nothing<A> {
        return this
    }

    map<B>():Maybe<B> {
        return new Nothing()
    }

    cata<B, C>(none:()=>B, some:(val:A)=>C) {
        return none()
    }

    fold<B>(defaultValue:B){
        return <C>(fn:(value:A)=>C):B|C => {
            return defaultValue
        }
    }

    catchMap<B>(fn:()=>Maybe<B>):Maybe<A>|Maybe<B> {
        return fn()
    }

    equals(other:Maybe<A>) {
        return !other.isValue
    }

    orElse<B>(data:B):A|B {
        return data
    }
}

export type Maybe<A> = Some<A>|Nothing<A>

export const Maybe = {
    just<A>(val:A):Maybe<A> {
        return Some.from(val)
    },

    from<A>(val:A|null|void):Maybe<A> {
        return Some.from(val)
    },

    nothing<A>(data?:A):Maybe<A> {
        return new Nothing<A>()
    }
}