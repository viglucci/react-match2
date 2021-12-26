const level = {
    moves: 12,
    goals: [
        {
            type: "blue",
            count: 12,
        },
        {
            type: "lime",
            count: 20,
        },
        {
            type: "red",
            count: 8,
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