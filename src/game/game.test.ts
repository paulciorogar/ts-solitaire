import sinon from 'ts-sinon'
import { expect } from 'chai'
import * as Utility from '../utility'
import * as Game from './game'

describe('game.ts', function () {
    // describe('newGame()', function () {
    //     it('generates state for a new game', function () {
    //         const gameState: Game.State = Game.newGame()
    //     })
    // })

    describe('generateSuite()', function () {
        it('returns a list of cards 1 - 13 all the same suite', function () {
            const result: Game.Card[] = Game.generateSuite("♠")
            expect(result.length).equal(13)
            result.forEach(card => expect(card.suit).equals('♠'))
        })
    })

    describe('newCardDeck()', function () {
        it('returns a shuffled list of cards', function () {
            // const cardList: Card[] = []
            const shuffle = sinon.stub()
            const generateSuite = sinon.stub()

            const result: Game.Card[] = Game.newCardDeck(shuffle, generateSuite, 1)
            expect(result.length).equal(13)
            result.forEach(card => expect(card.suit).equals('♠'))
        })
    })
})