export class Some<A> {

    readonly isValue = true

    private constructor(private val: A) { }

    static from<B>(val: B | null | undefined): Maybe<B> {
        if (val === null || val === undefined) return new Nothing<B>()
        return new Some(val)
    }

    isNothing(): this is Nothing<A> {
        return !this.isValue
    }

    bind<B>(bindFn: (val: A) => Maybe<B>) {
        return bindFn(this.val)
    }

    map<B extends Object>(fn: (value: A) => B): Some<B> | Nothing<B> {
        return Some.from(fn(this.val))
    }

    catchMap<B>(fn: () => B): Maybe<A> | Maybe<B> {
        return this
    }

    cata<B, C>(none: () => B, some: (val: A) => C) {
        return some(this.val)
    }

    fold<B>(defaultValue: B) {
        return <C>(fn: (value: A) => C): B | C => {
            return fn(this.val)
        }
    }

    forEach(fn: (val: A) => void): void {
        fn(this.val)
    }

    equals(other: Maybe<A>): boolean {
        return other.map(val => val === this.val).orElse(false)
    }

    orElse<B>(data: B): A | B {
        return this.val
    }

    filter(fn: (val: A) => boolean): Maybe<A> {
        if (fn(this.val)) return this
        return new Nothing<A>()
    }
}

export class Nothing<A> {

    readonly isValue = false

    isNothing(): this is Nothing<A> {
        return !this.isValue
    }

    bind<B>(bindFn: (val: A) => Maybe<B>) {
        return new Nothing<B>()
    }

    map<B extends Object>(): Maybe<B> {
        return new Nothing()
    }

    cata<B, C>(none: () => B, some: (val: A) => C) {
        return none()
    }

    fold<B>(defaultValue: B) {
        return <C>(fn: (value: A) => C): B | C => {
            return defaultValue
        }
    }

    forEach(fn: (val: A) => void): void { }

    catchMap<B>(fn: () => B): Maybe<A> | Maybe<B> {
        return Some.from(fn())
    }

    equals(other: Maybe<A>) {
        return !other.isValue
    }

    orElse<B>(data: B): A | B {
        return data
    }

    filter(fn: (val: A) => boolean): Maybe<A> {
        return this
    }
}

export type Maybe<A> = Some<A> | Nothing<A>

export function just<A>(val: NonNullable<A>): Maybe<A> {
    return Some.from(val)
}

export function from<A>(val: A | null | undefined): Maybe<A> {
    return Some.from(val)
}

export function nothing<A>(data?: A): Maybe<A> {
    return new Nothing<A>()
}
