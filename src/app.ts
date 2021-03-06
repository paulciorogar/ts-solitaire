import { Component } from './component'
import { Factory } from './factory'
import { Game, nextStep } from './game'
import { conf, newState, RenderFn, State } from './state'
import { throttle } from './utility'

window.addEventListener('load', () => {
    init(window.document)

    const state: State = newState()

    const render = () => renderFn(view)
    const game = new Game(window, state, nextStep, render)
    const newEvent = game.newEvent.bind(game)
    const factory = new Factory(document, newEvent)
    const view: Component<any> = factory.mainContainer(state)

    document.body.appendChild(view.element)

    const resizeObserver = new ResizeObserver(throttle(onResize(game, document), 30))
    resizeObserver.observe(document.body)

    game.run()
})


function renderFn(view: Component<any>): RenderFn {
    return function render(state: State, oldState: State) {
        view.update(state, oldState)
        view.forEachChild(child => renderFn(child)(state, oldState))
    }
}

function init(document: Document) {
    document.documentElement.style.height = '100%'
    document.body.style.width = '100%'
    document.body.style.height = '100%'
    document.body.style.margin = '0'
    document.body.style.boxSizing = 'border-box'
    document.body.style.backgroundColor = conf.backgroundColor
    document.body.style.fontFamily = 'Sans-serif'
}

function onResize(game: Game, document: Document): () => void {
    return function () {
        const box = document.body.getBoundingClientRect()
        game.newEvent(state => ({ ...state, body: { width: box.width, height: box.height } }))
    }
}

