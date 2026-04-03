import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../utils/api'

interface Settings {
  dailyReminder: boolean
  reminderTime: string
  darkMode: boolean
  soundEnabled: boolean
  reviewCount: number
}

export default function Settings() {
  const [settings, setSettings] = useState<Settings>({
    dailyReminder: true,
    reminderTime: '09:00',
    darkMode: false,
    soundEnabled: true,
    reviewCount: 20,
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/settings').then(res => setSettings(res.data))
  }, [])

  const handleSave = async () => {
    await api.put('/settings', settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
        enabled ? 'bg-gradient-to-r from-[#ef233c] to-[#d91e36]' : 'bg-[#e9ecef]'
      }`}
    >
      <div
        className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
          enabled ? 'left-7' : 'left-1'
        }`}
      />
    </button>
  )

  const settingsSections = [
    {
      title: '提醒设置',
      icon: '🔔',
      color: '#ef233c',
      items: [
        {
          key: 'dailyReminder',
          label: '每日学习提醒',
          desc: '每天定时提醒你学习',
          type: 'toggle' as const
        },
        {
          key: 'reminderTime',
          label: '提醒时间',
          desc: '设置每日提醒的具体时间',
          type: 'time' as const,
          value: settings.reminderTime
        }
      ]
    },
    {
      title: '外观设置',
      icon: '🎨',
      color: '#8b5cf6',
      items: [
        {
          key: 'darkMode',
          label: '深色模式',
          desc: '保护眼睛，夜间学习更舒适',
          type: 'toggle' as const
        },
        {
          key: 'soundEnabled',
          label: '音效',
          desc: '完成任务时播放音效',
          type: 'toggle' as const
        }
      ]
    },
    {
      title: '学习设置',
      icon: '📚',
      color: '#3b82f6',
      items: [
        {
          key: 'reviewCount',
          label: '每日新词数量',
          desc: `当前设置：${settings.reviewCount} 个/天`,
          type: 'slider' as const,
          value: settings.reviewCount,
          min: 5,
          max: 50
        }
      ]
    }
  ]

  return (
    <Layout maxWidth="max-w-4xl">
          {/* Header */}
          <header className="mb-10 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-12 bg-[#ef233c] rounded-full" />
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-[#2b2d42] mb-2">⚙️ 设置</h1>
                <p className="text-lg text-[#8d99ae]">个性化你的学习体验</p>
              </div>
            </div>
          </header>

          {/* Settings Sections */}
          <div className="space-y-6">
            {settingsSections.map((section, sectionIndex) => (
              <div
                key={section.title}
                className="group relative bg-white rounded-3xl p-8 shadow-md hover:shadow-xl transition-all duration-500 animate-slide-in"
                style={{ animationDelay: `${sectionIndex * 100}ms` }}
              >
                {/* Decorative gradient */}
                <div 
                  className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110 opacity-10"
                  style={{ backgroundColor: section.color }}
                />

                {/* Section Header */}
                <div className="relative mb-8">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{section.icon}</span>
                    <h2 className="text-2xl font-bold text-[#2b2d42]">{section.title}</h2>
                  </div>
                </div>

                {/* Settings Items */}
                <div className="relative space-y-6">
                  {section.items.map((item: any) => (
                    <div key={item.key} className="flex items-center justify-between py-4 border-b border-[#f8f9fa] last:border-0">
                      <div className="flex-1">
                        <p className="font-semibold text-[#2b2d42] text-lg mb-1">{item.label}</p>
                        <p className="text-[#8d99ae] text-sm">{item.desc}</p>
                      </div>

                      {/* Toggle */}
                      {item.type === 'toggle' && (
                        <ToggleSwitch
                          enabled={settings[item.key as keyof Settings] as boolean}
                          onChange={() => setSettings({ ...settings, [item.key]: !settings[item.key as keyof Settings] })}
                        />
                      )}

                      {/* Time Input */}
                      {item.type === 'time' && (
                        <div className="relative">
                          <input
                            type="time"
                            value={item.value}
                            onChange={(e) => setSettings({ ...settings, reminderTime: e.target.value })}
                            className="w-40 px-4 py-3 bg-[#f8f9fa] border-2 border-[#e9ecef] rounded-xl focus:ring-2 focus:ring-[#ef233c] focus:border-[#ef233c] outline-none transition-all font-medium text-[#2b2d42]"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d99ae] pointer-events-none">
                            🕐
                          </span>
                        </div>
                      )}

                      {/* Slider */}
                      {item.type === 'slider' && (
                        <div className="w-64">
                          <input
                            type="range"
                            min={item.min}
                            max={item.max}
                            value={item.value}
                            onChange={(e) => setSettings({ ...settings, reviewCount: parseInt(e.target.value) })}
                            className="w-full h-2 bg-[#e9ecef] rounded-full appearance-none cursor-pointer accent-[#ef233c]"
                          />
                          <div className="flex justify-between text-xs text-[#8d99ae] mt-2">
                            <span>{item.min}</span>
                            <span className="font-semibold text-[#ef233c]">{item.value}</span>
                            <span>{item.max}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="mt-10 animate-slide-in delay-3">
            <button
              onClick={handleSave}
              className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-500 shadow-lg ${
                saved
                  ? 'bg-gradient-to-r from-[#10b981] to-[#059669] text-white'
                  : 'bg-gradient-to-r from-[#ef233c] to-[#d91e36] hover:from-[#d91e36] hover:to-[#c41c30] text-white hover:shadow-xl hover:scale-[1.02]'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {saved ? (
                  <>
                    ✅ 设置已保存
                  </>
                ) : (
                  <>
                    💾 保存设置
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Success Toast */}
          {saved && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#10b981] text-white px-8 py-4 rounded-2xl shadow-2xl animate-bounce z-50">
              <span className="flex items-center gap-2 font-semibold">
                ✅ 设置已成功保存！
              </span>
            </div>
          )}
    </Layout>
  )
}
