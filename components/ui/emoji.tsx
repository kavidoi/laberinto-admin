'use client'

import { useEffect, useRef } from 'react'
import twemoji from 'twemoji'
import { cn } from '@/lib/utils'

interface EmojiProps {
  /** The emoji character or unicode */
  emoji: string
  /** Custom CSS classes */
  className?: string
  /** Size of the emoji (defaults to current text size) */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '6xl' | string
  /** Inline styles */
  style?: React.CSSProperties
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5', 
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-12 h-12',
  '6xl': 'w-24 h-24'
}

export function Emoji({ emoji, className, size = 'md', style }: EmojiProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (ref.current) {
      // Parse the emoji and replace with Twemoji
      twemoji.parse(ref.current, {
        base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/',
        ext: '.svg',
        size: 'svg',
        className: cn(
          'inline-block align-baseline',
          typeof size === 'string' && size in sizeClasses 
            ? sizeClasses[size as keyof typeof sizeClasses]
            : size,
          className
        )
      })
    }
  }, [emoji, size, className])

  return (
    <span 
      ref={ref} 
      className={cn('inline-block', className)}
      style={style}
      role="img"
      aria-label={`Emoji: ${emoji}`}
    >
      {emoji}
    </span>
  )
} 