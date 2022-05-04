
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

export type NextFn = (state:State) => State
export type RenderFn = (state:State, oldState:State) => void
export type EventFn = (state:State) => State
export type PickUpCardFn = (event:MouseEvent) => void
export type MoveCardFn = (event:MouseEvent)=>void

export type Dimensions = {readonly width:number, readonly height:number}
export type Point = {readonly x:number, readonly y:number }

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
export type CardSlot = Dimensions & Point & CardStack
export type Hand = {
    startX:number,
    startY:number,
    card:Card,
    setCard:EventFn
}

export type State = {
    readonly hand:Hand|undefined
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
    return {
        hand: undefined,
        eventQ: [],
        body:       {width: 0, height: 0},
        container:  {width: 0, height: 0, x: 0, y: 0},
        cardSize:   {width: 0, height: 0},
        sourcePile: {width: 0, height: 0, x: 0, y: 0, cards: [...cardDeck]},
        wastePile:  {width: 0, height: 0, x: 0, y: 0, cards: []},
        target1:    {width: 0, height: 0, x: 0, y: 0, cards: []},
        target2:    {width: 0, height: 0, x: 0, y: 0, cards: []},
        target3:    {width: 0, height: 0, x: 0, y: 0, cards: []},
        target4:    {width: 0, height: 0, x: 0, y: 0, cards: []},
        packing1:   {width: 0, height: 0, x: 0, y: 0, cards: []},
        packing2:   {width: 0, height: 0, x: 0, y: 0, cards: []},
        packing3:   {width: 0, height: 0, x: 0, y: 0, cards: []},
        packing4:   {width: 0, height: 0, x: 0, y: 0, cards: []},
        packing5:   {width: 0, height: 0, x: 0, y: 0, cards: []},
        packing6:   {width: 0, height: 0, x: 0, y: 0, cards: []},
        packing7:   {width: 0, height: 0, x: 0, y: 0, cards: []},
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