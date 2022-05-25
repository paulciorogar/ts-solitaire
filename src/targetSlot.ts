import { Maybe } from './maybe'
import { Component } from './component'
import { CardDataFn, conf, LazyCardSlot, SlotDataFn, State } from './state'
import { dom } from './utility'

export type TargetSlotFactorySpec = {
    state: State
    element: HTMLDivElement
    cardData: CardDataFn
    slotData: SlotDataFn
    newCardComponent: (state: State) => Component<any>
}

export function targetSlotFactory (spec: TargetSlotFactorySpec): Component<any> {
    const { state, element, cardData, slotData, newCardComponent } = spec
    const component = new Component(element, update)
    renderCard(state)
    return component

    function update (state: State, oldState: State) {
        const slot = slotData(state)
        const oldSlot = slotData(oldState)

        if (state.hand !== oldState.hand) {
            state.hand.bind(hand => {
                return hand.hoveringSlot
            })
                .bind(lazySlot => {
                    const data = lazySlot.data(state)
                    if (data !== slot) { return Maybe.nothing() }
                    element.style.borderColor = 'red'
                    return Maybe.just(true)
                }).catchMap(() => element.style.borderColor = conf.cardSlotBorderColor)
        }


        if (slot === oldSlot) return
        dom.updateDimensions(element, slot)
        dom.updatePosition(element, slot)

        if (slot.cards !== oldSlot.cards) {
            renderCard(state)
        }
    }

    function renderCard (state: State) {
        component.removeAll()
        cardData(state).map(() => component.append(newCardComponent(state)))
    }
}
