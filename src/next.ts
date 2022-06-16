import { GameLogic, NextFn, NextState } from './state'

export function nextFn(gameLogic: GameLogic): NextFn {
    return (state) => {
        const data = new NextState(state, state)
        return data.map(gameLogic.processEvents)
            .map(gameLogic.containerSize)
            .map(gameLogic.cardSize)
            .map(gameLogic.cardSlotsPositions)
            .map(gameLogic.flipSlotCards)
            .map(gameLogic.eligibleSlots)
            .map(gameLogic.targetSlot)
            .current
    }
}