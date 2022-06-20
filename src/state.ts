import { Maybe, nothing } from './maybe'
import { addCardsToWastePile, addCardToFn, flipCard, lazyTarget1, lazyTarget2, lazyTarget3, lazyTarget4 } from './game'
import { shuffle, topN, removeTop } from './utility'

export type Configuration = {
    readonly backgroundColor: string
    readonly cardSlotBackgroundColor: string
    readonly cardSlotBorderColor: string
    readonly blackSuitColor: string
    readonly redSuitColor: string
    readonly cardRatio: { x: number, y: number }
    readonly cardMargin: number
    readonly columns: number
    readonly containerMargin: number
    readonly aspectRation: { x: number, y: number }
    readonly cardStackOffset: number
}

export const conf: Configuration = {
    backgroundColor: '#000000',
    cardSlotBackgroundColor: '#201d36',
    cardSlotBorderColor: '#3d3861',
    blackSuitColor: '#4488df',
    // redSuitColor: '#df4444',
    redSuitColor: '#cbcbcb',
    cardRatio: { x: 63, y: 88 },
    cardMargin: 10,
    columns: 7,
    containerMargin: 40,
    aspectRation: { x: 16, y: 10 },
    cardStackOffset: 0.15,
}

const cardNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const

export function NO_OP() { }
export const Fn: IdFunction<any> = (data) => data

export type IdFunction<A> = (data: A) => A
export type NextStepFn = IdFunction<State>
export type RenderFn = (state: State, oldState: State) => void
export type EventFn = IdFunction<State>
export type NewEventFn = (fn: EventFn) => void
export type AddCardsToSlotFn = (lazySlot: LazyCardSlot) => IdFunction<State>
export type PickUpCardFn = (event: MouseEvent) => void
export type CardDataFn = (state: State) => Maybe<Card>
export type SlotDataFn = (state: State) => CardSlot
export type MoveCardFn = (event: MouseEvent) => void
export type UpdateSlotFn = (fn: (slot: CardSlot, state: State) => Partial<CardSlot> | void) => IdFunction<State>
export type UpdateCardsPosition = (slot: CardSlot) => (card: Card, index: number) => Card
export type SlotFn = (state: State) => CardSlot

export type Dimensions = { readonly width: number, readonly height: number }
export type Point = { readonly x: number, readonly y: number }
export type Rectangle = { a: Point, b: Point }

export type Orientation = 'up' | 'down'
export type Spade = '\u2660'
export type Club = '\u2663'
export type Heart = '\u2665'
export type Diamond = '\u2666'
export type Suit = Club | Spade | Heart | Diamond
export type CardNumber = typeof cardNumbers[number]
export type Card = {
    readonly orientation: Orientation
    readonly suit: Suit
    readonly number: CardNumber
} & Point
export type CardStack = { cards: ReadonlyArray<Card> }
export type CardSlot = Dimensions & Point & CardStack & {
    addCard: IdFunction<State>
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
    startX: number
    startY: number
    cards: ReadonlyArray<Card>
    hoveringSlot: Maybe<LazyCardSlot>
    returnCard: EventFn
    addCardToSlot: Maybe<IdFunction<State>>
}



export type State = {
    readonly running: boolean
    readonly eligibleSlots: ReadonlyArray<EligibleSlot>
    readonly hand: Maybe<Hand>
    readonly eventQ: ReadonlyArray<EventFn>
    readonly body: Dimensions
    readonly container: Dimensions & Point
    readonly cardSize: Dimensions
    readonly cardOffsetSize: number
    readonly sourcePile: CardSlot
    readonly wastePile: CardSlot
    readonly target1: CardSlot
    readonly target2: CardSlot
    readonly target3: CardSlot
    readonly target4: CardSlot
    readonly packing1: CardSlot
    readonly packing2: CardSlot
    readonly packing3: CardSlot
    readonly packing4: CardSlot
    readonly packing5: CardSlot
    readonly packing6: CardSlot
    readonly packing7: CardSlot
}

