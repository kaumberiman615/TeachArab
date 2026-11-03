import JSZip from 'jszip';
import { Draft, MediaItem } from '../types';
import { blobToBase64 } from './media';
import { sanitizeText } from './arabic';

/**
 * Trigger browser file download
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Generate Standalone Single-File Offline HTML for all 3 Templates
 */
export async function generateOfflineHTML(draft: Draft): Promise<string> {
  // Convert all media blobs to base64
  const mediaBase64Map: Record<string, { base64: string; mimeType: string; name: string }> = {};

  if (draft.mediaFiles) {
    for (const [id, item] of Object.entries(draft.mediaFiles)) {
      if (item && item.blob) {
        try {
          const base64 = await blobToBase64(item.blob);
          mediaBase64Map[id] = {
            base64,
            mimeType: item.mimeType || 'application/octet-stream',
            name: item.name || id,
          };
        } catch (e: unknown) {
          const err = e as { name?: string; message?: string };
          console.warn(`[generateOfflineHTML] Failed to convert media to base64: ${err.name} - ${err.message}`, id);
        }
      } else if (item && (item as any).url) {
        mediaBase64Map[id] = {
          base64: (item as any).url,
          mimeType: item.mimeType || 'application/octet-stream',
          name: item.name || id,
        };
      }
    }
  }

  const exportData = {
    ...draft,
    mediaBase64: mediaBase64Map
  };

  const safeTitle = sanitizeText(draft.title || 'Materi Bahasa Arab');
  const safeDesc = sanitizeText(draft.description || '');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} - Teach Arab Offline</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Noto+Naskh+Arabic:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Scheherazade+New:wght@400;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background-color: #f5f5f4;
      color: #1c1917;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .font-amiri { font-family: 'Amiri', serif; }
    .font-noto { font-family: 'Noto Naskh Arabic', sans-serif; }
    .font-scheherazade { font-family: 'Scheherazade New', serif; }
    .arabic-text {
      direction: rtl;
      unicode-bidi: isolate;
      line-height: 2.1 !important;
      padding: 0.2em 0;
    }
    .container {
      max-width: 1080px;
      margin: 0 auto;
      padding: 1.5rem 1rem;
      width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    header {
      background: #ffffff;
      border-bottom: 1px solid #e7e5e4;
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 40;
    }
    .brand {
      font-weight: 700;
      color: #047857;
      font-size: 1.125rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .badge {
      display: inline-block;
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      background: #ecfdf5;
      color: #065f46;
      font-weight: 600;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: 0.5rem;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;
      user-select: none;
    }
    .btn-primary { background: #059669; color: #fff; }
    .btn-primary:hover { background: #047857; }
    .btn-outline { background: #fff; border-color: #d6d3d1; color: #44403c; }
    .btn-outline:hover { background: #f5f5f4; }
    .card {
      background: #fff;
      border-radius: 1rem;
      border: 1px solid #e7e5e4;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      padding: 1.5rem;
    }
    /* Flip card styles */
    .flashcard-wrapper {
      perspective: 1200px;
      width: 100%;
      max-width: 680px;
      height: 380px;
      margin: 1.5rem auto;
      cursor: pointer;
    }
    .flashcard-inner {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      transform-style: preserve-3d;
    }
    .flashcard-inner.flipped {
      transform: rotateY(180deg);
    }
    .flashcard-face {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 1.25rem;
      background: #ffffff;
      border: 2px solid #e7e5e4;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.07);
    }
    .flashcard-back {
      transform: rotateY(180deg);
      background: #fcfbf9;
      border-color: #a7f3d0;
    }
    /* Quiz styles */
    .quiz-choice {
      padding: 1rem 1.25rem;
      border: 2px solid #e7e5e4;
      border-radius: 0.75rem;
      background: #fff;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-align: left;
      font-size: 1.1rem;
    }
    .quiz-choice:hover:not(.disabled) {
      border-color: #059669;
      background: #f0fdf4;
    }
    .quiz-choice.selected-correct {
      border-color: #059669;
      background: #ecfdf5;
      color: #065f46;
      font-weight: 600;
    }
    .quiz-choice.selected-wrong {
      border-color: #dc2626;
      background: #fef2f2;
      color: #991b1b;
      font-weight: 600;
    }
    /* Matching styles */
    .match-card {
      min-height: 80px;
      padding: 1rem;
      border: 2px solid #e7e5e4;
      border-radius: 0.75rem;
      background: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      cursor: pointer;
      transition: all 0.15s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.03);
      user-select: none;
    }
    .match-card:hover:not(.matched) {
      border-color: #059669;
      transform: translateY(-2px);
    }
    .match-card.selected {
      border-color: #059669;
      background: #ecfdf5;
      box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.2);
    }
    .match-card.matched {
      opacity: 0.4;
      pointer-events: none;
      border-color: #9ca3af;
      background: #f3f4f6;
    }
    .team-badge {
      padding: 0.4rem 0.8rem;
      border-radius: 0.5rem;
      border: 2px solid transparent;
      font-weight: 600;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .team-badge.active {
      border-color: #059669;
      background: #ecfdf5;
      color: #065f46;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    /* Slide styles */
    .slide-canvas {
      background: #fff;
      border: 1px solid #e7e5e4;
      border-radius: 1.25rem;
      padding: 2.5rem;
      min-height: 480px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      position: relative;
    }
    .slide-dots {
      display: flex;
      gap: 0.4rem;
      justify-content: center;
      align-items: center;
    }
    .slide-dot {
      width: 8px;
      height: 8px;
      border-radius: 9999px;
      background: #d6d3d1;
      cursor: pointer;
      transition: all 0.2s;
    }
    .slide-dot.active {
      width: 24px;
      background: #059669;
    }
    /* Vocab Picture styles */
    .vocab-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
    .vocab-card {
      background: #fff;
      border: 1px solid #e7e5e4;
      border-radius: 1rem;
      padding: 1.25rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .vocab-card:hover {
      border-color: #059669;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    /* Reading styles */
    .sentence-card {
      background: #fff;
      border: 1px solid #e7e5e4;
      border-radius: 1rem;
      padding: 1.25rem 1.5rem;
      cursor: pointer;
      transition: all 0.15s ease;
      margin-bottom: 0.75rem;
    }
    .sentence-card:hover {
      border-color: #10b981;
    }
    .sentence-card.active {
      border-color: #059669;
      background: #f0fdf4;
      box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.2);
    }
    /* Word Table styles */
    .table-container {
      background: #fff;
      border: 1px solid #e7e5e4;
      border-radius: 1rem;
      overflow-x: auto;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .data-table th {
      background: #047857;
      color: #fff;
      padding: 0.85rem 1rem;
      font-size: 0.85rem;
      font-weight: 700;
    }
    .data-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #f5f5f4;
      font-size: 0.95rem;
    }
    .data-table tr:hover td {
      background: #f0fdf4;
    }
    .masked-cell {
      background: #fef3c7;
      color: #92400e;
      border-radius: 0.35rem;
      padding: 0.2rem 0.5rem;
      font-size: 0.8rem;
      cursor: pointer;
      display: inline-block;
      user-select: none;
    }
    @media print {
      body * {
        visibility: hidden !important;
      }
      .printable-area, .printable-area * {
        visibility: visible !important;
      }
      .printable-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        margin: 0;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      .data-table th, .data-table td {
        border: 1px solid #000 !important;
        color: #000 !important;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>
      <span>Teach Arab</span>
      <span class="badge">Mode Offline</span>
    </div>
    <div style="display: flex; gap: 0.5rem;">
      <button class="btn btn-outline" id="btn-fullscreen" title="Layar Penuh Proyektor">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
        Layar Penuh
      </button>
    </div>
  </header>

  <main class="container">
    <div style="margin-bottom: 1.25rem;">
      <h1 style="font-size: 1.5rem; font-weight: 700; color: #1c1917;">${safeTitle}</h1>
      <p style="color: #78716c; font-size: 0.95rem; margin-top: 0.25rem;">${safeDesc || 'Materi pembelajaran Bahasa Arab siap pakai.'}</p>
    </div>

    <!-- Interactive App Viewport -->
    <div id="player-viewport"></div>
  </main>

  <script id="draft-data" type="application/json">
    ${JSON.stringify(exportData).replace(/</g, '\\u003c')}
  </script>

  <script>
    (function() {
      const data = JSON.parse(document.getElementById('draft-data').textContent);
      const viewport = document.getElementById('player-viewport');
      let soundMuted = false;
      let showHarakat = data.theme?.showHarakat !== false;
      let showLatin = data.theme?.showLatin !== false;
      const fontClass = data.theme?.fontFamily === 'Noto Naskh Arabic' ? 'font-noto' : (data.theme?.fontFamily === 'Scheherazade New' ? 'font-scheherazade' : 'font-amiri');

      // Harakat regex
      const HARAKAT_REGEX = /[\\u064B-\\u065F\\u0670\\u06D6-\\u06ED]/g;
      function filterHarakat(text) {
        if (!text) return '';
        return showHarakat ? text : text.replace(HARAKAT_REGEX, '');
      }

      // Web Audio SFX
      function playTone(freq1, freq2, duration, type) {
        if (soundMuted) return;
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (!AudioCtx) return;
          const ctx = new AudioCtx();
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = type || 'sine';
          osc.frequency.setValueAtTime(freq1, now);
          if (freq2) osc.frequency.setValueAtTime(freq2, now + duration * 0.4);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + duration);
        } catch (e) {}
      }

      function sfxCorrect() { playTone(659, 880, 0.4, 'triangle'); }
      function sfxWrong() { playTone(220, 170, 0.35, 'sawtooth'); }
      function sfxClick() { playTone(440, 880, 0.08, 'sine'); }

      // Arabic Speech
      function speak(text) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = 'ar-SA';
        utt.rate = 0.85;
        window.speechSynthesis.speak(utt);
      }

      // Media resolver
      function getMediaSrc(mediaId) {
        if (!mediaId || !data.mediaBase64 || !data.mediaBase64[mediaId]) return null;
        return data.mediaBase64[mediaId].base64;
      }

      // Fullscreen
      document.getElementById('btn-fullscreen').addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });

      // RENDERERS
      if (data.templateType === 'flashcard') {
        renderFlashcards();
      } else if (data.templateType === 'kuis') {
        renderQuiz();
      } else if (data.templateType === 'mencocokkan' || data.templateType === 'matching') {
        renderMatching();
      } else if (data.templateType === 'slide') {
        renderSlide();
      } else if (data.templateType === 'vocab-picture') {
        renderVocabPicture();
      } else if (data.templateType === 'reading') {
        renderReading();
      } else if (data.templateType === 'word-table') {
        renderWordTable();
      }

      // 1. FLASHCARD
      function renderFlashcards() {
        let currentIndex = 0;
        let isFlipped = false;
        const items = data.items || [];
        if (items.length === 0) {
          viewport.innerHTML = '<div class="card" style="text-align:center;">Belum ada kosakata dalam materi ini.</div>';
          return;
        }

        function updateCard() {
          const item = items[currentIndex];
          const audioSrc = getMediaSrc(item.mediaAudioId);
          const imgSrc = getMediaSrc(item.mediaImageId);

          viewport.innerHTML = \`
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
              <div style="font-weight:600; color:#57534e;">Kartu \${currentIndex + 1} dari \${items.length}</div>
              <div style="display:flex; gap:0.5rem;">
                <button class="btn btn-outline" id="toggle-harakat">\${showHarakat ? 'Sembunyikan Harakat' : 'Tampilkan Harakat'}</button>
                <button class="btn btn-outline" id="toggle-latin">\${showLatin ? 'Sembunyikan Latin' : 'Tampilkan Latin'}</button>
              </div>
            </div>

            <div class="flashcard-wrapper" id="card-click">
              <div class="flashcard-inner \${isFlipped ? 'flipped' : ''}">
                <!-- Front (Arabic) -->
                <div class="flashcard-face">
                  <div style="font-size:0.875rem; color:#78716c; margin-bottom:1rem;">Ketuk untuk melihat arti ↺</div>
                  \${imgSrc ? \`<img src="\${imgSrc}" style="max-height:140px; border-radius:0.5rem; margin-bottom:1rem; object-fit:contain;" />\` : ''}
                  <div class="arabic-text \${fontClass}" style="font-size:2.8rem; font-weight:700; color:#047857;">
                    \${filterHarakat(item.arabic)}
                  </div>
                  \${showLatin && item.latin ? \`<div style="font-size:1.1rem; color:#57534e; margin-top:0.75rem; font-style:italic;">\${item.latin}</div>\` : ''}
                  <div style="margin-top:1.5rem; display:flex; gap:0.5rem;">
                    <button class="btn btn-outline" id="btn-speak" style="padding:0.4rem 0.8rem; font-size:0.8rem;" onclick="event.stopPropagation();">
                      🔊 Bacakan
                    </button>
                    \${audioSrc ? \`<audio id="card-audio" src="\${audioSrc}" preload="auto"></audio><button class="btn btn-outline" id="btn-play-audio" style="padding:0.4rem 0.8rem; font-size:0.8rem;" onclick="event.stopPropagation();">🎵 Rekaman Guru</button>\` : ''}
                  </div>
                </div>
                <!-- Back (Meaning) -->
                <div class="flashcard-face flashcard-back">
                  <div style="font-size:0.875rem; color:#059669; font-weight:600; margin-bottom:0.75rem;">Arti Kata</div>
                  <div style="font-size:2rem; font-weight:700; color:#1c1917;">\${item.meaning}</div>
                  \${item.notes ? \`<div style="margin-top:1rem; font-size:0.95rem; color:#57534e; background:#f5f5f4; padding:0.5rem 1rem; border-radius:0.5rem;">\${item.notes}</div>\` : ''}
                  <div class="arabic-text \${fontClass}" style="font-size:1.4rem; color:#047857; margin-top:1.5rem;">
                    \${filterHarakat(item.arabic)}
                  </div>
                </div>
              </div>
            </div>

            <!-- Controls -->
            <div style="display:flex; justify-content:center; align-items:center; gap:1rem; margin-top:1.5rem;">
              <button class="btn btn-outline" id="btn-prev" \${currentIndex === 0 ? 'disabled' : ''}>← Sebelumnya</button>
              <button class="btn btn-outline" id="btn-flip">Balik Kartu (Spasi)</button>
              <button class="btn btn-primary" id="btn-next">\${currentIndex === items.length - 1 ? 'Selesai / Ulangi' : 'Selanjutnya →'}</button>
            </div>
          \`;

          document.getElementById('card-click').addEventListener('click', () => {
            isFlipped = !isFlipped;
            sfxClick();
            updateCard();
          });
          document.getElementById('btn-flip').addEventListener('click', (e) => {
            e.stopPropagation();
            isFlipped = !isFlipped;
            sfxClick();
            updateCard();
          });
          document.getElementById('btn-prev').addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentIndex > 0) {
              currentIndex--;
              isFlipped = false;
              sfxClick();
              updateCard();
            }
          });
          document.getElementById('btn-next').addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentIndex < items.length - 1) {
              currentIndex++;
              isFlipped = false;
              sfxClick();
              updateCard();
            } else {
              currentIndex = 0;
              isFlipped = false;
              sfxClick();
              updateCard();
            }
          });
          document.getElementById('toggle-harakat').addEventListener('click', () => {
            showHarakat = !showHarakat;
            updateCard();
          });
          document.getElementById('toggle-latin').addEventListener('click', () => {
            showLatin = !showLatin;
            updateCard();
          });
          document.getElementById('btn-speak').addEventListener('click', () => {
            speak(item.arabic);
          });
          const btnAudio = document.getElementById('btn-play-audio');
          if (btnAudio) {
            btnAudio.addEventListener('click', () => {
              const aud = document.getElementById('card-audio');
              if (aud) aud.play();
            });
          }
        }

        updateCard();
      }

      // 2. KUIS
      function renderQuiz() {
        const rawQuestions = data.items || [];
        let questions = rawQuestions.map(q => {
          let choices = (q.choices || []).map((c, i) => {
            const text = typeof c === 'string' ? c : (c.text || '');
            const mediaImageId = typeof c === 'object' ? c.mediaImageId : undefined;
            return { text, mediaImageId, isCorrect: i === q.correctIndex };
          });
          return { ...q, choices };
        });

        const pointsPerQuestion = data.settings?.pointsPerQuestion || 10;
        let curIdx = 0;
        let score = 0;
        let answered = false;
        let selectedChoice = -1;
        let gameFinished = false;

        // Team mode
        const isTeam = data.settings?.teamMode;
        const teamCount = data.settings?.teamCount || 2;
        const teamNames = data.settings?.teamNames || ['Tim Merah', 'Tim Biru', 'Tim Hijau', 'Tim Kuning'].slice(0, teamCount);
        let currentTeam = 0;
        const teamScores = Array(teamCount).fill(0);

        function showScreen() {
          if (questions.length === 0) {
            viewport.innerHTML = '<div class="card" style="text-align:center;">Belum ada soal kuis.</div>';
            return;
          }

          if (gameFinished) {
            viewport.innerHTML = \`
              <div class="card" style="text-align:center; padding:3rem 1.5rem;">
                <div style="font-size:3rem; margin-bottom:1rem;">🎉</div>
                <h2 style="font-size:1.75rem; font-weight:700; margin-bottom:0.5rem;">Kuis Selesai!</h2>
                \${isTeam ? \`
                  <div style="margin:2rem auto; max-width:450px; display:flex; flex-direction:column; gap:0.75rem;">
                    \${teamNames.map((name, i) => \`
                      <div style="display:flex; justify-content:space-between; padding:0.75rem 1rem; border-radius:0.5rem; background:#f5f5f4; font-weight:600;">
                        <span>\${name}</span>
                        <span style="color:#059669;">\${teamScores[i]} Poin</span>
                      </div>
                    \`).join('')}
                  </div>
                \` : \`
                  <p style="font-size:1.25rem; color:#57534e; margin-bottom:1.5rem;">Skor Akhir: <strong style="color:#059669; font-size:1.75rem;">\${score}</strong> dari \${questions.length * pointsPerQuestion}</p>
                \`}
                <button class="btn btn-primary" id="btn-restart" style="padding:0.75rem 2rem; font-size:1rem;">Ulangi Kuis</button>
              </div>
            \`;
            document.getElementById('btn-restart').addEventListener('click', () => {
              curIdx = 0;
              score = 0;
              answered = false;
              gameFinished = false;
              currentTeam = 0;
              teamScores.fill(0);
              showScreen();
            });
            return;
          }

          const q = questions[curIdx];
          const imgSrc = getMediaSrc(q.mediaImageId);
          const audioSrc = getMediaSrc(q.mediaAudioId);

          viewport.innerHTML = \`
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
              <div>
                <span style="font-size:0.875rem; font-weight:600; color:#57534e;">Soal \${curIdx + 1} dari \${questions.length}</span>
              </div>
              \${isTeam ? \`
                <div style="display:flex; gap:0.5rem;">
                  \${teamNames.map((tName, idx) => \`
                    <div class="team-badge \${idx === currentTeam ? 'active' : ''}">
                      \${tName}: \${teamScores[idx]}
                    </div>
                  \`).join('')}
                </div>
              \` : \`
                <div style="font-weight:700; color:#059669;">Skor: \${score}</div>
              \`}
            </div>

            <div class="card" style="margin-bottom:1.5rem;">
              \${imgSrc ? \`<img src="\${imgSrc}" style="max-height:180px; margin:0 auto 1rem; display:block; border-radius:0.5rem; object-fit:contain;" />\` : ''}
              \${q.questionArabic ? \`
                <div class="arabic-text \${fontClass}" style="font-size:2rem; font-weight:700; color:#047857; text-align:center;">
                  \${filterHarakat(q.questionArabic)}
                </div>
              \` : ''}
              \${q.questionIndo ? \`
                <div style="font-size:1.25rem; font-weight:600; text-align:center; margin-top:0.5rem; color:#1c1917;">
                  \${q.questionIndo}
                </div>
              \` : ''}
              <div style="display:flex; justify-content:center; gap:0.5rem; margin-top:1rem;">
                \${q.questionArabic ? \`<button class="btn btn-outline" id="quiz-speak" style="font-size:0.8rem; padding:0.3rem 0.6rem;">🔊 Bacakan</button>\` : ''}
                \${audioSrc ? \`<audio id="q-audio" src="\${audioSrc}"></audio><button class="btn btn-outline" id="quiz-audio" style="font-size:0.8rem; padding:0.3rem 0.6rem;">🎵 Audio Guru</button>\` : ''}
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
              \${q.choices.map((ch, idx) => {
                let statusClass = '';
                if (answered) {
                  if (ch.isCorrect) statusClass = 'selected-correct';
                  else if (idx === selectedChoice) statusClass = 'selected-wrong';
                  else statusClass = 'disabled';
                }
                const isChoiceArabic = /[\\u0600-\\u06FF]/.test(ch.text);
                const chImgSrc = getMediaSrc(ch.mediaImageId);
                return \`
                  <button class="quiz-choice \${statusClass}" data-index="\${idx}">
                    <span style="font-weight:700; color:#78716c; width:28px; height:28px; border-radius:50%; background:#f5f5f4; display:flex; align-items:center; justify-content:center; font-size:0.9rem;">
                      \${['A', 'B', 'C', 'D', 'E'][idx]}
                    </span>
                    \${chImgSrc ? \`<img src="\${chImgSrc}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;" />\` : ''}
                    <span class="\${isChoiceArabic ? fontClass + ' arabic-text' : ''}" style="flex:1; \${isChoiceArabic ? 'font-size:1.35rem;' : ''}">
                      \${filterHarakat(ch.text)}
                    </span>
                  </button>
                \`;
              }).join('')}
            </div>

            \${answered ? \`
              <div style="margin-top:1.5rem; display:flex; justify-content:space-between; align-items:center;">
                <div style="color:#57534e; font-size:0.95rem;">
                  \${q.explanation ? \`<strong>Penjelasan:</strong> \${q.explanation}\` : ''}
                </div>
                <button class="btn btn-primary" id="btn-next-quiz" style="padding:0.6rem 1.5rem;">
                  \${curIdx === questions.length - 1 ? 'Lihat Hasil Akhir →' : 'Soal Berikutnya →'}
                </button>
              </div>
            \` : ''}
          \`;

          if (document.getElementById('quiz-speak')) {
            document.getElementById('quiz-speak').addEventListener('click', () => speak(q.questionArabic));
          }
          if (document.getElementById('quiz-audio')) {
            document.getElementById('quiz-audio').addEventListener('click', () => {
              const aud = document.getElementById('q-audio');
              if (aud) aud.play();
            });
          }

          if (!answered) {
            document.querySelectorAll('.quiz-choice').forEach(el => {
              el.addEventListener('click', () => {
                const choiceIdx = parseInt(el.getAttribute('data-index'), 10);
                selectedChoice = choiceIdx;
                answered = true;

                if (q.choices[choiceIdx]?.isCorrect) {
                  sfxCorrect();
                  if (isTeam) teamScores[currentTeam] += pointsPerQuestion;
                  else score += pointsPerQuestion;
                } else {
                  sfxWrong();
                }

                showScreen();
              });
            });
          } else {
            document.getElementById('btn-next-quiz').addEventListener('click', () => {
              if (isTeam) currentTeam = (currentTeam + 1) % teamCount;
              if (curIdx < questions.length - 1) {
                curIdx++;
                answered = false;
                selectedChoice = -1;
                showScreen();
              } else {
                gameFinished = true;
                showScreen();
              }
            });
          }
        }

        showScreen();
      }

      // 3. MENCOCOKKAN
      function renderMatching() {
        const pairs = data.items || [];
        if (pairs.length === 0) {
          viewport.innerHTML = '<div class="card" style="text-align:center;">Belum ada pasangan kata untuk dicocokkan.</div>';
          return;
        }

        let selectedArabicId = null;
        let selectedMeaningId = null;
        let matchedIds = new Set();
        let attempts = 0;
        let score = 0;

        // Shuffle left and right independently
        const leftItems = [...pairs].sort(() => Math.random() - 0.5);
        const rightItems = [...pairs].sort(() => Math.random() - 0.5);

        function updateBoard() {
          if (matchedIds.size === pairs.length) {
            viewport.innerHTML = \`
              <div class="card" style="text-align:center; padding:3rem 1.5rem;">
                <div style="font-size:3rem; margin-bottom:1rem;">🏆</div>
                <h2 style="font-size:1.75rem; font-weight:700;">Luar Biasa! Semua Cocok</h2>
                <p style="color:#57534e; margin:1rem 0 1.5rem;">Total Percobaan: <strong>\${attempts}</strong></p>
                <button class="btn btn-primary" id="btn-restart-match" style="padding:0.75rem 2rem;">Main Lagi</button>
              </div>
            \`;
            document.getElementById('btn-restart-match').addEventListener('click', () => {
              matchedIds.clear();
              attempts = 0;
              score = 0;
              renderMatching();
            });
            return;
          }

          viewport.innerHTML = \`
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
              <span style="font-weight:600; color:#57534e;">Cocokkan Kata Arab dengan Artinya:</span>
              <div style="display:flex; gap:1rem; font-weight:600;">
                <span style="color:#059669;">Cocok: \${matchedIds.size} / \${pairs.length}</span>
                <span style="color:#78716c;">Percobaan: \${attempts}</span>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
              <!-- Left Column: Arabic words (Draggable) -->
              <div style="display:flex; flex-direction:column; gap:0.75rem;">
                \${leftItems.map(item => {
                  const isMatched = matchedIds.has(item.id);
                  const isSelected = selectedArabicId === item.id;
                  return \`
                    <div class="match-card \${isMatched ? 'matched' : ''} \${isSelected ? 'selected' : ''}" draggable="\${!isMatched}" data-type="arabic" data-id="\${item.id}">
                      <div class="arabic-text \${fontClass}" style="font-size:1.6rem; font-weight:700; color:#047857;">
                        \${filterHarakat(item.arabic)}
                      </div>
                      \${showLatin && item.latin ? \`<div style="font-size:0.85rem; color:#78716c;">\${item.latin}</div>\` : ''}
                    </div>
                  \`;
                }).join('')}
              </div>

              <!-- Right Column: Indonesian Meaning (Droppable) -->
              <div style="display:flex; flex-direction:column; gap:0.75rem;">
                \${rightItems.map(item => {
                  const isMatched = matchedIds.has(item.id);
                  const isSelected = selectedMeaningId === item.id;
                  const imgSrc = getMediaSrc(item.mediaImageId);
                  return \`
                    <div class="match-card \${isMatched ? 'matched' : ''} \${isSelected ? 'selected' : ''}" data-type="meaning" data-id="\${item.id}">
                      \${imgSrc ? \`<img src="\${imgSrc}" style="max-height:55px; border-radius:0.25rem; margin-bottom:0.4rem; object-fit:contain;" />\` : ''}
                      <div style="font-size:1.1rem; font-weight:600; color:#1c1917;">
                        \${item.meaning}
                      </div>
                    </div>
                  \`;
                }).join('')}
              </div>
            </div>
          \`;

          // Click handlers
          document.querySelectorAll('.match-card:not(.matched)').forEach(el => {
            el.addEventListener('click', () => {
              const type = el.getAttribute('data-type');
              const id = el.getAttribute('data-id');
              sfxClick();

              if (type === 'arabic') {
                selectedArabicId = id;
              } else {
                selectedMeaningId = id;
              }

              // Check if both selected
              if (selectedArabicId && selectedMeaningId) {
                attempts++;
                if (selectedArabicId === selectedMeaningId) {
                  sfxCorrect();
                  matchedIds.add(selectedArabicId);
                } else {
                  sfxWrong();
                }
                selectedArabicId = null;
                selectedMeaningId = null;
              }

              updateBoard();
            });

            // Drag and drop
            el.addEventListener('dragstart', (e) => {
              if (el.getAttribute('data-type') === 'arabic') {
                e.dataTransfer.setData('text/plain', el.getAttribute('data-id'));
              }
            });
            el.addEventListener('dragover', (e) => e.preventDefault());
            el.addEventListener('drop', (e) => {
              e.preventDefault();
              if (el.getAttribute('data-type') === 'meaning') {
                const dragId = e.dataTransfer.getData('text/plain');
                const dropId = el.getAttribute('data-id');
                if (dragId && dropId) {
                  attempts++;
                  if (dragId === dropId) {
                    sfxCorrect();
                    matchedIds.add(dragId);
                  } else {
                    sfxWrong();
                  }
                  updateBoard();
                }
              }
            });
          });
        }

        updateBoard();
      }

      // 4. SLIDE MATERI
      function renderSlide() {
        let currentIndex = 0;
        let showNotes = false;
        let currentAudio = null;
        const items = data.items || [];
        if (items.length === 0) {
          viewport.innerHTML = '<div class="card" style="text-align:center;">Belum ada slide dalam materi ini.</div>';
          return;
        }

        function updateSlide() {
          const slide = items[currentIndex];
          const imgSrc = getMediaSrc(slide.mediaImageId);
          const audioSrc = getMediaSrc(slide.mediaAudioId);
          const title = filterHarakat(slide.title || '');
          const content = filterHarakat(slide.content || '');

          let bodyHtml = '';
          if (slide.layout === 'big-title') {
            bodyHtml = \`
              <div style="text-align:center; margin:auto 0; padding:2rem 0;">
                <div style="font-size:2.8rem; font-weight:700; color:#047857; margin-bottom:1.5rem;" class="arabic-text \${fontClass}">
                  \${title}
                </div>
                \${content ? \`<div style="font-size:1.25rem; color:#44403c; max-width:700px; margin:0 auto; line-height:1.8; white-space:pre-line;">\${content}</div>\` : ''}
                \${imgSrc ? \`<img src="\${imgSrc}" style="max-height:220px; margin:1.5rem auto 0; border-radius:0.75rem; object-fit:contain; display:block;" />\` : ''}
              </div>
            \`;
          } else if (slide.layout === 'image-left') {
            bodyHtml = \`
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:2rem; align-items:center;">
                <div>
                  \${imgSrc ? \`<img src="\${imgSrc}" style="max-height:280px; width:100%; border-radius:0.75rem; object-fit:contain;" />\` : '<div style="background:#f5f5f4; border:1px dashed #d6d3d1; height:200px; border-radius:0.75rem; display:flex; align-items:center; justify-content:center; color:#78716c;">Media visual</div>'}
                </div>
                <div>
                  <h2 style="font-size:1.8rem; font-weight:700; color:#1c1917; margin-bottom:1rem;" class="arabic-text \${fontClass}">\${title}</h2>
                  <div style="font-size:1.05rem; color:#44403c; line-height:1.8; white-space:pre-line;">\${content}</div>
                </div>
              </div>
            \`;
          } else if (slide.layout === 'image-right') {
            bodyHtml = \`
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:2rem; align-items:center;">
                <div>
                  <h2 style="font-size:1.8rem; font-weight:700; color:#1c1917; margin-bottom:1rem;" class="arabic-text \${fontClass}">\${title}</h2>
                  <div style="font-size:1.05rem; color:#44403c; line-height:1.8; white-space:pre-line;">\${content}</div>
                </div>
                <div>
                  \${imgSrc ? \`<img src="\${imgSrc}" style="max-height:280px; width:100%; border-radius:0.75rem; object-fit:contain;" />\` : '<div style="background:#f5f5f4; border:1px dashed #d6d3d1; height:200px; border-radius:0.75rem; display:flex; align-items:center; justify-content:center; color:#78716c;">Media visual</div>'}
                </div>
              </div>
            \`;
          } else if (slide.layout === 'image-full') {
            bodyHtml = \`
              <div style="text-align:center;">
                <h2 style="font-size:1.5rem; font-weight:700; color:#1c1917; margin-bottom:1rem;" class="arabic-text \${fontClass}">\${title}</h2>
                \${imgSrc ? \`<img src="\${imgSrc}" style="max-height:360px; max-width:100%; border-radius:0.75rem; object-fit:contain; margin-bottom:1rem;" />\` : ''}
                \${content ? \`<div style="font-size:0.95rem; color:#57534e; max-width:640px; margin:0 auto; white-space:pre-line;">\${content}</div>\` : ''}
              </div>
            \`;
          } else {
            bodyHtml = \`
              <div style="max-width:760px; margin:auto; width:100%;">
                <h2 style="font-size:2rem; font-weight:700; color:#1c1917; text-align:center; border-bottom:1px solid #f5f5f4; padding-bottom:1rem; margin-bottom:1.5rem;" class="arabic-text \${fontClass}">
                  \${title}
                </h2>
                <div style="font-size:1.15rem; color:#44403c; line-height:2; white-space:pre-line; background:#fafaf9; padding:1.5rem; border-radius:0.75rem; border:1px solid #f5f5f4;">
                  \${content}
                </div>
              </div>
            \`;
          }

          viewport.innerHTML = \`
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
              <div class="badge">Slide \${currentIndex + 1} dari \${items.length}</div>
              <div style="display:flex; gap:0.5rem;">
                <button class="btn btn-outline" id="btn-slide-audio">🔊 Putar Audio</button>
                \${slide.teacherNotes ? \`<button class="btn btn-outline" id="btn-slide-notes">\${showNotes ? 'Tutup Catatan' : '📝 Catatan Guru'}</button>\` : ''}
              </div>
            </div>

            <div class="slide-canvas">
              \${bodyHtml}
              \${showNotes && slide.teacherNotes ? \`
                <div style="margin-top:1.5rem; padding:1rem; background:#fffbeb; border:1px solid #fef3c7; border-radius:0.5rem; font-size:0.875rem; color:#92400e;">
                  <strong>Catatan Guru:</strong> \${slide.teacherNotes}
                </div>
              \` : ''}
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1.5rem;">
              <button class="btn btn-outline" id="btn-slide-prev" \${currentIndex === 0 ? 'disabled' : ''}>← Sebelumnya</button>
              <div class="slide-dots">
                \${items.map((_, i) => \`<span class="slide-dot \${i === currentIndex ? 'active' : ''}" data-idx="\${i}"></span>\`).join('')}
              </div>
              <button class="btn btn-primary" id="btn-slide-next" \${currentIndex === items.length - 1 ? 'disabled' : ''}>Berikutnya →</button>
            </div>
          \`;

          document.getElementById('btn-slide-prev')?.addEventListener('click', () => {
            if (currentIndex > 0) { currentIndex--; updateSlide(); }
          });
          document.getElementById('btn-slide-next')?.addEventListener('click', () => {
            if (currentIndex < items.length - 1) { currentIndex++; updateSlide(); }
          });
          document.getElementById('btn-slide-audio')?.addEventListener('click', () => {
            if (audioSrc) {
              if (currentAudio) { currentAudio.pause(); }
              currentAudio = new Audio(audioSrc);
              currentAudio.play().catch(() => speak(title));
            } else {
              speak(title);
            }
          });
          document.getElementById('btn-slide-notes')?.addEventListener('click', () => {
            showNotes = !showNotes;
            updateSlide();
          });
          viewport.querySelectorAll('.slide-dot').forEach(el => {
            el.addEventListener('click', () => {
              const idx = parseInt(el.getAttribute('data-idx'));
              if (!isNaN(idx)) { currentIndex = idx; updateSlide(); }
            });
          });
        }

        window.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight' || e.key === ' ') {
            if (currentIndex < items.length - 1) { currentIndex++; updateSlide(); }
          } else if (e.key === 'ArrowLeft') {
            if (currentIndex > 0) { currentIndex--; updateSlide(); }
          }
        });

        updateSlide();
      }

      // 5. KOSAKATA BERGAMBAR
      function renderVocabPicture() {
        let viewMode = 'single';
        let currentIndex = 0;
        const items = data.items || [];
        if (items.length === 0) {
          viewport.innerHTML = '<div class="card" style="text-align:center;">Belum ada kosakata bergambar.</div>';
          return;
        }

        function updateVocab() {
          if (viewMode === 'single') {
            const item = items[currentIndex];
            const imgSrc = getMediaSrc(item.mediaImageId);
            const audioSrc = getMediaSrc(item.mediaAudioId);

            viewport.innerHTML = \`
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                <div class="badge">Kartu \${currentIndex + 1} dari \${items.length}</div>
                <div style="display:flex; gap:0.5rem;">
                  <button class="btn btn-outline" id="btn-toggle-view">Mode Grid</button>
                  <button class="btn btn-outline" id="toggle-harakat">\${showHarakat ? 'Sembunyikan Harakat' : 'Tampilkan Harakat'}</button>
                </div>
              </div>

              <div class="card" id="card-speak" style="cursor:pointer; text-align:center; padding:2.5rem; max-width:600px; margin:0 auto;">
                \${imgSrc ? \`<img src="\${imgSrc}" style="max-height:220px; margin-bottom:1.5rem; object-fit:contain; border-radius:0.75rem;" />\` : ''}
                <div class="arabic-text \${fontClass}" style="font-size:3.2rem; font-weight:700; color:#047857; margin-bottom:0.5rem;">
                  \${filterHarakat(item.arabic)}
                </div>
                \${showLatin && item.latin ? \`<div style="font-size:1.15rem; color:#78716c; font-style:italic; margin-bottom:0.5rem;">\${item.latin}</div>\` : ''}
                <div style="font-size:1.8rem; font-weight:700; color:#1c1917; margin-top:0.5rem;">
                  \${item.meaning}
                </div>
                <div style="margin-top:1.5rem;">
                  <button class="btn btn-primary" id="btn-vocab-sound">🔊 Dengarkan Pelafalan</button>
                </div>
              </div>

              <div style="display:flex; justify-content:center; gap:1rem; margin-top:1.5rem;">
                <button class="btn btn-outline" id="btn-vp-prev" \${currentIndex === 0 ? 'disabled' : ''}>← Sebelumnya</button>
                <button class="btn btn-primary" id="btn-vp-next" \${currentIndex === items.length - 1 ? 'disabled' : ''}>Berikutnya →</button>
              </div>
            \`;

            document.getElementById('btn-vp-prev')?.addEventListener('click', () => {
              if (currentIndex > 0) { currentIndex--; updateVocab(); }
            });
            document.getElementById('btn-vp-next')?.addEventListener('click', () => {
              if (currentIndex < items.length - 1) { currentIndex++; updateVocab(); }
            });
            const playSound = () => {
              if (audioSrc) {
                const aud = new Audio(audioSrc);
                aud.play().catch(() => speak(item.arabic));
              } else {
                speak(item.arabic);
              }
            };
            document.getElementById('btn-vocab-sound')?.addEventListener('click', (e) => {
              e.stopPropagation();
              playSound();
            });
            document.getElementById('card-speak')?.addEventListener('click', playSound);
            document.getElementById('btn-toggle-view')?.addEventListener('click', () => {
              viewMode = 'grid';
              updateVocab();
            });
            document.getElementById('toggle-harakat')?.addEventListener('click', () => {
              showHarakat = !showHarakat;
              updateVocab();
            });
          } else {
            viewport.innerHTML = \`
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                <div class="badge">\${items.length} Kosakata</div>
                <button class="btn btn-outline" id="btn-toggle-single">Mode Satu Per Satu</button>
              </div>

              <div class="vocab-grid">
                \${items.map((it, idx) => {
                  const imgSrc = getMediaSrc(it.mediaImageId);
                  return \`
                    <div class="vocab-card" data-idx="\${idx}">
                      \${imgSrc ? \`<img src="\${imgSrc}" style="max-height:120px; object-fit:contain; border-radius:0.5rem; margin-bottom:0.75rem;" />\` : ''}
                      <div class="arabic-text \${fontClass}" style="font-size:1.8rem; font-weight:700; color:#047857;">
                        \${filterHarakat(it.arabic)}
                      </div>
                      \${showLatin && it.latin ? \`<div style="font-size:0.85rem; color:#78716c; font-style:italic;">\${it.latin}</div>\` : ''}
                      <div style="font-size:1.1rem; font-weight:700; color:#1c1917; margin-top:0.35rem;">
                        \${it.meaning}
                      </div>
                      <div style="margin-top:0.75rem; font-size:0.8rem; color:#059669; font-weight:600;">
                        🔊 Ketuk bersuara
                      </div>
                    </div>
                  \`;
                }).join('')}
              </div>
            \`;

            document.getElementById('btn-toggle-single')?.addEventListener('click', () => {
              viewMode = 'single';
              updateVocab();
            });

            viewport.querySelectorAll('.vocab-card').forEach(el => {
              el.addEventListener('click', () => {
                const idx = parseInt(el.getAttribute('data-idx'));
                const it = items[idx];
                const audioSrc = getMediaSrc(it.mediaAudioId);
                if (audioSrc) {
                  const aud = new Audio(audioSrc);
                  aud.play().catch(() => speak(it.arabic));
                } else {
                  speak(it.arabic);
                }
              });
            });
          }
        }

        updateVocab();
      }

      // 6. TEKS BACAAN (QIRA'AH)
      function renderReading() {
        let activeIdx = 0;
        let revealed = {};
        let showAll = false;
        let fontScale = 0;
        const items = data.items || [];
        if (items.length === 0) {
          viewport.innerHTML = '<div class="card" style="text-align:center;">Belum ada teks bacaan.</div>';
          return;
        }

        function updateReading() {
          const fontSizeRem = 1.7 + fontScale * 0.25;

          viewport.innerHTML = \`
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
              <div class="badge">\${items.length} Kalimat Qira'ah</div>
              <div style="display:flex; gap:0.5rem;">
                <button class="btn btn-outline" id="btn-toggle-harakat">\${showHarakat ? 'Harakat: Aktif' : 'Harakat: Mati'}</button>
                <button class="btn btn-outline" id="btn-toggle-all">\${showAll ? 'Sembunyikan Semua Arti' : 'Tampilkan Semua Arti'}</button>
                <button class="btn btn-outline" id="btn-font-minus">A-</button>
                <button class="btn btn-outline" id="btn-font-plus">A+</button>
              </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:0.75rem;">
              \${items.map((it, idx) => {
                const isRevealed = showAll || revealed[idx];
                const isSelected = activeIdx === idx;
                return \`
                  <div class="sentence-card \${isSelected ? 'active' : ''}" data-idx="\${idx}">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem;">
                      <div style="display:flex; gap:0.5rem; align-items:center;">
                        <span class="badge" style="background:#f5f5f4; color:#57534e;">\${idx + 1}</span>
                        <button class="btn btn-outline" style="padding:0.25rem 0.6rem; font-size:0.75rem;" data-speak="\${idx}">🔊</button>
                      </div>
                      <div class="arabic-text \${fontClass}" style="flex:1; text-align:right; font-weight:700; color:#1c1917; font-size:\${fontSizeRem}rem;">
                        \${filterHarakat(it.arabic)}
                      </div>
                    </div>
                    <div style="margin-top:0.75rem; padding-top:0.5rem; border-top:1px solid #f5f5f4; display:flex; justify-content:space-between; align-items:center; font-size:0.875rem;">
                      <span style="color:#059669; font-weight:600; cursor:pointer;" data-toggle-trans="\${idx}">
                        \${isRevealed ? 'Tutup Arti' : '👁️ Lihat Terjemah'}
                      </span>
                      \${isRevealed ? \`<span style="color:#065f46; font-style:italic;">\${it.translation}</span>\` : ''}
                    </div>
                  </div>
                \`;
              }).join('')}
            </div>
          \`;

          document.getElementById('btn-toggle-harakat')?.addEventListener('click', () => {
            showHarakat = !showHarakat;
            updateReading();
          });
          document.getElementById('btn-toggle-all')?.addEventListener('click', () => {
            showAll = !showAll;
            updateReading();
          });
          document.getElementById('btn-font-minus')?.addEventListener('click', () => {
            if (fontScale > -2) { fontScale--; updateReading(); }
          });
          document.getElementById('btn-font-plus')?.addEventListener('click', () => {
            if (fontScale < 3) { fontScale++; updateReading(); }
          });

          viewport.querySelectorAll('[data-speak]').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const idx = parseInt(btn.getAttribute('data-speak'));
              activeIdx = idx;
              const it = items[idx];
              const audioSrc = getMediaSrc(it.mediaAudioId);
              if (audioSrc) {
                const aud = new Audio(audioSrc);
                aud.play().catch(() => speak(it.arabic));
              } else {
                speak(it.arabic);
              }
              updateReading();
            });
          });

          viewport.querySelectorAll('[data-toggle-trans]').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const idx = parseInt(btn.getAttribute('data-toggle-trans'));
              revealed[idx] = !revealed[idx];
              updateReading();
            });
          });

          viewport.querySelectorAll('.sentence-card').forEach(card => {
            card.addEventListener('click', () => {
              const idx = parseInt(card.getAttribute('data-idx'));
              activeIdx = idx;
              updateReading();
            });
          });
        }

        updateReading();
      }

      // 7. TABEL / TASHRIF KATA
      function renderWordTable() {
        let hiddenCols = {};
        let revealedCells = {};
        const items = data.items || [];
        const columns = (data.settings && data.settings.columns && data.settings.columns.length > 0)
          ? data.settings.columns
          : [
              { id: 'col_madhi', name: "Madhi", isArabic: true },
              { id: 'col_mudhari', name: "Mudhari'", isArabic: true },
              { id: 'col_amr', name: "Amr", isArabic: true },
              { id: 'col_mashdar', name: "Mashdar", isArabic: true },
              { id: 'col_arti', name: "Arti", isArabic: false }
            ];

        if (items.length === 0) {
          viewport.innerHTML = '<div class="card" style="text-align:center;">Belum ada baris dalam tabel ini.</div>';
          return;
        }

        function updateTable() {
          viewport.innerHTML = \`
            <div class="no-print" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
              <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                <span style="font-size:0.8rem; font-weight:700; color:#44403c;">Sembunyikan Kolom Hafalan:</span>
                \${columns.map((col) => \`
                  <button class="btn btn-outline" style="padding:0.25rem 0.6rem; font-size:0.75rem; \${hiddenCols[col.id] ? 'background:#fef3c7; border-color:#fde68a; color:#92400e;' : ''}" data-hide-col="\${col.id}">
                    \${hiddenCols[col.id] ? '🙈 ' : ''}\${col.name}
                  </button>
                \`).join('')}
              </div>
              <div style="display:flex; gap:0.5rem;">
                <button class="btn btn-outline" id="btn-toggle-harakat">\${showHarakat ? 'Harakat: Aktif' : 'Harakat: Mati'}</button>
                <button class="btn btn-primary" id="btn-print-table">🖨️ Cetak Tabel</button>
              </div>
            </div>

            <div class="printable-area table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width:40px; text-align:center;">No</th>
                    \${columns.map(col => \`<th style="\${col.isArabic ? 'text-align:right;' : 'text-align:left;'}">\${col.name}</th>\`).join('')}
                    <th class="no-print" style="width:50px; text-align:center;">Suara</th>
                  </tr>
                </thead>
                <tbody>
                  \${items.map((row, rIdx) => \`
                    <tr>
                      <td style="text-align:center; font-weight:600; color:#78716c;">\${rIdx + 1}</td>
                      \${columns.map(col => {
                        const val = (row.values && row.values[col.id]) || '';
                        const cellKey = rIdx + '_' + col.id;
                        const isHidden = hiddenCols[col.id] && !revealedCells[cellKey];
                        return \`
                          <td style="\${col.isArabic ? 'text-align:right; font-weight:700; font-size:1.25rem;' : ''}" class="\${col.isArabic ? fontClass : ''}">
                            \${isHidden ? \`<span class="masked-cell" data-reveal="\${cellKey}">❓ Klik buka</span>\` : filterHarakat(val)}
                          </td>
                        \`;
                      }).join('')}
                      <td class="no-print" style="text-align:center;">
                        <button class="btn btn-outline" style="padding:0.2rem 0.5rem; font-size:0.75rem;" data-row-sound="\${rIdx}">🔊</button>
                      </td>
                    </tr>
                  \`).join('')}
                </tbody>
              </table>
            </div>
          \`;

          document.getElementById('btn-print-table')?.addEventListener('click', () => {
            window.print();
          });
          document.getElementById('btn-toggle-harakat')?.addEventListener('click', () => {
            showHarakat = !showHarakat;
            updateTable();
          });

          viewport.querySelectorAll('[data-hide-col]').forEach(btn => {
            btn.addEventListener('click', () => {
              const colId = btn.getAttribute('data-hide-col');
              hiddenCols[colId] = !hiddenCols[colId];
              updateTable();
            });
          });

          viewport.querySelectorAll('[data-reveal]').forEach(btn => {
            btn.addEventListener('click', () => {
              const key = btn.getAttribute('data-reveal');
              revealedCells[key] = true;
              updateTable();
            });
          });

          viewport.querySelectorAll('[data-row-sound]').forEach(btn => {
            btn.addEventListener('click', () => {
              const rIdx = parseInt(btn.getAttribute('data-row-sound'));
              const row = items[rIdx];
              const arabCol = columns.find(c => c.isArabic);
              const text = arabCol && row.values ? row.values[arabCol.id] : (row.values ? Object.values(row.values)[0] : '');
              if (text) speak(text);
            });
          });
        }

        updateTable();
      }

    })();
  </script>
</body>
</html>`;
}

/**
 * Generate ZIP package containing index.html, project.json, and media files
 */
export async function generateProjectZip(draft: Draft): Promise<Blob> {
  const zip = new JSZip();

  // Create media folder
  const mediaFolder = zip.folder('media');
  const mediaPathMap: Record<string, string> = {};

  if (draft.mediaFiles && mediaFolder) {
    for (const [id, item] of Object.entries(draft.mediaFiles)) {
      if (item && item.blob) {
        let ext = 'bin';
        if (item.mimeType.includes('jpeg') || item.mimeType.includes('jpg')) ext = 'jpg';
        else if (item.mimeType.includes('png')) ext = 'png';
        else if (item.mimeType.includes('webp')) ext = 'webp';
        else if (item.mimeType.includes('audio') || item.mimeType.includes('mp3')) ext = 'mp3';
        else if (item.mimeType.includes('wav')) ext = 'wav';
        else if (item.mimeType.includes('video') || item.mimeType.includes('mp4')) ext = 'mp4';

        const filename = `${id}.${ext}`;
        mediaFolder.file(filename, item.blob);
        mediaPathMap[id] = `media/${filename}`;
      }
    }
  }

  // Generate offline HTML
  const offlineHtml = await generateOfflineHTML(draft);
  zip.file('index.html', offlineHtml);

  // Store project data json for re-import
  const projectJson = JSON.stringify(
    {
      ...draft,
      mediaPaths: mediaPathMap,
    },
    null,
    2
  );
  zip.file('project.teach-arab.json', projectJson);

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Export draft project as JSON (with base64 media)
 */
export async function exportDraftAsJson(draft: Draft): Promise<Blob> {
  const mediaBase64Map: Record<string, { base64: string; mimeType: string; name: string }> = {};

  if (draft.mediaFiles) {
    for (const [id, item] of Object.entries(draft.mediaFiles)) {
      if (item && item.blob) {
        try {
          const base64 = await blobToBase64(item.blob);
          mediaBase64Map[id] = {
            base64,
            mimeType: item.mimeType || 'application/octet-stream',
            name: item.name || id,
          };
        } catch (e: unknown) {
          const err = e as { name?: string; message?: string };
          console.warn(`[exportDraftAsJson] Failed base64 conversion: ${err.name} - ${err.message}`, id);
        }
      } else if (item && (item as any).url) {
        mediaBase64Map[id] = {
          base64: (item as any).url,
          mimeType: item.mimeType || 'application/octet-stream',
          name: item.name || id,
        };
      }
    }
  }

  const payload = {
    app: 'teach-arab',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    draft: {
      ...draft,
      mediaBase64: mediaBase64Map
    }
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  return new Blob([jsonStr], { type: 'application/json' });
}

/**
 * Import project from JSON file
 */
export async function importDraftFromJson(jsonFile: File): Promise<Draft> {
  const text = await jsonFile.text();
  const parsed = JSON.parse(text);

  const rawDraft = parsed.draft || parsed;
  if (!rawDraft.id || !rawDraft.templateType) {
    throw new Error('Format file proyek tidak valid untuk Teach Arab.');
  }

  // Reconstruct mediaFiles Blobs from base64
  const mediaFiles: Record<string, MediaItem> = {};
  if (rawDraft.mediaBase64) {
    for (const [id, m] of Object.entries<any>(rawDraft.mediaBase64)) {
      if (m && m.base64) {
        const res = await fetch(m.base64);
        const blob = await res.blob();
        mediaFiles[id] = {
          id,
          name: m.name || id,
          type: m.mimeType?.startsWith('audio') ? 'audio' : (m.mimeType?.startsWith('video') ? 'video' : 'image'),
          mimeType: m.mimeType || blob.type,
          blob,
          size: blob.size
        };
      }
    }
  }

  const newDraft: Draft = {
    id: 'draft_' + Math.random().toString(36).substring(2, 10),
    title: rawDraft.title ? `${rawDraft.title} (Impor)` : 'Draf Impor',
    description: rawDraft.description || '',
    templateType: rawDraft.templateType,
    theme: rawDraft.theme || {
      palette: 'emerald',
      fontFamily: 'Amiri',
      fontSize: 'large',
      showHarakat: true,
      showLatin: true,
      soundEnabled: true
    },
    settings: rawDraft.settings || {},
    items: Array.isArray(rawDraft.items) ? rawDraft.items : [],
    mediaFiles,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  return newDraft;
}
