import { CardSlot, CardSlots, conf, Dimensions, EventFn, NextFn, Point, RenderFn, State } from './state'
import { pipe } from './utility'

export class Game {

    private state:State
    private oldState:State

    constructor(
        private window:Window,
        initialState:State,
        private next:NextFn,
        private renderFn:() => RenderFn,
    ) {
        this.state = initialState
        this.oldState = initialState
    }

    run() {
        const render = this.renderFn()
        const step:FrameRequestCallback = t => {
            this.oldState = this.state
            this.state = this.next(this.state)
            render(this.state, this.oldState)
            this.window.requestAnimationFrame(step)
        }
        this.window.requestAnimationFrame(step)
    }

    newEvent(fn:EventFn) {
        const {eventQ} = this.state
        this.oldState = this.state
        this.state = {...this.state, eventQ: [...eventQ, fn]}
    }
}

class NextState {
    constructor(readonly current:State, readonly oldState:State) {}
    map(fn:(current:State, oldState:State)=>State):NextState {
        return new NextState(fn(this.current, this.oldState), this.current)
    }

    result():State {return this.current}
    previous():State {return this.oldState}
}

export function next(state:State):State {
    const data = new NextState(state, state)
    return data.map(processEvents)
        .map(containerSize)
        .map(cardSize)
        .map(cardSlotsPositions)
        .current
}


function processEvents(state:State):State {
    state = state.eventQ.reduce((result, fn) => fn(result), state)
    return {...state, eventQ: []}
}

function containerSize(state:State, oldState:State):State {
    if (state.body === oldState.body) return state
    const {aspectRation} = conf
    const point:Point = {x: conf.containerMargin, y: conf.containerMargin}
    const margin2X = 2 * conf.containerMargin
    const containerAvailableSpace = {
        x: state.body.width - margin2X,
        y: state.body.height - margin2X
    }
    const desiredHeight = (containerAvailableSpace.x * aspectRation.y)/aspectRation.x
    if (desiredHeight <= containerAvailableSpace.y) {
        return {...state, container: {...point, width: containerAvailableSpace.x, height: desiredHeight}}
    }
    const width = (containerAvailableSpace.y * aspectRation.x)/aspectRation.y
    return {...state, container: {...point, width: width, height: containerAvailableSpace.y}}
}

function cardSize(state:State, oldState:State):State {
    if (state.container === oldState.container) return state
    const {cardRatio} = conf
    const availableSpace = state.container.width - (conf.cardMargin * (conf.columns - 2))
    const cardWidth = Math.floor(availableSpace / conf.columns)
    const card = {
        width: cardWidth,
        height: Math.floor((cardWidth * cardRatio.y) / cardRatio.x)
    }
    return {...state, cardSize: card}
}

function cardSlotsPositions(state:State, oldState:State):State {
    if (state.cardSize === oldState.cardSize) return state
    const width = conf.cardMargin + state.cardSize.width
    const height = 2 * conf.cardMargin + state.cardSize.height

    const hand      = updateSlot(state.cardSlots.hand, state.container)
    const wastePile = updateSlot(state.cardSlots.wastePile, {...hand, x: hand.x + width})
    const target1   = updateSlot(state.cardSlots.target1, {...wastePile, x: wastePile.x + 2 * width})
    const target2   = updateSlot(state.cardSlots.target2, {...target1, x: target1.x + width})
    const target3   = updateSlot(state.cardSlots.target3, {...target2, x: target2.x + width})
    const target4   = updateSlot(state.cardSlots.target4, {...target3, x: target3.x + width})
    const packing1  = updateSlot(state.cardSlots.packing1, {...hand, y: hand.y + height})
    const packing2  = updateSlot(state.cardSlots.packing2, {...packing1, x: packing1.x + width})
    const packing3  = updateSlot(state.cardSlots.packing3, {...packing2, x: packing2.x + width})
    const packing4  = updateSlot(state.cardSlots.packing4, {...packing3, x: packing3.x + width})
    const packing5  = updateSlot(state.cardSlots.packing5, {...packing4, x: packing4.x + width})
    const packing6  = updateSlot(state.cardSlots.packing6, {...packing5, x: packing5.x + width})
    const packing7  = updateSlot(state.cardSlots.packing7, {...packing6, x: packing6.x + width})

    const cardSlots:CardSlots = {
        hand, wastePile, target1, target2, target3, target4,
        packing1, packing2, packing3, packing4, packing5, packing6, packing7
    }

    return {...state, cardSlots: cardSlots}

    function updateSlot(slot:CardSlot, position:Point):CardSlot {
        return pipe(slot)
        .pipe(updateSize(state.cardSize))
        .pipe(updatePosition(position))
        .run()
    }

    function updateSize(val:Dimensions) {
        return function<A extends Dimensions>(data:A):A {
            return {...data, height: val.height, width: val.width}
        }
    }

    function updatePosition(val:Point) {
        return function<A extends Point>(data:A):A {
            return {...data, x: val.x, y: val.y}
        }
    }
}
