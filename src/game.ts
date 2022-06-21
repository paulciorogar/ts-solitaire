import { just, Maybe, nothing } from './maybe'
import { _pickUpCards } from './pickUpCards'
import {
    AddCardsToSlotFn,
    Card, CardSlot, conf, Dimensions, EligibleSlot, EventFn,
    Hand, IdFunction, LazyCardSlot, newRectangle, NextStepFn, Point,
    Rectangle, RenderFn, slotRectangle, State, Suit, UpdateCardsPosition
} from './state'
import { first, pipe, removeTop, top } from './utility'

export class Game {

    private state: State
    private oldState: State

    constructor(
        private window: Window,
        initialState: State,
        private next: NextStepFn,
        private renderFn: () => RenderFn,
    ) {
        this.state = initialState
        this.oldState = initialState
    }

    run() {
        const render = this.renderFn()
        const step: FrameRequestCallback = t => {
            this.oldState = this.state
            this.state = this.next(this.state)
            render(this.state, this.oldState)
            this.window.requestAnimationFrame(step)
        }
        this.window.requestAnimationFrame(step)
    }

    newEvent(fn: EventFn) {
        const { eventQ } = this.state
        this.oldState = this.state
        this.state = { ...this.state, eventQ: [...eventQ, fn] }
    }
}

export class _Game {

    private state: State
    private oldState: State

    constructor(
        private animation: AnimationFrameProvider,
        initialState: State,
        private next: NextStepFn,
        private render: RenderFn,
    ) {
        this.state = initialState
        this.oldState = initialState
    }

    run() {
        if (this.state.running) return
        this.state = { ...this.state, running: true }

        const step: FrameRequestCallback = t => {
            this.oldState = this.state
            this.state = this.next(this.state)
            this.render(this.state, this.oldState)
            this.animation.requestAnimationFrame(step)
        }

        this.animation.requestAnimationFrame(step)
    }

    nextCard() { this.newEvent(nextCard) }

    setCard() { this.newEvent(setCard) }

    moveCard(point: Point) { this.newEvent(_moveCard(point)) }

    pickUpCards(
        point: Point, // screenX screenY
        addCardsToSlot: AddCardsToSlotFn,
        lazySlot: LazyCardSlot,
        numberOfCards = 1
    ) {
        this.newEvent(_pickUpCards(point, addCardsToSlot, lazySlot, numberOfCards))
    }

    private newEvent(fn: EventFn) {
        const { eventQ } = this.state
        this.oldState = this.state
        this.state = { ...this.state, eventQ: [...eventQ, fn] }
    }
}

class NextState {
    constructor(readonly current: State, readonly oldState: State) { }
    map(fn: (current: State, oldState: State) => State): NextState {
        return new NextState(fn(this.current, this.oldState), this.oldState)
    }

    result(): State { return this.current }
    previous(): State { return this.oldState }
}

export function nextStep(state: State): State {
    const data = new NextState(state, state)
    return data.map(processEvents)
        .map(containerSize)
        .map(cardSize)
        .map(cardSlotsPositions)
        .map(flipSlotCards)
        .map(_eligibleSlots)
        .map(targetSlot)
        .current
}

function processEvents(state: State): State {
    state = state.eventQ.reduce((result, fn) => fn(result), state)
    return { ...state, eventQ: [] }
}

function containerSize(state: State, oldState: State): State {
    if (state.body === oldState.body) return state
    const { aspectRation } = conf
    const point: Point = { x: conf.containerMargin, y: conf.containerMargin }
    const margin2X = 2 * conf.containerMargin
    const containerAvailableSpace = {
        x: state.body.width - margin2X,
        y: state.body.height - margin2X
    }
    const desiredHeight = (containerAvailableSpace.x * aspectRation.y) / aspectRation.x
    if (desiredHeight <= containerAvailableSpace.y) {
        return { ...state, container: { ...point, width: containerAvailableSpace.x, height: desiredHeight } }
    }
    const width = (containerAvailableSpace.y * aspectRation.x) / aspectRation.y
    return { ...state, container: { ...point, width: width, height: containerAvailableSpace.y } }
}

