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
    { id: 'emerald', name: 'Zamrud', color: 'bg-emerald-600', ring: 'ring-emerald-500' },
    { id: 'indigo', name: 'Nila', color: 'bg-indigo-600', ring: 'ring-indigo-500' },
    { id: 'amber', name: 'Kuning Madu', color: 'bg-amber-600', ring: 'ring-amber-500' },
    { id: 'rose', name: 'Mawar', color: 'bg-rose-600', ring: 'ring-rose-500' },
    { id: 'teal', name: 'Toska', color: 'bg-teal-600', ring: 'ring-teal-500' },
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
    <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs space-y-5">
      {/* 1. Arabic Font & Styling */}
      <div>
        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <Type className="w-3.5 h-3.5 text-emerald-600" />
          <span>Font & Tipografi Arab</span>
        </label>
        <div className="space-y-2">
          <select
            value={theme.fontFamily}
            onChange={(e) => onChangeTheme({ ...theme, fontFamily: e.target.value as any })}
            className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-600 focus:bg-white"
          >
            {fonts.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
            <span>Ukuran Tulisan Arab:</span>
            <div className="flex gap-1">
              {fontSizes.map((sz) => (
                <button
                  key={sz.id}
                  type="button"
                  onClick={() => onChangeTheme({ ...theme, fontSize: sz.id as any })}
                  className={`px-2.5 py-1 text-xs rounded-md border cursor-pointer font-medium ${
                    theme.fontSize === sz.id
                      ? 'bg-emerald-600 text-white border-emerald-600'
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
        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <Palette className="w-3.5 h-3.5 text-emerald-600" />
          <span>Nuansa Warna</span>
        </label>
        <div className="flex items-center gap-3">
          {palettes.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onChangeTheme({ ...theme, palette: p.id })}
              className={`w-7 h-7 rounded-full ${p.color} cursor-pointer transition-transform ${
                theme.palette === p.id ? 'scale-125 ring-3 ring-offset-2 ' + p.ring : 'hover:scale-110 opacity-80'
              }`}
              title={p.name}
            />
          ))}
        </div>
      </div>

      {/* 3. Harakat & Latin Toggles */}
      <div className="pt-2 border-t border-stone-100 space-y-2">
        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5 mb-1">
          <Eye className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tampilan Teks</span>
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => onChangeTheme({ ...theme, showHarakat: !theme.showHarakat })}
            className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
              theme.showHarakat
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                : 'bg-stone-50 border-stone-200 text-stone-600'
            }`}
          >
            <span>Harakat / Baris</span>
            {theme.showHarakat ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => onChangeTheme({ ...theme, showLatin: !theme.showLatin })}
            className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
              theme.showLatin
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                : 'bg-stone-50 border-stone-200 text-stone-600'
            }`}
          >
            <span>Teks Latin</span>
            {theme.showLatin ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 4. Game & Classroom Projector Options */}
      <div className="pt-2 border-t border-stone-100 space-y-3">
        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Pengaturan Kelas & Game</span>
        </label>

        {/* QUIZ SPECIFIC SETTINGS */}
        {templateType === 'kuis' && (
          <div className="space-y-2.5 p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs">
            <div className="flex items-center justify-between text-stone-700">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" /> Batas Waktu per Soal:
              </span>
              <select
                value={settings.timerSeconds || 0}
                onChange={(e) => onChangeSettings({ ...settings, timerSeconds: Number(e.target.value) })}
                className="px-2 py-1 text-xs bg-white border border-stone-300 rounded focus:outline-emerald-600"
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
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-emerald-600" /> Skor per Soal Benar:
              </span>
              <select
                value={settings.pointsPerQuestion || 10}
                onChange={(e) => onChangeSettings({ ...settings, pointsPerQuestion: Number(e.target.value) })}
                className="px-2 py-1 text-xs bg-white border border-stone-300 rounded focus:outline-emerald-600"
              >
                <option value={5}>5 Poin</option>
                <option value={10}>10 Poin</option>
                <option value={20}>20 Poin</option>
                <option value={25}>25 Poin</option>
                <option value={50}>50 Poin</option>
                <option value={100}>100 Poin</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-stone-700 pt-1 border-t border-stone-200">
              <span className="flex items-center gap-1">
                <Shuffle className="w-3.5 h-3.5 text-emerald-600" /> Acak Urutan Soal:
              </span>
              <input
                type="checkbox"
                checked={!!settings.shuffleQuestions}
                onChange={(e) => onChangeSettings({ ...settings, shuffleQuestions: e.target.checked })}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between text-stone-700">
              <span className="flex items-center gap-1">
                <Shuffle className="w-3.5 h-3.5 text-emerald-600" /> Acak Pilihan Jawaban:
              </span>
              <input
                type="checkbox"
                checked={!!settings.shuffleChoices}
                onChange={(e) => onChangeSettings({ ...settings, shuffleChoices: e.target.checked })}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* MATCHING SPECIFIC SETTINGS */}
        {isMatchingTemplate(templateType) && (
          <div className="space-y-2.5 p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs">
            <div className="flex items-center justify-between text-stone-700">
              <span className="flex items-center gap-1">
                <Shuffle className="w-3.5 h-3.5 text-emerald-600" /> Acak Posisi Kiri & Kanan:
              </span>
              <input
                type="checkbox"
                checked={settings.shufflePositions !== false}
                onChange={(e) => onChangeSettings({ ...settings, shufflePositions: e.target.checked })}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between text-stone-700">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-emerald-600" /> Pasangan per Ronde:
              </span>
              <select
                value={settings.pairsPerRound || 0}
                onChange={(e) => onChangeSettings({ ...settings, pairsPerRound: Number(e.target.value) })}
                className="px-2 py-1 text-xs bg-white border border-stone-300 rounded focus:outline-emerald-600"
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
        <div className="flex items-center justify-between text-xs text-stone-700">
          <span>Efek Suara (Benar / Salah):</span>
          <button
            type="button"
            onClick={() => onChangeTheme({ ...theme, soundEnabled: !theme.soundEnabled })}
            className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer border ${
              theme.soundEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-stone-100 text-stone-500 border-stone-200'
            }`}
          >
            {theme.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{theme.soundEnabled ? 'Aktif' : 'Mati'}</span>
          </button>
        </div>

        {/* Team Mode for Quiz / Matching */}
        {(templateType === 'kuis' || isMatchingTemplate(templateType)) && (
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" /> Mode Kompetisi Tim (Kelas)
              </span>
              <input
                type="checkbox"
                checked={!!settings.teamMode}
                onChange={(e) => onChangeSettings({ ...settings, teamMode: e.target.checked })}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            {settings.teamMode && (
              <div className="space-y-2 pt-1 border-t border-stone-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-600">Jumlah Tim:</span>
                  <div className="flex gap-1">
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
                        className={`px-2.5 py-0.5 rounded font-medium border cursor-pointer ${
                          (settings.teamCount || 2) === num
                            ? 'bg-emerald-600 text-white border-emerald-600'
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
