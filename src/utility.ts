import { from as maybeFrom, Maybe } from './maybe'
import { Dimensions, Point } from './state'
export function debounce<A>(fn: (data: A) => void, time: number) {
    let timeoutId: number | undefined = undefined
    return function (data: A) {
        clearTimeout(timeoutId)
        timeoutId = window.setTimeout(() => fn(data), time)
    }
}

export function throttle<A>(fn: (data: A) => void, limit: number) {
    let wait = false
    return function (data: A) {
        if (wait) return
        wait = true
        fn(data)
        setTimeout(() => wait = false, limit)
    }
}

export class Pipe<A> {
    constructor(private prev: () => A) { }

    pipe<B>(fn: (data: A) => B) {
        return new Pipe<B>(() => {
            return fn(this.prev())
        })
    }

    run(): A { return this.prev() }
}

export function pipe<A>(data: A): Pipe<A> {
    return new Pipe(() => data)
}

export function peek<A>(fn: (data: A) => void): (data: A) => A {
    return (data) => {
        fn(data)
        return data
    }
}

export function px(val: number): string { return val + 'px' }

export function top<A>(list: A[] | ReadonlyArray<A>): Maybe<A> {
    const [element] = list.slice(-1)
    return maybeFrom(element)
}

export function first<A>(list: A[] | ReadonlyArray<A>): Maybe<A> {
    return maybeFrom(list[0])
}

export function topN<A>(list: A[] | ReadonlyArray<A>, number: number): ReadonlyArray<A> {
    return list.slice(-1 * number)
}

export const dom = {
    updateDimensions: function (element: HTMLElement, data: Dimensions): void {
        element.style.width = px(data.width)
        element.style.height = px(data.height)
    },

    updatePosition: function (element: HTMLElement, data: Point) {
        element.style.top = px(data.y)
        element.style.left = px(data.x)
    }
}

export function removeTop<A>(list: ReadonlyArray<A> | A[], number = 1): A[] {
    return list.slice(0, list.length - number)
}

function mulberry32(seed: number) {
    return function () {
        let t = seed += 0x6D2B79F5
        t = Math.imul(t ^ t >>> 15, t | 1)
        t ^= t + Math.imul(t ^ t >>> 7, t | 61)
        return ((t ^ t >>> 14) >>> 0) / 4294967296
    }
}

export function shuffle<A>(deck: A[], seed: number): A[] {
    const rand = mulberry32(seed)
    const newRand = (max: number) => Math.floor(rand() * max)
    const list = [...deck]
    let lastIndex = deck.length - 1

    while (lastIndex > 0) {
        const randIndex = newRand(lastIndex)
        const lastIndexElem = list[lastIndex]
        if (lastIndex < list.length && randIndex < list.length) {
            list[lastIndex] = list[randIndex]
            list[randIndex] = lastIndexElem
            lastIndex--
        }
    }
    return list
}