function cardSize(state: State, oldState: State): State {
    if (state.container === oldState.container) return state
    const { cardRatio } = conf
    const availableSpace = state.container.width - (conf.cardMargin * (conf.columns - 2))
    const cardWidth = Math.floor(availableSpace / conf.columns)
    const card = {
        width: cardWidth,
        height: Math.floor((cardWidth * cardRatio.y) / cardRatio.x)
    }
    const cardOffsetSize = Math.ceil(card.height * conf.cardStackOffset)
    return { ...state, cardSize: card, cardOffsetSize }
}

function cardSlotsPositions(state: State, oldState: State): State {
    if (state.cardSize === oldState.cardSize) return state
    const width = conf.cardMargin + state.cardSize.width
    const height = 2 * conf.cardMargin + state.cardSize.height

    const sourcePile = updateSlot(state.sourcePile, state.container, updatePosition)
    const wastePile = updateSlot(state.wastePile, { ...sourcePile, x: sourcePile.x + width }, updatePosition)
    const target1 = updateSlot(state.target1, { ...wastePile, x: wastePile.x + 2 * width }, updatePosition)
    const target2 = updateSlot(state.target2, { ...target1, x: target1.x + width }, updatePosition)
    const target3 = updateSlot(state.target3, { ...target2, x: target2.x + width }, updatePosition)
    const target4 = updateSlot(state.target4, { ...target3, x: target3.x + width }, updatePosition)
    const packing1 = updateSlot(state.packing1, { ...sourcePile, y: sourcePile.y + height }, updateCardsPositionWithOffset(state.cardOffsetSize))
    const packing2 = updateSlot(state.packing2, { ...packing1, x: packing1.x + width }, updateCardsPositionWithOffset(state.cardOffsetSize))
    const packing3 = updateSlot(state.packing3, { ...packing2, x: packing2.x + width }, updateCardsPositionWithOffset(state.cardOffsetSize))
    const packing4 = updateSlot(state.packing4, { ...packing3, x: packing3.x + width }, updateCardsPositionWithOffset(state.cardOffsetSize))
    const packing5 = updateSlot(state.packing5, { ...packing4, x: packing4.x + width }, updateCardsPositionWithOffset(state.cardOffsetSize))
    const packing6 = updateSlot(state.packing6, { ...packing5, x: packing5.x + width }, updateCardsPositionWithOffset(state.cardOffsetSize))
    const packing7 = updateSlot(state.packing7, { ...packing6, x: packing6.x + width }, updateCardsPositionWithOffset(state.cardOffsetSize))

    return {
        ...state, sourcePile, wastePile, target1, target2, target3, target4,
        packing1, packing2, packing3, packing4, packing5, packing6, packing7
    }

    function updateSlot(slot: CardSlot, position: Point, updateCardsPosition: UpdateCardsPosition): CardSlot {
        return pipe(slot)
            .pipe(updateSize(state.cardSize))
            .pipe(updatePosition(position))
            .pipe(updateCards)
            .run()

        function updateCards(data: CardSlot): CardSlot {
            const update = updateCardsPosition(data)
            const cards = data.cards.map(update)
            return { ...data, cards: cards }
        }
    }
}

function flipSlotCards(state: State, oldState: State): State {
    return state.hand.cata(
        () => {
            return pipe(state)
                .pipe(flip(lazyPacking1))
                .pipe(flip(lazyPacking2))
                .pipe(flip(lazyPacking3))
                .pipe(flip(lazyPacking4))
                .pipe(flip(lazyPacking5))
                .pipe(flip(lazyPacking6))
                .pipe(flip(lazyPacking7))
                .run()
        },
        () => state
    )

    function flip(lazySlot: LazyCardSlot): IdFunction<State> {
        return lazySlot.update((slot) => {
            const topCard = top(slot.cards)
            return topCard.filter(card => card.orientation !== 'up')
                .map(card => ({ cards: [...removeTop(slot.cards, 1), flipCard(card)] }))
                .orElse(undefined)
        })
    }
}

