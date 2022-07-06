import { expect } from 'chai'
import { GameLogic } from './gameLogic'
import { nothing } from './maybe'
import { nextStepFn } from './nextStep'
import { conf, Hand, newState, State } from './state'

const gameLogic = new GameLogic(conf)
const nextStep = nextStepFn(gameLogic)

describe('gameLogic.ts', function () {

    describe('processEvents()', function () {

        it('processes all events in order', function () {
            let firstCall = 1
            let secondCall = 1
            let state = newState()
            state = {
                ...state,
                hand: nothing<Hand>(),
                eventQ: [
                    (state) => {
                        firstCall += 1
                        return state
                    },
                    (state) => {
                        secondCall = firstCall + 1
                        return state
                    }
                ]
            }

            const result = nextStep(state)
            expect(result.eventQ).deep.equal([])
            expect(firstCall).lessThan(secondCall)
        })

    })

    describe('containerSize()', function () {

        it('does nothing if body not changed', function () {
            const state = newState()

            const result = nextStep(state)
            expect(result).equal(state)
        })

        it('updates container size if body changed', function () {
            let state = newState()
            state = {
                ...state,
                hand: nothing<Hand>(),
                container: { height: 0, width: 0, x: 0, y: 0 },
                eventQ: [(state) => ({
                    ...state,
                    body: { width: 1000, height: 1111 }
                })]
            }

            const result = nextStep(state)
            expect(result.container).deep.equal({
                width: 920,
                height: 575,
                x: conf.containerMargin,
                y: conf.containerMargin
            })
        })

    })

    describe('cardSize()', function () {

        it('does nothing if container not changed', function () {
            const state = newState()

            const result = nextStep(state)
            expect(result).equal(state)
        })

        it('updates card size if container changed', function () {
            let state = newState()
            state = {
                ...state,
                hand: nothing<Hand>(),
                container: { height: 0, width: 0, x: 0, y: 0 },
                eventQ: [(state) => ({
                    ...state,
                    container: { ...state.container, width: 1000, height: 1111 }
                })]
            }

            const result = nextStep(state)
            expect(result.cardSize).deep.equal({ width: 135, height: 188, })
        })

    })

    describe('cardSlotsPositions()', function () {

        it('does nothing if cardSize not changed', function () {
            const state = newState()

            const result = nextStep(state)
            expect(result).equal(state)
        })

        it('updates sourcePile slot positions if cardSize changed', function () {
            let state = newState()
            state = {
                ...state,
                sourcePile: { ...state.sourcePile, cards: [] },
                hand: nothing<Hand>(),
                eventQ: [(state) => ({
                    ...state,
                    cardSize: { width: 1000, height: 1111 }
                })]
            }

            const result = nextStep(state)
            expect(result.sourcePile).deep.equal({ width: 1000, height: 1111, x: 0, y: 0, cards: [] })
        })

        it('updates wastePile slot positions if cardSize changed', function () {
            let state = newState()
            state = {
                ...state,
                hand: nothing<Hand>(),
                eventQ: [(state) => ({
                    ...state,
                    cardSize: { width: 1000, height: 1111 }
                })]
            }

            const result = nextStep(state)
            expect(result.wastePile).deep.equal({ width: 1000, height: 1111, x: 1010, y: 0, cards: [] })
        })

        it('updates target1 slot positions if cardSize changed', function () {
            let state = newState()
            state = {
                ...state,
                hand: nothing<Hand>(),
                eventQ: [(state) => ({
                    ...state,
                    cardSize: { width: 1000, height: 1111 }
                })]
            }

            const result = nextStep(state)
            expect(result.target1).deep.equal({ width: 1000, height: 1111, x: 3030, y: 0, cards: [] })
        })

        it('updates target2 slot positions if cardSize changed', function () {
            let state = newState()
            state = {
                ...state,
                hand: nothing<Hand>(),
                eventQ: [(state) => ({
                    ...state,
                    cardSize: { width: 1000, height: 1111 }
                })]
            }

            const result = nextStep(state)
            expect(result.target2).deep.equal({ width: 1000, height: 1111, x: 4040, y: 0, cards: [] })
        })

        it('updates target3 slot positions if cardSize changed', function () {
            let state = newState()
            state = {
                ...state,
                hand: nothing<Hand>(),
                eventQ: [(state) => ({
                    ...state,
                    cardSize: { width: 1000, height: 1111 }
                })]
            }

            const result = nextStep(state)
            expect(result.target3).deep.equal({ width: 1000, height: 1111, x: 5050, y: 0, cards: [] })
        })

        it('updates target4 slot positions if cardSize changed', function () {
            let state = newState()
            state = {
                ...state,
                hand: nothing<Hand>(),
                eventQ: [(state) => ({
                    ...state,
                    cardSize: { width: 1000, height: 1111 }
                })]
            }

            const result = nextStep(state)
            expect(result.target4).deep.equal({ width: 1000, height: 1111, x: 6060, y: 0, cards: [] })
        })

        it('updates packing1 slot positions if cardSize changed', function () {
            let state = newState()
            state = {
                ...state,
                packing1: { ...state.packing1, cards: [] },
                hand: nothing<Hand>(),
                eventQ: [(state) => ({
                    ...state,
                    cardSize: { width: 1000, height: 1111 }
                })]
            }

            const result = nextStep(state)
            expect(result.packing1).deep.equal({ width: 1000, height: 1111, x: 0, y: 1131, cards: [] })
        })

        it('updates packing2 slot positions if cardSize changed', function () {
            let state = newState()
            state = {
                ...state,
                packing2: { ...state.packing2, cards: [] },
                hand: nothing<Hand>(),
                eventQ: [(state) => ({
                    ...state,
                    cardSize: { width: 1000, height: 1111 }
                })]
            }

            const result = nextStep(state)
            expect(result.packing2).deep.equal({ width: 1000, height: 1111, x: 1010, y: 1131, cards: [] })
        })

        it('updates packing3 slot positions if cardSize changed', function () {
            let state = newState()
            state = {
                ...state,
                packing3: { ...state.packing3, cards: [] },
                hand: nothing<Hand>(),
                eventQ: [(state) => ({
                    ...state,
                    cardSize: { width: 1000, height: 1111 }
                })]
            }

            const result = nextStep(state)
            expect(result.packing3).deep.equal({ width: 1000, height: 1111, x: 2020, y: 1131, cards: [] })
        })

        it('updates packing4 slot positions if cardSize changed', function () {
            let state = newState()
            state = {
                ...state,
                packing4: { ...state.packing4, cards: [] },
                hand: nothing<Hand>(),
                eventQ: [(state) => ({
                    ...state,
                    cardSize: { width: 1000, height: 1111 }
                })]
            }

            const result = nextStep(state)
            expect(result.packing4).deep.equal({ width: 1000, height: 1111, x: 3030, y: 1131, cards: [] })
        })

        it('updates packing5 slot positions if cardSize changed', function () {
            let state = newState()
            state = {
                ...state,
                packing5: { ...state.packing5, cards: [] },
                hand: nothing<Hand>(),
                eventQ: [(state) => ({
                    ...state,
                    cardSize: { width: 1000, height: 1111 }
                })]
            }

            const result = nextStep(state)
            expect(result.packing5).deep.equal({ width: 1000, height: 1111, x: 4040, y: 1131, cards: [] })
        })

        it('updates packing6 slot positions if cardSize changed', function () {
            let state = newState()
            state = {
                ...state,
                packing6: { ...state.packing6, cards: [] },
                hand: nothing<Hand>(),
                eventQ: [(state) => ({
                    ...state,
                    cardSize: { width: 1000, height: 1111 }
                })]
            }

            const result = nextStep(state)
            expect(result.packing6).deep.equal({ width: 1000, height: 1111, x: 5050, y: 1131, cards: [] })
        })

        it('updates packing7 slot positions if cardSize changed', function () {
            let state = newState()
            state = {
                ...state,
                packing7: { ...state.packing7, cards: [] },
                hand: nothing<Hand>(),
                eventQ: [(state) => ({
                    ...state,
                    cardSize: { width: 1000, height: 1111 }
                })]
            }

            const result = nextStep(state)
            expect(result.packing7).deep.equal({ width: 1000, height: 1111, x: 6060, y: 1131, cards: [] })
        })

    })
})