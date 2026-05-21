'use client';

import { Children, type ReactNode } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  distance?: number;
  direction?: Direction;
  amount?: number;
  once?: boolean;
}

const easeOut = [0.22, 1, 0.36, 1] as const;

function hiddenOffset(direction: Direction, distance: number) {
  switch (direction) {
    case 'down':
      return { y: -distance };
    case 'left':
      return { x: distance };
    case 'right':
      return { x: -distance };
    case 'none':
      return {};
    case 'up':
    default:
      return { y: distance };
  }
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 0.65,
  distance = 34,
  direction = 'up',
  amount = 0.16,
  once = true,
}: ScrollRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const variants: Variants = {
    hidden: {
      opacity: 0,
      ...hiddenOffset(direction, distance),
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        delay,
        duration,
        ease: easeOut,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: '0px 0px -72px 0px' }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  delay?: number;
  stagger?: number;
  distance?: number;
  amount?: number;
  once?: boolean;
}

export function StaggerReveal({
  children,
  className,
  itemClassName,
  delay = 0,
  stagger = 0.08,
  distance = 26,
  amount = 0.12,
  once = true,
}: StaggerRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay,
        staggerChildren: stagger,
      },
    },
  };

  const item: Variants = {
    hidden: {
      opacity: 0,
      y: distance,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.55,
        ease: easeOut,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: '0px 0px -64px 0px' }}
    >
      {Children.map(children, (child) => (
        <motion.div className={cn('min-w-0', itemClassName)} variants={item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
