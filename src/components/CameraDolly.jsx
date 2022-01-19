import {
    useFrame
} from '@react-three/fiber';

const CameraDolly = ({ isZoom }) => {
    // const vec = new THREE.Vector3();

    useFrame((state) => {
        // const step = 0.1
        // const x = isZoom ? 0 : 5
        // const y = isZoom ? 10 : 5
        // const z = isZoom ? 10 : 5

        // console.log({ x, y, z });

        // state.camera.position.lerp(vec.set(x, y, z), step)
        console.log(state.camera.position)
        state.camera.lookAt(0, 0, 0);
        state.camera.updateProjectionMatrix();
    });

    return null;
}