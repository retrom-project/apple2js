import type { KnownKeys } from '../types';

export const BUTTON = {
    // Buttons
    A: 0,
    B: 1,
    X: 2,
    Y: 3,

    // Triggers
    L1: 4,
    R1: 5,
    L2: 6,
    R2: 7,

    // Analog stick buttons
    L3: 10,
    R3: 11,

    // Special
    START: 9,
    SELECT: 8,
    LOGO: 16,

    // D pad
    UP: 12,
    DOWN: 13,
    LEFT: 14,
    RIGHT: 15,
} as const;

export type ButtonType = KnownKeys<typeof BUTTON>;

/**
 * A `GamepadConfiguration` maps buttons on the controller to Apple Paddle
 * buttons or keys on the keyboard. If the value is a number, it must be
 * 0 | 1 | 2 and will map to the corresponding paddle button. If the value
 * is a string, the _first_ character of the string is used as a key to
 * press on the keyboard.
 */
export type GamepadConfiguration = {
    [K in ButtonType]?: 0 | 1 | 2 | string;
};
