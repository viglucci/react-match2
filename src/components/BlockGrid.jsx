import Box from "./Box";
import {assign, createMachine} from "xstate";
import {useMachine} from "@xstate/react";
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

function BoxContainer({children, position}) {
    const [state, send] = useMachine(boxMachine, {
        context: {
            position
        }
    });

    useEffect(() => {
        send({
            type: 'POSITION_UPDATE',
            position
        });
    }, [send, position]);

    return children({
        position: state.context.position
    });
}

export default function BlockGrid({blocks, onBlockClick}) {
    return (
        <>
            {blocks.map((block) => {

                const {x, y, position, nextPosition, type, id} = block;

                return (
                    <BoxContainer
                        key={id}
                        position={position}
                        nextPosition={nextPosition}
                    >
                        {({position: desiredPosition}) => (
                            <Box
                                position={desiredPosition}
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
