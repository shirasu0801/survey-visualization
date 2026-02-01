'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Translations
const resources = {
  ja: {
    translation: {
      app: {
        title: 'Survey Visualization',
        description: 'アンケート作成・集計・可視化アプリケーション',
      },
      home: {
        createSurvey: 'アンケートを作成',
        createSurveyDesc: 'ドラッグ&ドロップで簡単にアンケートを作成',
        viewSurveys: 'アンケート一覧',
        viewSurveysDesc: '作成したアンケートを確認・編集',
      },
      survey: {
        create: 'アンケート作成',
        edit: 'アンケート編集',
        title: 'タイトル',
        description: '説明',
        save: '保存',
        cancel: 'キャンセル',
        delete: '削除',
        share: '共有',
        qrCode: 'QRコード',
        responses: '回答数',
        analytics: '集計',
        export: 'エクスポート',
      },
      question: {
        add: '設問を追加',
        type: '設問タイプ',
        title: '設問文',
        required: '必須',
        optional: '任意',
        options: '選択肢',
        addOption: '選択肢を追加',
        delete: '削除',
        singleChoice: '単一選択',
        multipleChoice: '複数選択',
        text: '記述式',
        scale: 'スケール',
        date: '日付',
        rating: '評価',
      },
      response: {
        submit: '送信',
        submitted: '回答ありがとうございました',
        required: 'この設問は必須です',
      },
    },
  },
  en: {
    translation: {
      app: {
        title: 'Survey Visualization',
        description: 'Survey creation, collection, and visualization application',
      },
      home: {
        createSurvey: 'Create Survey',
        createSurveyDesc: 'Create surveys easily with drag & drop',
        viewSurveys: 'View Surveys',
        viewSurveysDesc: 'View and edit your created surveys',
      },
      survey: {
        create: 'Create Survey',
        edit: 'Edit Survey',
        title: 'Title',
        description: 'Description',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        share: 'Share',
        qrCode: 'QR Code',
        responses: 'Responses',
        analytics: 'Analytics',
        export: 'Export',
      },
      question: {
        add: 'Add Question',
        type: 'Question Type',
        title: 'Question',
        required: 'Required',
        optional: 'Optional',
        options: 'Options',
        addOption: 'Add Option',
        delete: 'Delete',
        singleChoice: 'Single Choice',
        multipleChoice: 'Multiple Choice',
        text: 'Text',
        scale: 'Scale',
        date: 'Date',
        rating: 'Rating',
      },
      response: {
        submit: 'Submit',
        submitted: 'Thank you for your response',
        required: 'This question is required',
      },
    },
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ja',
    interpolation: {
      escapeValue: false,
    },
  })

const I18nContext = createContext<{ i18n: typeof i18n }>({ i18n })

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return (
    <I18nContext.Provider value={{ i18n }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const { i18n } = useContext(I18nContext)
  return {
    t: (key: string) => i18n.t(key),
    i18n,
  }
}

export default i18n
