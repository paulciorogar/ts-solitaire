import { Component } from './component'
import { Dimensions, EventFn, Point, State } from './state'
import { px } from './utility'

export class Factory {

    constructor(private document:Document, private newEvent:(fn:EventFn)=>void) {}

    mainContainer():Component<any> {
        const element = this.document.createElement('div')
        element.style.position = 'fixed'
        element.style.width = '100%'
        element.style.height = '100%'

        const container = new Component(element, update)
        container.append(this.hand())
        container.append(this.wastePile())
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
        const result = new Component(element, update)
        result.append(this.card())
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.cardSlots.hand === oldState.cardSlots.hand) return
            updateDimensions(element, state.cardSlots.hand)
            updatePosition(element, state.cardSlots.hand)
        }
    }

    wastePile():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.cardSlots.wastePile === oldState.cardSlots.wastePile) return
            updateDimensions(element, state.cardSlots.wastePile)
            updatePosition(element, state.cardSlots.wastePile)
        }
    }

    target1():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.cardSlots.target1 === oldState.cardSlots.target1) return
            updateDimensions(element, state.cardSlots.target1)
            updatePosition(element, state.cardSlots.target1)
        }
    }

    target2():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.cardSlots.target2 === oldState.cardSlots.target2) return
            updateDimensions(element, state.cardSlots.target2)
            updatePosition(element, state.cardSlots.target2)
        }
    }

    target3():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.cardSlots.target3 === oldState.cardSlots.target3) return
            updateDimensions(element, state.cardSlots.target3)
            updatePosition(element, state.cardSlots.target3)
        }
    }

    target4():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.cardSlots.target4 === oldState.cardSlots.target4) return
            updateDimensions(element, state.cardSlots.target4)
            updatePosition(element, state.cardSlots.target4)
        }
    }

    packing1():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.cardSlots.packing1 === oldState.cardSlots.packing1) return
            updateDimensions(element, state.cardSlots.packing1)
            updatePosition(element, state.cardSlots.packing1)
        }
    }

    packing2():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.cardSlots.packing2 === oldState.cardSlots.packing2) return
            updateDimensions(element, state.cardSlots.packing2)
            updatePosition(element, state.cardSlots.packing2)
        }
    }

    packing3():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.cardSlots.packing3 === oldState.cardSlots.packing3) return
            updateDimensions(element, state.cardSlots.packing3)
            updatePosition(element, state.cardSlots.packing3)
        }
    }

    packing4():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.cardSlots.packing4 === oldState.cardSlots.packing4) return
            updateDimensions(element, state.cardSlots.packing4)
            updatePosition(element, state.cardSlots.packing4)
        }
    }

    packing5():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.cardSlots.packing5 === oldState.cardSlots.packing5) return
            updateDimensions(element, state.cardSlots.packing5)
            updatePosition(element, state.cardSlots.packing5)
        }
    }

    packing6():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.cardSlots.packing6 === oldState.cardSlots.packing6) return
            updateDimensions(element, state.cardSlots.packing6)
            updatePosition(element, state.cardSlots.packing6)
        }
    }

    packing7():Component<'div'> {
        const element = this.cardSlotElement()
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.cardSlots.packing7 === oldState.cardSlots.packing7) return
            updateDimensions(element, state.cardSlots.packing7)
            updatePosition(element, state.cardSlots.packing7)
        }
    }

    card() {
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
        const result = new Component(element, update)
        return result

        function update(state:State, oldState:State, component:Component<'div'>) {
            if (state.cardSize === oldState.cardSize) return
            updateDimensions(element, state.cardSize)
            // updatePosition(element, data)

        }
    }

    cardSlotElement():HTMLDivElement {
        const element = this.document.createElement('div')
        element.style.borderRadius = px(8)
        element.style.position = 'fixed'
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