function eligibleSlots(state: State): State {
    const overlappingArea = (card: Card, slot: CardSlot) => {
        const rect1 = newRectangle(card, state.cardSize)
        const rect2 = slotRectangle(slot)
        return shape.overlappingArea(rect1, rect2)
    }

    const calculateOverlappingArea = (state: State, slot: CardSlot) =>
        state.hand.map(hand => {
            const [first] = hand.cards
            return first ? overlappingArea(first, slot) : 0
        }).orElse(0)

    const calculateOverlappingAreaWithOffset = (state: State, slot: CardSlot) => {
        const { cardOffsetSize } = state
        const height = state.cardSize.height + slot.cards.length * cardOffsetSize
        const adjustSize = updateSize({ width: state.cardSize.width, height })
        return state.hand.map(hand => {
            const [first] = hand.cards
            return first ? overlappingArea(first, adjustSize(slot)) : 0
        }).orElse(0)
    }

    return {
        ...state, eligibleSlots: [
            {
                ...lazyTarget1,
                overlappingArea: calculateOverlappingArea(state, state.target1),
                addCard: addCardsToSlot(lazyTarget1)
            },
            {
                ...lazyTarget2,
                overlappingArea: calculateOverlappingArea(state, state.target2),
                addCard: addCardsToSlot(lazyTarget2)
            },
            {
                ...lazyTarget3,
                overlappingArea: calculateOverlappingArea(state, state.target3),
                addCard: addCardsToSlot(lazyTarget3)
            },
            {
                ...lazyTarget4,
                overlappingArea: calculateOverlappingArea(state, state.target4),
                addCard: addCardsToSlot(lazyTarget4)
            },
            {
                ...lazyPacking1,
                overlappingArea: calculateOverlappingAreaWithOffset(state, state.packing1),
                addCard: addCardsToPackingSlot(lazyPacking1)
            },
            {
                ...lazyPacking2,
                overlappingArea: calculateOverlappingAreaWithOffset(state, state.packing2),
                addCard: addCardsToPackingSlot(lazyPacking2)
            },
            {
                ...lazyPacking3,
                overlappingArea: calculateOverlappingAreaWithOffset(state, state.packing3),
                addCard: addCardsToPackingSlot(lazyPacking3)
            },
            {
                ...lazyPacking4,
                overlappingArea: calculateOverlappingAreaWithOffset(state, state.packing4),
                addCard: addCardsToPackingSlot(lazyPacking4)
            },
            {
                ...lazyPacking5,
                overlappingArea: calculateOverlappingAreaWithOffset(state, state.packing5),
                addCard: addCardsToPackingSlot(lazyPacking5)
            },
            {
                ...lazyPacking6,
                overlappingArea: calculateOverlappingAreaWithOffset(state, state.packing6),
                addCard: addCardsToPackingSlot(lazyPacking6)
            },
            {
                ...lazyPacking7,
                overlappingArea: calculateOverlappingAreaWithOffset(state, state.packing7),
                addCard: addCardsToPackingSlot(lazyPacking7)
            }
        ]
    }
}

