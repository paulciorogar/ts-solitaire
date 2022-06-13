import { expect } from 'chai'
import { createMock } from 'ts-auto-mock'
import { lazyPacking1, _Game } from './game'
import { just, nothing } from './maybe'
import { AddCardsToSlotFn, CardSlot, Hand, IdFunction, LazyCardSlot, NextFn, RenderFn, State } from './state'
import { peek, pipe } from './utility'

let animation: AnimationFrameProvider
let render: RenderFn = (current, old) => { }
let next: NextFn = (data) => data.eventQ.reduce((result, fn) => fn(result), data)

describe('Game', function () {
    describe('run()', function () {

        beforeEach(() => {
            animation = createMock<AnimationFrameProvider>({
                requestAnimationFrame: requestAnimationFrameCallbackTimes(3)
            })
        })

        it('starts the game loop', function () {
            const initialState = createMock<State>()
            const next: NextFn = (data) => data
            let calls = 0
            animation = createMock<AnimationFrameProvider>({
                requestAnimationFrame: (() => {
                    const fn = requestAnimationFrameCallbackTimes(3)
                    return (cb: FrameRequestCallback) => fn(() => cb(calls += 1))
                })()
            })

            const game = new _Game(animation, initialState, next, render)

            game.run()

            expect(calls).equal(3)
        })

        it('does not start the game loop twice', function () {
            const initialState = createMock<State>()
            const next: NextFn = (data) => data
            let calls = 0
            animation = createMock<AnimationFrameProvider>({
                requestAnimationFrame: () => calls += 1
            })

            const game = new _Game(animation, initialState, next, render)

            game.run()
            game.run()

            expect(calls).equal(1)
        })

        it('calls next on each step', function () {
            const initialState = createMock<State>()
            const stateAfterFirstNext = createMock<State>()
            const stateAfterSecondNext = createMock<State>()
            const stateAfterThirdNext = createMock<State>()
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

            const game = new _Game(animation, initialState, next, render)

            game.run()

            expect(callParams[0]).deep.equal({ ...initialState, running: true })
            expect(callParams[1]).eq(stateAfterFirstNext)
            expect(callParams[2]).eq(stateAfterSecondNext)
        })

        it('calls render with the current and previous state', function () {
            const initialState = createMock<State>()
            const stateAfterFirstNext = createMock<State>()
            const stateAfterSecondNext = createMock<State>()
            const stateAfterThirdNext = createMock<State>()
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
            expect(callParams.length).equals(3)
            callParams.forEach((param, index) => {
                switch (index) {
                    case 0:
                        expect(param.current).eq(stateAfterFirstNext)
                        expect(param.old).deep.equal(firstState)
                        break
                    case 1:
                        expect(param.current).eq(stateAfterSecondNext)
                        expect(param.old).eq(stateAfterFirstNext)
                        break
                    case 2:
                        expect(param.current).eq(stateAfterThirdNext)
                        expect(param.old).eq(stateAfterSecondNext)
                        break
                }
            })


        })
    })

    describe('nextCard()', function () {
        beforeEach(() => {
            animation = createMock<AnimationFrameProvider>({
                requestAnimationFrame: requestAnimationFrameCallbackTimes(1)
            })
        })

        it('adds nextCard event function to event queue', function (done) {
            const initialState = createMock<State>()
            const next: NextFn = (data) => {
                const { eventQ } = data
                expect(eventQ.length).equals(1)
                done()
                return data
            }

            const game = new _Game(animation, initialState, next, render)

            game.nextCard()
            game.run()
        })

        it('adds top card form sourcePile to waste pile', function (done) {
            const initialState = createMock<State>({
                sourcePile: createMock<CardSlot>({
                    cards: [
                        { number: 10, orientation: 'down', suit: '♠', x: 0, y: 0 }
                    ]
                }),
                wastePile: createMock<CardSlot>({ x: 10, y: 11 })
            })
            const next: NextFn = (data) => {
                data.eventQ.forEach(event => {
                    const result = event(data)
                    expect(result.sourcePile.cards.length).equals(0)
                    expect(result.wastePile.cards)
                        .deep.equals([{ number: 10, orientation: 'down', suit: '♠', x: 10, y: 11 }])
                    done()
                })
                return data
            }

            const game = new _Game(animation, initialState, next, render)

            game.nextCard()
            game.run()
        })

        it('moves all cards from waste pile to source', function (done) {
            const initialState = createMock<State>({
                wastePile: createMock<CardSlot>({
                    cards: [
                        { number: 10, orientation: 'down', suit: '♠', x: 10, y: 11 },
                        { number: 11, orientation: 'down', suit: '♠', x: 10, y: 11 }
                    ]
                })
            })
            const next: NextFn = (data) => {
                data.eventQ.forEach(event => {
                    const result = event(data)
                    expect(result.wastePile.cards.length).equals(0)
                    expect(result.sourcePile.cards)
                        .deep.equals([
                            { number: 11, orientation: 'down', suit: '♠', x: 0, y: 0 },
                            { number: 10, orientation: 'down', suit: '♠', x: 0, y: 0 }
                        ])
                    done()
                })
                return data
            }

            const game = new _Game(animation, initialState, next, render)

            game.nextCard()
            game.run()
        })

    })

    describe('setCard()', function () {
        beforeEach(() => {
            animation = createMock<AnimationFrameProvider>({
                requestAnimationFrame: requestAnimationFrameCallbackTimes(1)
            })
        })

        it('adds setCard event function to event queue', function (done) {
            const initialState = createMock<State>()
            const next: NextFn = (data) => {
                expect(data.eventQ.length).equals(1)
                done()
                return data
            }

            const game = new _Game(animation, initialState, next, render)

            game.nextCard()
            game.run()
        })

        it('returns card to slot from which it was picked up', function () {
            let cardReturned = false
            const initialState = createMock<State>({
                hand: just(createMock<Hand>({
                    addCardToSlot: nothing<IdFunction<State>>(),
                    returnCard: (sate) => { cardReturned = true; return sate }
                })),
            })

            const game = new _Game(animation, initialState, next, render)

            game.setCard()
            game.run()
            expect(cardReturned).true
        })

        it('adds card to slot', function () {
            let cardAdded = false
            const initialState = createMock<State>({
                hand: just(createMock<Hand>({
                    addCardToSlot: just<IdFunction<State>>((state) => {
                        cardAdded = true
                        return state
                    }),
                }))
            })

            const game = new _Game(animation, initialState, next, render)

            game.setCard()
            game.run()
            expect(cardAdded).true
        })

    })

    describe('moveCard()', function () {
        beforeEach(() => {
            animation = createMock<AnimationFrameProvider>({
                requestAnimationFrame: requestAnimationFrameCallbackTimes(1)
            })
        })

        it('updates hand position with the difference from current position to next position', function (done) {
            const initialState = createMock<State>({
                hand: just<Hand>({
                    startX: 10,
                    startY: 11,
                    cards: [{
                        orientation: 'up',
                        suit: '♠',
                        number: 1,
                        x: 100,
                        y: 111
                    }],
                    hoveringSlot: nothing<LazyCardSlot>(),
                    returnCard: (data) => data,
                    addCardToSlot: nothing<IdFunction<State>>()
                })
            })
            const localNext: NextFn = (data) => pipe(next(data))
                .pipe(peek(state =>
                    state.hand.forEach(hand => {
                        expect(hand.startX).eq(1000)
                        expect(hand.startY).eq(1111)
                        expect(hand.cards).deep.eq([
                            {
                                orientation: 'up',
                                suit: '♠',
                                number: 1,
                                x: 1090,
                                y: 1211
                            }
                        ])
                        done()
                    })
                ))
                .run()
            const game = new _Game(animation, initialState, localNext, render)

            game.moveCard({ x: 1000, y: 1111 })
            game.run()
        })

        it('updates cards in hand with the offset', function (done) {
            const initialState = createMock<State>({
                cardOffsetSize: 3,
                hand: just<Hand>({
                    startX: 10,
                    startY: 11,
                    cards: [
                        { orientation: 'up', suit: '♠', number: 1, x: 100, y: 111 },
                        { orientation: 'up', suit: '♠', number: 2, x: 100, y: 111 }
                    ],
                    hoveringSlot: nothing<LazyCardSlot>(),
                    returnCard: (data) => data,
                    addCardToSlot: nothing<IdFunction<State>>()
                })
            })
            const localNext: NextFn = (data) => pipe(next(data))
                .pipe(peek(state =>
                    state.hand.forEach(hand => {
                        expect(hand.startX).eq(1000)
                        expect(hand.startY).eq(1111)
                        expect(hand.cards).deep.eq([
                            { orientation: 'up', suit: '♠', number: 1, x: 1090, y: 1211 },
                            { orientation: 'up', suit: '♠', number: 2, x: 1090, y: 1214 }
                        ])
                        done()
                    })
                ))
                .run()
            const game = new _Game(animation, initialState, localNext, render)

            game.moveCard({ x: 1000, y: 1111 })
            game.run()
        })
    })

    describe('pickUpCards()', function () {
        beforeEach(() => {
            animation = createMock<AnimationFrameProvider>({
                requestAnimationFrame: requestAnimationFrameCallbackTimes(1)
            })
        })

        it('moves top cards from slot to hand', function (done) {
            const initialState = createMock<State>({
                packing1: createMock<CardSlot>({
                    cards: [
                        { number: 1, suit: '♠', orientation: 'up', x: 11, y: 100 },
                        { number: 2, suit: '♠', orientation: 'up', x: 11, y: 101 },
                        { number: 3, suit: '♠', orientation: 'up', x: 11, y: 111 }
                    ]
                }),
                hand: nothing<Hand>()
            })
            const localNext: NextFn = (data) => pipe(next(data))
                .pipe(peek(state =>
                    state.hand.forEach(hand => {
                        expect(hand.startX).eq(1000)
                        expect(hand.startY).eq(1111)
                        expect(hand.returnCard).equals(expectedReturnCardFn)
                        expect(hand.cards).deep.eq([
                            { number: 2, suit: '♠', orientation: 'up', x: 11, y: 101 },
                            { number: 3, suit: '♠', orientation: 'up', x: 11, y: 111 }
                        ])
                        expect(state.packing1.cards).deep.eq([
                            { number: 1, suit: '♠', orientation: 'up', x: 11, y: 100 },
                        ])
                        done()
                    })
                ))
                .run()
            const expectedReturnCardFn: IdFunction<State> = (data) => data
            const addCardsToSlot: AddCardsToSlotFn = () => expectedReturnCardFn
            const game = new _Game(animation, initialState, localNext, render)

            game.pickUpCards({ x: 1000, y: 1111 }, addCardsToSlot, lazyPacking1, 2)
            game.run()
        })
    })
})

function requestAnimationFrameCallbackTimes(x: number) {
    return (fn: FrameRequestCallback) => {
        if (x-- > 0) fn(0)
        return x
    }
}