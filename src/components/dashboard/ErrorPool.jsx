import { useContext } from 'react'
import { AppContext } from '../../context/AppContext'

export default function ErrorPool() {
  const { errorPool, questionsData, clearErrors, setModule } = useContext(AppContext)

  const errorQuestions = questionsData.filter(q => errorPool.includes(q.id))
  // Also include errors from other levels stored in pool (show id if no matching question)
  const allErrorIds = errorPool

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-700">
          復習プール
          {allErrorIds.length > 0 && (
            <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
              {allErrorIds.length}問
            </span>
          )}
        </h3>
        {allErrorIds.length > 0 && (
          <button
            onClick={clearErrors}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            すべてクリア
          </button>
        )}
      </div>

      {allErrorIds.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">🎉</div>
          <p className="text-sm text-gray-500">間違えた問題はありません！</p>
          <p className="text-xs text-gray-400 mt-1">試験を受けて実力を確認しましょう</p>
        </div>
      ) : (
        <div className="space-y-2">
          {errorQuestions.length > 0 ? (
            errorQuestions.map(q => (
              <div
                key={q.id}
                className="flex items-start justify-between p-3 rounded-lg bg-red-50 border border-red-100"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{q.question_text}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{q.id} · {q.type}</p>
                </div>
                <button
                  onClick={() => setModule('exam')}
                  className="ml-3 text-xs text-blue-500 hover:underline whitespace-nowrap"
                >
                  復習する →
                </button>
              </div>
            ))
          ) : (
            // Show IDs for errors from other levels
            allErrorIds.map(id => (
              <div
                key={id}
                className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100"
              >
                <p className="text-sm text-gray-600">{id}</p>
                <button
                  onClick={() => setModule('exam')}
                  className="text-xs text-blue-500 hover:underline"
                >
                  試験へ →
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
