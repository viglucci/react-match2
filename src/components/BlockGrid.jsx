import Box from "./Box";
import {assign, createMachine} from "xstate";
import {useActor, useMachine} from "@xstate/react";
import {useEffect} from "react";

const boxMachine = createMachine({
    id: "boxMachine",
    initial: "IDLE",
    context: {},
    states: {
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

function BoxContainer({children, machine}) {
    const [state] = useActor(machine);
    const {context} = state;
    const {position} = context;

    return children({position});
}

export default function BlockGrid({blocks, onBlockClick}) {
    return (
        <>
            {blocks.map((block) => {

                const {x, y, type, id, $machine} = block;

                return (
                    <BoxContainer
                        key={id}
                        machine={$machine}
                    >
                        {({position}) => (
                            <Box
                                position={position}
                                geometry={[1, 1, 1]}
                                color={type}
                                onClick={() => {
                                    onBlockClick({x, y})
                                }}
                            />
                        )}
                    </BoxContainer>
                );
            })}
        </>
    );
}
