import { Maybe } from '../maybe'
import { addCardsToWastePile, addCardToFn, flipCard, lazyTarget1, lazyTarget2, lazyTarget3, lazyTarget4 } from './game'

export const conf = Object.freeze({
    backgroundColor: '#000000',
    cardSlotBackgroundColor: '#201d36',
    cardSlotBorderColor: '#3d3861',
    blackSuitColor: '#4488df',
    // redSuitColor: '#df4444',
    redSuitColor: '#cbcbcb',
    cardRatio: {x: 63, y:88},
    cardMargin: 10,
    columns: 7,
    containerMargin: 40,
    aspectRation: {x: 16, y: 10},
    cardStackOffset: 0.15,
})

const cardNumbers = [1,2,3,4,5,6,7,8,9,10,11,12,13] as const

export function NO_OP() {}
export const Fn:IdFunction<any> = (data) => data

export type IdFunction<A> = (data:A) => A
export type NextFn = IdFunction<State>
export type RenderFn = (state:State, oldState:State) => void
export type EventFn = IdFunction<State>
export type NewEventFn = (fn:EventFn)=>void
export type AddCardsToSlotFn = (lazySlot:LazyCardSlot) => IdFunction<State>
export type PickUpCardFn = (event:MouseEvent) => void
export type CardDataFn = (state:State) => Maybe<Card>
export type SlotDataFn = (state:State) => CardSlot
export type MoveCardFn = (event:MouseEvent)=>void
export type UpdateSlotFn = (fn:(slot:CardSlot)=>Partial<CardSlot>|void)=>IdFunction<State>
export type UpdateCardsPosition = (slot:CardSlot) => (card:Card, index:number) => Card
export type SlotFn = (state:State)=>CardSlot

export type Dimensions = {readonly width:number, readonly height:number}
export type Point = {readonly x:number, readonly y:number }
export type Rectangle = {a:Point, b:Point}

export type Orientation = 'up'|'down'
export type Spade = '\u2660'
export type Club = '\u2663'
export type Heart = '\u2665'
export type Diamond = '\u2666'
export type Suit = Club|Spade|Heart|Diamond
export type CardNumber = typeof cardNumbers[number]
export type Card = {
    readonly orientation: Orientation
    readonly suit:Suit
    readonly number:CardNumber
} & Point
export type CardStack = {cards: ReadonlyArray<Card>}
export type CardSlot = Dimensions & Point & CardStack & {
    addCard:IdFunction<State>
}
export type LazyCardSlot = {
    data: SlotFn,
    update: UpdateSlotFn
}
export type EligibleSlot = {
    overlappingArea: number,
    data: SlotFn,
    update: UpdateSlotFn
    addCard: IdFunction<State>
}

export type Hand = {
    startX:number
    startY:number
    cards:ReadonlyArray<Card>
    hoveringSlot:Maybe<LazyCardSlot>
    returnCard:EventFn
    addCardToSlot:Maybe<IdFunction<State>>
}



export type State = {
    readonly eligibleSlots:ReadonlyArray<EligibleSlot>
    readonly hand:Maybe<Hand>
    readonly eventQ:ReadonlyArray<EventFn>
    readonly body: Dimensions
    readonly container: Dimensions & Point
    readonly cardSize: Dimensions
    readonly cardOffsetSize: number
    readonly sourcePile:CardSlot
    readonly wastePile:CardSlot
    readonly target1:CardSlot
    readonly target2:CardSlot
    readonly target3:CardSlot
    readonly target4:CardSlot
    readonly packing1:CardSlot
    readonly packing2:CardSlot
    readonly packing3:CardSlot
    readonly packing4:CardSlot
    readonly packing5:CardSlot
    readonly packing6:CardSlot
    readonly packing7:CardSlot
}

export function newState():State {
    const cardDeck = newCardDeck()
    const sixDown = cardDeck.slice(-7).map(flipCard)
    const source = cardDeck.slice(0, cardDeck.length - 7)
    const point = {x: 0, y: 0}
    const size = {width: 0, height: 0}
    const rectangle = newRectangle(point, size)
    return {
        eligibleSlots: [],
        hand:       Maybe.nothing(),
        eventQ:     [],
        body:       size,
        cardSize:   size,
        cardOffsetSize: 0,
        container:  {...size, ...point},
        sourcePile: {...size, ...point, addCard: Fn, cards: source},
        wastePile:  {...size, ...point, addCard: addCardsToWastePile, cards: []},
        target1:    {...size, ...point, addCard: addCardToFn(lazyTarget1), cards: []},
        target2:    {...size, ...point, addCard: addCardToFn(lazyTarget2), cards: []},
        target3:    {...size, ...point, addCard: addCardToFn(lazyTarget3), cards: []},
        target4:    {...size, ...point, addCard: addCardToFn(lazyTarget4), cards: []},
        packing1:   {...size, ...point, addCard: Fn, cards: []},
        packing2:   {...size, ...point, addCard: Fn, cards: []},
        packing3:   {...size, ...point, addCard: Fn, cards: []},
        packing4:   {...size, ...point, addCard: Fn, cards: []},
        packing5:   {...size, ...point, addCard: Fn, cards: []},
        packing6:   {...size, ...point, addCard: Fn, cards: []},
        packing7:   {...size, ...point, addCard: Fn, cards: sixDown},
    }
}

export function slotRectangle(slot:CardSlot):Rectangle {
    return newRectangle(slot, slot)
}

export function newRectangle(origin:Point, size:Dimensions):Rectangle {
    return {
        a: origin,
        b: {x: origin.x + size.width, y: origin.y + size.height}
    }
}

export function newCardDeck():Card[] {
    return [
        ...generateSuite('♠'),
        ...generateSuite('♣'),
        ...generateSuite('♥'),
        ...generateSuite('♦'),
    ]

    function generateSuite(suit:Suit):Card[] {
        return cardNumbers.map(num => ({
            number: num,
            orientation: 'up',
            suit: suit,
            x: 0, y: 0
        }))
    }
}