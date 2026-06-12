import { useState, useEffect, useCallback, useRef } from 'react'

const BASE = import.meta.env.BASE_URL

// ─── Data ────────────────────────────────────────────────────────────────────

const QUIZ_QUESTIONS = [
  {
    question: 'Onde nos vimos pela primeira vez?',
    options: ['Escola / Faculdade', 'Na Igreja', 'Por aplicativo', 'Casa de amigos'],
    answer: 1,
  },
  {
    question: 'Por onde começamos a conversar?',
    options: ['WhatsApp', 'Twitter / X', 'Instagram', 'Discord'],
    answer: 2,
  },
  {
    question: 'Onde eu tentei procurar o ovo de páscoa?',
    options: ['Embaixo da cama', 'No jardim', 'No armário', 'Dentro da parede'],
    answer: 3,
  },
  {
    question: 'Qual desses animes nós mais gostamos?',
    options: ['Fire Force', 'Dragon Ball', 'Sword Art Online', 'Frieren'],
    answer: 3,
  },
]

const MEMORY_CARDS = [
  { id: 1, img: `${BASE}ano_novo.jpeg`,      caption: 'Ano Novo' },
  { id: 2, img: `${BASE}na_praça.jpeg`,      caption: 'Na Praça' },
  { id: 3, img: `${BASE}restaurante.jpeg`,   caption: 'Restaurante' },
  { id: 4, img: `${BASE}filme_em_casa.jpeg`, caption: 'Filme em Casa' },
]

// ─── Frieren aesthetic constants ─────────────────────────────────────────────

const FALL_SYMBOLS = ['ᚠ', 'ᚢ', 'ᚦ', 'ᛁ', 'ᛈ', 'ᛊ', 'ᛟ', '✦', '✧', '◇', '⬡', 'ᚱ']
const RING_RUNES   = ['ᚠ', 'ᛁ', 'ᛈ', 'ᛟ']
const QUIZ_RUNES   = ['ᚠ', 'ᛁ', 'ᛈ', 'ᛟ']
const CORNER_RUNES = ['ᚠ', 'ᛟ', 'ᛁ', 'ᛈ']
const CORNER_POS   = [{ top: 10, left: 12 }, { top: 10, right: 12 }, { bottom: 10, left: 12 }, { bottom: 10, right: 12 }]

const PARTICLES = Array.from({ length: 26 }, (_, i) => ({
  id: i,
  symbol: FALL_SYMBOLS[i % FALL_SYMBOLS.length],
  left: (i * 3.9 + (i % 5) * 2.8) % 97,
  delay: (i * 1.9) % 24,
  duration: 16 + (i * 1.4) % 16,
  size: 9 + (i * 0.85) % 10,
  purple: i % 3 === 0,
  opacity: 0.045 + (i % 9) * 0.012,
}))

// ─── Anniversary counter ─────────────────────────────────────────────────────

const START_DATE = new Date('2025-02-09T08:28:00')

function getElapsed() {
  const diff = Date.now() - START_DATE.getTime()
  const s = Math.floor(diff / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildDeck() {
  const pairs = MEMORY_CARDS.flatMap((c) => [
    { ...c, uid: `${c.id}-a` },
    { ...c, uid: `${c.id}-b` },
  ])
  return shuffle(pairs)
}

// ─── Background layers ───────────────────────────────────────────────────────

const STAR_COUNT = 55

function Stars() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: STAR_COUNT }).map((_, i) => {
        const size = Math.random() < 0.7 ? 1 : Math.random() < 0.5 ? 2 : 3
        return (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `rgba(180, 220, 255, ${0.25 + Math.random() * 0.55})`,
              animation: `twinkle ${3 + Math.random() * 6}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 9}s`,
            }}
          />
        )
      })}
    </div>
  )
}

function FallingRunes() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {PARTICLES.map(p => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '-3%',
            fontSize: p.size,
            color: `rgba(${p.purple ? '150, 110, 230' : '100, 180, 255'}, ${p.opacity})`,
            animation: `fall ${p.duration}s ${p.delay}s linear infinite`,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  )
}

