import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function PasswordInput({ id, label, value, onChange, placeholder, required, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[#8888aa] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="input-field pr-10"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555577] hover:text-[#8888aa] transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
