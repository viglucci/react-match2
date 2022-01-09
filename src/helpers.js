import colors from 'tailwindcss/colors';
import DataModel from "./DataModel";
import PresentationModel from "./PresentationModel";

// const BLOCK_TYPES = [
//     'lime',
//     'red',
//     'blue',
//     'orange'
// ];

function visitEach(matrix, cb) {
    for (let j = 0; j < matrix.length; j++) {
        for (let i = 0; i < matrix[0].length; i++) {
            const item = matrix[j][i];
            cb({ x: i, y: j, item });
        }
    }
}

export function getConnectedCoords({ x, y }) {
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

export function isOnBoard({ x, y }, { width, height }) {
    return y >= 0 &&
        y < height &&
        x >= 0 &&
        x < width;
}

export const randomBlock = (allowedBlocks) => {
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

export function dataModelFromMatrix(matrix) {

    const dimensions = {
        height: matrix.length,
        width: matrix[0].length,
    };

    const model = new DataModel();

    model._dimensions = dimensions;
    model._list = buildFlatList(matrix, dimensions.width);
    model.update();

    return model;
}

export function vec3FromCoords({ x, y, padding, width, height, matrixWidth, matrixHeight }) {

    const originX = (padding / 2) + (width / 2);
    const originY = (padding / 2) + (height / 2);

    const vec3 = [originX, height / 2, originY];

    const offsetX = width + padding;
    const midX = matrixWidth / 2;
    let positionFromCenterX = (x % midX) + 1;

    // handling blocks left of center
    if (x < midX) {
        positionFromCenterX = positionFromCenterX - (midX + 1);
        vec3[0] = originX + (positionFromCenterX * offsetX);
    }
    // blocks right of center
    else if (positionFromCenterX > 1) {
        vec3[0] = originX + ((positionFromCenterX - 1) * offsetX);
    }

    const offsetY = height + padding;
    const midY = matrixHeight / 2;
    let positionFromCenterY = (y % midY) + 1;

    // handling blocks top of center
    if (y < midY) {
        positionFromCenterY = positionFromCenterY - (midY + 1);
        vec3[2] = originY + (positionFromCenterY * offsetY);
    }
    // blocks bottom of center
    else if (positionFromCenterY > 1) {
        vec3[2] = originY + ((positionFromCenterY - 1) * offsetY);
    }

    return vec3;
}

export const mapMeshColor = (type) => {
    return ({
        'lime': colors.lime['500'],
        'red': colors.red['500'],
        'blue': colors.blue['500'],
        'orange': colors.orange['500'],
        'empty': colors.gray['500'],
    })[type];
};

export const mapBackgroundColorClass = (type) => {
    return {
        'bg-lime-400': type === 'lime',
        'bg-red-400': type === 'red',
        'bg-blue-400': type === 'blue',
        'bg-orange-400': type === 'orange',
        'bg-gray-900': type === 'empty'
    };
};

export const computeGoalRemaining = (goals, progress, type) => {
    const goal = goals.find((g) => g.type === type);
    if (!goal) return 0;
    const current = progress[type] || 0;
    return goal.count - current;
};

export function presentationModelFromDataModel(dataModel) {
    const blocks = dataModel._list.map(({ x, y, item }) => {
        const position = vec3FromCoords({
            x,
            y,
            padding: 0.2,
            width: 1,
            height: 1,
            matrixWidth: 6,
            matrixHeight: 6
        });
        const { type } = item;
        return {
            x,
            y,
            position,
            destination: position,
            type
        };
    });
    return new PresentationModel(blocks);
}
