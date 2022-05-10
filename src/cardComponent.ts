import { Component } from './component'
import { addOffsetY } from './game'
import { Card, CardDataFn, CardNumber, conf, PickUpCardFn, State, Suit } from './state'
import { dom, px } from './utility'

export function newFaceUpCard(
    document:Document,
    state:State,
    pickUpCard:PickUpCardFn,
    cardData:CardDataFn,
) {
    const element = document.createElement('div')
    const topRow = document.createElement('div')
    const middleRow = document.createElement('div')
    const bottomRow = document.createElement('div')
    const numberTop = document.createElement('span')
    const suiteTop = document.createElement('span')
    const suiteBottom = document.createElement('span')
    const numberBottom = document.createElement('span')
    const suiteMiddle = document.createElement('span')

    element.style.position = 'fixed'
    element.style.display = 'flex'
    element.style.flexDirection = 'column'
    element.style.boxSizing = 'border-box'
    element.style.background = '#414060'
    element.style.cursor = 'grab'
    element.style.userSelect = 'none'
    element.style.boxShadow = 'rgba(0, 0, 0, 0.50) 0px 0px 8px'
    element.style.whiteSpace = 'pre'

    numberBottom.style.transform = 'rotate(180deg)'
    numberBottom.style.display = 'inline-block'

    suiteBottom.style.transform = 'rotate(180deg)'
    suiteBottom.style.display = 'inline-block'


    topRow.style.display = 'flex'
    topRow.style.alignItems = 'center'

    middleRow.style.flex = '1'
    middleRow.style.display = 'flex'
    middleRow.style.alignItems = 'center'
    middleRow.style.justifyContent = 'center'
    middleRow.style.overflow = 'hidden'

    bottomRow.style.display = 'flex'
    bottomRow.style.justifyContent = 'end'
    bottomRow.style.alignItems = 'center'

    topRow.appendChild(suiteTop)
    topRow.appendChild(numberTop)
    element.appendChild(topRow)

    middleRow.appendChild(suiteMiddle)
    element.appendChild(middleRow)

    bottomRow.appendChild(numberBottom)
    bottomRow.appendChild(suiteBottom)
    element.appendChild(bottomRow)

    renderDimensions(state)
    cardData(state).map(renderCardData)

    element.addEventListener('mousedown', pickUpCard)

    const component = new Component(element, update)
    return component

    function update(state:State, oldState:State, component:Component<'div'>) {
        if (state.cardSize !== oldState.cardSize) {
            renderDimensions(state)
        }

        const data = cardData(state)
        const oldData = cardData(oldState)

        if (data.equals(oldData)) return
        data.map(renderCardData)
    }

    function renderCardData(data: Card) {
        element.id = [cardNumber(data.number), data.suit].join('-')
        element.style.color = suitColor(data.suit)
        numberTop.textContent = cardNumber(data.number)
        numberBottom.textContent = cardNumber(data.number)
        suiteTop.textContent = ' ' + data.suit
        suiteBottom.textContent = ' ' + data.suit
        suiteMiddle.textContent = data.suit
    }

    function renderDimensions(state:State) {
        const data = cardData(state)
        data.map(card => dom.updatePosition(element, card))


        dom.updateDimensions(element, state.cardSize)
        element.style.borderRadius = px(Math.ceil(state.cardSize.height * 0.05)) // TODO move to state
        numberTop.style.fontSize = px(Math.ceil(state.cardSize.height * 0.1))
        numberBottom.style.fontSize = px(Math.ceil(state.cardSize.height * 0.1))
        suiteTop.style.fontSize = px(Math.ceil(state.cardSize.height * 0.12))
        suiteBottom.style.fontSize = px(Math.ceil(state.cardSize.height * 0.12))
        suiteMiddle.style.fontSize = px(Math.ceil(state.cardSize.height * 0.40))
        suiteMiddle.style.marginBottom = px(Math.ceil(state.cardSize.height * 0.15))
    }
}

export function newFaceDownCard(
    document:Document,
    state:State,
    cardData:CardDataFn,
) {
    const element = document.createElement('div')
    element.style.position = 'fixed'
    element.style.display = 'flex'
    element.style.flexDirection = 'column'
    element.style.boxSizing = 'border-box'
    element.style.userSelect = 'none'
    element.style.boxShadow = 'rgba(0, 0, 0, 0.50) 0px 0px 8px'
    element.style.background = 'linear-gradient(300deg, rgb(31 29 50) 0%, rgb(138, 0, 21) 100%)'

    renderDimensions(state)
    cardData(state).map(renderCardData)

    const component = new Component(element, update)
    return component

    function update(state:State, oldState:State, component:Component<'div'>) {
        if (state.cardSize !== oldState.cardSize) {
            renderDimensions(state)
        }

        const data = cardData(state)
        const oldData = cardData(oldState)

        if (data.equals(oldData)) return
        data.map(renderCardData)
    }

    function renderCardData(data: Card) {
        element.id = [cardNumber(data.number), data.suit].join('-')
        element.style.color = suitColor(data.suit)
    }

    function renderDimensions(state:State) {
        const data = cardData(state)
        data.map(card => dom.updatePosition(element, card))

        dom.updateDimensions(element, state.cardSize)
        element.style.borderRadius = px(Math.ceil(state.cardSize.height * 0.05)) // TODO move to state
    }
}

function suitColor(suit:Suit):string {
    switch(suit) {
        case '♠': return conf.blackSuitColor
        case '♣': return conf.blackSuitColor
        case '♥': return conf.redSuitColor
        case '♦': return conf.redSuitColor
    }
}

function cardNumber(number:CardNumber):string {
    if (number === 1) return ' A'
    if (number === 11) return ' J'
    if (number === 12) return ' Q'
    if (number === 13) return ' K'
    return ' ' + number.toString()
}