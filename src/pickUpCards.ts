import { Maybe } from '../maybe'
import { removeTopCardsFromSlot, updateHand } from './game'
import { AddCardsToSlotFn, LazyCardSlot, NewEventFn, State } from './state'
import { pipe, topN } from './utility'

export function pickUpCards(
    newEvent:NewEventFn,
    addCardsToSlot:AddCardsToSlotFn,
    lazySlot:LazyCardSlot,
    numberOfCards = 1
    ) {
    return (event:MouseEvent) => newEvent((state:State):State => {
        const slot = lazySlot.data(state)
        const cards = topN(slot.cards, numberOfCards)
        return cards.fold(state)(cards => {
            return pipe(state)
            .pipe(updateHand(() => Maybe.just({
                startX: event.screenX,
                startY: event.screenY,
                cards,
                hoveringSlot: Maybe.nothing(),
                returnCard: addCardsToSlot(lazySlot),
                addCardToSlot: Maybe.nothing()
            })))
            .pipe(removeTopCardsFromSlot(lazySlot, numberOfCards))
            .run()
        })
    })
}