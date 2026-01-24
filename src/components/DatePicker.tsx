import { useState, useRef, useEffect, useMemo } from 'react'
import { getTodayDateString, formatDateLabel } from '../utils/analytics'
import './DatePicker.css'

interface DatePickerProps {
  selectedDate: string
  availableDates: string[]
  onChange: (date: string) => void
}

const DatePicker = ({ selectedDate, availableDates, onChange }: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    // Start with the selected date's month
    const [year, month] = selectedDate.split('-').map(Number)
    return new Date(year, month - 1, 1)
  })
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Get data range (earliest and latest dates with data)
  const dataRange = useMemo(() => {
    if (availableDates.length === 0) {
      const today = getTodayDateString()
      return { earliest: today, latest: today }
    }
    const sorted = [...availableDates].sort()
    return {
      earliest: sorted[0],
      latest: sorted[sorted.length - 1],
    }
  }, [availableDates])

  // Check if a date has data
  const hasData = (dateStr: string) => availableDates.includes(dateStr)

  // Get days for the current view month
  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear()
    const month = viewMonth.getMonth()
    
    // First day of month
    const firstDay = new Date(year, month, 1)
    
    // Start from the Sunday of the first week
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days: Array<{
      date: Date
      dateStr: string
      isCurrentMonth: boolean
      hasData: boolean
      isToday: boolean
      isSelected: boolean
      isFuture: boolean
    }> = []

    const today = getTodayDateString()
    const todayDate = new Date()

    // Generate 6 weeks of days
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate)
      d.setDate(startDate.getDate() + i)
      
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      
      days.push({
        date: d,
        dateStr,
        isCurrentMonth: d.getMonth() === month,
        hasData: hasData(dateStr),
        isToday: dateStr === today,
        isSelected: dateStr === selectedDate,
        isFuture: d > todayDate,
      })
    }

    return days
  }, [viewMonth, availableDates, selectedDate])

  const goToPrevMonth = () => {
    setViewMonth(prev => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() - 1)
      return d
    })
  }

  const goToNextMonth = () => {
    setViewMonth(prev => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() + 1)
      return d
    })
  }

  const handleDateClick = (dateStr: string, isFuture: boolean) => {
    if (isFuture) return
    // Allow selecting any past date, even without data
    onChange(dateStr)
    setIsOpen(false)
  }

  const monthLabel = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="datepicker" ref={containerRef}>
      <button 
        className="datepicker__trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="datepicker__value">{formatDateLabel(selectedDate)}</span>
        <svg className="datepicker__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {isOpen && (
        <div className="datepicker__dropdown">
          <div className="datepicker__header">
            <button 
              className="datepicker__nav" 
              onClick={goToPrevMonth}
              type="button"
              aria-label="Previous month"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="datepicker__month">{monthLabel}</span>
            <button 
              className="datepicker__nav" 
              onClick={goToNextMonth}
              type="button"
              aria-label="Next month"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className="datepicker__weekdays">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="datepicker__weekday">{day}</div>
            ))}
          </div>

          <div className="datepicker__grid">
            {calendarDays.map(({ dateStr, date, isCurrentMonth, hasData: dayHasData, isToday, isSelected, isFuture }) => (
              <button
                key={dateStr}
                className={[
                  'datepicker__day',
                  !isCurrentMonth && 'datepicker__day--other-month',
                  dayHasData && 'datepicker__day--has-data',
                  isToday && 'datepicker__day--today',
                  isSelected && 'datepicker__day--selected',
                  isFuture && 'datepicker__day--disabled',
                ].filter(Boolean).join(' ')}
                onClick={() => handleDateClick(dateStr, isFuture)}
                disabled={isFuture}
                type="button"
              >
                {date.getDate()}
              </button>
            ))}
          </div>

          <div className="datepicker__footer">
            <div className="datepicker__legend">
              <span className="datepicker__legend-item">
                <span className="datepicker__legend-dot datepicker__legend-dot--data" />
                Data available
              </span>
            </div>
            <div className="datepicker__range">
              Data from {formatDateLabel(dataRange.earliest)} to {formatDateLabel(dataRange.latest)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DatePicker
