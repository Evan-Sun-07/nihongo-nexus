import { useState } from 'react'
import SpeedControl from '../layout/SpeedControl'
import ListeningMode from './ListeningMode'
import ShadowMode from './ShadowMode'

const SUB_TABS = [
  { id: 'listening', label: '挖空精聴' },
  { id: 'shadow', label: '影読み・録音' },
]

export default function AudioTraining() {
  const [activeTab, setActiveTab] = useState('listening')

  return (
    <div className="space-y-4">
      {/* Header + speed */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">聴解・口語トレーニング</h2>
          <p className="text-sm text-gray-500">リスニングと影読みで実力アップ</p>
        </div>
        <SpeedControl />
      </div>

      {/* Sub tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'listening' ? <ListeningMode /> : <ShadowMode />}
    </div>
  )
}
