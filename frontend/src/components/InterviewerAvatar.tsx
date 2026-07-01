import React from 'react';
import './InterviewerAvatar.css';

export type PersonaId = 'sarah' | 'marcus' | 'nova';

interface Persona {
  id: PersonaId;
  name: string;
  role: string;
  themeColor: string;
  accentColor: string;
  badge: string;
  description: string;
}

export const PERSONAS: Persona[] = [
  {
    id: 'sarah',
    name: 'Sarah Vance',
    role: 'Lead Technical Recruiter',
    themeColor: 'var(--indigo)',
    accentColor: '#a5b4fc',
    badge: 'Tech Recruiter',
    description: 'Specializes in system architecture and coding practices.',
  },
  {
    id: 'marcus',
    name: 'Marcus Sterling',
    role: 'Senior HR Partner',
    themeColor: 'var(--emerald)',
    accentColor: '#6ee7b7',
    badge: 'HR Executive',
    description: 'Focuses on cultural fit, behavioral skills, and leadership.',
  },
  {
    id: 'nova',
    name: 'Nova AI',
    role: 'Futuristic AI Assistant',
    themeColor: 'var(--violet)',
    accentColor: '#c084fc',
    badge: 'AI Hologram',
    description: 'Dynamic automated agent leveraging advanced neural networks.',
  },
];

interface InterviewerAvatarProps {
  phase: 'idle' | 'speaking' | 'listening' | 'saving';
  activePersona: PersonaId;
  onChangePersona: (id: PersonaId) => void;
  isAutoRunning?: boolean;
}

