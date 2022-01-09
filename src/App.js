import React, { useRef } from 'react';
import {
  Canvas,
  useFrame
} from '@react-three/fiber';
import classNames from 'classnames';
import { useMachine } from '@xstate/react';
import { OrthographicCamera, OrbitControls, useHelper } from '@react-three/drei';
import { createMachine } from 'xstate';
// import { inspect } from '@xstate/inspect';
import {
  dataModelFromMatrix,
  vec3FromCoords
} from './helpers';
import machineConfig from './machine';
import staticLevel from './level';
import './App.css';

import colors from 'tailwindcss/colors';
import { Vector3, PointLightHelper } from 'three';


// inspect({
//   // options
//   // url: 'https://statecharts.io/inspect', // (default)
//   iframe: false // open in new window
// });

const initialContext = {
  moves: staticLevel.moves,
  goals: staticLevel.goals,
  progress: {},
};

const gameMachine = createMachine(machineConfig);

const mapBackgroundColorClass = (type) => {
  return {
    'bg-lime-400': type === 'lime',
    'bg-red-400': type === 'red',
    'bg-blue-400': type === 'blue',
    'bg-orange-400': type === 'orange',
    'bg-gray-900': type === 'empty'
  };
};

const mapMeshColor = (type) => {
  return ({
    'lime': colors.lime['500'],
    'red': colors.red['500'],
    'blue': colors.blue['500'],
    'orange': colors.orange['500'],
    'empty': colors.gray['500'],
  })[type];
};

const computeGoalRemaining = (goals, progress, type) => {
  const goal = goals.find((g) => g.type === type);
  if (!goal) return 0;
  const current = progress[type] || 0;
  return goal.count - current;
};

function Box({
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

// const CameraDolly = ({ isZoom }) => {
//   // const vec = new THREE.Vector3();

//   useFrame((state) => {
//     // const step = 0.1
//     // const x = isZoom ? 0 : 5
//     // const y = isZoom ? 10 : 5
//     // const z = isZoom ? 10 : 5

//     // console.log({ x, y, z });

//     // state.camera.position.lerp(vec.set(x, y, z), step)
//     console.log(state.camera.position)
//     state.camera.lookAt(0, 0, 0);
//     state.camera.updateProjectionMatrix();
//   });

//   return null;
// }

function Stage({ blocks, onBlockClick }) {
  return (
    <Canvas>
      <Scene blocks={blocks} onBlockClick={onBlockClick} />
    </Canvas>
  );
}

function BlockGrid({ blocks, onBlockClick }) {
  return (
    <>
      {blocks.map((block, rowIdx) => {

        const { x, y, vec3, item, type } = block;

        if (type === 'empty') {
          return null;
        }

        return (
          <Box
            key={`${x}-${y}`}
            position={vec3}
            geometry={[1, 1, 1]}
            color={type}
            onClick={() => {
              onBlockClick({ x, y })
            }}
          />
        );
      })}
    </>
  );
}

function Scene({ blocks, onBlockClick }) {

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

function WinLossOverlay({ state }) {
  let title = 'Game Over';
  if (state === 'WON') {
    title = 'You Win!'
  }
  return (
    <div
      className='absolute top-0 bottom-0 left-0 right-0 bg-gray-900/90 flex justify-center items-center flex-col'
    >
      <div className='flex justify-center items-center font-medium text-gray-100 text-2xl uppercase mb-4'>
        <span>{title}</span>
      </div>
      <div className='font-medium text-gray-100 uppercase'>
        <button
          className='bg-gray-900 hover:border-blue-400 text-gray-100 py-2 px-4 border border-gray-700 rounded shadow uppercase text-sm'
          onClick={() => {
            window.location.reload();
          }}>
          Play Again
        </button>
      </div>
    </div>
  );
}

function presentationModelFromDataModel(dataModel) {
  const blocks = dataModel._list.map(({ x, y, item }) => {
    const { type } = item;
    const vec3 = vec3FromCoords({
      x,
      y,
      padding: 0.2,
      width: 1,
      height: 1,
      matrixWidth: 6,
      matrixHeight: 6
    });
    return {
      x,
      y,
      vec3,
      type
    };
  });
  const model = {
    blocks
  };
  return model;
}

export default function App() {
  const [state, send] = useMachine(gameMachine,
    {
      context: {
        ...initialContext,
        model: dataModelFromMatrix(staticLevel.matrix)
      },
      devTools: true,
    });
  const { context } = state;

  const presenentationModel
    = presentationModelFromDataModel(context.model);

  const { goals, progress, moves, model } = context;

  return (
    <div className='p-2 pt-8 lg:pt-16 max-w-fit mx-auto'>
      <div className='flex flex-col lg:flex-row'>
        <div className='max-w-full lg:max-w-none'>
          <div className='flex mb-4'>
            <div className='relative flex justify-center items-center border-solid border-2 border-gray-700 rounded pt-6 p-4 mr-4'>
              {goals.map(({ type, count }, index) => {
                return (
                  <div
                    key={type}
                    className={classNames(
                      'relative w-16 h-16 border-solid border-2 border-gray-700 rounded',
                      mapBackgroundColorClass(type),
                      {
                        'ml-4': index > 0
                      }
                    )}
                  >
                    <div className='font-medium absolute top-10 left-10 flex justify-center items-center h-8 w-8 text-gray-100 text-md bg-gray-800 border border-solid border-gray-700 rounded-full'>
                      {computeGoalRemaining(goals, progress, type)}
                    </div>
                  </div>
                );
              })}
              <div className='absolute -top-4 border-gray-700 border-solid border-2 rounded-full p-1 px-2 bg-gray-900 text-gray-100 uppercase text-xs'>
                <span>Goals</span>
              </div>
            </div>
            <div className='flex justify-center items-center grow border-solid border-2 border-gray-700 rounded p-4 relative'>
              <div className='absolute -top-4 border-gray-700 border-solid border-2 rounded-full p-1 px-2 bg-gray-900 text-gray-100 uppercase text-xs'>
                <span>Moves</span>
              </div>
              <span className='font-medium text-gray-100 text-4xl uppercase'>{moves}</span>
            </div>
          </div>
          <div className='p-4 border-solid border-2 border-gray-700 rounded relative' style={{ width: 600, height: 600 }}>

            <Stage blocks={presenentationModel.blocks} onBlockClick={({ x, y }) => {
              if (!state.matches('MATCHING')) { return; }
              send({
                type: 'SELECT',
                x,
                y
              })
            }} />

            {state.matches('WON') || state.matches('LOST')
              ? <WinLossOverlay state={state.value} />
              : null}
          </div>
        </div>

        <div className='mt-4 lg:mt-0 lg:ml-4 max-w-md lg:max-w-md text-gray-300 p-4 border-solid border-2 border-gray-700 rounded'>
          <div className='text-xl'>Instructions</div>
          <ul className='list-disc ml-8 mt-4'>
            <li className='mb-2'>
              Click on squares with atleast one adjacent same color square to clear the square and all connected same color squares from the board.
            </li>
            <li className='mb-2'>
              Clear the listed number of squares for each color in the goals box at the top.
            </li>
            <li className='mb-2'>
              Each successful match will exhaust one "move". Complete the goals with the set number of moves shown in the moves box above.
            </li>
          </ul>
        </div>
      </div>

      <div className='mt-2 text-gray-300'>
        Created by <a href='https://twitter.com/kviglucci' className='text-blue-400 hover:underline' target='_blank' rel='noreferrer'>@kviglucci</a>
      </div>
    </div>
  );
}
