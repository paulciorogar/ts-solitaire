
export const conf = Object.freeze({
    backgroundColor: '#000000',
    cardSlotBackgroundColor: '#201d36',
    cardRatio: {x: 63, y:88},
    cardMargin: 10,
    columns: 7,
    containerMargin: 40,
    aspectRation: {x: 16, y: 10},
})

export type NextFn = (state:State) => State
export type RenderFn = (state:State, oldState:State) => void
export type EventFn = (state:State) => State
export type Dimensions = {readonly width:number, readonly height:number}
export type Point = {readonly x:number, readonly y:number }
export type CardSlot = Dimensions & Point
export type CardSlots = {
    readonly hand:CardSlot
    readonly wastePile:CardSlot
    readonly target1:CardSlot
    readonly target2:CardSlot
    readonly target3:CardSlot
    readonly target4:CardSlot
    readonly packing1:CardSlot
    readonly packing2:CardSlot
    readonly packing3:CardSlot
    readonly packing4:CardSlot
    readonly packing5:CardSlot
    readonly packing6:CardSlot
    readonly packing7:CardSlot
}
export type State = {
    readonly eventQ:ReadonlyArray<EventFn>
    readonly body: Dimensions
    readonly container: Dimensions & Point
    readonly cardSize: Dimensions
    readonly cardSlots: CardSlots
}

export function newState():State {
    return {
        eventQ: [],
        body: {width: 0, height: 0},
        container: {width: 0, height: 0, y: 0, x: 0},
        cardSize: {width: 0, height: 0},
        cardSlots: {
            hand:       {width: 0, height: 0, y: 0, x: 0},
            wastePile:  {width: 0, height: 0, y: 0, x: 0},
            target1:    {width: 0, height: 0, y: 0, x: 0},
            target2:    {width: 0, height: 0, y: 0, x: 0},
            target3:    {width: 0, height: 0, y: 0, x: 0},
            target4:    {width: 0, height: 0, y: 0, x: 0},
            packing1:   {width: 0, height: 0, y: 0, x: 0},
            packing2:   {width: 0, height: 0, y: 0, x: 0},
            packing3:   {width: 0, height: 0, y: 0, x: 0},
            packing4:   {width: 0, height: 0, y: 0, x: 0},
            packing5:   {width: 0, height: 0, y: 0, x: 0},
            packing6:   {width: 0, height: 0, y: 0, x: 0},
            packing7:   {width: 0, height: 0, y: 0, x: 0},
        }
    }
}