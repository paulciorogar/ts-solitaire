import { Maybe } from '../maybe'
import {
    Card, CardSlot, conf, Dimensions, EligibleSlot, EventFn,
    Hand, IdFunction, LazyCardSlot, newRectangle, NextFn, Point,
    Rectangle, RenderFn, slotRectangle, State
} from './state'
import { peek, pipe, removeTop, topN } from './utility'

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
        .map(eligibleSlots)
        .map(targetSlot)
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
    const cardOffsetSize = Math.ceil(card.height * conf.cardStackOffset)
    return {...state, cardSize: card, cardOffsetSize}
}

function cardSlotsPositions(state:State, oldState:State):State {
    if (state.cardSize === oldState.cardSize) return state
    const width = conf.cardMargin + state.cardSize.width
    const height = 2 * conf.cardMargin + state.cardSize.height

    const sourcePile    = updateSlot(state.sourcePile, state.container)
    const wastePile     = updateSlot(state.wastePile, {...sourcePile, x: sourcePile.x + width})
    const target1       = updateSlot(state.target1, {...wastePile, x: wastePile.x + 2 * width})
    const target2       = updateSlot(state.target2, {...target1, x: target1.x + width})
    const target3       = updateSlot(state.target3, {...target2, x: target2.x + width})
    const target4       = updateSlot(state.target4, {...target3, x: target3.x + width})
    const packing1      = updateSlot(state.packing1, {...sourcePile, y: sourcePile.y + height})
    const packing2      = updateSlot(state.packing2, {...packing1, x: packing1.x + width})
    const packing3      = updateSlot(state.packing3, {...packing2, x: packing2.x + width})
    const packing4      = updateSlot(state.packing4, {...packing3, x: packing3.x + width})
    const packing5      = updateSlot(state.packing5, {...packing4, x: packing4.x + width})
    const packing6      = updateSlot(state.packing6, {...packing5, x: packing5.x + width})
    const packing7      = updateSlot(state.packing7, {...packing6, x: packing6.x + width})

    return {...state, sourcePile, wastePile, target1, target2, target3, target4,
        packing1, packing2, packing3, packing4, packing5, packing6, packing7
    }

    function updateSlot(slot:CardSlot, position:Point):CardSlot {
        return pipe(slot)
        .pipe(updateSize(state.cardSize))
        .pipe(updatePosition(position))
        .pipe(updateCards)
        .run()

        function updateCards(data:CardSlot):CardSlot {
            const update = updatePosition(data)
            const cards = data.cards.map(update)
            return {...data, cards: cards}
        }
    }
}

