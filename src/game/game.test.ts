import { expect } from 'chai'
import { ShuffleFn } from '../utility'
import * as Game from './game'

describe('game.ts', function () {
    describe('newGame()', function () {
        it('generates state for a new game', function () {
            const gameState: Game.State = Game.newGame()
        })
    })

    describe('generateSuite()', function () {
        it('returns a list of cards 1 - 13 all the same suite', function () {
            const result: Game.Card[] = Game.generateSuite("♠")
            expect(result.length).equal(13)
            result.forEach(card => expect(card.suit).equals('♠'))
        })
    })

    describe('newCardDeck()', function () {
        it('returns a shuffled list of cards', function () {
            const cardList: Card[] = []
            const shuffle: ShuffleFn = (list, seed) => { list }
            const generateSuite: Game.GenerateSuiteFn = (suite) =>
            const result: Game.Card[] = Game.newCardDeck(shuffle,)
                expect(result.length).equal(13)
                result.forEach(card => expect(card.suit).equals('♠'))
            })
    })
})