import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, ProgressBar, Badge, Avatar } from '../src/components/ui';

describe('Button', () => {
  it('renders its label and fires onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Back this project</Button>);
    const btn = screen.getByRole('button', { name: /back this project/i });
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled and non-interactive while loading', async () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Submit</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('ProgressBar', () => {
  it('renders the funded percentage label when asked', () => {
    render(<ProgressBar value={65} showLabel />);
    expect(screen.getByText('65% funded')).toBeInTheDocument();
  });

  it('clamps values below 0 and above 100', () => {
    const { rerender } = render(<ProgressBar value={250} showLabel />);
    expect(screen.getByText('100% funded')).toBeInTheDocument();
    rerender(<ProgressBar value={-40} showLabel />);
    expect(screen.getByText('0% funded')).toBeInTheDocument();
  });
});

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge variant="success">Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});

describe('Avatar', () => {
  it('derives up to two initials from a name when no image is given', () => {
    render(<Avatar name="Priya Nair" />);
    expect(screen.getByText('PN')).toBeInTheDocument();
  });

  it('renders an <img> with alt text when a src is provided', () => {
    render(<Avatar name="Marcus Hale" src="https://example.com/a.jpg" />);
    expect(screen.getByRole('img', { name: 'Marcus Hale' })).toBeInTheDocument();
  });
});
