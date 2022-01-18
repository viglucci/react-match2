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
                const blockId = event.data.block.id;
                this._map[blockId].position = vec3FromCoords({
                    x: event.data.current.x,
                    y: event.data.current.y,
                    ...conversionConstants
                });
                this._map[blockId].x = event.data.current.x;
                this._map[blockId].y = event.data.current.y;
                break;
            }
            case 'SPAWNED': {

                const [x, y] = vec3FromCoords({
                    x: event.data.x,
                    y: event.data.y,
                    ...conversionConstants
                });

                const z = calcSpawnZ({
                    y: event.data.y,
                    ...conversionConstants
                });

                const position = [x, y, z];

                this._map[event.data.block.id] = {
                    state: "spawning",
                    position,
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
