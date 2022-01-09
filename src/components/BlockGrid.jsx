import Box from "./Box";

export default function BlockGrid({ blocks, onBlockClick }) {
    return (
      <>
        {blocks.map((block) => {
  
          const { x, y, position, destination, type } = block;
  
          if (type === 'empty') {
            return null;
          }

          return (
            <Box
              key={`${x}-${y}`}
              position={position}
              destination={destination}
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
