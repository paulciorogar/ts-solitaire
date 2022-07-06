import { expect } from 'chai'
import { nextStep } from './game'
import { nothing } from './maybe'
import { conf, Hand, State } from './state'

describe('next()', function () {
    it('processes all events in order', function () {
        const state = createMock<State>({
            hand: nothing<Hand>(),
            cardOffsetSize: 111,
            eventQ: [
                (state) => ({ ...state, cardOffsetSize: state.cardOffsetSize + 1 }),
                (state) => ({ ...state, cardOffsetSize: state.cardOffsetSize + 2 })
            ]
        })

        const result = nextStep(state)
        expect(result.eventQ).deep.equal([])
        expect(result.cardOffsetSize).equal(114)
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

    it('updates card size if container changed', function () {
        const state = createMock<State>({
            hand: nothing<Hand>(),
            container: { height: 0, width: 0, x: 0, y: 0 },
            cardSize: { height: 0, width: 0 },
            eventQ: [(state) => ({
                ...state,
                container: { height: 500, width: 920, x: 40, y: 40 }
            })]
        })

        const result = nextStep(state)
        expect(result.cardSize).deep.equal({
            height: 173,
            width: 124
        })

    })
})