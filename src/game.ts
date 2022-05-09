import { Maybe } from '../maybe'
import {
    Card, CardSlot, conf, Dimensions, EligibleSlot, EventFn, Hand, IdFunction,
    newRectangle, NextFn, Point, Rectangle, RenderFn, SlotFn, slotRectangle, State, UpdateSlotFn
} from './state'
import { pipe, removeTop, topN, _top } from './utility'
import { SlotDataFn, LazyCardSlot } from './state';

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
    return {...state, cardSize: card}
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
        state.hand.fold(0)(hand => overlappingArea(hand.cards, slot))

    return {...state, eligibleSlots: [
        {
            overlappingArea: calculateOverlappingArea(state, state.target1),
            slot: (state:State) => state.target1,
            update: updateTarget1,
            addCard: addCardToSlot(updateTarget1, (state:State) => state.target1)
        },
        {
            overlappingArea: calculateOverlappingArea(state, state.target2),
            slot: (state:State) => state.target2,
            update: updateTarget2,
            addCard: addCardToSlot(updateTarget2, (state:State) => state.target2)
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
        const addCardToSlot = Maybe.from((slot.overlappingArea === 0)? null : slot.addCard)
        const newHand:Hand = {...hand, addCardToSlot}
        return {...state, hand: Maybe.just(newHand)}
    }
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

export function pickUpCardFromWastePile(event:MouseEvent):EventFn {
    return (state:State):State => {
        const cards = [...state.wastePile.cards]
        const card = cards.pop()
        if (card === undefined) return state
        const wastePile:CardSlot = {...state.wastePile, cards}
        const newHand:Hand = {
            startX: event.screenX,
            startY: event.screenY,
            cards: card,
            highlight:false,
            returnCard: addCardToWastePile,
            addCardToSlot: Maybe.nothing()
        }
        const hand = Maybe.from(newHand)
        return {...state, wastePile, hand}
    }
}

export function removeTopCardsFromSlot(lazySlot:LazyCardSlot, number:number) {
    return lazySlot.update(slot => {
        return {cards: removeTop(slot.cards, number)}
    })
}

export function pickUpCardsFactory(lazySlot:LazyCardSlot) {
    return (event:MouseEvent) => (state:State):State => {
        const slot = lazySlot.data(state)
        const cards = topN(slot.cards, 1)
        return cards.fold(state)(cards => {
            return pipe(state)
            .pipe(updateHand(() => Maybe.just({
                startX: event.screenX,
                startY: event.screenY,
                cards,
                highlight:false,
                returnCard: addCardToSlot(lazySlot.update, lazySlot.data),
                addCardToSlot: Maybe.nothing()
            })))
            .pipe(removeTopCardsFromSlot(lazySlot, 1))
            .run()
        })
    }
}

export function pickUpCardFromTarget1(event:MouseEvent):EventFn {
    return (state:State):State => {
        const cards = [...state.target1.cards]
        const card = cards.pop()
        if (card === undefined) return state
        const newHand:Hand = {
            startX: event.screenX,
            startY: event.screenY,
            cards: card,
            highlight:false,
            returnCard: addCardToSlot(updateTarget1, (state:State) => state.target1),
            addCardToSlot: Maybe.nothing()
        }
        return pipe(state)
            .pipe(updateHand(() => Maybe.just(newHand)))
            .pipe(updateTarget1(() => ({cards: cards})))
            .run()
    }
}

export function addCardToTarget1(state:State):State {
    const updateCardPosition = updatePosition(state.target1)
    return state.hand.cata(
        () => state,
        hand => pipe(state)
        .pipe(updateHand(() => Maybe.nothing()))
        .pipe(updateTarget1(slot => ({cards: [...slot.cards, updateCardPosition(hand.cards)]})))
        .run()
    )
}

export function addCardToTarget2(state:State):State {
    const updateCardPosition = updatePosition(state.target2)
    return state.hand.cata(
        () => state,
        hand => pipe(state)
        .pipe(updateHand(() => Maybe.nothing()))
        .pipe(updateTarget2(slot => ({cards: [...slot.cards, updateCardPosition(hand.cards)]})))
        .run()
    )
}

export function addCardToSlot(updateSlot:UpdateSlotFn, slot:SlotFn) {
    return function (state:State):State {
        const updateCardPosition = updatePosition(slot(state))
        return state.hand.cata(
            () => state,
            hand => pipe(state)
            .pipe(updateHand(() => Maybe.nothing()))
            .pipe(updateSlot(slot => ({cards: [...slot.cards, updateCardPosition(hand.cards)]})))
            .run()
        )
    }
}

export function updateHand(fn:IdFunction<Maybe<Hand>>):IdFunction<State> {
    return function (state:State):State {
        return {...state, hand: fn(state.hand)}
    }
}

export function updateTarget1(fn:(slot:CardSlot)=>Partial<CardSlot>):IdFunction<State> {
    return function (state:State):State {
        return {...state, target1: {...state.target1, ...fn(state.target1)}}
    }
}

export function updateTarget2(fn:(slot:CardSlot)=>Partial<CardSlot>):IdFunction<State> {
    return function (state:State):State {
        return {...state, target2: {...state.target2, ...fn(state.target2)}}
    }
}

export function setCard(state:State):State {
    return state.hand.fold(state)(hand => {
        return hand.addCardToSlot.cata(returnCard, addCard)
        function returnCard() {return hand.returnCard(state)}
        function addCard(fn:IdFunction<State>) {return fn(state)}
    })
}

export function moveCard(event:MouseEvent):EventFn {
    return (state:State):State => {
        return state.hand.fold(state)(hand => {
            const point:Point = {
                x: hand.cards.x + (event.screenX - hand.startX),
                y: hand.cards.y + (event.screenY - hand.startY),
            }
            const move = updatePosition(point)
            const newHand:Hand = {
                ...hand,
                cards: move(hand.cards),
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

export function addCardToWastePile(state:State):State {
    return state.hand.fold(state)(hand => {
        const pushCard = updateWastePile(data => {
            const updateCardPosition = updatePosition(state.wastePile)
            const card = updateCardPosition(hand.cards)
            return {cards: data.cards.concat([card])}
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
        const area1 = Math.abs(rect1.a.x - rect1.b.x) * Math.abs(rect1.a.y - rect1.b.y)
        const area2 = Math.abs(rect2.a.x - rect2.b.x) * Math.abs(rect2.a.y - rect2.b.y)

        // Length of intersecting part
        // starts from max(l1[x], l2[x]) of x-coordinate and
        // ends at min(r1[x], r2[x]) x-coordinate
        // by subtracting start from end we get required lengths
        const x_dist = (Math.min(rect1.b.x, rect2.b.x)
            - Math.max(rect1.a.x, rect2.a.x))

        const y_dist = (Math.min(rect1.b.y, rect2.b.y)
            - Math.max(rect1.a.y, rect2.a.y))

        if (x_dist > 0 && y_dist > 0) {
            return (area1 + area2 - (x_dist * y_dist))
        } else {return 0}
    }
}