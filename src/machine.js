import {  assign } from 'xstate';

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
                            target: 'SHIFTING',
                            actions: assign((context, event) => {
                                const { goals, model } = context;
                                let { moves } = context;

                                const matched = model.getMatches({ x: event.x, y: event.y });

                                const { item: selectedItem } = model.getItem({ x: event.x, y: event.y });

                                if (selectedItem.type === 'empty') {
                                    return;
                                }

                                // a match was made
                                if (matched.length > 0) {
                                    // decrement moves
                                    moves--;

                                    const goal = goals.find((g) => g.type === selectedItem.type);
                                    if (goal) {
                                        const matchCount = matched.length;
                                        const newGoal = Math.max(0, goal.count - matchCount);
                                        // mutate the goal
                                        goal.count = newGoal;
                                    }

                                    matched.forEach((matchIdx) => {
                                        model.remove(matchIdx);
                                    });
                                }

                                // model.shift();
                                model.update();

                                return {
                                    ...context,
                                    goals,
                                    moves
                                };
                            })
                        }
                    },
                },
                SHIFTING: {
                    after: {
                        200: 'SPAWNING'
                    },
                    exit: [
                        assign(({ model }) => {
                            model.shift();
                            model.update();
                        })
                    ]
                },
                SPAWNING: {
                    after: {
                        200: 'IDLE'
                    },
                    exit: [
                        assign(({ model }) => {
                            model.spawn();
                            model.update();
                        })
                    ]
                },
            },
            always: [
                {
                    target: 'LOST',
                    cond: ({ moves, goals }) => {
                        const goalsRemaining = goals.filter((g) => g.count > 0);
                        return (moves <= 0) && (goalsRemaining.length > 0);
                    }
                },
                {
                    target: 'WON',
                    cond: ({ moves, goals }) => {
                        const goalsRemaining = goals.filter((g) => g.count > 0);
                        return goalsRemaining.length === 0;
                    }
                },
            ]
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