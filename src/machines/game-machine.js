import {assign} from 'xstate';

const machineConfig = {
    id: 'gameMachine',
    initial: 'MATCHING',
    states: {
        MATCHING: {
            initial: 'IDLE',
            states: {
                IDLE: {
                    on: {
                        'SELECT': {
                            target: 'CONDITIONS',
                            actions: assign((context, event) => {
                                const { goals, model } = context;
                                let { moves } = context;

                                const matched = model.getMatches({ x: event.x, y: event.y });

                                const { block: selectedItem } = model.getItem({ x: event.x, y: event.y });

                                if (selectedItem === 'empty') {
                                    return;
                                }

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
                                        model.remove(matchIdx);
                                    });
                                }

                                model.shift();
                                model.update();
                                // presentationModel.update(model);

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
                        assign(({ model, goals }) => {
                            // only spawn in blocks which are part of the current goals
                            const allowedBlockTypes = goals.map(g => g.type);
                            model.spawn(allowedBlockTypes);
                            model.update();
                        })
                    ]
                },
                CONDITIONS: {
                    always: [
                        {
                            target: '#gameMachine.LOST',
                            cond: ({ moves, goals }) => {
                                const goalsRemaining = goals.filter((g) => g.count > 0);
                                return (moves <= 0) && (goalsRemaining.length > 0);
                            }
                        },
                        {
                            target: '#gameMachine.WON',
                            cond: ({ moves, goals }) => {
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
};

export default machineConfig;
