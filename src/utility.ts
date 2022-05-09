import { Maybe } from '../maybe'
import { Dimensions, Point, Rectangle } from './state';
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
        return new Pipe<B>(() => {
            return fn(this.prev())
        })
    }

    run(): A { return this.prev() }
}

export function pipe<A>(data:A):Pipe<A> {
    return new Pipe(() => data)
}

export function peek<A>(fn:(data:A)=>void):(data:A)=>A {
    return (data) => {
        fn(data)
        return data
    }
}

export function px(val:number):string {return val + 'px'}

export function top<A>(list:A[]|ReadonlyArray<A>):Maybe<A> {
    const [element] = list.slice(-1)
    return Maybe.from(element)
}

export function topN<A>(list:A[]|ReadonlyArray<A>, number:number):Maybe<ReadonlyArray<A>> {
    return Maybe.from(list.slice(-1 * number))
}

export const dom = {
    updateDimensions: function(element:HTMLElement, data:Dimensions):void {
        element.style.width = px(data.width)
        element.style.height = px(data.height)
    },

    updatePosition: function(element:HTMLElement, data:Point) {
        element.style.top = px(data.y)
        element.style.left = px(data.x)
    }
}

export function removeTop<A>(list:ReadonlyArray<A>|A[], number = 1):A[] {
    return list.slice(0, list.length - number)
}