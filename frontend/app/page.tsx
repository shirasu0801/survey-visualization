'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            {t('app.title')}
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            {t('app.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link
            href="/surveys/create"
            className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-8 hover:shadow-xl hover:bg-gray-750 transition-all"
          >
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-2xl font-semibold mb-2 text-white">{t('home.createSurvey')}</h2>
            <p className="text-gray-300">{t('home.createSurveyDesc')}</p>
          </Link>

          <Link
            href="/surveys"
            className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-8 hover:shadow-xl hover:bg-gray-750 transition-all"
          >
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-2xl font-semibold mb-2 text-white">{t('home.viewSurveys')}</h2>
            <p className="text-gray-300">{t('home.viewSurveysDesc')}</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
