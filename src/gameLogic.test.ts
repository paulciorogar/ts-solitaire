import { createMock } from 'ts-auto-mock'
import { conf, Hand, State } from './state'
import { nothing } from './maybe'
import { expect } from 'chai'
import { nextStepFn } from './nextStep'
import { GameLogic } from './gameLogic'

const gameLogic = new GameLogic(conf)
const nextStep = nextStepFn(gameLogic)

describe('gameLogic.ts', function () {

    describe('processEvents()', function () {

        it('processes all events in order', function () {
            let firstCall = 1
            let secondCall = 1
            const state = createMock<State>({
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
            })

            const result = nextStep(state)
            expect(result.eventQ).deep.equal([])
            expect(firstCall).lessThan(secondCall)
        })

    })

    describe('containerSize()', function () {

        it('does nothing if body not changed', function () {
            const state = createMock<State>()

            const result = nextStep(state)
            expect(result).equal(state)
        })

        it('updates container size if body changed', function () {
            const state = createMock<State>({
                hand: nothing<Hand>(),
                container: { height: 0, width: 0, x: 0, y: 0 },
                eventQ: [(state) => ({
                    ...state,
                    body: { width: 1000, height: 1111 }
                })]
            })

            const result = nextStep(state)
            expect(result.container).deep.equal({
                width: 920,
                height: 575,
                x: conf.containerMargin,
                y: conf.containerMargin
            })

        })

    })
})