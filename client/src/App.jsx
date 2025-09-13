import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [numCards, setNumCards] = useState(2);
  const [cards, setCards] = useState([]);
  const [inputs, setInputs] = useState(Array(2).fill(""));
  const [flipped, setFlipped] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const cardRefs = useRef([]);
  const containerRef = useRef(null);

  const initializeInputs = (n) => {
    setInputs(Array(n).fill(""));
  };

  useEffect(() => {
    initializeInputs(numCards);
  }, [numCards]);

  const handleNumCardsChange = (value) => {
    let n = parseInt(value, 10);
    if (isNaN(n) || n < 2) n = 2;
    if (n > 10) n = 10;
    setNumCards(n);
  };

  const incrementCards = () => {
    if (numCards < 10) {
      setNumCards(prev => prev + 1);
    }
  };

  const decrementCards = () => {
    if (numCards > 2) {
      setNumCards(prev => prev - 1);
    }
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
    if (inputs.some(input => input.trim() === "")) {
      setErrorMessage("Please enter values for all cards");
      return;
    }
    setErrorMessage("");
    setIsAnimating(true);

    const inputElements = cardRefs.current;
    const initialRects = inputElements.map(el => el && el.getBoundingClientRect());

    const shuffled = shuffleArray(inputs.map((text, id) => ({ id, text })));
    setCards(shuffled);
    setFlipped({});

    setTimeout(() => {
      const cardElements = cardRefs.current;
      cardElements.forEach((el, index) => {
        if (!el) return;
        
        const finalRect = el.getBoundingClientRect();
        const initialRect = initialRects.find((rect, i) => shuffled[index]?.id === i);
        
        if (!initialRect) return;
        
        const deltaX = initialRect.left - finalRect.left;
        const deltaY = initialRect.top - finalRect.top;
        
        gsap.fromTo(el, {
          x: deltaX,
          y: deltaY,
          rotation: 0,
          opacity: 0
        }, {
          x: 0,
          y: 0,
          rotation: 360,
          opacity: 1,
          duration: 1,
          ease: "power2.inOut",
          onComplete: () => {
            if (index === cardElements.length - 1) {
              setIsAnimating(false);
            }
          },
        });
      });
    }, 50);
  };

  const revealCard = (card, index) => {
    if (flipped[card.id] || isAnimating) return;

    const cardEl = cardRefs.current[index];
    if (!cardEl) return;
    
    setIsAnimating(true);
    gsap.to(cardEl, {
      rotationY: 180,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        setFlipped((prev) => ({
          ...prev,
          [card.id]: true,
        }));
        setIsAnimating(false);
      }
    });
  };

  const resetGame = () => {
    setIsAnimating(true);
    
    const cardElements = cardRefs.current;
    const flipBackPromises = cardElements.map((el, index) => {
      if (!el) return Promise.resolve();
      
      return new Promise(resolve => {
        gsap.to(el, {
          rotationY: 0,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: resolve
        });
      });
    });
    
    Promise.all(flipBackPromises).then(() => {
      setCards([]);
      setFlipped({});
      setIsAnimating(false);
    });
  };

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, Math.max(inputs.length, cards.length));
  }, [inputs, cards]);

  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-950 to-black relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-purple-500 opacity-40"
              style={{
                width: Math.random() * 200 + 50 + 'px',
                height: Math.random() * 200 + 50 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                filter: 'blur(40px)'
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Glassmorphism card with animated border - now clickable anywhere */}
          <div 
            onClick={() => setShowWelcome(false)}
            className="glassy-card relative bg-purple-900/20 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center cursor-pointer overflow-hidden transition-all duration-500 hover:bg-purple-900/30"
          >
            <div className="text-wrapper mb-8">
              <div className="text-6xl font-bold text-white tracking-widest mb-4">
                WELCOME
              </div>
              <div className="text-4xl font-light text-purple-200 mb-4">
                TO
              </div>
              <div className="text-7xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent tracking-wider">
                DRAW OF FATE
              </div>
            </div>

            {/* Click instruction text */}
            <div className="text-purple-200 text-lg font-medium mt-6 animate-pulse">
              Click anywhere on card to continue
            </div>
            
            {/* Border animation elements */}
            <div className="border-anim border-anim-1"></div>
            <div className="border-anim border-anim-2"></div>
          </div>
        </div>

        <style jsx>{`
          .glassy-card {
            box-shadow: 
              0 10px 30px rgba(0, 0, 0, 0.3),
              inset 0 1px 1px rgba(255, 255, 255, 0.2);
            transition: all 0.4s ease;
          }
          
          .glassy-card:hover {
            box-shadow: 
              0 15px 40px rgba(0, 0, 0, 0.4),
              inset 0 1px 1px rgba(255, 255, 255, 0.3);
            transform: translateY(-5px);
          }
          
          /* Border animation elements */
          .glassy-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, #8b5cf6, transparent);
            transform: translateX(-100%);
            opacity: 0;
            transition: all 0.6s ease;
          }
          
          .glassy-card::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, #6366f1, transparent);
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.6s ease;
          }
          
          .glassy-card:hover::before {
            transform: translateX(100%);
            opacity: 1;
          }
          
          .glassy-card:hover::after {
            transform: translateX(-100%);
            opacity: 1;
          }
          
          .border-anim {
            position: absolute;
            width: 2px;
            height: 0;
            background: linear-gradient(transparent, #818cf8, transparent);
            transition: all 0.6s ease;
            opacity: 0;
          }
          
          .border-anim-1 {
            top: 0;
            right: 0;
          }
          
          .border-anim-2 {
            bottom: 0;
            left: 0;
          }
          
          .glassy-card:hover .border-anim {
            height: 100%;
            opacity: 1;
          }
          
          .glassy-card:hover .border-anim-1 {
            transition-delay: 0.2s;
          }
          
          .glassy-card:hover .border-anim-2 {
            transition-delay: 0.4s;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col items-center p-4 relative bg-gradient-to-b from-violet-950 to-black">
      {/* Back button */}
      <button
        onClick={() => setShowWelcome(true)}
        className="absolute top-6 left-6 bg-gradient-to-r from-purple-700 to-violet-700 hover:from-purple-800 hover:to-violet-800 text-white px-4 py-2 rounded-full transition-all shadow-lg hover:shadow-purple-500/30 flex items-center space-x-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back</span>
      </button>

      <div className="mt-6 mb-4">
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-full px-8 py-3 text-lg font-bold text-white tracking-wider shadow-lg">
          DRAW OF FATE
        </div>
      </div>

      {/* Number of cards selector - moved to center */}
      {cards.length === 0 && (
        <div className="flex flex-col items-center mb-8">
          <div className="text-purple-200 text-sm font-medium mb-2">NUMBER OF CARDS</div>
          <div className="flex items-center space-x-4 bg-purple-800/80 p-3 rounded-lg shadow-sm backdrop-blur-sm">
            <button
              onClick={decrementCards}
              disabled={numCards <= 2 || isAnimating}
              className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            
            <div className="w-12 text-center text-white font-bold text-xl">
              {numCards}
            </div>
            
            <button
              onClick={incrementCards}
              disabled={numCards >= 10 || isAnimating}
              className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {cards.length > 0 ? (
        <div className="flex space-x-6 perspective-1000 flex-wrap justify-center">
          {cards.map((card, index) => (
            <div
              key={card.id}
              ref={(el) => (cardRefs.current[index] = el)}
              className="w-36 h-48 cursor-pointer relative transform-style-preserve-3d mb-4"
              onClick={() => revealCard(card, index)}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute w-full h-full bg-gradient-to-br from-purple-500 to-blue-400 rounded-lg shadow-lg flex items-center justify-center text-3xl font-bold text-white" style={{ backfaceVisibility: 'hidden' }}>
                ?
              </div>
              <div className="absolute w-full h-full bg-gradient-to-br from-purple-400 to-blue-300 rounded-lg shadow-lg flex items-center justify-center text-center px-4 text-sm text-gray-800 font-medium" style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}>
                {card.text}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-6">
          {inputs.map((value, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Card ${index + 1}`}
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              disabled={isAnimating}
              ref={(el) => (cardRefs.current[index] = el)}
              className="w-36 h-48 bg-gradient-to-br from-purple-500 to-blue-400 rounded-lg shadow-lg text-white p-4 text-center placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white"
              maxLength={20}
            />
          ))}
        </div>
      )}

      {errorMessage && (
        <div className="text-red-300 mt-4 font-semibold bg-purple-900/70 px-4 py-2 rounded-lg">{errorMessage}</div>
      )}

      {cards.length === 0 && (
        <button
          onClick={startGame}
          className="mt-6 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-8 py-3 rounded-full transition-all shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 font-bold"
          disabled={numCards < 2 || isAnimating}
        >
          Start Game
        </button>
      )}

      {cards.length > 0 && (
        <button
          onClick={resetGame}
          className="mt-8 bg-gradient-to-r from-purple-700 to-violet-700 hover:from-purple-800 hover:to-violet-800 text-white px-6 py-2 rounded-full transition-all shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 font-medium"
          disabled={isAnimating}
        >
          Restart
        </button>
      )}

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}

export default App;