
const BLOCK_TYPES = [
    'lime',
    'red',
    'blue',
    'orange'
];

function visitEach(matrix, cb) {
    for (let j = 0; j < matrix.length; j++) {
        for (let i = 0; i < matrix[0].length; i++) {
            const item = matrix[j][i];
            cb({ x: i, y: j, item });
        }
    }
}

function getConnectedCoords({ x, y }) {
    const top = { x: x, y: y - 1 };
    const right = { x: x + 1, y };
    const bottom = { x: x, y: y + 1 };
    const left = { x: x - 1, y };
    return {
        top,
        bottom,
        left,
        right
    };
}

function isOnBoard({ x, y }, { width, height }) {
    return y >= 0 &&
        y < height &&
        x >= 0 &&
        x < width;
}


const randomBlock = (allowedBlocks) => {
    const randomtype = allowedBlocks[Math.floor(Math.random() * allowedBlocks.length)];
    return {
        type: randomtype
    };
};

export function coordsToListIndex({ x, y }, width) {
    return x + (y * width);
}

export function listIndexToCoords(index, width) {
    return {
        x: index % width,
        y: Math.floor(index / width)
    };
}


export function buildFlatList(matrix, width) {
    const list = [];
    visitEach(matrix, ({ x, y, item }) => {
        const index = coordsToListIndex({ x, y, }, width);
        list[index] = { x, y, item };
    });
    return list;
}

export function modelFromMatrix(matrix) {

    const dimensions = {
        height: matrix.length,
        width: matrix[0].length,
    };

    const model = new Model();

    model._dimensions = dimensions;
    model._list = buildFlatList(matrix, dimensions.width);
    model.update();

    return model;
}

class Model {
    _list = [];
    _matches = [];
    _dimensions = {};

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

    remove(index) {
        this._list[index].item.type = 'empty';
    }

    update() {
        this._matches = this._buildMatchesList();
    }

    shift() {
        const depths = {};
        for (let i = this._list.length - 1; i >= 0; i--) {
            const { x, y, item } = this._list[i];
            if (item.type !== 'empty') {
                const deepestAvailable = depths[x] || -1;
                if (deepestAvailable >= 0) {
                    const newListIdx = coordsToListIndex({ x, y: deepestAvailable }, this._dimensions.width);
                    this._list[newListIdx].item.type = item.type;
                    this._list[i].item.type = 'empty';
                    depths[x]--;
                }
            } else {
                depths[x] = Math.max(depths[x] || 0, y);
            }
        }
    }

    spawn(blockTypes) {
        for (let i = this._list.length - 1; i >= 0; i--) {
            const { item } = this._list[i];
            if (item.type === 'empty') {
                this._list[i].item = randomBlock(blockTypes);
            }
        }
    }

    _buildMatchesList() {
        function areSameType(subject, observed) {
            return subject
                && subject.item.type === observed.item.type;
        }

        const adjacentsOfType = [];
        const adjacencyList = [];
        this._list.forEach((item) => {
            const cellIndex = coordsToListIndex(item, this._dimensions.width);

            adjacencyList[cellIndex] = adjacencyList[cellIndex] || [];
            adjacentsOfType[cellIndex] = adjacentsOfType[cellIndex] || [];

            const { top, right, bottom, left } = getConnectedCoords(item);

            [top, right, bottom, left].forEach((adjacent) => {
                if (isOnBoard(adjacent, this._dimensions)) {
                    const adjacentIndex = coordsToListIndex(adjacent, this._dimensions.width);
                    adjacencyList[cellIndex].push(adjacentIndex);
                    if (areSameType(this._list[adjacentIndex], item)) {
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