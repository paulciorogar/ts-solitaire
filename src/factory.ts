import { Component } from './component'
import { Card, conf, Dimensions, EventFn, NO_OP, Point, State, Suit, CardNumber, PickUpCardFn, CardSlot, CardStack, MoveCardFn } from './state';
import { px, top, dom, throttle } from './utility';
import { moveCard, nextCard, pickUpCardFromWastePile, setCard } from './game';
import { newCard } from './cardComponent';

export class Factory {

    constructor(private document:Document, readonly newEvent:(fn:EventFn)=>void) {}

    mainContainer(state:State):Component<any> {
        const factory = this
        const element = this.document.createElement('div')
        let moveCardCallback:MoveCardFn|undefined

        let hand:Component<'div'>|undefined = undefined
        element.style.position = 'fixed'
        element.style.width = '100%'
        element.style.height = '100%'

        const container = new Component(element, update)
        container.append(this.sourcePile())
        container.append(this.wastePile(state))
        container.append(this.target1())
        container.append(this.target2())
        container.append(this.target3())
        container.append(this.target4())
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
                if (state.hand === undefined && hand) {
                    component.remove(hand)
                }
                if (state.hand && hand === undefined) {
                    hand = factory.hand(state.hand.card, state)
                    component.append(hand)
                }
            }
            if (state.hand !== oldState.hand) {
                if (state.hand === undefined && moveCardCallback) {
                    document.body.removeEventListener('mousemove',  moveCardCallback)
                    moveCardCallback = undefined
                }
                if (state.hand && moveCardCallback === undefined) {
                    moveCardCallback = factory.moveCard()
                    document.body.addEventListener('mousemove', moveCardCallback)
                }
            }
        }
    }

    hand(card:Card, state:State) {
        return this.card(card, state, NO_OP, this.moveCard(), fetchData)

        function fetchData(state:State):Card|undefined {
            return state.hand?.card
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
                card = this.faceDownCard()
                component.append(card)
            }

        }
        const result = new Component(element, update)
        return result
    }

    wastePile(state:State):Component<'div'> {
        const factory = this
        const element = this.cardSlotElement()
        const component = new Component(element, update)
        let topCard:Component<any>|undefined = undefined
        let bottomCard:Component<any>|undefined = undefined

        renderCards(state)

        return component

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.wastePile === oldState.wastePile) return

            if (state.wastePile.height !== oldState.wastePile.height) {
                dom.updateDimensions(element, state.wastePile)
                dom.updatePosition(element, state.wastePile)
            }

            if (state.wastePile.cards !== oldState.wastePile.cards) {
                renderCards(state)
            }
        }

        function renderCards(state:State) {
            const [first, second] = top(state.wastePile.cards, 2)
            if (first && bottomCard === undefined) {
                bottomCard = factory.card(first, state, pickUpCard, NO_OP, bottomCardData)
                component.append(bottomCard)
            }
            if (second && topCard === undefined) {
                topCard = factory.card(second, state, pickUpCard, NO_OP, topCardData)
                component.append(topCard)
            }
            if (second === undefined && topCard) {
                component.remove(topCard)
                topCard = undefined
            }
            if (first === undefined && bottomCard) {
                component.remove(bottomCard)
                bottomCard = undefined
            }
        }

        function bottomCardData(state:State):Card|undefined {
            const [first,_] = top(state.wastePile.cards, 2)
            return first
        }

        function topCardData(state:State):Card|undefined {
            const [_,second] = top(state.wastePile.cards, 2)
            return second
        }

        function pickUpCard(event:MouseEvent) {
            factory.newEvent(pickUpCardFromWastePile(event))
        }
    }

    target1():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.target1 === oldState.target1) return
            dom.updateDimensions(element, state.target1)
            dom.updatePosition(element, state.target1)
        }
    }

    target2():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.target2 === oldState.target2) return
            dom.updateDimensions(element, state.target2)
            dom.updatePosition(element, state.target2)
        }
    }

    target3():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.target3 === oldState.target3) return
            dom.updateDimensions(element, state.target3)
            dom.updatePosition(element, state.target3)
        }
    }

    target4():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.target4 === oldState.target4) return
            dom.updateDimensions(element, state.target4)
            dom.updatePosition(element, state.target4)
        }
    }

    packing1():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.packing1 === oldState.packing1) return
            dom.updateDimensions(element, state.packing1)
            dom.updatePosition(element, state.packing1)
        }
    }

    packing2():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.packing2 === oldState.packing2) return
            dom.updateDimensions(element, state.packing2)
            dom.updatePosition(element, state.packing2)
        }
    }

    packing3():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.packing3 === oldState.packing3) return
            dom.updateDimensions(element, state.packing3)
            dom.updatePosition(element, state.packing3)
        }
    }

    packing4():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.packing4 === oldState.packing4) return
            dom.updateDimensions(element, state.packing4)
            dom.updatePosition(element, state.packing4)
        }
    }

    packing5():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.packing5 === oldState.packing5) return
            dom.updateDimensions(element, state.packing5)
            dom.updatePosition(element, state.packing5)
        }
    }

    packing6():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.packing6 === oldState.packing6) return
            dom.updateDimensions(element, state.packing6)
            dom.updatePosition(element, state.packing6)
        }
    }

    packing7():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.packing7 === oldState.packing7) return
            dom.updateDimensions(element, state.packing7)
            dom.updatePosition(element, state.packing7)
        }
    }

    card(card:Card, state:State, pickUpCard:PickUpCardFn, moveCard:MoveCardFn, fetchData:(state:State)=>Card|undefined) {
        return newCard(card, this.document, state, pickUpCard, this.setCard(), fetchData)
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

    cardSlotElement():HTMLDivElement {
        const element = this.document.createElement('div')
        element.style.borderRadius = px(8)
        element.style.position = 'fixed'
        element.style.boxSizing = 'border-box'
        element.style.background = '#1f1d32'
        element.style.border = '2px solid #3d3861'
        return element
    }
}