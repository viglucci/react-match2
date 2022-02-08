import { useRef } from "react";
import { useHelper } from "@react-three/drei";
import { PointLightHelper } from "three";
import BlockGrid from "./BlockGrid";
import colors from "tailwindcss/colors";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";

export default function Scene({ blocks, onBlockClick }) {

    const cameraRef = useRef();
    const pointLightRef = useRef();
    useHelper(pointLightRef, PointLightHelper, 0.5, 'red');

    return (
        <>
            <OrthographicCamera
                ref={cameraRef}
                makeDefault
                zoom={55}
                position={[
                    7, 10, 7
                ]}
            />

            <OrbitControls
                enablePan={false}
                enableZoom={false}
                enableRotate={false}
            />

            <gridHelper args={[30, 30, colors.gray['800'], colors.gray['800']]} />

            <ambientLight />
            <pointLight ref={pointLightRef} position={[0, 10, 30]} />

            <BlockGrid blocks={blocks} onBlockClick={onBlockClick} />

            {/* <CameraDolly isZoom={false} /> */}
        </>
    );
}