function eligibleSlots(state:State):State {
    const overlappingArea = (card:Card, slot:CardSlot) => {
        const rect1 = newRectangle(card, state.cardSize)
        const rect2 = slotRectangle(slot)
        return shape.overlappingArea(rect1, rect2)
    }
    const calculateOverlappingArea = (state:State, slot:CardSlot) =>
        state.hand.fold(0)(hand => {
            const [first] = hand.cards
            return first? overlappingArea(first, slot) : 0
        })
    const calculateOverlappingAreaWithOffset = (state:State, slot:CardSlot) => {
        const {cardOffsetSize} = state
        const height = state.cardSize.height + slot.cards.length * cardOffsetSize
        const adjustSize = updateSize({width: state.cardSize.width, height})
        return state.hand.fold(0)(hand => {
            const [first] = hand.cards
            return first? overlappingArea(first, adjustSize(slot)) : 0
        })
    }

    return {...state, eligibleSlots: [
        {
            ...lazyTarget1,
            overlappingArea: calculateOverlappingArea(state, state.target1),
            addCard: addCardsToSlot(lazyTarget1)
        },
        {
            ...lazyTarget2,
            overlappingArea: calculateOverlappingArea(state, state.target2),
            addCard: addCardsToSlot(lazyTarget2)
        },
        {
            ...lazyTarget3,
            overlappingArea: calculateOverlappingArea(state, state.target3),
            addCard: addCardsToSlot(lazyTarget3)
        },
        {
            ...lazyTarget4,
            overlappingArea: calculateOverlappingArea(state, state.target4),
            addCard: addCardsToSlot(lazyTarget4)
        },
        {
            ...lazyPacking1,
            overlappingArea: calculateOverlappingAreaWithOffset(state, state.packing1),
            addCard: addCardsToPackingSlot(lazyPacking1)
        },
        {
            ...lazyPacking2,
            overlappingArea: calculateOverlappingArea(state, state.packing2),
            addCard: addCardsToSlot(lazyPacking2)
        },
        {
            ...lazyPacking3,
            overlappingArea: calculateOverlappingArea(state, state.packing3),
            addCard: addCardsToSlot(lazyPacking3)
        },
        {
            ...lazyPacking4,
            overlappingArea: calculateOverlappingArea(state, state.packing4),
            addCard: addCardsToSlot(lazyPacking4)
        },
        {
            ...lazyPacking5,
            overlappingArea: calculateOverlappingArea(state, state.packing5),
            addCard: addCardsToSlot(lazyPacking5)
        },
        {
            ...lazyPacking6,
            overlappingArea: calculateOverlappingArea(state, state.packing6),
            addCard: addCardsToSlot(lazyPacking6)
        },
        {
            ...lazyPacking7,
            overlappingArea: calculateOverlappingArea(state, state.packing7),
            addCard: addCardsToSlot(lazyPacking7)
        }
    ]}
}

function targetSlot(state:State):State {
    return state.hand.cata(clear, findTargetSlot)

    function clear() { return state }

    function findTargetSlot(hand:Hand):State {
        const byArea = (result:EligibleSlot, data:EligibleSlot) => {
            return data.overlappingArea > result.overlappingArea ? data : result
        }
        const slot = state.eligibleSlots.reduce(byArea)
        if (slot.overlappingArea === 0) {
            return hand.hoveringSlot.fold(state)(() => {
                const addCardToSlot = Maybe.nothing<IdFunction<State>>()
                const hoveringSlot = Maybe.nothing<LazyCardSlot>()
                const newHand:Hand = {...hand, addCardToSlot, hoveringSlot}
                return {...state, hand: Maybe.just(newHand)}
            })
        } else {
            const addCardToSlot = Maybe.just(slot.addCard)
            const hoveringSlot = Maybe.just(slot)
            const newHand:Hand = {...hand, addCardToSlot, hoveringSlot}
            return {...state, hand: Maybe.just(newHand)}
        }
    }
}

function updateSize(val:Dimensions) {
    return function<A extends Dimensions>(data:A):A {
        return {...data, height: val.height, width: val.width}
    }
}

export function updatePosition(val:Point) {
    return function<A extends Point>(data:A):A {
        return {...data, x: val.x, y: val.y}
    }
}

export function addOffsetY(offset:number) {
    return <A extends Point>(data:A):A => ({...data, y: data.y + offset})
}

export function removeTopCardsFromSlot(lazySlot:LazyCardSlot, number:number) {
    return lazySlot.update(slot => {
        return {cards: removeTop(slot.cards, number)}
    })
}

export function addCardToFn(lazySlot:LazyCardSlot) {
    return (state:State):State => {
        const updateCardPosition = updatePosition(lazySlot.data(state))
        return state.hand.fold(state)(hand => pipe(state)
            .pipe(updateHand(() => Maybe.nothing()))
            .pipe(lazySlot.update(slot => {
                return {cards: [...slot.cards, ...hand.cards.map(updateCardPosition)]}
            }))
            .run()
        )
    }
}

