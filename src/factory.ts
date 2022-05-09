import { Maybe } from '../maybe'
import { newCard, _newCard, __newCard } from './cardComponent'
import { Component } from './component'
import { addCardToSlot, moveCard, nextCard, pickUpCardFromTarget1, pickUpCardFromWastePile, removeTopCardsFromSlot, setCard, updateHand, updateTarget2 } from './game'
import { Card, CardDataFn, conf, EventFn, Hand, LazyCardSlot, NO_OP, PickUpCardFn, State } from './state'
import { targetSlotFactory } from './targetSlot'
import { dom, pipe, px, throttle, top, topN, _top } from './utility'

export class Factory {

    constructor(private document:Document, readonly newEvent:(fn:EventFn)=>void) {}

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
                handComponent = state.hand.cata(removeComponent, addComponent)
            }

            function removeComponent():Maybe<Component<any>> {
                return handComponent.bind(cmp => {
                    document.body.removeEventListener('mousemove',  moveCardCallback)
                    component.remove(cmp)
                    return Maybe.nothing(cmp)
                })
            }

            function addComponent(hand:Hand) {
                return handComponent.catchMap(() => {
                    const newHandComponent = factory.hand(state)
                    newHandComponent.element.addEventListener('mouseup', factory.setCard())
                    document.body.addEventListener('mousemove', moveCardCallback)
                    component.append(newHandComponent)
                    return Maybe.just(newHandComponent)
                })
            }
        }
    }

    hand(state:State) {
        return this.__card(NO_OP, fetchData)(state)

        function fetchData(state:State):Maybe<ReadonlyArray<Card>> {
            return state.hand.fold(Maybe.nothing())(hand => Maybe.just([hand.cards]))
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
        renderCards(state)
        return component

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.wastePile === oldState.wastePile) return
            dom.updateDimensions(element, state.wastePile)
            dom.updatePosition(element, state.wastePile)

            if (state.wastePile.cards !== oldState.wastePile.cards) {
                renderCards(state)
            }
        }

        function renderCards(state:State) {
            component.removeAll()
            const lazyCardData = (state:State) => _top(state.wastePile.cards)
            const cardData = lazyCardData(state)
            cardData.map(addCard)

            function addCard(data:Card) {
                const comp = factory._card(data, state, pickUpCard, lazyCardData)
                component.append(comp)
            }
        }

        function pickUpCard(event:MouseEvent) {
            factory.newEvent(pickUpCardFromWastePile(event))
        }
    }

    target1(state:State):Component<any> {
        const slotData = (state:State) => state.target1
        const cardData = (state:State) => _top(state.target1.cards)
        const pickUpCard = this.pickUpCard(pickUpCardFromTarget1)

        return targetSlotFactory({
            state: state,
            element: this.cardSlotElement(),
            cardData: cardData,
            slotData: slotData,
            newCardComponent: this.__card(pickUpCard, cardData)
        })
    }

    target2(state:State):Component<'div'> {
        const slotData = (state:State) => state.target2
        const cardData = (state:State) => _top(state.target2.cards)
        const pickUpCard = this.pickUpCards({
            data: slotData,
            update: updateTarget2
        })

        return targetSlotFactory({
            state: state,
            element: this.cardSlotElement(),
            cardData: cardData,
            slotData: slotData,
            newCardComponent: this.__card(pickUpCard, cardData)
        })

        const element = this.cardSlotElement()
        const result = new Component(element, update(this))
        renderCard(state, this)
        return result

        function update(factory:Factory) {
            return function update(state:State, oldState:State, component:Component<'div'>) {
                if (state.target2 === oldState.target2) return
                dom.updateDimensions(element, state.target2)
                dom.updatePosition(element, state.target2)

                if (state.target2.cards !== oldState.target2.cards) {
                    renderCard(state, factory)
                }
            }
        }

        function renderCard(state:State, factory:Factory) {
            const lazyCardData = (state:State) => _top(state.target2.cards)
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

    card(card:Card, state:State, pickUpCard:PickUpCardFn, fetchData:(state:State)=>Card|undefined) {
        return newCard(card, this.document, state, pickUpCard, fetchData)
    }

    _card(card:Card, state:State, pickUpCard:PickUpCardFn, cardData:CardDataFn) {
        return _newCard(card, this.document, state, pickUpCard, cardData)
    }

    __card(pickUpCard:PickUpCardFn, cardData:CardDataFn) {
        return (state:State) => {
            return __newCard(this.document, state, pickUpCard, cardData)
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

    pickUpCard(fn:(event:MouseEvent)=>EventFn) {
        return (event:MouseEvent) => this.newEvent(fn(event))
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
        element.style.border = ['2px solid', conf.cardSlotBorderColor].join(' ')
        return element
    }

    pickUpCards(lazySlot:LazyCardSlot) {
        return (event:MouseEvent) => this.newEvent((state:State):State => {
                const slot = lazySlot.data(state)
                const cards = topN(slot.cards, 1)
                return cards.fold(state)(cards => {
                    return pipe(state)
                    .pipe(updateHand(() => Maybe.just({
                        startX: event.screenX,
                        startY: event.screenY,
                        cards,
                        highlight:false,
                        returnCard: addCardToSlot(lazySlot.update, lazySlot.data),
                        addCardToSlot: Maybe.nothing()
                    })))
                    .pipe(removeTopCardsFromSlot(lazySlot, 1))
                    .run()
                })
            }
        )
    }
}