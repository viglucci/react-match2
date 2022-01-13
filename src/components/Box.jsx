import {useRef} from "react";
import {mapMeshColor} from "../helpers";
import {Vector3} from "three";
import {useFrame} from "@react-three/fiber";


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

    return (
        <mesh
            {...rest}
            position={originalPosition.current}
            ref={mesh}
            scale={1}
        >
            <boxGeometry args={geometry}/>
            <meshStandardMaterial color={hexColor}/>
        </mesh>
    );
}
