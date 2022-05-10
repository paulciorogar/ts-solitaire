import { Component } from './component'
import { addOffsetY, updatePosition } from './game'
import { Card, CardDataFn, CardNumber, conf, MoveCardFn, PickUpCardFn, Point, State, Suit } from './state'
import { px, dom } from './utility'

export function newCard(
    document:Document,
    state:State,
    pickUpCard:PickUpCardFn,
    cardData:CardDataFn,
    offsetStep:number
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

    numberTop.style.whiteSpace = 'pre'

    numberBottom.style.transform = 'rotate(180deg)'
    numberBottom.style.display = 'inline-block'
    numberBottom.style.whiteSpace = 'pre'

    suiteBottom.style.transform = 'rotate(180deg)'
    suiteBottom.style.display = 'inline-block'


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
        suiteTop.textContent = data.suit
        suiteBottom.textContent = data.suit
        suiteMiddle.textContent = data.suit
    }

    function renderDimensions(state:State) {
        const data = cardData(state)
        const offset = addOffsetY(offsetStep * state.cardOffsetSize)
        data.map(card => dom.updatePosition(element, offset(card)))


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