export type GameLogicFn = (state: State, oldState: State) => State
export interface GameLogicInterface {
    processEvents: GameLogicFn
    containerSize: GameLogicFn
    cardSize: GameLogicFn
    cardSlotsPositions: GameLogicFn
    flipSlotCards: GameLogicFn
    eligibleSlots: GameLogicFn
    targetSlot: GameLogicFn
}


export class NextState {
    constructor(readonly current: State, readonly oldState: State) { }
    map(fn: (current: State, oldState: State) => State): NextState {
        return new NextState(fn(this.current, this.oldState), this.oldState)
    }

    result(): State { return this.current }
    previous(): State { return this.oldState }
}

export function newState(): State {
    let cardDeck = newCardDeck(1)

    const pack1 = topN(cardDeck, 1).map(flipCard)
    cardDeck = removeTop(cardDeck, 1)

    const pack2 = topN(cardDeck, 2).map(flipCard)
    cardDeck = removeTop(cardDeck, 2)

    const pack3 = topN(cardDeck, 3).map(flipCard)
    cardDeck = removeTop(cardDeck, 3)

    const pack4 = topN(cardDeck, 4).map(flipCard)
    cardDeck = removeTop(cardDeck, 4)

    const pack5 = topN(cardDeck, 5).map(flipCard)
    cardDeck = removeTop(cardDeck, 5)

    const pack6 = topN(cardDeck, 6).map(flipCard)
    cardDeck = removeTop(cardDeck, 6)

    const pack7 = topN(cardDeck, 7).map(flipCard)
    cardDeck = removeTop(cardDeck, 7)

    const point = { x: 0, y: 0 }
    const size = { width: 0, height: 0 }
    const rectangle = newRectangle(point, size) // TODO: remove
    return {
        running: false,
        eligibleSlots: [],
        hand: nothing(),
        eventQ: [],
        body: size,
        cardSize: size,
        cardOffsetSize: 0,
        container: { ...size, ...point },
        sourcePile: { ...size, ...point, addCard: Fn, cards: cardDeck },
        wastePile: { ...size, ...point, addCard: addCardsToWastePile, cards: [] },
        target1: { ...size, ...point, addCard: addCardToFn(lazyTarget1), cards: [] },
        target2: { ...size, ...point, addCard: addCardToFn(lazyTarget2), cards: [] },
        target3: { ...size, ...point, addCard: addCardToFn(lazyTarget3), cards: [] },
        target4: { ...size, ...point, addCard: addCardToFn(lazyTarget4), cards: [] },
        packing1: { ...size, ...point, addCard: Fn, cards: pack1 },
        packing2: { ...size, ...point, addCard: Fn, cards: pack2 },
        packing3: { ...size, ...point, addCard: Fn, cards: pack3 },
        packing4: { ...size, ...point, addCard: Fn, cards: pack4 },
        packing5: { ...size, ...point, addCard: Fn, cards: pack5 },
        packing6: { ...size, ...point, addCard: Fn, cards: pack6 },
        packing7: { ...size, ...point, addCard: Fn, cards: pack7 },
    }
}

export function slotRectangle(slot: CardSlot): Rectangle {
    return newRectangle(slot, slot)
}

export function newRectangle(origin: Point, size: Dimensions): Rectangle {
    return {
        a: origin,
        b: { x: origin.x + size.width, y: origin.y + size.height }
    }
}

export function newCardDeck(game: number): Card[] {
    return shuffle([
        ...generateSuite('♠'),
        ...generateSuite('♣'),
        ...generateSuite('♥'),
        ...generateSuite('♦'),
    ], game)

    function generateSuite(suit: Suit): Card[] {
        return cardNumbers.map(num => ({
            number: num,
            orientation: 'up',
            suit: suit,
            x: 0, y: 0
        }))
    }
}