// ─── Shared UI ───────────────────────────────────────────────────────────────

function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl p-6 ${className}`}
      style={{
        background: 'rgba(14, 30, 64, 0.65)',
        border: '1px solid rgba(100, 180, 230, 0.2)',
        backdropFilter: 'blur(8px)',
        position: 'relative',
      }}
    >
      {children}
    </div>
  )
}

function PrimaryButton({ onClick, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-4 rounded-xl font-medium text-base transition-all duration-300 active:scale-95 hover:scale-105 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #1a5f8a, #2b8fc9)',
        color: '#e8f4fd',
        boxShadow: '0 0 24px rgba(43, 143, 201, 0.3)',
        letterSpacing: '0.02em',
        animation: 'pulse-glow 3.5s ease-in-out infinite',
      }}
    >
      {children}
    </button>
  )
}

function RuneRow({ delay = 0 }) {
  return (
    <p style={{
      color: 'rgba(130, 100, 220, 0.28)',
      fontSize: 11,
      letterSpacing: '0.45em',
      textAlign: 'center',
      animation: `rune-glow 5s ${delay}s ease-in-out infinite`,
      userSelect: 'none',
      margin: 0,
    }}>
      ᚠ ᚢ ᚦ ᚨ ᚱ ᛁ ᛈ ᛊ ᛟ
    </p>
  )
}

// ─── Screen 1 — Welcome ──────────────────────────────────────────────────────

function WelcomeScreen({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center animate-fade-in gap-7">

      <div className="relative flex items-center justify-center w-40 h-40">
        <div className="absolute inset-0 rounded-full" style={{
          border: '1px solid rgba(100, 180, 230, 0.35)',
          animation: 'spin-slow 22s linear infinite',
        }} />
        <div className="absolute inset-4 rounded-full" style={{
          border: '1px solid rgba(130, 100, 220, 0.25)',
          animation: 'spin-slow 15s linear infinite reverse',
        }}>
          {RING_RUNES.map((r, i) => (
            <span key={i} style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              color: 'rgba(150, 115, 240, 0.6)',
              fontSize: 9,
              transform: `rotate(${i * 90}deg) translateY(-22px) translateX(-50%) rotate(-${i * 90}deg)`,
              animation: 'rune-glow 3.5s ease-in-out infinite',
              animationDelay: `${i * 0.85}s`,
            }}>{r}</span>
          ))}
        </div>
        <div className="absolute inset-10 rounded-full" style={{
          border: '1px dashed rgba(100, 180, 230, 0.15)',
          animation: 'spin-slow 9s linear infinite',
        }} />
        <span style={{
          fontSize: '2.1rem',
          color: 'rgba(170, 215, 255, 0.95)',
          filter: 'drop-shadow(0 0 10px rgba(100,180,230,1)) drop-shadow(0 0 30px rgba(120,80,200,0.6))',
          animation: 'float 4.5s ease-in-out infinite',
          display: 'block',
          position: 'relative',
        }}>✦</span>
      </div>

      <RuneRow />

      <div>
        <p className="text-xs tracking-widest uppercase mb-3" style={{
          color: 'rgba(140, 110, 240, 0.7)',
          letterSpacing: '0.2em',
        }}>
          Jornada ao Norte ✦ Dia dos Namorados
        </p>
        <h1 className="text-4xl font-light mb-4 leading-snug" style={{
          fontFamily: "'Playfair Display', serif",
          color: '#c5e8f5',
        }}>
          Para você
        </h1>
        <p className="text-xs mb-4 italic" style={{
          color: 'rgba(150, 115, 240, 0.55)',
          maxWidth: '260px',
          margin: '0 auto 14px',
          lineHeight: 1.7,
        }}>
          "Mesmo que leve mil anos, ainda vale a pena<br />conhecer alguém de verdade."
        </p>
        <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'rgba(150, 200, 230, 0.75)' }}>
          Preparei algo pra você. Vai ter quiz, jogo da memória e uma carta no final.
        </p>
      </div>

      <PrimaryButton onClick={onStart}>Começar →</PrimaryButton>
    </div>
  )
}

// ─── Screen 2 — Quiz ─────────────────────────────────────────────────────────

function QuizScreen({ onFinish }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)

  const q = QUIZ_QUESTIONS[current]
  const progress = (current / QUIZ_QUESTIONS.length) * 100

  function handleOption(idx) {
    if (answered) return
    setSelected(idx)
    setAnswered(true)
    if (idx === q.answer) setScore((s) => s + 1)
  }

  function handleNext() {
    if (current + 1 >= QUIZ_QUESTIONS.length) {
      onFinish(score)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen px-4 py-8 animate-fade-in">
      <div className="mb-6">
        <div className="flex justify-between mb-2 px-0.5">
          {QUIZ_QUESTIONS.map((_, i) => (
            <span key={i} style={{
              fontSize: 9,
              color: i <= current ? 'rgba(150, 115, 240, 0.75)' : 'rgba(100, 180, 230, 0.18)',
              transition: 'color 0.7s ease',
              animation: i === current ? 'rune-glow 2.5s ease-in-out infinite' : 'none',
            }}>
              {QUIZ_RUNES[i]}
            </span>
          ))}
        </div>
        <div className="flex justify-between text-xs mb-2" style={{ color: 'rgba(150, 200, 230, 0.6)' }}>
          <span>{current + 1} / {QUIZ_QUESTIONS.length}</span>
          <span>{score} acertos</span>
        </div>
        <div className="w-full h-px" style={{ background: 'rgba(100, 180, 230, 0.12)' }}>
          <div
            className="h-px transition-all duration-700"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, rgba(100,180,230,0.6), rgba(150,115,240,0.7))' }}
          />
        </div>
      </div>

      <Card className="mb-5 animate-slide-up">
        <p className="text-lg font-light text-center leading-relaxed" style={{ fontFamily: "'Playfair Display', serif", color: '#c5e8f5' }}>
          {q.question}
        </p>
      </Card>

      <div className="flex flex-col gap-3 flex-1">
        {q.options.map((opt, idx) => {
          let bg = 'rgba(14, 30, 64, 0.5)'
          let border = 'rgba(100, 180, 230, 0.18)'
          let color = 'rgba(180, 220, 240, 0.85)'

          if (answered) {
            if (idx === q.answer) { bg = 'rgba(16, 80, 60, 0.4)'; border = 'rgba(80, 200, 140, 0.5)'; color = '#86efac' }
            else if (idx === selected) { bg = 'rgba(80, 20, 20, 0.4)'; border = 'rgba(240, 100, 100, 0.5)'; color = '#fca5a5' }
          } else if (selected === idx) {
            bg = 'rgba(20, 60, 100, 0.6)'; border = 'rgba(100, 180, 230, 0.6)'
          }

          return (
            <button key={idx} onClick={() => handleOption(idx)}
              className="w-full text-left px-4 py-4 rounded-xl text-sm transition-all duration-300 active:scale-95"
              style={{ background: bg, border: `1px solid ${border}`, color, backdropFilter: 'blur(4px)' }}
            >
              <span className="mr-2" style={{ fontFamily: 'monospace', color: 'rgba(150,115,240,0.5)', fontSize: 10 }}>
                {FALL_SYMBOLS[idx * 2]}
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      {answered && (
        <div className="mt-5 animate-slide-up">
          <p className="text-center text-sm mb-4" style={{ color: selected === q.answer ? '#86efac' : '#fca5a5' }}>
            {selected === q.answer ? '✦ Acertou!' : '✧ Não foi dessa vez'}
          </p>
          <PrimaryButton onClick={handleNext} className="w-full justify-center">
            {current + 1 >= QUIZ_QUESTIONS.length ? 'Ver resultado →' : 'Próxima →'}
          </PrimaryButton>
        </div>
      )}
    </div>
  )
}

// ─── Screen 2.5 — Quiz Result ────────────────────────────────────────────────

function QuizResultScreen({ score, onContinue }) {
  const total = QUIZ_QUESTIONS.length
  const message =
    score === total ? 'Acertou tudo. Eu sabia que você ia gabaritar.' :
    score >= 2      ? 'Quase tudo certo. Não tá mal não.' :
                     'Bom, a gente vai ter que rever a nossa história.'

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center animate-fade-in gap-8">
      <div className="relative flex items-center justify-center" style={{ width: 148, height: 148 }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '1px solid rgba(100, 180, 230, 0.35)',
          animation: 'spin-slow 22s linear infinite',
        }} />
        {RING_RUNES.map((r, i) => (
          <span key={i} style={{
            position: 'absolute', left: '50%', top: '50%',
            color: 'rgba(150, 115, 240, 0.5)', fontSize: 9,
            transform: `rotate(${i * 90}deg) translateY(-70px) translateX(-50%) rotate(-${i * 90}deg)`,
            animation: 'rune-glow 4s ease-in-out infinite',
            animationDelay: `${i * 1}s`,
          }}>{r}</span>
        ))}
        <div style={{
          position: 'absolute', inset: 10, borderRadius: '50%',
          border: '1px dashed rgba(130, 100, 220, 0.2)',
          animation: 'spin-slow 14s linear infinite reverse',
        }} />
        <p style={{
          fontSize: '3rem', fontWeight: 300, color: '#c5e8f5',
          fontFamily: "'Playfair Display', serif", position: 'relative', margin: 0, lineHeight: 1,
        }}>
          {score}<span style={{ fontSize: '1.25rem', opacity: 0.4 }}>/{total}</span>
        </p>
      </div>
      <div>
        <RuneRow />
        <p className="text-sm mt-4" style={{ color: 'rgba(150, 200, 230, 0.7)' }}>{message}</p>
      </div>
      <PrimaryButton onClick={onContinue}>Próxima fase →</PrimaryButton>
    </div>
  )
}

// ─── Screen 3 — Memory Match ─────────────────────────────────────────────────

function MemoryCard({ card, isFlipped, isMatched, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={isFlipped || isMatched}
      className="relative w-full aspect-square rounded-xl overflow-hidden transition-transform duration-200 active:scale-95"
    >
      <div
        className="absolute inset-0 flex items-center justify-center rounded-xl transition-opacity duration-500"
        style={{
          background: 'rgba(8, 20, 55, 0.9)',
          border: '1px solid rgba(100, 180, 230, 0.22)',
          opacity: isFlipped || isMatched ? 0 : 1,
          pointerEvents: isFlipped || isMatched ? 'none' : 'auto',
        }}
      >
        <div className="relative flex items-center justify-center" style={{ width: 32, height: 32 }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '1px solid rgba(100, 180, 230, 0.3)',
            animation: 'spin-slow 10s linear infinite',
          }} />
          <div style={{
            position: 'absolute', inset: 5, borderRadius: '50%',
            border: '1px dashed rgba(140, 100, 230, 0.2)',
            animation: 'spin-slow 7s linear infinite reverse',
          }} />
          <span style={{ color: 'rgba(120, 180, 255, 0.6)', fontSize: '0.55rem', position: 'relative' }}>✦</span>
        </div>
      </div>

      <div
        className="absolute inset-0 rounded-xl overflow-hidden transition-opacity duration-500"
        style={{ opacity: isFlipped || isMatched ? 1 : 0 }}
      >
        <img src={card.img} alt={card.caption} className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            if (e.currentTarget.parentElement) e.currentTarget.parentElement.style.background = 'rgba(20, 50, 90, 0.8)'
          }}
        />
        {isMatched && (
          <div className="absolute inset-0 flex items-end p-1"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }}
          >
            <p className="text-white text-xs text-center w-full leading-tight">{card.caption}</p>
          </div>
        )}
        {isFlipped && !isMatched && (
          <div className="absolute inset-0"
            style={{ border: '2px solid rgba(150, 115, 240, 0.5)', borderRadius: '0.75rem' }}
          />
        )}
      </div>
    </button>
  )
}

function MemoryScreen({ onFinish }) {
  const [deck] = useState(() => buildDeck())
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState(new Set())
  const [moves, setMoves] = useState(0)
  const [foundCaptions, setFoundCaptions] = useState([])
  const [isChecking, setIsChecking] = useState(false)

  const handleFlip = useCallback((uid) => {
    if (isChecking || flipped.includes(uid) || matched.has(uid)) return
    if (flipped.length >= 2) return
    const next = [...flipped, uid]
    setFlipped(next)
    if (next.length === 2) {
      setMoves((m) => m + 1)
      setIsChecking(true)
      const [a, b] = next.map((u) => deck.find((c) => c.uid === u))
      if (a.id === b.id) {
        const newMatched = new Set([...matched, a.uid, b.uid])
        setMatched(newMatched)
        setFoundCaptions((prev) => prev.find((c) => c.id === a.id) ? prev : [...prev, a])
        setFlipped([])
        setIsChecking(false)
        if (newMatched.size === deck.length) setTimeout(onFinish, 900)
      } else {
        setTimeout(() => { setFlipped([]); setIsChecking(false) }, 950)
      }
    }
  }, [deck, flipped, matched, isChecking, onFinish])

  const allMatched = matched.size === deck.length

  return (
    <div className="flex flex-col min-h-screen px-4 py-8 animate-fade-in">
      <div className="text-center mb-5">
        <h2 className="text-xl font-light mb-1" style={{ fontFamily: "'Playfair Display', serif", color: '#c5e8f5' }}>
          Jogo da Memória
        </h2>
        <p className="text-xs mb-2" style={{ color: 'rgba(150, 115, 240, 0.38)', letterSpacing: '0.35em' }}>
          ᛁ ᛈ ᛊ ᛟ ᚠ
        </p>
        <p className="text-xs" style={{ color: 'rgba(150, 200, 230, 0.5)' }}>
          {moves} jogadas · {matched.size / 2} / {MEMORY_CARDS.length} pares
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-5">
        {deck.map((card) => (
          <MemoryCard key={card.uid} card={card}
            isFlipped={flipped.includes(card.uid)}
            isMatched={matched.has(card.uid)}
            onClick={() => handleFlip(card.uid)}
          />
        ))}
      </div>

      {foundCaptions.length > 0 && (
        <Card className="mb-4 py-4 px-5">
          <p className="text-xs mb-2" style={{ color: 'rgba(150, 200, 230, 0.45)', letterSpacing: '0.1em' }}>ENCONTRADOS</p>
          <div className="flex flex-col gap-1">
            {foundCaptions.map((c) => (
              <p key={c.id} className="text-sm" style={{ color: 'rgba(180, 220, 240, 0.85)' }}>✦ {c.caption}</p>
            ))}
          </div>
        </Card>
      )}

      {allMatched && (
        <PrimaryButton onClick={onFinish} className="w-full mt-auto animate-slide-up">
          Ver a carta →
        </PrimaryButton>
      )}
    </div>
  )
}

// ─── Screen 4 — Love Letter ──────────────────────────────────────────────────

function LoveLetterScreen({ onContinue }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-14 animate-fade-in">
      {!open ? (
        /* Sealed state */
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="relative flex items-center justify-center w-44 h-44">
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '1px solid rgba(100, 180, 230, 0.3)',
              animation: 'spin-slow 24s linear infinite',
            }} />
            <div style={{
              position: 'absolute', inset: 5, borderRadius: '50%',
              border: '1px solid rgba(130, 100, 220, 0.2)',
              animation: 'spin-slow 16s linear infinite reverse',
            }}>
              {RING_RUNES.map((r, i) => (
                <span key={i} style={{
                  position: 'absolute', left: '50%', top: '50%',
                  color: 'rgba(150, 115, 240, 0.55)', fontSize: 9,
                  transform: `rotate(${i * 90}deg) translateY(-26px) translateX(-50%) rotate(-${i * 90}deg)`,
                  animation: 'rune-glow 4s ease-in-out infinite',
                  animationDelay: `${i * 1}s`,
                }}>{r}</span>
              ))}
            </div>
            <div style={{
              position: 'absolute', inset: 14, borderRadius: '50%',
              border: '1px dashed rgba(100, 180, 230, 0.12)',
              animation: 'spin-slow 10s linear infinite',
            }} />
            <span style={{
              fontSize: '2.6rem',
              color: 'rgba(170, 215, 255, 0.9)',
              filter: 'drop-shadow(0 0 12px rgba(100,180,230,1)) drop-shadow(0 0 36px rgba(120,80,200,0.7))',
              animation: 'float 5s ease-in-out infinite',
              position: 'relative',
            }}>✉</span>
          </div>

          <RuneRow />

          <div>
            <p className="text-xs mb-3" style={{ color: 'rgba(140, 110, 240, 0.6)', letterSpacing: '0.15em' }}>
              — MENSAGEM SELADA —
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(150, 200, 230, 0.7)', maxWidth: 240 }}>
              Uma carta foi guardada para você.<br />Ela só pode ser aberta por você.
            </p>
          </div>

          <PrimaryButton onClick={() => setOpen(true)}>
            Abrir a Carta ✦
          </PrimaryButton>
        </div>
      ) : (
        /* Letter revealed */
        <div className="flex flex-col items-center w-full animate-fade-in">
          <span className="text-3xl mb-4 block" style={{
            color: 'rgba(150, 115, 240, 0.65)',
            animation: 'float 4.5s ease-in-out infinite',
          }}>✦</span>

          <RuneRow />

          <p className="text-xs text-center italic" style={{
            color: 'rgba(150, 115, 240, 0.52)',
            maxWidth: 240,
            lineHeight: 1.75,
            margin: '20px auto 24px',
          }}>
            "Até os elfos aprendem algo novo<br />com cada pessoa que encontram."
          </p>

          <Card className="w-full max-w-sm mb-6 animate-slide-up">
            {CORNER_RUNES.map((r, i) => (
              <span key={i} style={{
                position: 'absolute',
                color: 'rgba(140, 105, 230, 0.35)',
                fontSize: 10,
                ...CORNER_POS[i],
                animation: 'rune-glow 4.5s ease-in-out infinite',
                animationDelay: `${i * 1.1}s`,
                userSelect: 'none',
              }}>{r}</span>
            ))}

            <p className="text-sm font-light mb-6 text-center" style={{ color: 'rgba(150, 200, 230, 0.45)', letterSpacing: '0.12em' }}>
              — CARTA —
            </p>

            <div className="flex flex-col gap-4 text-sm leading-relaxed font-light" style={{ color: 'rgba(190, 225, 245, 0.88)' }}>
              <p>Oi, moce.</p>
              <p>
                Não sou muito bom com palavras, mas tô tentando, porque você merece
                que eu tente.
              </p>
              <p>
                Sou grato a Deus por ter colocado você na minha vida. De verdade.
                Não é papo, é que quando eu olho pra trás, fica claro que foi Ele
                que organizou tudo isso — cada detalhe, desde a igreja até aqui.
              </p>
              <p>
                Você tem esse jeito de me deixar bem só de estar por perto. Não
                precisa fazer nada de especial, você já é especial do jeito que é.
              </p>
              <p>
                Eu quero me esforçar muito mais. Quero que você sinta que tem
                alguém do seu lado de verdade, que tá prestando atenção em você,
                que se importa com o que você sente.
              </p>
              <p>
                Feliz Dia dos Namorados, senhore. Fico feliz demais que seja você.
              </p>
              <p className="text-right mt-2" style={{ color: 'rgba(130, 100, 220, 0.65)' }}>
                Com amor ✦
              </p>
            </div>
          </Card>

          <PrimaryButton onClick={onContinue} className="mb-6">
            Continuar →
          </PrimaryButton>

          <p className="text-xs text-center" style={{ color: 'rgba(100, 180, 230, 0.28)' }}>
            feito com carinho (e bastante CSS)
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Screen 5 — Anniversary Counter ─────────────────────────────────────────

function CounterScreen() {
  const [elapsed, setElapsed] = useState(() => getElapsed())

  useEffect(() => {
    const id = setInterval(() => setElapsed(getElapsed()), 1000)
    return () => clearInterval(id)
  }, [])

  const pad = (n) => String(n).padStart(2, '0')

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center animate-fade-in">

      {/* Header */}
      <span style={{
        fontSize: '1.8rem',
        color: 'rgba(150, 115, 240, 0.7)',
        animation: 'float 5s ease-in-out infinite',
        display: 'block',
        marginBottom: 16,
        filter: 'drop-shadow(0 0 8px rgba(120,80,200,0.5))',
      }}>✦</span>

      <p style={{ color: 'rgba(140, 110, 240, 0.65)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6 }}>
        A jornada juntos · desde
      </p>
      <p style={{ color: '#c5e8f5', fontSize: 13, fontFamily: "'Playfair Display', serif", letterSpacing: '0.08em', marginBottom: 20 }}>
        09 de fevereiro de 2025 · 08h28
      </p>

      <RuneRow />

      {/* Portrait photo */}
      <div style={{
        width: 155,
        height: 255,
        borderRadius: 20,
        overflow: 'hidden',
        margin: '24px auto',
        position: 'relative',
        border: '1px solid rgba(130, 100, 220, 0.35)',
        boxShadow: '0 0 32px rgba(100, 140, 255, 0.12), 0 0 64px rgba(120, 80, 200, 0.1)',
        flexShrink: 0,
      }}>
        <img
          src={`${BASE}inicio.jpeg`}
          alt="nossa história"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            if (e.currentTarget.parentElement) {
              e.currentTarget.parentElement.style.background = 'rgba(14, 25, 60, 0.9)'
            }
          }}
        />
        {/* Subtle top gradient for polish */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(4,12,30,0.25) 0%, transparent 30%, transparent 70%, rgba(4,12,30,0.35) 100%)',
        }} />
        {/* Corner rune top-left */}
        <span style={{
          position: 'absolute', top: 8, left: 10,
          color: 'rgba(140, 105, 230, 0.5)', fontSize: 9,
          animation: 'rune-glow 4s ease-in-out infinite',
        }}>ᚠ</span>
        <span style={{
          position: 'absolute', top: 8, right: 10,
          color: 'rgba(140, 105, 230, 0.5)', fontSize: 9,
          animation: 'rune-glow 4s ease-in-out infinite',
          animationDelay: '1s',
        }}>ᛟ</span>
      </div>

      {/* Counter card */}
      <div style={{
        background: 'rgba(14, 30, 64, 0.6)',
        border: '1px solid rgba(100, 180, 230, 0.18)',
        borderRadius: 18,
        padding: '22px 32px',
        backdropFilter: 'blur(8px)',
        width: '100%',
        maxWidth: 300,
        position: 'relative',
        marginBottom: 24,
      }}>
        {/* Spinning ring behind the number */}
        <div style={{
          position: 'absolute', top: -1, left: -1, right: -1, bottom: -1,
          borderRadius: 18, border: '1px solid rgba(130, 100, 220, 0.15)',
          animation: 'spin-slow 30s linear infinite',
          pointerEvents: 'none',
        }} />

        <p style={{
          fontSize: '3.5rem', fontWeight: 300, color: '#c5e8f5',
          fontFamily: "'Playfair Display', serif", margin: '0 0 2px', lineHeight: 1,
          textShadow: '0 0 20px rgba(100,180,230,0.3)',
        }}>
          {elapsed.days}
        </p>
        <p style={{ fontSize: 10, color: 'rgba(140, 110, 240, 0.55)', letterSpacing: '0.2em', marginBottom: 16 }}>
          DIAS DE JORNADA
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
          {[
            { v: pad(elapsed.hours),   l: 'horas' },
            { v: pad(elapsed.minutes), l: 'min' },
            { v: pad(elapsed.seconds), l: 'seg' },
          ].map(({ v, l }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: '1.6rem', fontWeight: 300,
                color: 'rgba(180, 220, 240, 0.85)', margin: 0,
                fontFamily: 'monospace', letterSpacing: '0.05em',
                textShadow: '0 0 10px rgba(100,180,230,0.2)',
              }}>{v}</p>
              <p style={{ fontSize: 8, color: 'rgba(130,100,220,0.4)', margin: 0, letterSpacing: '0.15em' }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Frieren quote */}
      <p style={{
        color: 'rgba(150, 115, 240, 0.48)',
        fontSize: 11,
        fontStyle: 'italic',
        maxWidth: 260,
        lineHeight: 1.8,
        textAlign: 'center',
        marginBottom: 20,
      }}>
        "Para um elfo, mil anos passam como um sopro.<br />
        Mas Frieren entendeu tarde demais<br />
        que cada momento com alguém importa.<br />
        A gente não vai deixar isso acontecer."
      </p>

      <RuneRow delay={2} />
    </div>
  )
}

// ─── Music player button ─────────────────────────────────────────────────────

function MusicButton({ muted, onToggle, started }) {
  if (!started) return null
  return (
    <button
      onClick={onToggle}
      title={muted ? 'Ativar música' : 'Silenciar música'}
      className="fixed bottom-5 right-5 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
      style={{
        background: 'rgba(14, 30, 64, 0.8)',
        border: '1px solid rgba(100, 180, 230, 0.3)',
        backdropFilter: 'blur(8px)',
        color: muted ? 'rgba(100, 180, 230, 0.35)' : 'rgba(100, 180, 230, 0.85)',
        fontSize: '1.1rem',
      }}
    >
      {muted ? '🔇' : '🎵'}
    </button>
  )
}

// ─── App Shell ───────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState('welcome')
  const [quizScore, setQuizScore] = useState(0)
  const [muted, setMuted] = useState(false)
  const [musicStarted, setMusicStarted] = useState(false)
  const audioRef = useRef(null)

  function startMusic() {
    if (audioRef.current && !musicStarted) {
      audioRef.current.volume = 0.35
      audioRef.current.play().catch(() => {})
      setMusicStarted(true)
    }
  }

  function toggleMute() {
    if (!audioRef.current) return
    const next = !muted
    audioRef.current.muted = next
    setMuted(next)
  }

  function handleStart() {
    startMusic()
    setScreen('quiz')
  }

  return (
    <>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50%       { opacity: 1; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fall {
          0%   { transform: translateY(-6vh) translateX(0px) rotate(0deg);    opacity: 0; }
          8%   { opacity: 1; }
          35%  { transform: translateY(35vh) translateX(18px) rotate(140deg); }
          65%  { transform: translateY(65vh) translateX(-12px) rotate(270deg); }
          88%  { opacity: 0.7; }
          100% { transform: translateY(108vh) translateX(5px) rotate(400deg); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-11px); }
        }
        @keyframes rune-glow {
          0%, 100% { opacity: 0.15; }
          50%      { opacity: 0.75; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 24px rgba(43, 143, 201, 0.3); }
          50%      { box-shadow: 0 0 42px rgba(43, 143, 201, 0.55), 0 0 64px rgba(130, 80, 210, 0.22); }
        }
        .animate-fade-in  { animation: fadeIn  1.5s ease-out forwards; }
        .animate-slide-up { animation: slideUp 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <audio ref={audioRef} src={`${BASE}frieren.mp3`} loop preload="auto" />

      <div
        className="relative min-h-screen"
        style={{ background: 'linear-gradient(180deg, #040c1e 0%, #071428 60%, #030b1a 100%)' }}
      >
        <Stars />
        <FallingRunes />
        <div className="relative z-10 max-w-sm mx-auto">
          {screen === 'welcome'     && <WelcomeScreen onStart={handleStart} />}
          {screen === 'quiz'        && <QuizScreen onFinish={(s) => { setQuizScore(s); setScreen('quiz-result') }} />}
          {screen === 'quiz-result' && <QuizResultScreen score={quizScore} onContinue={() => setScreen('memory')} />}
          {screen === 'memory'      && <MemoryScreen onFinish={() => setScreen('letter')} />}
          {screen === 'letter'      && <LoveLetterScreen onContinue={() => setScreen('counter')} />}
          {screen === 'counter'     && <CounterScreen />}
        </div>
        <MusicButton muted={muted} onToggle={toggleMute} started={musicStarted} />
      </div>
    </>
  )
}
