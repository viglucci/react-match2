import {coordsToListIndex, getConnectedCoords, vec3FromCoords} from "./helpers";
import {data} from "autoprefixer";

class PresentationModel {
    _list = [];

    constructor(list) {
        this._list = list;
    }

    getList() {
        return this._list;
    }

    update(dataModel) {
        const blocks = dataModel.getList();
        const shifted = dataModel.getShifted();
        const spawned = dataModel.getSpawned();

        const translationConstants = {
            padding: 0.2,
            width: 1,
            height: 1,
            matrixWidth: 6,
            matrixHeight: 6
        };

        this._list = blocks.map(({ x, y, item }) => {
            const listIdx = coordsToListIndex({ x, y }, 6);
            let position = vec3FromCoords({
                x,
                y,
                ...translationConstants
            });
            let destination = position;

            if (shifted[listIdx]) {
                position = vec3FromCoords({
                    x: shifted[listIdx].previous.x,
                    y: shifted[listIdx].previous.y,
                    ...translationConstants
                });
            } else if(spawned.has(listIdx)) {
                const spawnPoint = -5;
                position = [
                    position[0],
                    position[1],
                    spawnPoint + (y * (translationConstants.height + translationConstants.padding))
                ];
            }

            const { type } = item;

            return {
                x,
                y,
                position,
                destination,
                type
            };
        });
    }
}

export default PresentationModel;
