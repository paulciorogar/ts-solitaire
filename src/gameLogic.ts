import { conf, Configuration, GameLogicInterface, Point, State } from './state'

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
        return state
    }
    cardSlotsPositions(state: State, oldState: State): State {
        return state
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