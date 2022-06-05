
import { removeTopCardsFromSlot, updateHand } from './game'
import { just, nothing } from './maybe'
import { AddCardsToSlotFn, LazyCardSlot, NewEventFn, State } from './state'
import { pipe, topN } from './utility'

export function pickUpCards(
    newEvent: NewEventFn,
    addCardsToSlot: AddCardsToSlotFn,
    lazySlot: LazyCardSlot,
    numberOfCards = 1
) {
    return (event: MouseEvent) => newEvent((state: State): State => {
        const slot = lazySlot.data(state)
        const cards = topN(slot.cards, numberOfCards)
        return pipe(state)
            .pipe(updateHand(() => just({
                startX: event.screenX,
                startY: event.screenY,
                cards,
                hoveringSlot: nothing(),
                returnCard: addCardsToSlot(lazySlot),
                addCardToSlot: nothing()
            })))
            .pipe(removeTopCardsFromSlot(lazySlot, numberOfCards))
            .run()
    })
}