function _eligibleSlots(state: State, oldState: State): State {
    if (state.hand === oldState.hand) return state
    const eligibleSlots: EligibleSlot[] = []
    return state.hand.bind(hand => first(hand.cards))
        .bind(cardInHand => {
            console.log('_eligibleSlots')
            eligibleTargetSlot(state, lazyTarget1, cardInHand).map(slot => eligibleSlots.push(slot))
            eligibleTargetSlot(state, lazyTarget2, cardInHand).map(slot => eligibleSlots.push(slot))
            eligibleTargetSlot(state, lazyTarget3, cardInHand).map(slot => eligibleSlots.push(slot))
            eligibleTargetSlot(state, lazyTarget4, cardInHand).map(slot => eligibleSlots.push(slot))
            eligiblePackingSlot(state, lazyPacking1, cardInHand).map(slot => eligibleSlots.push(slot))
            eligiblePackingSlot(state, lazyPacking2, cardInHand).map(slot => eligibleSlots.push(slot))
            eligiblePackingSlot(state, lazyPacking3, cardInHand).map(slot => eligibleSlots.push(slot))
            eligiblePackingSlot(state, lazyPacking4, cardInHand).map(slot => eligibleSlots.push(slot))
            eligiblePackingSlot(state, lazyPacking5, cardInHand).map(slot => eligibleSlots.push(slot))
            eligiblePackingSlot(state, lazyPacking6, cardInHand).map(slot => eligibleSlots.push(slot))
            eligiblePackingSlot(state, lazyPacking7, cardInHand).map(slot => eligibleSlots.push(slot))
            return just(eligibleSlots)
        })
        .map(slots => ({ ...state, eligibleSlots: slots }))
        .orElse(state)
}

function eligibleTargetSlot(state: State, lazySlot: LazyCardSlot, card: Card): Maybe<EligibleSlot> {
    const slot = lazySlot.data(state)
    const topCard = top(slot.cards)
    return topCard.cata(none, some)

    function none(): Maybe<EligibleSlot> {
        if (card.number === 1) return just(newEligibleSlot())
        return nothing()
    }

    function some(topCard: Card): Maybe<EligibleSlot> {
        if (topCard.suit !== card.suit) return nothing()
        if (topCard.number + 1 !== card.number) return nothing()
        return just(newEligibleSlot())
    }

    function newEligibleSlot(): EligibleSlot {
        return {
            ...lazySlot,
            overlappingArea: overlappingArea(card, slot, state.cardSize),
            addCard: addCardsToSlot(lazySlot)
        }
    }
}

function eligiblePackingSlot(state: State, lazySlot: LazyCardSlot, cardInHand: Card): Maybe<EligibleSlot> {
    const slot = lazySlot.data(state)
    const card = top(slot.cards)
    return card.cata(none, some)

    function none(): Maybe<EligibleSlot> {
        if (cardInHand.number === 13) return just(newEligibleSlot())
        return nothing()
    }

    function some(card: Card): Maybe<EligibleSlot> {
        if (sameColor(card.suit, cardInHand.suit)) return nothing()
        if (card.number - 1 !== cardInHand.number) return nothing()
        return just(newEligibleSlot())
    }

    function newEligibleSlot(): EligibleSlot {
        return {
            ...lazySlot,
            overlappingArea: overlappingAreaWithOffset(cardInHand, slot, state),
            addCard: addCardsToPackingSlot(lazySlot)
        }
    }
}

function overlappingArea(card: Card, slot: CardSlot, cardSize: Dimensions): number {
    const rect1 = newRectangle(card, cardSize)
    const rect2 = slotRectangle(slot)
    return shape.overlappingArea(rect1, rect2)
}

function overlappingAreaWithOffset(card: Card, slot: CardSlot, state: State): number {
    const { cardOffsetSize } = state
    const height = state.cardSize.height + slot.cards.length * cardOffsetSize
    const adjustSize = updateSize({ width: state.cardSize.width, height })
    return overlappingArea(card, adjustSize(slot), state.cardSize)
}

function sameColor(suit1: Suit, suit2: Suit): boolean {
    switch (suit1) {
        case '♠': return suit1 === suit2 || suit2 === '♣'
        case '♣': return suit1 === suit2 || suit2 === '♠'
        case '♥': return suit1 === suit2 || suit2 === '♦'
        case '♦': return suit1 === suit2 || suit2 === '♥'
    }
}


