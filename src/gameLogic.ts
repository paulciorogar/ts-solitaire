import { updateCardsPositionWithOffsetFn, updatePosition, updateSize } from './game'
import { CardSlot, conf, Configuration, GameLogicInterface, Point, State, UpdateCardsPosition } from './state'
import { pipe } from './utility'

export class GameLogic implements GameLogicInterface {

    constructor(private conf: Configuration) { }

    processEvents(state: State): State {
        if (state.eventQ.length === 0) return state
        state = state.eventQ.reduce((result, fn) => fn(result), state)
        return { ...state, eventQ: [] }
    }

    containerSize(state: State, oldState: State): State {
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

    cardSize(state: State, oldState: State): State {
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

    cardSlotsPositions(state: State, oldState: State): State {
        if (state.cardSize === oldState.cardSize) return state
        const width = conf.cardMargin + state.cardSize.width
        const height = 2 * conf.cardMargin + state.cardSize.height
        const topPosition = slotPositionFn(state.container, width)
        const bottomPosition = slotPositionFn({ ...state.container, y: state.container.y + height }, width)
        const updateCardsPositionWithOffset = updateCardsPositionWithOffsetFn(state.cardOffsetSize)

        return pipe(state)
            .pipe(state => ({ ...state, sourcePile: updateSlot(state.sourcePile, topPosition(0), updatePosition) }))
            .pipe(state => ({ ...state, wastePile: updateSlot(state.wastePile, topPosition(1), updatePosition) }))
            .pipe(state => ({ ...state, target1: updateSlot(state.target1, topPosition(3), updatePosition) }))
            .pipe(state => ({ ...state, target2: updateSlot(state.target2, topPosition(4), updatePosition) }))
            .pipe(state => ({ ...state, target3: updateSlot(state.target3, topPosition(5), updatePosition) }))
            .pipe(state => ({ ...state, target4: updateSlot(state.target4, topPosition(6), updatePosition) }))
            .pipe(state => ({ ...state, packing1: updateSlot(state.packing1, bottomPosition(0), updateCardsPositionWithOffset) }))
            .pipe(state => ({ ...state, packing2: updateSlot(state.packing2, bottomPosition(1), updateCardsPositionWithOffset) }))
            .pipe(state => ({ ...state, packing3: updateSlot(state.packing3, bottomPosition(2), updateCardsPositionWithOffset) }))
            .pipe(state => ({ ...state, packing4: updateSlot(state.packing4, bottomPosition(3), updateCardsPositionWithOffset) }))
            .pipe(state => ({ ...state, packing5: updateSlot(state.packing5, bottomPosition(4), updateCardsPositionWithOffset) }))
            .pipe(state => ({ ...state, packing6: updateSlot(state.packing6, bottomPosition(5), updateCardsPositionWithOffset) }))
            .pipe(state => ({ ...state, packing7: updateSlot(state.packing7, bottomPosition(6), updateCardsPositionWithOffset) }))
            .run()

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

        function slotPositionFn(reference: Point, unit: number) {
            return (positionNumber: number) => {
                return { y: reference.y, x: reference.x + (unit * positionNumber) }
            }
        }

    }

    flipSlotCards(state: State, oldState: State): State {
        return state
    }

    eligibleSlots(state: State, oldState: State): State {
        return state
    }

    targetSlot(state: State, oldState: State): State {
        return state
    }
}