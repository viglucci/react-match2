import React from 'react';
import './App.css';
import classNames from 'classnames';
import { useMachine } from '@xstate/react';
import { createMachine, assign } from 'xstate';
import { inspect } from '@xstate/inspect';
import { modelFromMatrix, coordsToListIndex, listIndexToCoords } from './helpers';

import staticLevel from './level';

const initialContext = {
  moves: staticLevel.moves,
  goals: staticLevel.goals,
  progress: {},
};

inspect({
  // options
  // url: 'https://statecharts.io/inspect', // (default)
  iframe: false // open in new window
});

const gameMachine = createMachine({
  id: 'gameMachine',
  initial: 'MATCHING',
  states: {
    MATCHING: {
      on: {
        'SELECT': {
          target: 'MATCHING',
          actions: assign((context, event) => {
            const { goals, model } = context;
            let { moves } = context;
            
            const matched = model.getMatches({ x: event.x, y: event.y });

            const { item: selectedItem } = model.getItem({ x: event.x, y: event.y });

            if (selectedItem.type === 'empty') {
              return;
            }

            // a match was made
            if (matched.length > 0) {
              // decrement moves
              moves--;

              matched.forEach((matchIdx) => {
                model.remove(matchIdx);
              });

              const goal = goals.find((g) => g.type === selectedItem.type);
              if (goal) {
                const matchCount = matched.length;
                const newGoal = Math.max(0, goal.count - matchCount);
                // mutate the goal
                goal.count = newGoal;
              }
            }

            model.shift();
            model.spawn();
            model.update();

            return {
              ...context,
              moves
            };
          })
        }
      },
      always: [
        {
          target: 'LOST',
          cond: ({ moves, goals }) => {
            const goalsRemaining = goals.filter((g) => g.count > 0);
            return (moves <= 0) && (goalsRemaining.length > 0);
          }
        },
        {
          target: 'WON',
          cond: ({ moves, goals }) => {
            const goalsRemaining = goals.filter((g) => g.count > 0);
            return goalsRemaining.length === 0;
          }
        },
      ]
    },
    WON: {
      type: 'final'
    },
    LOST: {
      type: 'final'
    },
  }
});

const mapBackgroundColor = (type) => {
  return {
    'bg-lime-400': type === 'lime',
    'bg-red-400': type === 'red',
    'bg-blue-400': type === 'blue',
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
          <div
            key={`${x}-${y}`}
            className={classNames(
              'w-full h-16 border-solid border-2 border-gray-700 rounded',
              mapBackgroundColor(type)
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
    <div className='max-w-md m-auto pt-16'>
      <div className='flex mb-4'>
        <div className='flex border-solid border-2 border-gray-700 rounded p-4 mr-4'>
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
        </div>
        <div className='flex justify-center items-center grow border-solid border-2 border-gray-700 rounded p-4 font-medium text-gray-100 text-xl uppercase'>
          <span>Moves: {moves}</span>
        </div>
      </div>
      <div className='p-4 border-solid border-2 border-gray-700 rounded'>

        {state.matches('MATCHING') ? <Grid blocks={list} onBlockClick={({ x, y }) => {
          send({
            type: 'SELECT',
            x,
            y
          })
        }} /> : null}

        {state.matches('WON') ? (
          <div className='flex justify-center items-center font-medium text-gray-100 text-2xl uppercase'>
            You Win!
          </div>
        ) : null}

        {state.matches('LOST') ? (
          <div className='flex justify-center items-center font-medium text-gray-100 text-2xl uppercase'>
            Game Over!
          </div>
        ) : null}
      </div>
    </div>
  )
}
