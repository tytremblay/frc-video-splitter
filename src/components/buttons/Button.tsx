import { ComponentProps } from 'react';
import { cn } from '../../lib/utils/cn';

export type ButtonSizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ButtonProps = ComponentProps<'button'> & {
  size: ButtonSizes;
  secondary?: boolean;
};

const buttonSizeStyles: Record<ButtonSizes, string> = {
  xs: 'rounded px-2 py-1 text-xs ',
  sm: 'rounded px-2 py-1 text-sm ',
  md: 'rounded-md px-2.5 py-1.5 text-sm ',
  lg: 'rounded-md px-3 py-2 text-sm ',
  xl: 'rounded-md px-3.5 py-2.5 text-sm ',
};

export function Button({ size, secondary, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'font-semibold text-white shadow-sm ',
        secondary
          ? 'bg-white/10 hover:bg-white/20 disabled:bg-white/10 disabled:text-white/20 disabled:cursor-not-allowed'
          : 'bg-indigo-500 hover:bg-indigo-400 disabled:bg-indigo-300 disabled:text-indigo-500 disabled:cursor-not-allowed',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500',
        buttonSizeStyles[size],
        props.className
      )}
      {...props}
    >
      {props.children}
    </button>
  );
}
