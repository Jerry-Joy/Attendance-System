import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Copy, Check } from 'lucide-react'

const LEVELS = ['Level 100', 'Level 200', 'Level 300', 'Level 400']

function generateJoinCode(courseCode: string): string {
  const stripped = courseCode.replace(/\s+/g, '').toUpperCase()
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)]
  }
  return `${stripped}-${suffix}`
}

export default function CreateCourse() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('Level 400')
  const [groups, setGroups] = useState('All')
  const [state, setState] = useState<'form' | 'success'>('form')
  const [joinCode, setJoinCode] = useState('')
  const [copied, setCopied] = useState(false)

  const isValid = code.trim().length >= 3 && name.trim().length >= 3

  const handleCreate = () => {
    if (!isValid) return
    const generated = generateJoinCode(code.trim())
    setJoinCode(generated)
    setState('success')
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(joinCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (state === 'success') {
    return (
      <div className="p-5 lg:p-8 max-w-2xl mx-auto animate-slide-up">
        <div className="text-center py-8">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">{code.trim().toUpperCase()}</h1>
          <p className="text-slate-500">{name.trim()}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
          <p className="text-center text-sm text-slate-500 mb-4">Share this code with your students</p>
          <div className="py-5 bg-slate-50 rounded-xl border-2 border-dashed border-brand-200 text-center mb-4">
            <span className="text-3xl font-bold text-brand-600 tracking-[0.2em] font-mono">{joinCode}</span>
          </div>
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-xl text-sm font-semibold transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
          {[
            { label: 'Level', value: selectedLevel },
            { label: 'Groups', value: groups || 'All' },
            { label: 'Students', value: '0 enrolled' },
          ].map((item, i) => (
            <div key={i} className={`flex items-center justify-between py-3 ${i !== 2 ? 'border-b border-slate-100' : ''}`}>
              <span className="text-sm text-slate-500">{item.label}</span>
              <span className="text-sm font-medium text-slate-800">{item.value}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/courses')}
          className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-brand-500/25"
        >
          Done
        </button>
      </div>
    )
  }

  return (
    <div className="p-5 lg:p-8 max-w-2xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Create Course</h1>
      </div>

      <div className="space-y-6">
        {/* Course Code */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Course Code *</label>
          <div className="relative">
            <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. CSC 401"
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
        </div>

        {/* Course Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Course Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Software Engineering"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        {/* Level */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Level</label>
          <div className="flex gap-2">
            {LEVELS.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${selectedLevel === lvl
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
              >
                {lvl.replace('Level ', 'L')}
              </button>
            ))}
          </div>
        </div>

        {/* Groups */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Groups (optional)</label>
          <input
            type="text"
            value={groups}
            onChange={(e) => setGroups(e.target.value)}
            placeholder="e.g. Group A, Group B or All"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
          <p className="text-xs text-slate-400 mt-1.5">Separate multiple groups with commas</p>
        </div>

        {/* Info */}
        <div className="p-4 bg-brand-50 rounded-xl border border-brand-100">
          <p className="text-sm text-brand-600 leading-relaxed">
            A unique join code will be generated automatically. Share it with your students so they can enroll.
          </p>
        </div>

        {/* Submit */}
        <button
          onClick={handleCreate}
          disabled={!isValid}
          className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Create Course
        </button>
      </div>
    </div>
  )
}
