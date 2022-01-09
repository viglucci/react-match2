import { useRef } from "react";
import { mapMeshColor } from "../helpers";
import { Vector3 } from "three";
import { useFrame } from "@react-three/fiber";

export default function Box({
    geometry,
    color,
    position,
    ...rest
}) {

    // reference gives us direct access to the THREE.Mesh object
    const mesh = useRef();

    // Subscribe this component to the render-loop, rotate the mesh every frame
    // useFrame((state, delta) => (ref.current.rotation.x += 0.01));
    // Return the view, these are regular Threejs elements expressed in JSX

    const hexColor = mapMeshColor(color);

    const newPosition = new Vector3(position[0], position[1], position[2]);

    useFrame(({ clock }) => {
        mesh.current.position.lerp(newPosition, 0.01);
    });

    return (
        <mesh
            {...rest}
            position={position}
            ref={mesh}
            scale={1}
        >
            <boxGeometry args={geometry} />
            <meshStandardMaterial color={hexColor} />
        </mesh>
    )
}