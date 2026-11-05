import { ThemeConfig, DraftSettings, TemplateType, isMatchingTemplate } from '../types';
import { Type, Palette, Clock, Users, Volume2, VolumeX, Eye, EyeOff, Shuffle, Award, Layers } from 'lucide-react';

interface ThemePanelProps {
  templateType: TemplateType;
  theme: ThemeConfig;
  settings: DraftSettings;
  onChangeTheme: (newTheme: ThemeConfig) => void;
  onChangeSettings: (newSettings: DraftSettings) => void;
}

export default function ThemePanel({
  templateType,
  theme,
  settings,
  onChangeTheme,
  onChangeSettings,
}: ThemePanelProps) {
  const palettes = [
    { id: 'emerald', name: 'Zamrud', color: 'bg-emerald-500', ring: 'ring-emerald-400' },
    { id: 'indigo', name: 'Nila', color: 'bg-indigo-500', ring: 'ring-indigo-400' },
    { id: 'amber', name: 'Kuning Madu', color: 'bg-amber-400', ring: 'ring-amber-300' },
    { id: 'rose', name: 'Mawar', color: 'bg-[#FF3B8D]', ring: 'ring-pink-300' },
    { id: 'teal', name: 'Toska', color: 'bg-[#00B4D8]', ring: 'ring-cyan-300' },
  ] as const;

  const fonts = [
    { id: 'Amiri', name: 'Amiri (Klasik Naskh)', sample: 'العَرَبِيَّةُ' },
    { id: 'Noto Naskh Arabic', name: 'Noto Naskh (Modern Bersih)', sample: 'العَرَبِيَّةُ' },
    { id: 'Scheherazade New', name: 'Scheherazade (Kaligrafi Tradisional)', sample: 'العَرَبِيَّةُ' },
  ] as const;

  const fontSizes = [
    { id: 'normal', name: 'Sedang (1.75rem)' },
    { id: 'large', name: 'Besar (2.25rem)' },
    { id: 'xlarge', name: 'Sangat Besar (3rem)' },
    { id: 'xxlarge', name: 'Raksasa / Proyektor (3.75rem)' },
  ] as const;

  return (
    <div className="bg-white border-2 border-stone-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* 1. Arabic Font & Styling */}
      <div>
        <label className="text-xs font-black text-[#0A254D] uppercase tracking-wider flex items-center gap-2 mb-2.5">
          <Type className="w-4 h-4 text-[#00B4D8]" />
          <span>Font & Tipografi Arab</span>
        </label>
        <div className="space-y-2.5">
          <select
            value={theme.fontFamily}
            onChange={(e) => onChangeTheme({ ...theme, fontFamily: e.target.value as any })}
            className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FAFCFC] border-2 border-stone-200 rounded-2xl focus:outline-[#00B4D8] focus:bg-white text-[#0A254D] font-bold"
          >
            {fonts.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          <div className="flex items-center justify-between text-xs text-stone-600 pt-1 font-medium">
            <span>Ukuran Tulisan Arab:</span>
            <div className="flex gap-1.5">
              {fontSizes.map((sz) => (
                <button
                  key={sz.id}
                  type="button"
                  onClick={() => onChangeTheme({ ...theme, fontSize: sz.id as any })}
                  className={`min-h-[36px] px-3 py-1 text-xs rounded-full border-2 cursor-pointer font-black transition-all ${
                    theme.fontSize === sz.id
                      ? 'bg-[#00B4D8] text-white border-[#00B4D8] shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                  title={sz.name}
                >
                  {sz.id === 'normal' ? 'M' : sz.id === 'large' ? 'L' : sz.id === 'xlarge' ? 'XL' : 'XXL'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Color Theme Palette */}
      <div>
        <label className="text-xs font-black text-[#0A254D] uppercase tracking-wider flex items-center gap-2 mb-2.5">
          <Palette className="w-4 h-4 text-[#FF3B8D]" />
          <span>Nuansa Warna</span>
        </label>
        <div className="flex items-center gap-3">
          {palettes.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onChangeTheme({ ...theme, palette: p.id })}
              className={`w-9 h-9 rounded-full ${p.color} cursor-pointer transition-all ${
                theme.palette === p.id ? 'scale-120 ring-4 ring-offset-2 ' + p.ring : 'hover:scale-110 opacity-80'
              }`}
              title={p.name}
              aria-label={p.name}
            />
          ))}
        </div>
      </div>

      {/* 3. Harakat & Latin Toggles */}
      <div className="pt-3 border-t border-stone-100 space-y-2.5">
        <label className="text-xs font-black text-[#0A254D] uppercase tracking-wider flex items-center gap-2 mb-1">
          <Eye className="w-4 h-4 text-[#00B4D8]" />
          <span>Tampilan Teks</span>
        </label>
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <button
            type="button"
            onClick={() => onChangeTheme({ ...theme, showHarakat: !theme.showHarakat })}
            className={`min-h-[44px] p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
              theme.showHarakat
                ? 'bg-[#E6F7F5] border-[#00B4D8] text-[#00B4D8] font-black'
                : 'bg-stone-50 border-stone-200 text-stone-600'
            }`}
          >
            <span>Harakat / Baris</span>
            {theme.showHarakat ? <Eye className="w-4 h-4 text-[#00B4D8]" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => onChangeTheme({ ...theme, showLatin: !theme.showLatin })}
            className={`min-h-[44px] p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
              theme.showLatin
                ? 'bg-[#E6F7F5] border-[#00B4D8] text-[#00B4D8] font-black'
                : 'bg-stone-50 border-stone-200 text-stone-600'
            }`}
          >
            <span>Teks Latin</span>
            {theme.showLatin ? <Eye className="w-4 h-4 text-[#00B4D8]" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 4. Game & Classroom Projector Options */}
      <div className="pt-3 border-t border-stone-100 space-y-3">
        <label className="text-xs font-black text-[#0A254D] uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#FF3B8D]" />
          <span>Pengaturan Kelas & Game</span>
        </label>

        {/* QUIZ SPECIFIC SETTINGS */}
        {templateType === 'kuis' && (
          <div className="space-y-3 p-4 bg-[#FAFCFC] border-2 border-stone-100 rounded-2xl text-xs">
            <div className="flex items-center justify-between text-stone-700">
              <span className="flex items-center gap-1.5 font-bold text-[#0A254D]">
                <Clock className="w-4 h-4 text-[#00B4D8]" /> Batas Waktu per Soal:
              </span>
              <select
                value={settings.timerSeconds || 0}
                onChange={(e) => onChangeSettings({ ...settings, timerSeconds: Number(e.target.value) })}
                className="px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-[#00B4D8] font-bold text-[#0A254D]"
              >
                <option value={0}>Tanpa Timer (Santai)</option>
                <option value={10}>10 Detik (Kilat)</option>
                <option value={15}>15 Detik (Cepat)</option>
                <option value={30}>30 Detik (Standar)</option>
                <option value={45}>45 Detik</option>
                <option value={60}>60 Detik</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-stone-700">
              <span className="flex items-center gap-1.5 font-bold text-[#0A254D]">
                <Award className="w-4 h-4 text-[#FF3B8D]" /> Skor per Soal Benar:
              </span>
              <select
                value={settings.pointsPerQuestion || 10}
                onChange={(e) => onChangeSettings({ ...settings, pointsPerQuestion: Number(e.target.value) })}
                className="px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-[#FF3B8D] font-bold text-[#0A254D]"
              >
                <option value={5}>5 Poin</option>
                <option value={10}>10 Poin</option>
                <option value={20}>20 Poin</option>
                <option value={25}>25 Poin</option>
                <option value={50}>50 Poin</option>
                <option value={100}>100 Poin</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-stone-700 pt-2 border-t border-stone-200">
              <span className="flex items-center gap-1.5 font-bold text-[#0A254D]">
                <Shuffle className="w-4 h-4 text-purple-500" /> Acak Urutan Soal:
              </span>
              <input
                type="checkbox"
                checked={!!settings.shuffleQuestions}
                onChange={(e) => onChangeSettings({ ...settings, shuffleQuestions: e.target.checked })}
                className="w-5 h-5 accent-[#00B4D8] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between text-stone-700">
              <span className="flex items-center gap-1.5 font-bold text-[#0A254D]">
                <Shuffle className="w-4 h-4 text-purple-500" /> Acak Pilihan Jawaban:
              </span>
              <input
                type="checkbox"
                checked={!!settings.shuffleChoices}
                onChange={(e) => onChangeSettings({ ...settings, shuffleChoices: e.target.checked })}
                className="w-5 h-5 accent-[#00B4D8] rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* MATCHING SPECIFIC SETTINGS */}
        {isMatchingTemplate(templateType) && (
          <div className="space-y-3 p-4 bg-[#FAFCFC] border-2 border-stone-100 rounded-2xl text-xs">
            <div className="flex items-center justify-between text-stone-700">
              <span className="flex items-center gap-1.5 font-bold text-[#0A254D]">
                <Shuffle className="w-4 h-4 text-purple-500" /> Acak Posisi Kiri & Kanan:
              </span>
              <input
                type="checkbox"
                checked={settings.shufflePositions !== false}
                onChange={(e) => onChangeSettings({ ...settings, shufflePositions: e.target.checked })}
                className="w-5 h-5 accent-[#FF3B8D] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between text-stone-700">
              <span className="flex items-center gap-1.5 font-bold text-[#0A254D]">
                <Layers className="w-4 h-4 text-[#00B4D8]" /> Pasangan per Ronde:
              </span>
              <select
                value={settings.pairsPerRound || 0}
                onChange={(e) => onChangeSettings({ ...settings, pairsPerRound: Number(e.target.value) })}
                className="px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-[#00B4D8] font-bold text-[#0A254D]"
              >
                <option value={0}>Semua Pasangan Sekaligus</option>
                <option value={4}>4 Pasang per Ronde</option>
                <option value={6}>6 Pasang per Ronde</option>
                <option value={8}>8 Pasang per Ronde</option>
              </select>
            </div>
          </div>
        )}

        {/* Sound toggle */}
        <div className="flex items-center justify-between text-xs text-stone-700 pt-1 font-bold">
          <span>Efek Suara (Benar / Salah):</span>
          <button
            type="button"
            onClick={() => onChangeTheme({ ...theme, soundEnabled: !theme.soundEnabled })}
            className={`min-h-[38px] px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 cursor-pointer border-2 transition-all ${
              theme.soundEnabled
                ? 'bg-[#E6F7F5] text-[#00B4D8] border-[#00B4D8]'
                : 'bg-stone-100 text-stone-500 border-stone-200'
            }`}
          >
            {theme.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{theme.soundEnabled ? 'Aktif' : 'Mati'}</span>
          </button>
        </div>

        {/* Team Mode for Quiz / Matching */}
        {(templateType === 'kuis' || isMatchingTemplate(templateType)) && (
          <div className="p-4 bg-[#FAFCFC] border-2 border-stone-100 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#0A254D] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00B4D8]" /> Mode Kompetisi Tim (Kelas)
              </span>
              <input
                type="checkbox"
                checked={!!settings.teamMode}
                onChange={(e) => onChangeSettings({ ...settings, teamMode: e.target.checked })}
                className="w-5 h-5 accent-[#00B4D8] rounded cursor-pointer"
              />
            </div>

            {settings.teamMode && (
              <div className="space-y-2 pt-2 border-t border-stone-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-600 font-bold">Jumlah Tim:</span>
                  <div className="flex gap-1.5">
                    {[2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          const defaultNames = ['Tim Merah', 'Tim Biru', 'Tim Hijau', 'Tim Kuning'];
                          onChangeSettings({
                            ...settings,
                            teamCount: num,
                            teamNames: defaultNames.slice(0, num),
                          });
                        }}
                        className={`min-h-[32px] px-3.5 py-1 rounded-full font-black text-xs border-2 cursor-pointer transition-all ${
                          (settings.teamCount || 2) === num
                            ? 'bg-[#00B4D8] text-white border-[#00B4D8]'
                            : 'bg-white text-stone-700 border-stone-300'
                        }`}
                      >
                        {num} Tim
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
