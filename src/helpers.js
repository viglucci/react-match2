
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

export function getListIndex({ x, y }, width) {
    return x + (y * width);
}

function isOnBoard({ x, y }, { width, height }) {
    return y >= 0 &&
        y < height &&
        x >= 0 &&
        x < width;
}

function buildFlatList(matrix, dimensions) {
    const list = [];
    visitEach(matrix, ({ x, y, item }) => {
        const index = getListIndex({ x, y, }, dimensions.width);
        list[index] = { x, y, item };
    });
    return list;
}

function buildMatchesList(adjacentsOfType, count) {
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

    const matches = Array(count).fill([]);
    matchSets.forEach((matchSet) => {
        matchSet.forEach((cellIndex) => {
            matches[cellIndex] = matchSet;
        });
    });

    return matches;
}

export function buildModel(matrix) {

    const dimensions = {
        height: matrix.length,
        width: matrix[0].length,
    };

    const list = buildFlatList(matrix, dimensions);

    function areSameType(subject, observed) {
        return subject
            && subject.item.type === observed.item.type;
    }

    const adjacentsOfType = [];
    const adjacencyList = [];
    list.forEach((item) => {
        const cellIndex = getListIndex(item, dimensions.width);

        adjacencyList[cellIndex] = adjacencyList[cellIndex] || [];
        adjacentsOfType[cellIndex] = adjacentsOfType[cellIndex] || [];

        const { top, right, bottom, left } = getConnectedCoords(item);

        [top, right, bottom, left].forEach((adjacent) => {
            if (isOnBoard(adjacent, dimensions)) {
                const adjacentIndex = getListIndex(adjacent, dimensions.width);
                adjacencyList[cellIndex].push(adjacentIndex);
                if (areSameType(list[adjacentIndex], item)) {
                    adjacentsOfType[cellIndex].push(adjacentIndex);
                }
            }
        });
    });

    const matches = buildMatchesList(adjacentsOfType, list.length);

    const model = {
        dimensions,
        matrix,
        list,
        matches,
    };

    return model;
}