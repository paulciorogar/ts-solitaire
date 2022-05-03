import { Component } from './component'
import { Card, CardNumber, conf, MoveCardFn, PickUpCardFn, State, Suit } from './state'
import { px, dom } from './utility'

export function newCard(
    data:Card,
    document:Document,
    state:State,
    pickUpCard:PickUpCardFn,
    setCard:()=>void,
    fetchData:(state:State)=>Card|undefined
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
    element.style.boxShadow = 'rgba(0, 0, 0, 0.16) 0px 1px 4px'

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
    renderCardData(data)

    element.addEventListener('mousedown', pickUpCard)
    element.addEventListener('mouseup', setCard)

    const component = new Component(element, update)
    return component

    function update(state:State, oldState:State, component:Component<'div'>) {
        const data = fetchData(state)
        if (data === undefined) return
        const oldData = fetchData(oldState)
        if (state.cardSize !== oldState.cardSize) {
            renderDimensions(state)
        }
        if (data === oldData) return
        renderCardData(data)
    }

    function renderCardData(data:Card) {
        dom.updatePosition(element, data)
        element.id = [cardNumber(data.number), data.suit].join('-')
        element.style.color = suitColor(data.suit)
        numberTop.textContent = cardNumber(data.number)
        numberBottom.textContent = cardNumber(data.number)
        suiteTop.textContent = data.suit
        suiteBottom.textContent = data.suit
        suiteMiddle.textContent = data.suit
    }

    function renderDimensions(state:State) {
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