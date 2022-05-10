import { Maybe } from '../maybe'
import { newFaceDownCard, newFaceUpCard } from './cardComponent'
import { Component } from './component'
import {
    addCardsToPackingSlot,
    addCardsToSlot, lazyPacking1, lazyPacking2, lazyPacking3, lazyPacking4, lazyPacking5, lazyPacking6, lazyPacking7, lazyTarget1, lazyTarget2, lazyTarget3, lazyTarget4, lazyWastePile, moveCard,
    nextCard, setCard
} from './game'
import { packingComponent } from './packingSlotComponent'
import { pickUpCards } from './pickUpCards'
import { Card, CardDataFn, conf, LazyCardSlot, NewEventFn, NO_OP, PickUpCardFn, State } from './state'
import { targetSlotFactory } from './targetSlot'
import { dom, px, throttle, top } from './utility'

export class Factory {

    constructor(private document:Document, readonly newEvent:NewEventFn) {}

    mainContainer(state:State):Component<any> {
        const factory = this
        const element = this.document.createElement('div')
        const moveCardCallback = this.moveCard()

        let handComponent:Maybe<Component<any>> = Maybe.nothing()
        element.style.position = 'fixed'
        element.style.width = '100%'
        element.style.height = '100%'

        const container = new Component(element, update)
        container.append(this.sourcePile())
        container.append(this.wastePile(state))
        container.append(this.target1(state))
        container.append(this.target2(state))
        container.append(this.target3(state))
        container.append(this.target4(state))
        container.append(this.packing1())
        container.append(this.packing2())
        container.append(this.packing3())
        container.append(this.packing4())
        container.append(this.packing5())
        container.append(this.packing6())
        container.append(this.packing7())
        return container

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.container !== oldState.container) {
                dom.updateDimensions(element, state.container)
                dom.updatePosition(element, state.container)
            }

            if (state.hand !== oldState.hand) {
                handComponent = state.hand.cata(removeComponent, addComponent)
            }

            function removeComponent():Maybe<Component<any>> {
                return handComponent.bind(cmp => {
                    document.body.removeEventListener('mousemove',  moveCardCallback)
                    component.remove(cmp)
                    return Maybe.nothing()
                })
            }

