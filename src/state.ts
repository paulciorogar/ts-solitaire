import { Maybe } from '../maybe'

export const conf = Object.freeze({
    backgroundColor: '#000000',
    cardSlotBackgroundColor: '#201d36',
    blackSuitColor: '#4488df',
    redSuitColor: '#df4444',
    cardRatio: {x: 63, y:88},
    cardMargin: 10,
    columns: 7,
    containerMargin: 40,
    aspectRation: {x: 16, y: 10},
})

const cardNumbers = [1,2,3,4,5,6,7,8,9,10,11,12,13] as const

export function NO_OP() {}
export const id:IdFunction<any> = (data) => data

export type IdFunction<A> = (data:A) => A
export type NextFn = IdFunction<State>
export type RenderFn = (state:State, oldState:State) => void
export type EventFn = IdFunction<State>
export type PickUpCardFn = (event:MouseEvent) => void
export type MoveCardFn = (event:MouseEvent)=>void

export type Dimensions = {readonly width:number, readonly height:number}
export type Point = {readonly x:number, readonly y:number }
export type Rectangle = {a:Point, b:Point, c:Point, d:Point}

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
export type CardSlot = Dimensions & Point & CardStack & {rectangle:Rectangle}
export type Hand = {
    startX:number
    startY:number
    card:Card
    returnCard:EventFn
    setCard:Maybe<EventFn>
}

export type UpdateSlotFn = (state:State, slot:CardSlot)=>State
export type AvailableSlot = {slot:CardSlot, addCard:EventFn}
export type AvailableSlots = ReadonlyArray<AvailableSlot>

export type State = {
    readonly availableSlots:AvailableSlots
    readonly hand:Maybe<Hand>
    readonly eventQ:ReadonlyArray<EventFn>
    readonly body: Dimensions
    readonly container: Dimensions & Point
    readonly cardSize: Dimensions
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
    const point = {x: 0, y: 0}
    const size = {width: 0, height: 0}
    const rectangle = newRectangle(point, size)
    return {
        availableSlots: [],
        hand: Maybe.nothing(),
        eventQ: [],
        body:       size,
        container:  {...size, ...point},
        cardSize:   size,
        sourcePile: {...size, ...point, rectangle: rectangle, cards: [...cardDeck]},
        wastePile:  {...size, ...point, rectangle: rectangle, cards: []},
        target1:    {...size, ...point, rectangle: rectangle, cards: []},
        target2:    {...size, ...point, rectangle: rectangle, cards: []},
        target3:    {...size, ...point, rectangle: rectangle, cards: []},
        target4:    {...size, ...point, rectangle: rectangle, cards: []},
        packing1:   {...size, ...point, rectangle: rectangle, cards: []},
        packing2:   {...size, ...point, rectangle: rectangle, cards: []},
        packing3:   {...size, ...point, rectangle: rectangle, cards: []},
        packing4:   {...size, ...point, rectangle: rectangle, cards: []},
        packing5:   {...size, ...point, rectangle: rectangle, cards: []},
        packing6:   {...size, ...point, rectangle: rectangle, cards: []},
        packing7:   {...size, ...point, rectangle: rectangle, cards: []},
    }
}

export function newRectangle(origin:Point, size:Dimensions):Rectangle {
    return {
        a: origin,
        b: {x: origin.x + size.width, y: origin.y},
        c: {x: origin.x + size.width, y: origin.y + size.height},
        d: {x: origin.x, y: origin.y + size.height},
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