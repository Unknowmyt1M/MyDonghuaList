import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeToggle } from '@/components/layout/theme-toggle'

describe('ThemeToggle', () => {
    it('renders without crashing', () => {
        render(<ThemeToggle />)
        expect(screen.getByRole('button')).toBeInTheDocument()
    })
})