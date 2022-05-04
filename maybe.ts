class Some<A> {

    readonly isValue = true

    private constructor(private val:A) {}

    static from<B>(val:B):Maybe<B> {
        if (val === null || val === undefined) return new Nothing()
        return new Some(val)
    }

    isNothing():this is Nothing<A> {
        return !this.isValue
    }

    map<B>(transformer:(value:A)=>B):Maybe<B> {
        return Some.from(transformer(this.val))
    }

    cata<B, C>(none:()=>B, some:(val:A)=>C) {
        return some(this.val)
    }

    fold<B>(defaultValue:B){
        return (fn:(value:A)=>B) => {
            return fn(this.val)
        }
    }

    orSome<B>(otherValue:B):A {
        return this.val
    }
}

class Nothing<A> {

    readonly isValue = false

    isNothing():this is Nothing<A> {
        return !this.isValue
    }

    map<B>():Maybe<B> {
        return new Nothing()
    }

    cata<B, C>(none:()=>B, some:(val:A)=>C) {
        return none()
    }

    fold<B>(defaultValue:B){
        return (fn:(value:A)=>B) => {
            return defaultValue
        }
    }

    orSome<B>(otherValue:B):B {
        return otherValue
    }
}

export type Maybe<A> = Some<A>|Nothing<A>

export const Maybe = {
    just<A>(val:A):Maybe<A> {
        return Some.from(val)
    },

    from<A>(val:A):Maybe<A> {
        return Some.from(val)
    },

    nothing<A>():Maybe<A> {
        return new Nothing()
    }
}