export function addCardsToSlot(lazySlot:LazyCardSlot) {
    return function (state:State):State {
        const updateCardPosition = updatePosition(lazySlot.data(state))
        return state.hand.fold(state)(hand => pipe(state)
            .pipe(updateHand(() => Maybe.nothing()))
            .pipe(lazySlot.update(slot => {
                return {cards: slot.cards.concat(hand.cards.map(updateCardPosition))}
            }))
            .run()
        )
    }
}

export function addCardsToPackingSlot(lazySlot:LazyCardSlot) {
    return function (state:State):State {
        const updateCardPosition = (slot:CardSlot) => ((card:Card, index:number) => {
            const offset = addOffsetY((slot.cards.length + index) * state.cardOffsetSize)
            const update = updatePosition(offset(slot))
            return update(card)
        })
        return state.hand.fold(state)(hand => pipe(state)
            .pipe(updateHand(() => Maybe.nothing()))
            .pipe(lazySlot.update(slot => {
                const update = updateCardPosition(slot)
                return {cards: slot.cards.concat(hand.cards.map(update))}
            }))
            .run()
        )
    }
}

export function updateHand(fn:IdFunction<Maybe<Hand>>):IdFunction<State> {
    return function (state:State):State {
        return {...state, hand: fn(state.hand)}
    }
}

export const lazyWastePile:LazyCardSlot = {
    data: (state:State) => state.wastePile,
    update: (fn:(slot:CardSlot)=>Partial<CardSlot>) => (state:State):State => {
        return {...state, wastePile: {...state.wastePile, ...fn(state.wastePile)}}
    }
}

export const lazyTarget1:LazyCardSlot = {
    data: (state:State) => state.target1,
    update: (fn:(slot:CardSlot)=>Partial<CardSlot>) => (state:State):State => {
        return {...state, target1: {...state.target1, ...fn(state.target1)}}
    }
}

export const lazyTarget2:LazyCardSlot = {
    data: (state:State) => state.target2,
    update: (fn:(slot:CardSlot)=>Partial<CardSlot>) => (state:State):State => {
        return {...state, target2: {...state.target2, ...fn(state.target2)}}
    }
}

export const lazyTarget3:LazyCardSlot = {
    data: (state:State) => state.target3,
    update: (fn:(slot:CardSlot)=>Partial<CardSlot>) => (state:State):State => {
        return {...state, target3: {...state.target3, ...fn(state.target3)}}
    }
}

export const lazyTarget4:LazyCardSlot = {
    data: (state:State) => state.target4,
    update: (fn:(slot:CardSlot)=>Partial<CardSlot>) => (state:State):State => {
        return {...state, target4: {...state.target4, ...fn(state.target4)}}
    }
}

export const lazyPacking1:LazyCardSlot = {
    data: (state:State) => state.packing1,
    update: (fn:(slot:CardSlot)=>Partial<CardSlot>) => (state:State):State => {
        return {...state, packing1: {...state.packing1, ...fn(state.packing1)}}
    }
}

export const lazyPacking2:LazyCardSlot = {
    data: (state:State) => state.packing2,
    update: (fn:(slot:CardSlot)=>Partial<CardSlot>) => (state:State):State => {
        return {...state, packing2: {...state.packing2, ...fn(state.packing2)}}
    }
}

export const lazyPacking3:LazyCardSlot = {
    data: (state:State) => state.packing3,
    update: (fn:(slot:CardSlot)=>Partial<CardSlot>) => (state:State):State => {
        return {...state, packing3: {...state.packing3, ...fn(state.packing3)}}
    }
}

export const lazyPacking4:LazyCardSlot = {
    data: (state:State) => state.packing4,
    update: (fn:(slot:CardSlot)=>Partial<CardSlot>) => (state:State):State => {
        return {...state, packing4: {...state.packing4, ...fn(state.packing4)}}
    }
}

export const lazyPacking5:LazyCardSlot = {
    data: (state:State) => state.packing5,
    update: (fn:(slot:CardSlot)=>Partial<CardSlot>) => (state:State):State => {
        return {...state, packing5: {...state.packing5, ...fn(state.packing5)}}
    }
}