            function addComponent():Maybe<Component<any>> {
                return handComponent.catchMap(() => {
                    const newHandComponent = factory.handComponent(state)
                    newHandComponent.element.addEventListener('mouseup', factory.setCard())
                    document.body.addEventListener('mousemove', moveCardCallback)
                    component.append(newHandComponent)
                    return newHandComponent
                })
            }
        }
    }

    handComponent(state:State) {
        const element = this.document.createElement('div')
        const component = new Component(element, update(this))
        return component

        function update(factory:Factory) {
            return (state:State, oldState:State) => {
                const cards = state.hand.fold([])(hand => hand.cards)
                const oldCards = oldState.hand.fold([])(hand => hand.cards)
                if (cards === oldCards) return
                component.removeAll()
                cards.forEach((_, index) => {
                    const cardData = (state:State) => state.hand.bind(hand => Maybe.from(hand.cards[index]))
                    const cardComponent = factory.card(NO_OP, cardData)
                    component.append(cardComponent(state))
                })
            }
        }
    }

    sourcePile():Component<'div'> {
        const element = this.cardSlotElement()
        element.addEventListener('click', () => this.newEvent(nextCard))
        let card:Component<any>|undefined = undefined
        const update = (state:State, oldState:State, component:Component<'div'>) => {
            if (state.sourcePile === oldState.sourcePile) return
            dom.updateDimensions(element, state.sourcePile)
            dom.updatePosition(element, state.sourcePile)

            if (state.sourcePile.cards.length === 0 && card) {
                component.remove(card)
                card = undefined
            }

            if (state.sourcePile.cards.length > 0 && card === undefined) {
                const cardData = (state:State) => top(state.sourcePile.cards)
                card = this._faceDownCard(state, cardData)
                component.append(card)
            }

        }
        const result = new Component(element, update)
        return result
    }

    wastePile(state:State):Component<any> {
        const factory = this
        const pickUpCard = this.pickUpCards(lazyWastePile)
        const element = this.cardSlotElement()
        const component = new Component(element, update)
        renderCards(state)
        return component

        function update(state:State, oldState:State) {
            if (state.wastePile === oldState.wastePile) return
            dom.updateDimensions(element, state.wastePile)
            dom.updatePosition(element, state.wastePile)

            if (state.wastePile.cards !== oldState.wastePile.cards) {
                renderCards(state)
            }
        }

        function renderCards(state:State) {
            component.removeAll()
            const lazyCardData = (state:State) => top(state.wastePile.cards)
            const cardData = lazyCardData(state)
            cardData.map(addCard)

            function addCard(data:Card) {
                const comp = factory.card(pickUpCard, lazyCardData)
                component.append(comp(state))
            }
        }
    }

    target1(state:State):Component<any> {
        const cardData = (state:State) => top(state.target1.cards)
        const pickUpCard = this.pickUpCards(lazyTarget1)

        return targetSlotFactory({
            state: state,
            element: this.cardSlotElement(),
            cardData: cardData,
            slotData: lazyTarget1.data,
            newCardComponent: this.card(pickUpCard, cardData)
        })
    }

    target2(state:State):Component<any> {
        const cardData = (state:State) => top(state.target2.cards)
        const pickUpCard = this.pickUpCards(lazyTarget2)

        return targetSlotFactory({
            state: state,
            element: this.cardSlotElement(),
            cardData: cardData,
            slotData: lazyTarget2.data,
            newCardComponent: this.card(pickUpCard, cardData)
        })
    }

    target3(state:State):Component<any> {
        const cardData = (state:State) => top(state.target3.cards)
        const pickUpCard = this.pickUpCards(lazyTarget3)

        return targetSlotFactory({
            state: state,
            element: this.cardSlotElement(),
            cardData: cardData,
            slotData: lazyTarget3.data,
            newCardComponent: this.card(pickUpCard, cardData)
        })
    }

    target4(state:State):Component<any> {
        const cardData = (state:State) => top(state.target4.cards)
        const pickUpCard = this.pickUpCards(lazyTarget4)

        return targetSlotFactory({
            state: state,
            element: this.cardSlotElement(),
            cardData: cardData,
            slotData: lazyTarget4.data,
            newCardComponent: this.card(pickUpCard, cardData)
        })
    }

    packing1():Component<any> {
        return packingComponent(this, lazyPacking1)
    }

    packing2():Component<any> {
        return packingComponent(this, lazyPacking2)
    }

    packing3():Component<any> {
        return packingComponent(this, lazyPacking3)
    }

    packing4():Component<any> {
        return packingComponent(this, lazyPacking4)
    }

    packing5():Component<any> {
        return packingComponent(this, lazyPacking5)
    }

    packing6():Component<any> {
        return packingComponent(this, lazyPacking6)
    }

    packing7():Component<any> {
        return packingComponent(this, lazyPacking7)
    }

    card(pickUpCard:PickUpCardFn, cardData:CardDataFn) {
        return (state:State) => {
            return newFaceUpCard(this.document, state, pickUpCard, cardData)
        }
    }

    setCard() {
        return () => this.newEvent(setCard)
    }

    moveCard() {
        return throttle((event:MouseEvent) => {
            this.newEvent(moveCard(event))
        }, 16)
    }

    faceDownCard() {
        const element = this.document.createElement('div')
        element.style.borderRadius = px(8)
        element.style.height = '100%'
        element.style.width = '100%'
        element.style.boxSizing = 'border-box'
        // element.style.background = '#3d3861'
        element.style.background = [
            'linear-gradient(217deg, rgba(255,0,0,.8), rgba(255,0,0,0) 70.71%),',
            'linear-gradient(127deg, rgba(0,255,0,.8), rgba(0,255,0,0) 70.71%),',
            'linear-gradient(336deg, rgba(0,0,255,.8), rgba(0,0,255,0) 70.71%)'
        ].join('')
        // element.style.background = 'repeating-linear-gradient(120deg, #0092b7 0,black 1px, black .25em, #0092b7 calc(.25em + 1px), #0092b7 .75em)'
        // element.style.border = '2px solid rgb(187, 0, 255)'
        const result = new Component(element, NO_OP)
        return result
    }

    _faceDownCard(state:State, cardData:CardDataFn) {
        return newFaceDownCard(this.document, state, cardData)
    }

    cardSlotElement():HTMLDivElement {
        const element = this.document.createElement('div')
        element.style.borderRadius = px(8)
        element.style.position = 'fixed'
        element.style.boxSizing = 'border-box'
        element.style.background = '#1f1d32'
        element.style.border = ['2px solid', conf.cardSlotBorderColor].join(' ')
        return element
    }

    pickUpCards(lazySlot:LazyCardSlot, numberOfCards = 1) {
        return pickUpCards(this.newEvent, addCardsToSlot, lazySlot, numberOfCards)
    }

    pickUpCardsWithOffset(lazySlot:LazyCardSlot, numberOfCards = 1) {
        return pickUpCards(this.newEvent, addCardsToPackingSlot, lazySlot, numberOfCards)
    }
}