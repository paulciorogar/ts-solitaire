import { updateCardsPositionWithOffset, updatePosition, updateSize } from './game'
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