export const lazyPacking6:LazyCardSlot = {
    data: (state:State) => state.packing6,
    update: (fn:(slot:CardSlot)=>Partial<CardSlot>) => (state:State):State => {
        return {...state, packing6: {...state.packing6, ...fn(state.packing6)}}
    }
}

export const lazyPacking7:LazyCardSlot = {
    data: (state:State) => state.packing7,
    update: (fn:(slot:CardSlot)=>Partial<CardSlot>) => (state:State):State => {
        return {...state, packing7: {...state.packing7, ...fn(state.packing7)}}
    }
}

export function setCard(state:State):State {
    return state.hand.fold(state)(hand => {
        return hand.addCardToSlot.cata(returnCard, addCard)
        function returnCard() {return hand.returnCard(state)}
        function addCard(fn:IdFunction<State>) {
            return fn(state)
        }
    })
}

export function moveCard(event:MouseEvent):EventFn {
    return (state:State):State => {
        return state.hand.fold(state)(hand => {
            const [card] = hand.cards
            if (card === undefined) return state
            const point:Point = {
                x: card.x + (event.screenX - hand.startX),
                y: card.y + (event.screenY - hand.startY),
            }
            const move = updatePosition(point)
            const newHand:Hand = {
                ...hand,
                cards: hand.cards.map(move),
                startX: event.screenX,
                startY: event.screenY
            }
            return updateHand(() => Maybe.just(newHand))(state)
        })
    }
}

export function nextCard(state:State):State {
    const handCards = [...state.sourcePile.cards]
    const topCard = handCards.pop()
    const updateWastePilePosition = updatePosition(state.wastePile)
    if (topCard) {
        const nextCard:Card = updateWastePilePosition(topCard)
        const sourcePile:CardSlot = {...state.sourcePile, cards: handCards}
        const wastePileCards = [...state.wastePile.cards, nextCard]
        const wastePile:CardSlot = {...state.wastePile, cards: wastePileCards}
        return {...state, sourcePile: sourcePile, wastePile}
    } else {
        const handCards:Card[] = [...state.wastePile.cards].reverse()
        const sourcePile:CardSlot = {...state.sourcePile, cards: handCards}
        const wastePile:CardSlot = {...state.wastePile, cards: []}
        return {...state, sourcePile: sourcePile, wastePile}
    }
}

export function addCardsToWastePile(state:State):State {
    return state.hand.fold(state)(hand => {
        console.log('addCardsToWastePile')
        const pushCard = updateWastePile(data => {
            const updateCardPosition = updatePosition(state.wastePile)
            const cards = hand.cards.map(updateCardPosition)
            return {cards: data.cards.concat(cards)}
        })
        return pipe(state)
        .pipe(pushCard)
        .pipe(updateHand(() => Maybe.nothing()))
        .run()
    })
}

function updateWastePile(fn:(data:CardSlot)=>Partial<CardSlot>):IdFunction<State> {
    return function(state) {
        const wastePile = {...state.wastePile, ...fn(state.wastePile)}
        return {...state, wastePile}
    }
}

const shape = {
    overlappingArea: function (rect1:Rectangle, rect2:Rectangle):number {
        // Length of intersecting part
        // starts from max(l1[x], l2[x]) of x-coordinate and
        // ends at min(r1[x], r2[x]) x-coordinate
        // by subtracting start from end we get required lengths
        const x_dist = (Math.min(rect1.b.x, rect2.b.x)
            - Math.max(rect1.a.x, rect2.a.x))

        const y_dist = (Math.min(rect1.b.y, rect2.b.y)
            - Math.max(rect1.a.y, rect2.a.y))

        if (x_dist > 0 && y_dist > 0) {
            return x_dist * y_dist
        } else {return 0}
    }
}