function targetSlot(state: State): State {
    return state.hand.cata(clear, findTargetSlot)

    function clear() { return state }

    function findTargetSlot(hand: Hand): State {
        const byArea = (result: Maybe<EligibleSlot>, data: EligibleSlot): Maybe<EligibleSlot> => {
            return result.cata(
                () => data.overlappingArea > 0 ? just(data) : result,
                slot => data.overlappingArea > 0
                    && data.overlappingArea > slot.overlappingArea ? just(data) : result
            )
        }
        const slot = state.eligibleSlots.reduce(byArea, nothing())
        return slot.cata(clearHovering, addHovering)

        function clearHovering() {
            return hand.hoveringSlot.map(() => {
                const addCardToSlot = nothing<IdFunction<State>>()
                const hoveringSlot = nothing<LazyCardSlot>()
                const newHand: Hand = { ...hand, addCardToSlot, hoveringSlot }
                return { ...state, hand: just(newHand) }
            }).orElse(state)
        }

        function addHovering(eligibleSlot: EligibleSlot) {
            const addCardToSlot = just(eligibleSlot.addCard)
            const hoveringSlot = just(eligibleSlot)
            const newHand: Hand = { ...hand, addCardToSlot, hoveringSlot }
            return { ...state, hand: just(newHand) }
        }
    }
}

export function updateSize(val: Dimensions) {
    return function <A extends Dimensions>(data: A): A {
        return { ...data, height: val.height, width: val.width }
    }
}

export function updatePosition(val: Point) {
    return function <A extends Point>(data: A): A {
        return { ...data, x: val.x, y: val.y }
    }
}

export function updateCardsPositionWithOffset(cardOffsetSize: number) {
    return (slot: CardSlot) => (card: Card, index: number) => {
        const offset = addOffsetY(index * cardOffsetSize)
        const update = updatePosition(offset(slot))
        return update(card)
    }
}

export function addOffsetY(offset: number) {
    return <A extends Point>(data: A): A => ({ ...data, y: data.y + offset })
}

export function removeTopCardsFromSlot(lazySlot: LazyCardSlot, number: number) {
    return lazySlot.update(slot => {
        return { cards: removeTop(slot.cards, number) }
    })
}

export function addCardToFn(lazySlot: LazyCardSlot) {
    return (state: State): State => {
        const updateCardPosition = updatePosition(lazySlot.data(state))
        return state.hand.map(hand => pipe(state)
            .pipe(updateHand(() => nothing()))
            .pipe(lazySlot.update(slot => {
                return { cards: [...slot.cards, ...hand.cards.map(updateCardPosition)] }
            }))
            .run()
        ).orElse(state)
    }
}

export function addCardsToSlot(lazySlot: LazyCardSlot) {
    return function (state: State): State {
        const updateCardPosition = updatePosition(lazySlot.data(state))
        return state.hand.map(hand => pipe(state)
            .pipe(updateHand(() => nothing()))
            .pipe(lazySlot.update(slot => {
                return { cards: slot.cards.concat(hand.cards.map(updateCardPosition)) }
            }))
            .run()
        ).orElse(state)
    }
}

export function addCardsToPackingSlot(lazySlot: LazyCardSlot) {
    return function (state: State): State {
        const updateCardPosition = (slot: CardSlot) => ((card: Card, index: number) => {
            const offset = addOffsetY((slot.cards.length + index) * state.cardOffsetSize)
            const update = updatePosition(offset(slot))
            return update(card)
        })
        return state.hand.map(hand => pipe(state)
            .pipe(updateHand(() => nothing()))
            .pipe(lazySlot.update(slot => {
                const update = updateCardPosition(slot)
                return { cards: slot.cards.concat(hand.cards.map(update)) }
            }))
            .run()
        ).orElse(state)
    }
}

export function updateHand(fn: IdFunction<Maybe<Hand>>): IdFunction<State> {
    return function (state: State): State {
        return { ...state, hand: fn(state.hand) }
    }
}

