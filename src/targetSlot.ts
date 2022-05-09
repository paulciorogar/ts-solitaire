import { Component } from './component'
import { Factory } from './factory'
import { Card, CardDataFn, PickUpCardFn, State } from './state'
import { dom } from './utility'

export type TargetSlotFactorySpec = {
    state:State
    factory:Factory
    cardData:CardDataFn
    pickUpCard:PickUpCardFn
    newCardComponent:(state:State)=>Component<any>
}

export function targetSlotFactory(spec:TargetSlotFactorySpec):Component<any> {
    const element = spec.factory.cardSlotElement()
    const component = new Component(element, update)
    renderCard(spec.state)
    return component

    function update(state:State, oldState:State) {
        if (state.target1 === oldState.target1) return
        dom.updateDimensions(element, state.target1)
        dom.updatePosition(element, state.target1)

        if (state.target1.cards !== oldState.target1.cards) {
            renderCard(state)
        }
    }

    function renderCard(state:State) {
        component.removeAll()
        spec.cardData(state).map(card => component.append(spec.newCardComponent(state)))
    }
}

function newCardComponent(factory:Factory, pickUpCard:PickUpCardFn, cardData:CardDataFn) {
    return function (state:State) {
        return factory.__card(state, pickUpCard, cardData)
    }
}
