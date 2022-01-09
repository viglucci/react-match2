import Box from "./Box";

export default function BlockGrid({ blocks, onBlockClick }) {
    return (
      <>
        {blocks.map((block, rowIdx) => {
  
          const { x, y, vec3, type } = block;
  
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