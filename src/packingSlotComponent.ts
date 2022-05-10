import { Maybe } from '../maybe'
import { Component } from './component'
import { Factory } from './factory'
import { Card, conf, LazyCardSlot, State } from './state'
import { dom } from './utility'

export function packingComponent(factory:Factory, lazySlot:LazyCardSlot):Component<any> {
    const element = factory.cardSlotElement()
    const result = new Component(element, update)
    return result

    function update(state:State, oldState:State, component:Component<any>) {
        const slot = lazySlot.data(state)
        const oldSlot = lazySlot.data(oldState)

        if (state.hand !== oldState.hand) {
            state.hand.bind(hand => {
                return hand.hoveringSlot
            })
            .bind(lazySlot => {
                const data = lazySlot.data(state)
                if (data !== slot) {return Maybe.nothing()}
                element.style.borderColor = 'red'
                return Maybe.just(true)
            }).catchMap(() => element.style.borderColor = conf.cardSlotBorderColor)
        }

        if (slot === oldSlot) return
        dom.updateDimensions(element, slot)
        dom.updatePosition(element, slot)

        if (slot.cards === oldSlot.cards) return
        component.removeAll()
        slot.cards.forEach((_, index:number) => {
            const nrOfCards = slot.cards.length - index
            const pickUpCards = factory.pickUpCardsWithOffset(lazySlot, nrOfCards)
            const cardData = (state:State) => Maybe.from(lazySlot.data(state).cards[index])
            const cardComponent = factory.card(pickUpCards, cardData)
            component.append(cardComponent(state))
        })
    }
}