import { State } from './state'


export type UpdateComponentFn<A extends keyof HTMLElementTagNameMap> = (state:State, oldState:State, component:Component<A>) => void

export class Component<A extends keyof HTMLElementTagNameMap> {

    private children:Component<any>[] = []

    constructor(
        readonly element:HTMLElementTagNameMap[A],
        private _update: UpdateComponentFn<A>
    ) {}

    append(item:Component<any>):void {
        this.element.appendChild(item.element)
        this.children.push(item)
    }

    remove(item:Component<any>):void {
        this.children = this.children.filter(child => {
            if (child === item) {
                this.element.removeChild(child.element)
                return false
            }
            return true
        })
    }

    removeAll():void {
        this.children.forEach(child => {
            this.element.removeChild(child.element)
        })
        this.children = []
    }

    forEachChild(fn:(child:Component<any>, index:number, list: Component<any>[])=>void):void {
        this.children.forEach(fn)
    }

    update(state:State, oldState:State):void {
        this._update(state, oldState, this)
    }
}

