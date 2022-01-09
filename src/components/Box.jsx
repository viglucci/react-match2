import {useRef} from "react";
import {mapMeshColor} from "../helpers";
import {Vector3} from "three";
import {useFrame} from "@react-three/fiber";

export default function Box(props) {

    const {
        geometry,
        color,
        position,
        destination,
        ...rest
    } = props;

    // reference gives us direct access to the THREE.Mesh object
    const mesh = useRef();

    const hexColor = mapMeshColor(color);

    // Subscribe this component to the render-loop and lerp between vec3
    useFrame(({clock}) => {
        mesh.current.position.lerp(
            new Vector3(destination[0], destination[1], destination[2]),
            0.1);
    });

    return (
        <mesh
            {...rest}
            position={position}
            ref={mesh}
            scale={1}
        >
            <boxGeometry args={geometry}/>
            <meshStandardMaterial color={hexColor}/>
        </mesh>
    )
}
