import {coordsToListIndex, getConnectedCoords, isOnBoard, listIndexToCoords, randomBlock} from "./helpers";
import {Subject} from "rxjs";

class DataModel {
    _list = [];
    _matches = [];
    _dimensions = {};
    events = new Subject();

    getDimensions() {
        return this._dimensions;
    }

    getMatches({ x, y }) {
        const listIdx = coordsToListIndex({ x, y }, this._dimensions.width);
        return this._matches[listIdx];
    }

    getList() {
        return this._list;
    }

    getItem({ x, y }) {
        const listIdx = coordsToListIndex({ x, y }, this._dimensions.width);
        return this._list[listIdx];
    }

    update() {
        this._matches = this._buildMatchesList();
    }

    remove(index) {
        this.events.next({
            type: "REMOVED",
            data: {
                ...this._list[index]
            }
        });
        this._list[index].block = null;
    }

    shift() {
        const depths = {};
        for (let i = this._list.length - 1; i >= 0; i--) {
            const { x, y, block } = this._list[i];
            if (block) {
                const deepestAvailable = depths[x] || -1;
                if (deepestAvailable >= 0) {
                    const newListIdx = coordsToListIndex({ x, y: deepestAvailable }, this._dimensions.width);
                    this.events.next({
                        type: 'SHIFTED',
                        data: {
                            previous: { x, y },
                            current: { x, y: deepestAvailable },
                            block
                        }
                    });
                    this._list[newListIdx].block = {
                        ...block
                    };
                    this._list[i].block = null;
                    depths[x]--;
                }
            } else {
                depths[x] = Math.max(depths[x] || 0, y);
            }
        }
    }

    spawn(blockTypes) {
        for (let i = this._list.length - 1; i >= 0; i--) {
            const { block } = this._list[i];
            if (!block) {
                const newBlock = randomBlock(blockTypes);
                this._list[i].block = newBlock;
                const { x, y } = listIndexToCoords(i, this.getDimensions().width);
                this.events.next({
                    type: 'SPAWNED',
                    data: {
                        x,
                        y,
                        block: newBlock
                    }
                });
            }
        }
    }

    _buildMatchesList() {
        function areSameType(a, b) {
            return a.type === b.type;
        }

        const adjacentsOfType = [];
        const adjacencyList = [];
        this._list.forEach((cell) => {
            const cellIndex = coordsToListIndex(cell, this._dimensions.width);

            adjacencyList[cellIndex] = adjacencyList[cellIndex] || [];
            adjacentsOfType[cellIndex] = adjacentsOfType[cellIndex] || [];

            const { top, right, bottom, left } = getConnectedCoords(cell);

            [top, right, bottom, left].forEach((adjacent) => {
                if (isOnBoard(adjacent, this._dimensions)) {
                    const adjacentIndex = coordsToListIndex(adjacent, this._dimensions.width);
                    adjacencyList[cellIndex].push(adjacentIndex);
                    const adajacent = this._list[adjacentIndex];
                    if (adajacent.block && cell.block && areSameType(adajacent.block, cell.block)) {
                        adjacentsOfType[cellIndex].push(adjacentIndex);
                    }
                }
            });
        });

        const seen = new Set();
        const matchSets = [];
        for (let i = 0; i < adjacentsOfType.length; i++) {
            if (seen.has(i)) {
                continue;
            }
            const path = [];
            let queue = [i];
            while (queue.length > 0) {
                let next = queue.pop();
                if (!seen.has(next)) {
                    seen.add(next);
                    let adjacents = adjacentsOfType[next];
                    for (let j = 0; j < adjacents.length; j++) {
                        queue.push(adjacents[j]);
                    }
                    path.push(next);
                }
            }
            if (path.length > 1) {
                matchSets.push(path);
            }
        }

        const matches = Array(this._list.length).fill([]);
        matchSets.forEach((matchSet) => {
            matchSet.forEach((cellIndex) => {
                matches[cellIndex] = matchSet;
            });
        });

        return matches;
    }
}

export default DataModel;
