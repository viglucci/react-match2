import {assign, createMachine, spawn} from "xstate";
import {calcSpawnZ, vec3FromCoords} from "../helpers";
import blockMachine from "./block-machine";

const machineConfig = createMachine({
    id: 'viewMachine',
    initial: 'idle',
    context: {
        list: [],
        map: {},
        conversionConstants: {}
    },
    entry: assign((ctx) => {
        Object.keys(ctx.map).forEach((id) => {
            const {x, y} = ctx.map[id];
            const position = vec3FromCoords({
                x,
                y,
                ...ctx.conversionConstants
            });
            const blockMachineContext = {
                position,
                coords: {x, y},
                dimensions: {
                    width: 1,
                    height: 1,
                },
                matrixDimensions: {
                    width: 6,
                    height: 6
                },
                padding: ctx.conversionConstants.padding
            };
            ctx.map[id].$machine = spawn(blockMachine.withContext(blockMachineContext), `block-${id}`);
        });

        ctx.list = Object.keys(ctx.map).map((id) => {
            return ctx.map[id];
        });
    }),
    states: {
        idle: {}
    },
    on: {
        REMOVED: {
            actions: [
                assign((ctx, event) => {
                    delete ctx.map[event.block.id];
                    ctx.list = Object.keys(ctx.map).map((id) => {
                        return ctx.map[id];
                    });
                    return ctx;
                })
            ]
        },
        SHIFTED: {
            actions: [
                assign((ctx, event) => {
                    const blockId = event.block.id;

                    ctx.map[blockId].$machine.send({
                        type: 'POSITION_UPDATE',
                        position: vec3FromCoords({
                            x: event.current.x,
                            y: event.current.y,
                            ...ctx.conversionConstants
                        })
                    });

                    ctx.map[blockId].x = event.current.x;
                    ctx.map[blockId].y = event.current.y;

                    ctx.list = Object.keys(ctx.map).map((id) => {
                        return ctx.map[id];
                    });

                    return ctx;
                })
            ]
        },
        SPAWNED: {
            actions: [
                assign((ctx, event) => {
                    const id = event.block.id;
                    const matrixX = event.x;
                    const matrixY = event.y;
                    const conversionConstants = ctx.conversionConstants;

                    const vec3 = vec3FromCoords({
                        x: matrixX,
                        y: matrixY,
                        ...ctx.conversionConstants
                    });

                    const z = calcSpawnZ({
                        y: matrixY,
                        ...ctx.conversionConstants
                    });

                    const blockMachineContext = {
                        position: [vec3[0], vec3[1], z],
                        coords: {
                            x: matrixX,
                            y: matrixY
                        },
                        dimensions: {
                            width: conversionConstants.width,
                            height: conversionConstants.height,
                        },
                        matrixDimensions: {
                            width: conversionConstants.matrixWidth,
                            height: conversionConstants.matrixHeight
                        },
                        padding: conversionConstants.padding
                    };

                    const $machine = spawn(blockMachine.withContext(blockMachineContext), `block-${id}`);

                    ctx.map[event.block.id] = {
                        ...{...event.block},
                        x: matrixX,
                        y: matrixY,
                        $machine
                    };

                    ctx.list = Object.keys(ctx.map).map((id) => {
                        return ctx.map[id];
                    });

                    return ctx;
                })
            ]
        }
    }
});

export default machineConfig;
