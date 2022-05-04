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

export function px(val:number):string {return val + 'px'}

export function top<A>(list:A[]|ReadonlyArray<A>, number:number):A[] {
    return list.slice(-1 * number)
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

type Vector = {
    readonly kind: 'vector'
    readonly x:number
    readonly y:number
}

export function pointInRectangle(point:Point, rectangle:Rectangle) {
    const AB = vector(rectangle.a, rectangle.b)
    const AP = vector(rectangle.a, point)
    const BC = vector(rectangle.b, rectangle.c)
    const BP = vector(rectangle.b, point)
    const dotABAP = dotProduct(AB, AP)
    const dotABAB = dotProduct(AB, AB)
    const dotBCBP = dotProduct(BC, BP)
    const dotBCBC = dotProduct(BC, BC)
    return 0 <= dotABAP && dotABAP <= dotABAB && 0 <= dotBCBP && dotBCBP <= dotBCBC
}

function vector(p1:Point, p2:Point):Vector {
    return {
        kind: 'vector',
        x: p2.x - p1.x,
        y: p2.y - p1.y
    }
}

function dotProduct(v1:Vector, v2:Vector):number {
    return v1.x * v2.x + v1.y * v2.y
}