export const lazySourcePile: LazyCardSlot = {
    data: (state) => state.sourcePile,
    update: (fn) => (state) => {
        const newData = fn(state.sourcePile, state)
        if (newData) { return { ...state, sourcePile: { ...state.sourcePile, ...newData } } }
        return state
    }
}

export const lazyWastePile: LazyCardSlot = {
    data: (state) => state.wastePile,
    update: (fn) => (state) => {
        const newData = fn(state.wastePile, state)
        if (newData) { return { ...state, wastePile: { ...state.wastePile, ...newData } } }
        return state
    }
}

export const lazyTarget1: LazyCardSlot = {
    data: (state) => state.target1,
    update: (fn) => (state) => {
        const newData = fn(state.target1, state)
        if (newData) { return { ...state, target1: { ...state.target1, ...newData } } }
        return state
    }
}

export const lazyTarget2: LazyCardSlot = {
    data: (state) => state.target2,
    update: (fn) => (state) => {
        const newData = fn(state.target2, state)
        if (newData) { return { ...state, target2: { ...state.target2, ...newData } } }
        return state
    }
}

export const lazyTarget3: LazyCardSlot = {
    data: (state) => state.target3,
    update: (fn) => (state) => {
        const newData = fn(state.target3, state)
        if (newData) { return { ...state, target3: { ...state.target3, ...newData } } }
        return state
    }
}

export const lazyTarget4: LazyCardSlot = {
    data: (state) => state.target4,
    update: (fn) => (state) => {
        const newData = fn(state.target4, state)
        if (newData) { return { ...state, target4: { ...state.target4, ...newData } } }
        return state
    }
}

export const lazyPacking1: LazyCardSlot = {
    data: (state) => state.packing1,
    update: (fn) => (state) => {
        const newData = fn(state.packing1, state)
        if (newData) { return { ...state, packing1: { ...state.packing1, ...newData } } }
        return state
    }
}

export const lazyPacking2: LazyCardSlot = {
    data: (state) => state.packing2,
    update: (fn) => (state) => {
        const newData = fn(state.packing2, state)
        if (newData) { return { ...state, packing2: { ...state.packing2, ...newData } } }
        return state
    }
}

export const lazyPacking3: LazyCardSlot = {
    data: (state) => state.packing3,
    update: (fn) => (state) => {
        const newData = fn(state.packing3, state)
        if (newData) { return { ...state, packing3: { ...state.packing3, ...newData } } }
        return state
    }
}

export const lazyPacking4: LazyCardSlot = {
    data: (state) => state.packing4,
    update: (fn) => (state) => {
        const newData = fn(state.packing4, state)
        if (newData) { return { ...state, packing4: { ...state.packing4, ...newData } } }
        return state
    }
}

export const lazyPacking5: LazyCardSlot = {
    data: (state) => state.packing5,
    update: (fn) => (state) => {
        const newData = fn(state.packing5, state)
        if (newData) { return { ...state, packing5: { ...state.packing5, ...newData } } }
        return state
    }
}

export const lazyPacking6: LazyCardSlot = {
    data: (state) => state.packing6,
    update: (fn) => (state) => {
        const newData = fn(state.packing6, state)
        if (newData) { return { ...state, packing6: { ...state.packing6, ...newData } } }
        return state
    }
}

export const lazyPacking7: LazyCardSlot = {
    data: (state) => state.packing7,
    update: (fn) => (state) => {
        const newData = fn(state.packing7, state)
        if (newData) { return { ...state, packing7: { ...state.packing7, ...newData } } }
        return state
    }
}

export function setCard(state: State): State {
    return state.hand.map(hand => {
        return hand.addCardToSlot.cata(returnCard, addCard)
        function returnCard() { return hand.returnCard(state) }
        function addCard(fn: IdFunction<State>) {
            return fn(state)
        }
    }).orElse(state)
}