export const InterviewerAvatar: React.FC<InterviewerAvatarProps> = ({
  phase,
  activePersona,
  onChangePersona,
  isAutoRunning = false,
}) => {
  const currentPersona = PERSONAS.find((p) => p.id === activePersona) || PERSONAS[0];

  return (
    <div className={`avatar-container ${phase} persona-${activePersona}`}>
      {/* Background Cyber Glow & Grids */}
      <div className="avatar-glow-backdrop" />
      {activePersona === 'nova' && <div className="avatar-grid-overlay" />}

      {/* Floating Header details */}
      <div className="avatar-header-bar">
        <span className="persona-badge" style={{ borderColor: currentPersona.themeColor, color: currentPersona.accentColor }}>
          {currentPersona.badge}
        </span>
        <div className="persona-selector">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => onChangePersona(p.id)}
              className={`persona-btn ${activePersona === p.id ? 'active' : ''}`}
              title={p.name}
              style={{
                '--btn-theme': p.themeColor,
              } as React.CSSProperties}
            >
              {p.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Avatar SVG Model */}
      <div className="avatar-display">
        {/* Ambient Ring Visualizers */}
        <div className="avatar-ambient-rings">
          <div className="avatar-ring ring-1" style={{ borderColor: currentPersona.themeColor }} />
          <div className="avatar-ring ring-2" style={{ borderColor: currentPersona.themeColor }} />
          <div className="avatar-ring ring-3" style={{ borderColor: currentPersona.themeColor }} />
        </div>

        {/* Live Soundwave Bars for Listening & Speaking */}
        {(phase === 'speaking' || phase === 'listening') && (
          <div className="avatar-soundwaves">
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className="wave-bar"
                style={{
                  backgroundColor: currentPersona.themeColor,
                  animationDelay: `${i * 0.12}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* SVG Portrait Model */}
        <svg viewBox="0 0 200 220" className="avatar-svg">
          <defs>
            {/* Skin Gradients */}
            <linearGradient id="sarahSkin" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbcfe8" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
            <linearGradient id="marcusSkin" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <linearGradient id="novaSkin" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.4" />
            </linearGradient>

            {/* Hair Gradients */}
            <linearGradient id="sarahHair" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#312e81" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
            <linearGradient id="marcusHair" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>

            {/* Suit Gradients */}
            <linearGradient id="sarahSuit" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#312e81" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
            <linearGradient id="marcusSuit" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="100%" stopColor="#022c22" />
            </linearGradient>
            <linearGradient id="novaSuit" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
            </linearGradient>

            {/* Futuristic Tech Glow Filter */}
            <filter id="novaGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* BACKGROUND MATRIX GRID (Nova Persona) */}
          {activePersona === 'nova' && (
            <g opacity="0.3" filter="url(#novaGlow)">
              <circle cx="100" cy="95" r="55" fill="none" stroke="var(--violet)" strokeWidth="0.8" strokeDasharray="3 3" />
              <circle cx="100" cy="95" r="70" fill="none" stroke="var(--violet)" strokeWidth="0.5" />
              <line x1="100" y1="20" x2="100" y2="170" stroke="var(--violet)" strokeWidth="0.5" strokeDasharray="5 5" />
              <line x1="30" y1="95" x2="170" y2="95" stroke="var(--violet)" strokeWidth="0.5" strokeDasharray="5 5" />
            </g>
          )}

          {/* THINKING SPINNER BACKDROP (Saving State) */}
          {phase === 'saving' && (
            <g className="saving-spinner">
              <circle
                cx="100"
                cy="95"
                r="65"
                fill="none"
                stroke={currentPersona.themeColor}
                strokeWidth="2"
                strokeDasharray="40 120"
                opacity="0.8"
              />
              <circle
                cx="100"
                cy="95"
                r="72"
                fill="none"
                stroke={currentPersona.themeColor}
                strokeWidth="1"
                strokeDasharray="15 60"
                opacity="0.5"
                style={{ animationDirection: 'reverse', transformOrigin: 'center' }}
              />
            </g>
          )}

          {/* =============================================================== */}
          {/* BODY / SUIT LAYER (Breathing Animation) */}
          {/* =============================================================== */}
          <g className="avatar-body-group">
            {activePersona === 'sarah' && (
              <>
                {/* Shoulders / Suit */}
                <path d="M 45,190 C 45,150 70,140 100,140 C 130,140 155,150 155,190 L 165,220 L 35,220 Z" fill="url(#sarahSuit)" />
                {/* Shirt Collar / V-Neck */}
                <path d="M 85,140 L 100,165 L 115,140 Z" fill="#ffffff" />
                <path d="M 80,140 L 100,168 L 120,140 Z" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                {/* Necklace / Detail */}
                <circle cx="100" cy="155" r="3" fill="#fbbf24" />
              </>
            )}

            {activePersona === 'marcus' && (
              <>
                {/* Shoulders / Suit */}
                <path d="M 40,195 C 40,152 70,142 100,142 C 130,142 160,152 160,195 L 170,220 L 30,220 Z" fill="url(#marcusSuit)" />
                {/* Under Shirt (Dark Grey) */}
                <path d="M 86,142 L 100,170 L 114,142 Z" fill="#1e293b" />
                {/* Tie / Detail */}
                <path d="M 97,170 L 103,170 L 105,210 L 95,210 Z" fill="#334155" />
              </>
            )}

            {activePersona === 'nova' && (
              <>
                {/* Futuristic Cyber Body */}
                <path
                  d="M 45,190 C 50,155 75,145 100,145 C 125,145 150,155 155,190 L 160,220 L 40,220 Z"
                  fill="url(#novaSuit)"
                  stroke="var(--violet)"
                  strokeWidth="1"
                  filter="url(#novaGlow)"
                />
                {/* Cyber Collar Line */}
                <path d="M 75,150 Q 100,175 125,150" fill="none" stroke="#c084fc" strokeWidth="2.5" opacity="0.8" />
                {/* Power Core Node */}
                <circle cx="100" cy="180" r="8" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="2" />
                <circle cx="100" cy="180" r="3" fill="#a78bfa" className="core-glow" />
              </>
            )}
          </g>

          {/* =============================================================== */}
          {/* HEAD & FACE LAYER (Bobbing / Tilting Animation) */}
          {/* =============================================================== */}
          <g className="avatar-head-group">
            {/* Neck */}
            {activePersona === 'sarah' && <rect x="88" y="118" width="24" height="30" rx="4" fill="#fb7185" opacity="0.9" />}
            {activePersona === 'marcus' && <rect x="88" y="118" width="24" height="30" rx="4" fill="#fb923c" opacity="0.9" />}
            {activePersona === 'nova' && (
              <g>
                <rect x="90" y="120" width="20" height="28" fill="none" stroke="var(--violet)" strokeWidth="1.5" />
                <line x1="95" y1="125" x2="105" y2="125" stroke="var(--violet)" strokeWidth="1" />
                <line x1="95" y1="133" x2="105" y2="133" stroke="var(--violet)" strokeWidth="1" />
                <line x1="95" y1="141" x2="105" y2="141" stroke="var(--violet)" strokeWidth="1" />
              </g>
            )}

            {/* Back Hair (Sarah) */}
            {activePersona === 'sarah' && (
              <path d="M 60,95 C 50,75 55,42 100,40 C 145,42 150,75 140,95 L 144,145 C 144,145 130,150 100,150 C 70,150 56,145 56,145 Z" fill="url(#sarahHair)" />
            )}

            {/* Face Shield / Shape */}
            {activePersona === 'sarah' && <ellipse cx="100" cy="94" rx="28" ry="36" fill="url(#sarahSkin)" />}
            {activePersona === 'marcus' && <ellipse cx="100" cy="94" rx="28" ry="36" fill="url(#marcusSkin)" />}
            {activePersona === 'nova' && (
              <ellipse
                cx="100"
                cy="94"
                rx="28"
                ry="36"
                fill="url(#novaSkin)"
                stroke="var(--violet)"
                strokeWidth="1.5"
                filter="url(#novaGlow)"
              />
            )}

            {/* Front Hair / Beard Details */}
            {activePersona === 'sarah' && (
              <>
                {/* Sleek Swoop Bangs */}
                <path d="M 72,72 Q 100,60 128,72 Q 132,60 124,52 C 112,44 88,44 76,52 Q 68,60 72,72 Z" fill="url(#sarahHair)" />
                <path d="M 70,72 Q 88,68 100,82 Q 112,68 130,72 Q 135,90 135,105 Q 135,115 132,120 L 132,80 L 68,80 L 68,120 Q 65,115 65,105 Q 65,90 70,72 Z" fill="url(#sarahHair)" opacity="0.95" />
              </>
            )}

            {activePersona === 'marcus' && (
              <>
                {/* Hair Top */}
                <path d="M 70,72 C 68,54 75,44 100,43 C 125,44 132,54 130,72 Q 134,60 125,52 C 115,44 85,44 75,52 Q 66,60 70,72 Z" fill="url(#marcusHair)" />
                {/* Mature Beard & Mustache Overlay */}
                <path d="M 72,94 C 72,122 84,136 100,136 C 116,136 128,122 128,94 C 128,115 125,126 100,126 C 75,126 72,115 72,94 Z" fill="#475569" opacity="0.95" />
                <path d="M 73,105 Q 100,105 127,105 C 124,115 116,124 100,124 C 84,124 76,115 73,105 Z" fill="#334155" />
                <path d="M 86,108 Q 100,113 114,108 Q 100,105 86,108" fill="#1e293b" /> {/* Mustache base */}
              </>
            )}

            {activePersona === 'nova' && (
              <g opacity="0.8">
                {/* Cybernetic details on face */}
                <path d="M 78,82 L 90,82 M 110,82 L 122,82" stroke="#22d3ee" strokeWidth="1" />
                <path d="M 74,94 L 84,94 M 116,94 L 126,94" stroke="#22d3ee" strokeWidth="1" />
                <path d="M 100,62 L 100,75" stroke="#22d3ee" strokeWidth="1" />
                {/* Hologram circuits */}
                <circle cx="85" cy="74" r="2" fill="var(--violet)" />
                <circle cx="115" cy="74" r="2" fill="var(--violet)" />
              </g>
            )}

            {/* =============================================================== */}
            {/* EYES & BROWS (Dynamic Blinking & Expressions) */}
            {/* =============================================================== */}
            <g className="avatar-eyes-group">
              {/* Eyebrows */}
              {activePersona === 'sarah' && (
                <g stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" opacity="0.9">
                  <path d="M 80,82 Q 88,77 94,83" fill="none" />
                  <path d="M 120,82 Q 112,77 106,83" fill="none" />
                </g>
              )}
              {activePersona === 'marcus' && (
                <g stroke="#334155" strokeWidth="3" strokeLinecap="round" opacity="0.9">
                  <path d="M 79,81 Q 87,76 94,82" fill="none" />
                  <path d="M 121,81 Q 113,76 106,82" fill="none" />
                </g>
              )}
              {activePersona === 'nova' && (
                <g stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M 80,82 L 93,82" fill="none" />
                  <path d="M 120,82 L 107,82" fill="none" />
                </g>
              )}

              {/* Eye Left */}
              <g className="eye-left-container">
                {/* White of eye */}
                {activePersona !== 'nova' && <ellipse cx="87" cy="88" rx="5.5" ry="4.5" fill="#ffffff" />}
                {/* Pupil/Iris */}
                {activePersona === 'sarah' && <circle cx="87" cy="88" r="3.2" fill="#5b21b6" />}
                {activePersona === 'marcus' && <circle cx="87" cy="88" r="3.2" fill="#047857" />}
                {activePersona === 'nova' && (
                  <g>
                    <circle cx="87" cy="88" r="4.5" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
                    <circle cx="87" cy="88" r="1.5" fill="#22d3ee" />
                  </g>
                )}
                {/* Highlight */}
                {activePersona !== 'nova' && <circle cx="88.5" cy="86.5" r="1.2" fill="#ffffff" />}
                {/* Eyelid (Animated scale down) */}
                <ellipse cx="87" cy="88" rx="6" ry="5" className="eyelid" fill={activePersona === 'sarah' ? '#fb7185' : activePersona === 'marcus' ? '#fb923c' : '#22d3ee'} />
              </g>

              {/* Eye Right */}
              <g className="eye-right-container">
                {/* White of eye */}
                {activePersona !== 'nova' && <ellipse cx="113" cy="88" rx="5.5" ry="4.5" fill="#ffffff" />}
                {/* Pupil/Iris */}
                {activePersona === 'sarah' && <circle cx="113" cy="88" r="3.2" fill="#5b21b6" />}
                {activePersona === 'marcus' && <circle cx="113" cy="88" r="3.2" fill="#047857" />}
                {activePersona === 'nova' && (
                  <g>
                    <circle cx="113" cy="88" r="4.5" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
                    <circle cx="113" cy="88" r="1.5" fill="#22d3ee" />
                  </g>
                )}
                {/* Highlight */}
                {activePersona !== 'nova' && <circle cx="114.5" cy="86.5" r="1.2" fill="#ffffff" />}
                {/* Eyelid (Animated scale down) */}
                <ellipse cx="113" cy="88" rx="6" ry="5" className="eyelid" fill={activePersona === 'sarah' ? '#fb7185' : activePersona === 'marcus' ? '#fb923c' : '#22d3ee'} />
              </g>

              {/* Thoughtful Eyes Offset for Saving/Thinking State */}
              {phase === 'saving' && (
                <style>
                  {`.eye-left-container circle, .eye-right-container circle {
                    transform: translate(1px, -2px);
                    transition: transform 0.8s ease-in-out;
                  }`}
                </style>
              )}
            </g>

            {/* =============================================================== */}
            {/* GLASSES LAYER (Sarah & Marcus Personas) */}
            {/* =============================================================== */}
            {activePersona === 'sarah' && (
              <g stroke="#4f46e5" strokeWidth="2" fill="none" opacity="0.9" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.15))">
                <circle cx="86" cy="89" r="11.5" />
                <circle cx="114" cy="89" r="11.5" />
                <path d="M 97.5,89 L 102.5,89" strokeLinecap="round" />
                <path d="M 74.5,87 L 70,86" strokeLinecap="round" />
                <path d="M 125.5,87 L 130,86" strokeLinecap="round" />
              </g>
            )}

            {activePersona === 'marcus' && (
              <g stroke="#1e293b" strokeWidth="2.5" fill="none" opacity="0.9">
                <rect x="73" y="79" width="26" height="18" rx="3" />
                <rect x="101" y="79" width="26" height="18" rx="3" />
                <path d="M 99,87 L 101,87" />
                <path d="M 73,85 L 69,84" />
                <path d="M 127,85 L 131,84" />
              </g>
            )}

            {/* Nose */}
            {activePersona === 'sarah' && <path d="M 100,92 L 98,102 Q 100,104 102,102 Z" fill="#f43f5e" opacity="0.3" />}
            {activePersona === 'marcus' && <path d="M 100,92 L 97,102 Q 100,104 103,102 Z" fill="#ea580c" opacity="0.3" />}

            {/* =============================================================== */}
            {/* DYNAMIC MOUTH LAYER (Speech, Smile, Idle shapes) */}
            {/* =============================================================== */}
            <g className="avatar-mouth-group">
              {/* Mouth Back Drop (Speaking) */}
              {phase === 'speaking' ? (
                activePersona === 'nova' ? (
                  /* Digital talking grid / wave */
                  <path
                    d="M 90,111 Q 100,123 110,111 Q 100,116 90,111"
                    fill="#22d3ee"
                    className="mouth-talking-digital"
                  />
                ) : (
                  /* Warm human mouth path opening & closing */
                  <path
                    d="M 90,111 Q 100,125 110,111 Q 100,105 90,111 Z"
                    fill={activePersona === 'sarah' ? '#be123c' : '#991b1b'}
                    className="mouth-talking"
                  />
                )
              ) : phase === 'listening' ? (
                /* Interactive friendly smile path */
                <path
                  d="M 89,111 Q 100,119 111,111"
                  fill="none"
                  stroke={activePersona === 'nova' ? '#22d3ee' : activePersona === 'sarah' ? '#fb7185' : '#ea580c'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              ) : phase === 'saving' ? (
                /* Thoughtful focused flat/slight curved line */
                <path
                  d="M 91,113 L 109,113"
                  fill="none"
                  stroke={activePersona === 'nova' ? '#a78bfa' : activePersona === 'sarah' ? '#be123c' : '#475569'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              ) : (
                /* Idle: soft neutral smile line */
                <path
                  d="M 90,112 Q 100,116 110,112"
                  fill="none"
                  stroke={activePersona === 'nova' ? '#818cf8' : activePersona === 'sarah' ? '#f43f5e' : '#475569'}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </g>
          </g>
        </svg>

        {/* Dynamic Holographic Scanline Overlay for Nova */}
        {activePersona === 'nova' && <div className="avatar-scanline" />}
      </div>

      {/* Under Avatar Profile Detail */}
      <div className="avatar-footer-profile">
        <h3>{currentPersona.name}</h3>
        <p className="role-text" style={{ color: currentPersona.accentColor }}>{currentPersona.role}</p>
        <p className="description-text">{currentPersona.description}</p>
      </div>

      {/* Automated Flow Indicator Tag */}
      {isAutoRunning && (
        <div className="auto-flow-badge" style={{ backgroundColor: currentPersona.themeColor }}>
          <span className="blink-dot" /> Auto Interviewer Active
        </div>
      )}
    </div>
  );
};
