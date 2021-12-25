import React from 'react';
import './App.css';
import classNames from 'classnames';
import { useMachine } from '@xstate/react';
import { createMachine, assign } from 'xstate';
import { inspect } from '@xstate/inspect';
import { buildModel, getListIndex } from './helpers';

import staticLevel from './level';

const randomBlock = () => {
  const types = [
    'lime',
    'red',
    'blue'
  ];
  const randomtype = types[Math.floor(Math.random() * types.length)];
  return {
    type: randomtype
  };
};

// const genRow = () => {
//   const row = []
//   for (let i = 0; i < 6; i++) {
//     row.push(randomBlock());
//   }
//   return row;
// };

const initialContext = {
  moves: staticLevel.moves,
  goals: staticLevel.goals,
  blocks: staticLevel.blocks,
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
          target: 'CHECKING_CONDITIONS',
          actions: assign((context, event) => {
            const { goals, model, blocks, moves } = context;
            const listIdx = getListIndex({ x: event.x, y: event.y }, model.dimensions.width);
            const matches = model.matches[listIdx];
            let newMoves = moves;

            // a match was made
            if (matches.length > 0) {

              // decrement moves
              newMoves = moves - 1;

              matches.forEach((matchIdx) => {
                const item = model.list[matchIdx];
                blocks[item.y][item.x] = randomBlock();
              });

              const { item } = model.list[listIdx];
              const goal = goals.find((g) => g.type === item.type);
              if (goal) {
                const matchCount = matches.length;
                const newGoal = Math.max(0, goal.count - matchCount);
                // mutate the goal
                goal.count = newGoal;
              }
            }

            const newModel = buildModel(blocks);

            return {
              ...context,
              blocks,
              moves: newMoves,
              model: newModel
            };
          })
        }
      }
    },
    CHECKING_CONDITIONS: {
      always: [
        {
          target: 'MATCHING',
          cond: ({ moves, goals }) => {
            const goalsRemaining = goals.filter((g) => g.count > 0);
            return (moves > 0) && (goalsRemaining.length > 0);
          }
        },
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
            return goalsRemaining.length == 0;
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
      {blocks.map((cols, rowIdx) => {
        return (
          <React.Fragment key={rowIdx}>
            {cols.map(({ type }, colIdx) => {
              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={classNames(
                    'w-full h-16 border-solid border-2 border-gray-700 rounded',
                    mapBackgroundColor(type)
                  )}
                  onClick={() => {
                    onBlockClick({
                      x: colIdx,
                      y: rowIdx
                    })
                  }}
                />
              );
            })}
          </React.Fragment>
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
        model: buildModel(staticLevel.blocks)
      },
      devTools: true,
    });
  const { context } = state;
  const { goals, progress, blocks, moves } = context;

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

        {state.matches('MATCHING') ? <Grid blocks={blocks} onBlockClick={({ x, y }) => {
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
