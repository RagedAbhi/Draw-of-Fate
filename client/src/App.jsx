import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import bgblur from './assets/bgBlur.png'

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [numCards, setNumCards] = useState(2);
  const [cards, setCards] = useState([]);
  const [inputs, setInputs] = useState(Array(2).fill(""));
  const [flipped, setFlipped] = useState({});
  const cardRefs = useRef([]);

  const initializeInputs = (n) => {
    setInputs(Array(n).fill(""));
  };

  const handleNumCardsChange = (e) => {
    let n = parseInt(e.target.value, 10);
    if (isNaN(n) || n < 2) n = 2;
    setNumCards(n);
    initializeInputs(n);
  };

  const handleInputChange = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const shuffleArray = (array) => {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const startGame = () => {
    const shuffled = shuffleArray(inputs.map((text, id) => ({ id, text })));
    setCards(shuffled);
    setFlipped({});
  };

  const revealCard = (card, index) => {
    if (flipped[card.id]) return;

    const cardEl = cardRefs.current[index];
    gsap.to(cardEl, {
      rotateY: 180,
      duration: 0.8,
      ease: "power2.inOut",
    });

    setFlipped((prev) => ({
      ...prev,
      [card.id]: true,
    }));
  };

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, cards.length);
  }, [cards]);

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center" style={{backgroundImage: `url(${bgblur})`}}>
        <div
          onClick={() => setShowWelcome(false)}
          className="bg-white/10 h-70 w-150 flex justify-center items-center backdrop-blur-md rounded-xl px-8 py-6 text-center cursor-pointer hover:bg-white/20 transition-colors"
        >
          <h1 className="text-4xl font-bold text-gray-200">
            Welcome to the Draw of Fate
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center p-4 relative" style={{backgroundImage: `url(${bgblur})`}}>
      <div className="mt-6 mb-12">
        <div className="bg-gray-400 rounded-full px-6 py-2 text-lg font-semibold tracking-wider">
          DRAW OF FATE
        </div>
      </div>

      {cards.length > 0 ? (
        <div className="flex space-x-6 perspective-1000 flex-wrap justify-center">
          {cards.map((card, index) => (
            <div
              key={card.id}
              ref={(el) => (cardRefs.current[index] = el)}
              className="w-36 h-48 cursor-pointer relative transform-style-preserve-3d mb-4"
              onClick={() => revealCard(card, index)}
            >
              <div className="absolute w-full h-full bg-gradient-to-tr from-blue-300 to-pink-300 rounded-lg shadow-lg backface-hidden flex items-center justify-center text-3xl font-bold">
                ?
              </div>
              <div className="absolute w-full h-full bg-gradient-to-tr from-blue-300 to-pink-300 rounded-lg shadow-lg backface-hidden rotate-y-180 flex items-center justify-center text-center px-4 text-sm">
                {card.text}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6 w-full max-w-lg">
          <div className="space-y-4">
            {inputs.map((value, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Card ${index + 1} text`}
                value={value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className="w-full rounded bg-gray-600 text-gray-200 p-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ))}
          </div>
          <button
            onClick={startGame}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded transition-colors disabled:opacity-50"
            disabled={numCards < 2}
          >
            Start
          </button>
        </div>
      )}

      {cards.length > 0 && (
        <button
          onClick={() => {
            setCards([]);
            setFlipped({});
          }}
          className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded transition-colors"
        >
          Restart
        </button>
      )}

      {cards.length === 0 && (
        <div className="absolute top-6 right-6">
          <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded shadow-sm">
            <label className="text-sm">NO. OF CARDS</label>
            <input
              type="number"
              min="2"
              value={numCards}
              onChange={handleNumCardsChange}
              className="w-16 rounded bg-gray-700 text-gray-200 p-1 text-center"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;