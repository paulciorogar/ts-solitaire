import { Component } from './component'
import { Card, conf, Dimensions, EventFn, NO_OP, Point, State, Suit, CardNumber } from './state';
import { px, top } from './utility'

export class Factory {

    constructor(private document:Document, private newEvent:(fn:EventFn)=>void) {}

    mainContainer(state:State):Component<any> {
        const element = this.document.createElement('div')
        element.style.position = 'fixed'
        element.style.width = '100%'
        element.style.height = '100%'

        const container = new Component(element, update)
        container.append(this.hand())
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
                updateDimensions(element, state.container)
                updatePosition(element, state.container)
            }
        }
    }

    hand():Component<'div'> {
        const element = this.cardSlotElement()
        let card:Component<any>|undefined = undefined
        const update = (state:State, oldState:State, component:Component<'div'>) => {
            if (state.hand === oldState.hand) return
            updateDimensions(element, state.hand)
            updatePosition(element, state.hand)

            if (state.hand.cards.length === 0 && card) {
                component.remove(card)
                card = undefined
            }

            if (state.hand.cards.length > 0 && card === undefined) {
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
                updateDimensions(element, state.wastePile)
                updatePosition(element, state.wastePile)
            }

            if (state.wastePile.cards !== oldState.wastePile.cards) {
                renderCards(state)
            }
        }

        function renderCards(state:State) {
            const [first, second] = top(state.wastePile.cards, 2)
            if (first && bottomCard === undefined) {
                bottomCard = factory.card(state, bottomCardData)
                component.append(bottomCard)
            }
            if (second && topCard === undefined) {
                topCard = factory.card(state, bottomCardData)
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

        function bottomCardData(state:State):Card {
            const [first,_] = top(state.wastePile.cards, 2)
            return first
        }
    }

    target1():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.target1 === oldState.target1) return
            updateDimensions(element, state.target1)
            updatePosition(element, state.target1)
        }
    }

    target2():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.target2 === oldState.target2) return
            updateDimensions(element, state.target2)
            updatePosition(element, state.target2)
        }
    }

    target3():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.target3 === oldState.target3) return
            updateDimensions(element, state.target3)
            updatePosition(element, state.target3)
        }
    }

    target4():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.target4 === oldState.target4) return
            updateDimensions(element, state.target4)
            updatePosition(element, state.target4)
        }
    }

    packing1():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.packing1 === oldState.packing1) return
            updateDimensions(element, state.packing1)
            updatePosition(element, state.packing1)
        }
    }

    packing2():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.packing2 === oldState.packing2) return
            updateDimensions(element, state.packing2)
            updatePosition(element, state.packing2)
        }
    }

    packing3():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.packing3 === oldState.packing3) return
            updateDimensions(element, state.packing3)
            updatePosition(element, state.packing3)
        }
    }

    packing4():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.packing4 === oldState.packing4) return
            updateDimensions(element, state.packing4)
            updatePosition(element, state.packing4)
        }
    }

    packing5():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.packing5 === oldState.packing5) return
            updateDimensions(element, state.packing5)
            updatePosition(element, state.packing5)
        }
    }

    packing6():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.packing6 === oldState.packing6) return
            updateDimensions(element, state.packing6)
            updatePosition(element, state.packing6)
        }
    }

    packing7():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.packing7 === oldState.packing7) return
            updateDimensions(element, state.packing7)
            updatePosition(element, state.packing7)
        }
    }

    card(state:State, fetchData:(state:State)=>Card) {
        const data = fetchData(state)
        const element = this.document.createElement('div')
        const topRow = this.document.createElement('div')
        const middleRow = this.document.createElement('div')
        const bottomRow = this.document.createElement('div')
        const numberTop = this.document.createElement('span')
        const suiteTop = this.document.createElement('span')
        const suiteBottom = this.document.createElement('span')
        const numberBottom = this.document.createElement('span')
        const suiteMiddle = this.document.createElement('span')

        element.style.position = 'fixed'
        element.style.display = 'flex'
        element.style.flexDirection = 'column'
        element.style.boxSizing = 'border-box'
        element.style.background = '#414060'
        element.style.boxShadow = 'rgba(0, 0, 0, 0.16) 0px 1px 4px'

        element.style.color = suitColor(data.suit)
        numberTop.textContent = cardNumber(data.number)
        numberBottom.textContent = cardNumber(data.number)
        suiteTop.textContent = data.suit
        suiteBottom.textContent = data.suit

        numberTop.style.whiteSpace = 'pre'

        numberBottom.style.transform = 'rotate(180deg)'
        numberBottom.style.display = 'inline-block'
        numberBottom.style.whiteSpace = 'pre'

        suiteBottom.style.transform = 'rotate(180deg)'
        suiteBottom.style.display = 'inline-block'

        suiteMiddle.textContent = data.suit

        topRow.style.display = 'flex'

        middleRow.style.flex = '1'
        middleRow.style.display = 'flex'
        middleRow.style.alignItems = 'center'
        middleRow.style.justifyContent = 'center'
        middleRow.style.overflow = 'hidden'

        bottomRow.style.display = 'flex'
        bottomRow.style.justifyContent = 'end'

        topRow.appendChild(numberTop)
        topRow.appendChild(suiteTop)
        element.appendChild(topRow)

        middleRow.appendChild(suiteMiddle)
        element.appendChild(middleRow)

        bottomRow.appendChild(suiteBottom)
        bottomRow.appendChild(numberBottom)
        element.appendChild(bottomRow)

        const component = new Component(element, update)

        return component

        function update(state:State, oldState:State, component:Component<'div'>) {
            const data = fetchData(state)
            const oldData = fetchData(oldState)
            if (state.cardSize !== oldState.cardSize) {
                updateDimensions(element, state.cardSize)
                element.style.borderRadius = px(Math.ceil(state.cardSize.height * 0.05)) // TODO move to state
                numberTop.style.fontSize = px(Math.ceil(state.cardSize.height * 0.1))
                numberBottom.style.fontSize = px(Math.ceil(state.cardSize.height * 0.1))
                suiteTop.style.fontSize = px(Math.ceil(state.cardSize.height * 0.12))
                suiteBottom.style.fontSize = px(Math.ceil(state.cardSize.height * 0.12))
                suiteMiddle.style.fontSize = px(Math.ceil(state.cardSize.height * 0.40))
                suiteMiddle.style.marginBottom = px(Math.ceil(state.cardSize.height * 0.15))
            }
            if (data === oldData) return
            updatePosition(element, data)
            element.style.color = suitColor(data.suit)
            numberTop.textContent = cardNumber(data.number)
            numberBottom.textContent = cardNumber(data.number)
            suiteTop.textContent = data.suit
            suiteBottom.textContent = data.suit
        }
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

function updateDimensions(element:HTMLElement, data:Dimensions):void {
    element.style.width = px(data.width)
    element.style.height = px(data.height)
}

function updatePosition(element:HTMLElement, data:Point) {
    element.style.top = px(data.y)
    element.style.left = px(data.x)
}

function suitColor(suit:Suit):string {
    switch(suit) {
        case '♠': return conf.blackSuitColor
        case '♣': return conf.blackSuitColor
        case '♥': return conf.blackSuitColor
        case '♦': return conf.blackSuitColor
    }
}

function cardNumber(number:CardNumber):string {
    if (number === 1) return ' A'
    if (number === 11) return ' J'
    if (number === 12) return ' Q'
    if (number === 13) return ' K'
    return ' ' + number.toString()
}