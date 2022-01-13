import {calcSpawnZ, vec3FromCoords} from "./helpers";

class PresentationModel {
    _list = [];
    _map = {};

    constructor(list, map) {
        this._list = list;
        this._map = map;
    }

    getList() {
        return this._list;
    }

    handleEvent(event) {
        const conversionConstants = {
            padding: 0.2,
            width: 1,
            height: 1,
            matrixWidth: 6,
            matrixHeight: 6
        };

        switch (event.type) {
            case 'REMOVED': {
                delete this._map[event.data.block.id];
                break;
            }
            case 'SHIFTED': {
                this._map[event.data.block.id].position = vec3FromCoords({
                    x: event.data.current.x,
                    y: event.data.current.y,
                    ...conversionConstants
                });
                this._map[event.data.block.id].nextPosition
                    = this._map[event.data.block.id].position;
                this._map[event.data.block.id].x = event.data.current.x;
                this._map[event.data.block.id].y = event.data.current.y;
                break;
            }
            case 'SPAWNED': {

                const nextPosition = vec3FromCoords({
                    x: event.data.x,
                    y: event.data.y,
                    ...conversionConstants
                });

                const position = [
                    nextPosition[0],
                    nextPosition[1],
                    calcSpawnZ({
                        y: event.data.y,
                        ...conversionConstants
                    })
                ];

                console.log({
                    ...event.data,
                    nextPosition,
                    position
                });

                this._map[event.data.block.id] = {
                    state: "spawning",
                    position,
                    nextPosition,
                    ...{...event.data.block},
                    x: event.data.x,
                    y: event.data.y,
                };
                break;
            }
            default: {
                console.warn('unhandled event', event);
            }
        }

        this._list = Object.keys(this._map).map((id) => {
            return this._map[id];
        });
    }
}

export default PresentationModel;
