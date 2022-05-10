import { Maybe } from '../maybe'
import { Component } from './component'
import { Factory } from './factory'
import { Card, CardSlot, conf, LazyCardSlot, State } from './state'
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
        slot.cards.forEach((card:Card, index:number) => {
            component.append(cardComponent(card, state, slot, index))
        })
    }

    function cardComponent(card:Card, state:State, slot:CardSlot, index:number):Component<any> {
        const cardData = (state:State) => Maybe.from(lazySlot.data(state).cards[index])

        if (card.orientation === 'down') {return factory._faceDownCard(state, cardData)}

        const nrOfCards = slot.cards.length - index
        const pickUpCards = factory.pickUpCardsWithOffset(lazySlot, nrOfCards)
        const cardComponent = factory.card(pickUpCards, cardData)
        return cardComponent(state)
    }
}