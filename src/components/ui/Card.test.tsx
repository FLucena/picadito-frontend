import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/testUtils';
import userEvent from '@testing-library/user-event';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    const { container } = render(<Card>Default Card</Card>);
    const card = container.querySelector('.bg-white.rounded-xl');
    expect(card).toHaveClass('border', 'shadow-sm');
  });

  it('applies elevated variant styles', () => {
    const { container } = render(<Card variant="elevated">Elevated Card</Card>);
    const card = container.querySelector('.bg-white.rounded-xl');
    expect(card).toHaveClass('shadow-md');
  });

  it('applies outlined variant styles', () => {
    const { container } = render(<Card variant="outlined">Outlined Card</Card>);
    const card = container.querySelector('.bg-white.rounded-xl');
    expect(card).toHaveClass('border-gray-200');
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Card onClick={handleClick}>Clickable Card</Card>);
    
    await user.click(screen.getByText('Clickable Card'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Custom Card</Card>);
    const card = container.querySelector('.bg-white.rounded-xl');
    expect(card).toHaveClass('custom-class');
  });

  it('has interactive styles when onClick is provided', () => {
    const handleClick = vi.fn();
    const { container } = render(<Card onClick={handleClick}>Interactive Card</Card>);
    const card = container.querySelector('.bg-white.rounded-xl');
    expect(card).toHaveClass('cursor-pointer');
  });
});

