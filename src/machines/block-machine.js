import {assign, createMachine} from "xstate";
import {vec3FromCoords} from "../helpers";

const blockMachineConfig = createMachine({
    id: "boxMachine",
    initial: "SPAWNED",
    context: {},
    states: {
        SPAWNED: {
            after: {
                80: {
                    target: 'IDLE'
                }
            },
            exit: [
                assign({
                    position: (ctx) => {
                        const { coords, dimensions, matrixDimensions, padding } = ctx;
                        return vec3FromCoords({
                            ...coords,
                            padding,
                            ...dimensions,
                            matrixWidth: matrixDimensions.width,
                            matrixHeight: matrixDimensions.height
                        });
                    }
                })
            ]
        },
        IDLE: {},
    },
    on: {
        'POSITION_UPDATE': {
            actions: [
                assign({
                    position: (ctx, event) => {
                        return event.position;
                    }
                })
            ]
        }
    }
});

export default blockMachineConfig;
