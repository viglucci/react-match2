import { Canvas } from '@react-three/fiber';
import Scene from './Scene';

export default function Stage({ blocks, onBlockClick }) {
    return (
        <Canvas>
            <Scene blocks={blocks} onBlockClick={onBlockClick} />
        </Canvas>
    );
}