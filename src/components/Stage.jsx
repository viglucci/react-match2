import { Canvas } from '@react-three/fiber';
import Scene from './Scene';
import {useActor} from "@xstate/react";

export default function Stage({ machine, onBlockClick }) {
    const [state] = useActor(machine);
    return (
        <Canvas>
            <Scene blocks={state.context.list} onBlockClick={onBlockClick} />
        </Canvas>
    );
}
