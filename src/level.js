const level = {
    moves: 100,
    goals: [
        {
            type: "blue",
            count: 120,
        },
        {
            type: "lime",
            count: 200,
        },
        {
            type: "red",
            count: 80,
        }
    ],
    matrix:
        [
            [
                { type: "blue" },
                { type: "lime" },
                { type: "lime" },
                { type: "blue" },
                { type: "blue" },
                { type: "blue" }
            ],
            [
                { type: "blue" },
                { type: "lime" },
                { type: "red" },
                { type: "lime" },
                { type: "lime" },
                { type: "blue" }
            ],
            [
                { type: "red" },
                { type: "lime" },
                { type: "blue" },
                { type: "red" },
                { type: "lime" },
                { type: "lime" }
            ],
            [
                { type: "red" },
                { type: "blue" },
                { type: "lime" },
                { type: "red" },
                { type: "lime" },
                { type: "blue" }
            ],
            [
                { type: "red" },
                { type: "lime" },
                { type: "red" },
                { type: "lime" },
                { type: "red" },
                { type: "red" }
            ],
            [
                { type: "lime" },
                { type: "blue" },
                { type: "red" },
                { type: "blue" },
                { type: "red" },
                { type: "blue" }
            ]
        ]
};

export default level;
