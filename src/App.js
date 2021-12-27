import React from 'react';
import './App.css';
import classNames from 'classnames';
import { useMachine } from '@xstate/react';
import { createMachine } from 'xstate';
// import { inspect } from '@xstate/inspect';
import { modelFromMatrix } from './helpers';
import machineConfig from './machine';
import staticLevel from './level';

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

function Grid({ blocks, onBlockClick }) {
  return (
    <div className='grid gap-2 grid-cols-6 grid-rows-2'>
      {blocks.map((block, rowIdx) => {
        const { x, y, item } = block;
        const { type } = item;
        return (
          <button
            key={`${x}-${y}`}
            className={classNames(
              'h-14 w-14 lg:h-16 lg:w-16 border-solid border-2 border-gray-700 rounded',
              mapBackgroundColor(type),
              'cursor-pointer'
            )}
            onClick={() => {
              onBlockClick({ x, y })
            }}
          />
        );
      })}
    </div>
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
          <div className='p-4 border-solid border-2 border-gray-700 rounded relative'>

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
