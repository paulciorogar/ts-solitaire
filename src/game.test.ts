import { createMock } from 'ts-auto-mock'
import { _Game } from './game'
import { newState, NextFn, RenderFn, State } from './state'
import { expect } from 'chai'

describe('Game', function () {
    describe('run()', function () {
        const requestAnimationFrameCallbackTimes = (x: number) => (fn: FrameRequestCallback): number => {
            if (x-- > 0) fn(0)
            return x
        }
        let animation: AnimationFrameProvider

        beforeEach(() => {
            animation = createMock<AnimationFrameProvider>({
                requestAnimationFrame: requestAnimationFrameCallbackTimes(3)
            })
        })

        it('starts the game loop', function () {
            const state = newState()
            const next: NextFn = (data) => data
            const render: RenderFn = (current, old) => { }
            let calls = 0
            animation = createMock<AnimationFrameProvider>({
                requestAnimationFrame: (() => {
                    const fn = requestAnimationFrameCallbackTimes(3)
                    return (cb: FrameRequestCallback) => fn(() => cb(calls += 1))
                })()
            })

            const game = new _Game(animation, state, next, render)

            game.run()

            expect(calls).equal(3)
        })

        it('does not start the game loop twice', function () {
            const state = newState()
            const next: NextFn = (data) => data
            const render: RenderFn = (current, old) => { }
            let calls = 0
            animation = createMock<AnimationFrameProvider>({
                requestAnimationFrame: () => calls += 1
            })

            const game = new _Game(animation, state, next, render)

            game.run()
            game.run()

            expect(calls).equal(1)
        })

        it('calls next on each step', function () {
            const initialState = newState()
            const stateAfterFirstNext = newState()
            const stateAfterSecondNext = newState()
            const stateAfterThirdNext = newState()
            const callParams: State[] = []
            const next: NextFn = ((call = 0) => (data) => {
                callParams.push(data)
                call++
                switch (call) {
                    case 1: return stateAfterFirstNext
                    case 2: return stateAfterSecondNext
                    case 3: return stateAfterThirdNext
                    default: throw new Error("Should not get here")
                }
            })()
            const render: RenderFn = (current, old) => { }

            const game = new _Game(animation, initialState, next, render)

            game.run()

            expect(callParams[0]).deep.equal({ ...initialState, running: true })
            expect(callParams[1]).eq(stateAfterFirstNext)
            expect(callParams[2]).eq(stateAfterSecondNext)
        })

        it('calls render with the current and previous state', function () {
            const initialState = newState()
            const stateAfterFirstNext = newState()
            const stateAfterSecondNext = newState()
            const stateAfterThirdNext = newState()
            const callParams: { current: State, old: State }[] = []
            const next: NextFn = ((call = 0) => (data) => {
                call++
                switch (call) {
                    case 1: return stateAfterFirstNext
                    case 2: return stateAfterSecondNext
                    case 3: return stateAfterThirdNext
                    default: throw new Error("Should not get here")
                }
            })()
            const render: RenderFn = (current, old) => callParams.push({ current, old })

            const game = new _Game(animation, initialState, next, render)

            game.run()

            const firstState = { ...initialState, running: true }
            expect(callParams[0].current).eq(stateAfterFirstNext)
            expect(callParams[0].old).deep.equal(firstState)

            expect(callParams[1].current).eq(stateAfterSecondNext)
            expect(callParams[1].old).eq(stateAfterFirstNext)

            expect(callParams[2].current).eq(stateAfterThirdNext)
            expect(callParams[2].old).eq(stateAfterSecondNext)
        })
    })
})