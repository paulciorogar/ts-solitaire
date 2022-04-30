export function debounce<A>(fn:(data:A)=>void, time:number) {
    let timeoutId:number|undefined = undefined
    return function (data:A) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn(data), time)
    }
}

export function throttle<A>(fn:(data:A)=>void, limit:number) {
    let wait = false
    return function (data:A) {
        if (wait) return
        wait = true
        fn(data)
        setTimeout(() => wait = false, limit)
    }
}

export class Pipe<A> {
    constructor(private prev:()=>A) {}

    pipe<B>(fn:(data:A)=>B) {
        return new Pipe(() => {
            return fn(this.prev())
        })
    }

    run(): A { return this.prev() }
}

export function pipe<A>(fn:()=>A) {return new Pipe(fn)}

export function px(val:number):string {return val + 'px'}