export function moveCard(event: MouseEvent): EventFn {
    return (state: State): State => {
        return state.hand.map(hand => {
            const [card] = hand.cards
            if (card === undefined) return state
            const point: Point = {
                x: card.x + (event.screenX - hand.startX),
                y: card.y + (event.screenY - hand.startY),
            }
            const updateCardPosition = (point: Point) => ((card: Card, index: number) => {
                const offset = addOffsetY(index * state.cardOffsetSize)
                const update = updatePosition(offset(point))
                return update(card)
            })
            const move = updateCardPosition(point)
            const newHand: Hand = {
                ...hand,
                cards: hand.cards.map(move),
                startX: event.screenX,
                startY: event.screenY
            }
            return updateHand(() => just(newHand))(state)
        }).orElse(state)
    }
}

export function _moveCard(to: Point): EventFn {
    return (state: State): State => {
        return state.hand.map(hand => {
            const [card] = hand.cards
            if (card === undefined) return state
            const point: Point = {
                x: card.x + (to.x - hand.startX),
                y: card.y + (to.y - hand.startY),
            }
            const updateCardPosition = (point: Point) => ((card: Card, index: number) => {
                const offset = addOffsetY(index * state.cardOffsetSize)
                const update = updatePosition(offset(point))
                return update(card)
            })
            const move = updateCardPosition(point)
            const newHand: Hand = {
                ...hand,
                cards: hand.cards.map(move),
                startX: to.x,
                startY: to.y
            }
            return updateHand(() => just(newHand))(state)
        }).orElse(state)
    }
}

function reverse<A>(list: ReadonlyArray<A>): ReadonlyArray<A> {
    return [...list].reverse()
}

export function nextCard(state: State): State {
    const topCard = top(state.sourcePile.cards)
    return topCard.cata(resetSource, addCardToWastePile)

    function resetSource() {
        return pipe(state)
            .pipe(lazySourcePile.update((pile, state) => {
                const position = updatePosition(pile)
                return { cards: reverse(state.wastePile.cards).map(position) }
            }))
            .pipe(lazyWastePile.update(() => ({ cards: [] })))
            .run()
    }

    function addCardToWastePile(card: Card) {
        return pipe(state)
            .pipe(removeTopCardsFromSlot(lazySourcePile, 1))
            .pipe(lazyWastePile.update((slot) => {
                const updatePositionOf = updatePosition(slot)
                return { cards: slot.cards.concat([updatePositionOf(card)]) }
            }))
            .run()
    }
}

export function addCardsToWastePile(state: State): State {
    return state.hand.map(hand => {
        console.log('addCardsToWastePile')
        const pushCard = updateWastePile(data => {
            const updateCardPosition = updatePosition(state.wastePile)
            const cards = hand.cards.map(updateCardPosition)
            return { cards: data.cards.concat(cards) }
        })
        return pipe(state)
            .pipe(pushCard)
            .pipe(updateHand(() => nothing()))
            .run()
    }).orElse(state)
}

function updateWastePile(fn: (data: CardSlot) => Partial<CardSlot>): IdFunction<State> {
    return function (state) {
        const wastePile = { ...state.wastePile, ...fn(state.wastePile) }
        return { ...state, wastePile }
    }
}

export function flipCard(card: Card): Card {
    return { ...card, orientation: card.orientation === 'up' ? 'down' : 'up' }
}

const shape = {
    overlappingArea: function (rect1: Rectangle, rect2: Rectangle): number {
        // Length of intersecting part
        // starts from max(l1[x], l2[x]) of x-coordinate and
        // ends at min(r1[x], r2[x]) x-coordinate
        // by subtracting start from end we get required lengths
        const x_dist = (Math.min(rect1.b.x, rect2.b.x)
            - Math.max(rect1.a.x, rect2.a.x))

        const y_dist = (Math.min(rect1.b.y, rect2.b.y)
            - Math.max(rect1.a.y, rect2.a.y))

        if (x_dist > 0 && y_dist > 0) {
            return x_dist * y_dist
        } else { return 0 }
    }
}