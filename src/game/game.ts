import { ShuffleFn } from '../utility'

const cardNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const
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
}

export type State = {
    sourceStack: ReadonlyArray<Card>
    wasteStack: ReadonlyArray<Card>
}

export function newGame(): State {
    return {
        sourceStack: [],
        wasteStack: []
    }
}

export type NewCardDeckFn = (shuffle: ShuffleFn, generateSuite: GenerateSuiteFn, seed: number) => Card[]

export function newCardDeck(shuffle: ShuffleFn, generateSuite: GenerateSuiteFn, seed: number): Card[] {
    return shuffle([
        ...generateSuite('♠'),
        ...generateSuite('♣'),
        ...generateSuite('♥'),
        ...generateSuite('♦'),
    ], seed)
}

export type GenerateSuiteFn = (suit: Suit) => Card[]
export function generateSuite(suit: Suit): Card[] {
    return cardNumbers.map(num => ({
        number: num,
        orientation: 'up',
        suit: suit,
        x: 0, y: 0
    }))
}