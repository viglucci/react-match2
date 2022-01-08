import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import classNames from 'classnames';
import { useMachine } from '@xstate/react';
import * as THREE from 'three';
import { OrthographicCamera, OrbitControls } from '@react-three/drei';
import { createMachine } from 'xstate';
// import { inspect } from '@xstate/inspect';
import { modelFromMatrix } from './helpers';
import machineConfig from './machine';
import staticLevel from './level';
import './App.css';
import level from './level';

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

const mapBackgroundColor = (type) => {
  return {
    'bg-lime-400': type === 'lime',
    'bg-red-400': type === 'red',
    'bg-blue-400': type === 'blue',
    'bg-orange-400': type === 'orange',
    'bg-gray-900': type === 'empty'
  };
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
  ...rest
}) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef();
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  // useFrame((state, delta) => (ref.current.rotation.x += 0.01));
  // Return the view, these are regular Threejs elements expressed in JSX

  // console.log(rest.position);

  return (
    <mesh
      {...rest}
      ref={ref}
      scale={1}
    // onClick={(event) => click(!clicked)}
    // onPointerOver={(event) => hover(true)}
    // onPointerOut={(event) => hover(false)}
    >
      <boxGeometry args={geometry} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

const CameraDolly = ({ isZoom }) => {
  const vec = new THREE.Vector3()

  useFrame((state) => {
    // const step = 0.1
    // const x = isZoom ? 0 : 5
    // const y = isZoom ? 10 : 5
    // const z = isZoom ? 10 : 5

    // console.log({ x, y, z });

    // state.camera.position.lerp(vec.set(x, y, z), step)
    // console.log(state.camera.position)
    state.camera.lookAt(0, 0, 0);
    state.camera.updateProjectionMatrix();
  });

  return null
}

function vec3FromCoords({ x, y, padding, width, height, matrixWidth, matrixHeight }) {

  const originX = (padding / 2) + (width / 2);
  const originY = (padding / 2) + (height / 2);

  const vec3 = [originX, height / 2, originY];

  const offsetX = width + padding;
  const midX = matrixWidth / 2;
  let positionFromCenterX = (x % midX) + 1;

  // handling blocks left of center
  if (x < midX) {
    positionFromCenterX = positionFromCenterX - (midX + 1);
    vec3[0] = originX + (positionFromCenterX * offsetX);
  }
  // blocks right of center
  else if (positionFromCenterX > 1) {
    vec3[0] = originX + ((positionFromCenterX - 1) * offsetX);
  }

  const offsetY = height + padding;
  const midY = matrixHeight / 2;
  let positionFromCenterY = (y % midY) + 1;

  // handling blocks top of center
  if (y < midY) {
    positionFromCenterY = positionFromCenterY - (midY + 1);
    vec3[2] = originY + (positionFromCenterY * offsetY);
  }
  // blocks bottom of center
  else if (positionFromCenterY > 1) {
    vec3[2] = originY + ((positionFromCenterY - 1) * offsetY);
  }

  // console.log({
  //   x,
  //   y,
  //   positionX: positionFromCenterX,
  //   positionY: positionFromCenterY,
  //   vec3
  // });

  return vec3;
}

function Grid({ blocks, onBlockClick }) {

  const [isZoom, setZoom] = useState(false)
  const toggleZoom = () => setZoom((active) => !active)

  return (
    <Canvas>
      <OrthographicCamera
        makeDefault
        zoom={70}
        position={[
          // 0, 10, 0
          0, 20, 0
        ]}
      />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />

      {/* <gridHelper args={[10, 10, `white`, `gray`]} /> */}

      <ambientLight />
      <pointLight position={[0, 10, 0]} />

      {blocks.map((block, rowIdx) => {

        const { x, y, item } = block;
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

      <CameraDolly isZoom={isZoom} />
    </Canvas>
  );
}

function WinLossOverlay({ state }) {
  let title = 'Game Over';
  if (state === 'WON') {
    title = 'You Win!'
  }
  console.log(state)
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

export default function App() {
  const [state, send] = useMachine(gameMachine,
    {
      context: {
        ...initialContext,
        model: modelFromMatrix(staticLevel.matrix)
      },
      devTools: true,
    });
  const { context } = state;
  const { goals, progress, moves, model } = context;
  const list = model.getList();

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
                      mapBackgroundColor(type),
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

            <Grid blocks={list} onBlockClick={({ x, y }) => {
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
