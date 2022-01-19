import {useMemo, useRef} from 'react';
import {mapMeshColor} from '../helpers';
import {Shape, Vector3} from 'three';
import {useFrame} from '@react-three/fiber';

export default function Box(props) {

    const {
        geometry,
        color,
        position,
        ...rest
    } = props;

    // reference gives us direct access to the THREE.Mesh object
    const mesh = useRef();
    const originalPosition = useRef(position);

    const hexColor = mapMeshColor(color);

    // Subscribe this component to the render-loop and lerp between
    // current position as known to three and the position stored in state
    useFrame(({clock}) => {
        mesh.current.position.lerp(
            new Vector3(position[0], position[1], position[2]),
            0.1);
    });

    const memoizedGeometryArgs = useMemo(() => {
        // https://discourse.threejs.org/t/round-edged-box/1402

        const radius0 = .05;
        const height = geometry[0];
        const width = geometry[1];
        const depth = geometry[2];
        const smoothness = 10;

        let shape = new Shape();
        let eps = 0.00001;
        let radius = radius0 - eps;
        shape.absarc( eps, eps, eps, -Math.PI / 2, -Math.PI, true );
        shape.absarc( eps, height -  radius * 2, eps, Math.PI, Math.PI / 2, true );
        shape.absarc( width - radius * 2, height -  radius * 2, eps, Math.PI / 2, 0, true );
        shape.absarc( width - radius * 2, eps, eps, 0, -Math.PI / 2, true );

        const arg1 = {
            depth: depth - radius0 * 2,
            bevelEnabled: true,
            bevelSegments: smoothness * 2,
            steps: 1,
            bevelSize: radius,
            bevelThickness: radius0,
            curveSegments: smoothness
        };

        return [shape, arg1];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <mesh
            {...rest}
            position={originalPosition.current}
            ref={mesh}
            scale={1}
        >
            {/*<boxGeometry args={geometry}/>*/}
            <extrudeBufferGeometry args={memoizedGeometryArgs} />
            <meshStandardMaterial color={hexColor}/>
        </mesh>
    );
}
