export default function WinLossOverlay({ state }) {
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