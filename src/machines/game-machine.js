import {assign, createMachine, spawn} from 'xstate';
import {dataModelFromMatrix, presentationModelFromDataModel} from '../helpers';
import viewMachine from "./view-machine";

const machineConfig = createMachine({
    id: 'gameMachine',
    initial: 'MATCHING',
    entry: assign((ctx) => {
        ctx.model = dataModelFromMatrix(ctx.matrix);

        const presentationModel
            = presentationModelFromDataModel(ctx.model);

        ctx.$viewMachine = spawn(
            viewMachine.withContext({
                map: presentationModel.map,
                list: presentationModel.list,
                conversionConstants: {
                    padding: 0.07,
                    width: 1,
                    height: 1,
                    matrixWidth: 6,
                    matrixHeight: 6
                }
            }),
            viewMachine.id
        );

        delete ctx.matrix;

        return ctx;
    }),
    states: {
        MATCHING: {
            initial: 'IDLE',
            states: {
                IDLE: {
                    on: {
                        'SELECT': {
                            target: 'CONDITIONS',
                            actions: assign((context, event) => {
                                const {goals, model} = context;
                                let {moves} = context;

                                const matched = model.getMatches({x: event.x, y: event.y});

                                const {block: selectedItem} = model.getItem({x: event.x, y: event.y});

                                if (selectedItem === 'empty') {
                                    return;
                                }

                                const removedEvents = [];
                                // a match was made
                                if (matched.length > 0) {
                                    // decrement moves
                                    moves--;

                                    const goal = goals.find((g) => g.type === selectedItem.type);
                                    if (goal) {
                                        const matchCount = matched.length;
                                        // mutate the goal
                                        goal.count = Math.max(0, goal.count - matchCount);
                                    }

                                    matched.forEach((matchIdx) => {
                                        removedEvents.push(model.remove(matchIdx));
                                    });
                                }

                                const shiftEvents = model.shift();

                                model.update();

                                const allEvents = [
                                    ...removedEvents,
                                    ...shiftEvents
                                ];

                                if (allEvents.length) {
                                    context.$viewMachine.send(allEvents);
                                }

                                return {
                                    ...context,
                                    goals,
                                    moves
                                };
                            })
                        }
                    },
                },
                SPAWNING: {
                    after: {
                        200: 'IDLE'
                    },
                    exit: [
                        assign((ctx) => {
                            const {model, goals} = ctx;
                            // only spawn in blocks which are part of the current goals
                            const allowedBlockTypes = goals.map(g => g.type);
                            const events = model.spawn(allowedBlockTypes);
                            model.update();
                            if (events.length) {
                                ctx.$viewMachine.send(events);
                            }
                        })
                    ]
                },
                CONDITIONS: {
                    always: [
                        {
                            target: '#gameMachine.LOST',
                            cond: ({moves, goals}) => {
                                const goalsRemaining = goals.filter((g) => g.count > 0);
                                return (moves <= 0) && (goalsRemaining.length > 0);
                            }
                        },
                        {
                            target: '#gameMachine.WON',
                            cond: ({goals}) => {
                                const goalsRemaining = goals.filter((g) => g.count > 0);
                                return goalsRemaining.length === 0;
                            }
                        },
                        {
                            target: 'SPAWNING'
                        }
                    ]
                }
            }
        },
        WON: {
            type: 'final'
        },
        LOST: {
            type: 'final'
        },
    }
});

export default machineConfig;
