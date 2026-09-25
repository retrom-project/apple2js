/** @jest-environment jsdom */
import type Apple2IO from '../../js/apple2io';
import { initGamepad, processGamepad } from '../../js/ui/gamepad';

it('maps standard D-pad direction and A confirmation', () => {
    const buttons = Array.from({ length: 16 }, () => ({ pressed: false }));
    buttons[15].pressed = true;
    buttons[0].pressed = true;
    Object.defineProperty(navigator, 'getGamepads', {
        configurable: true,
        value: () => [{ axes: [0, 0], buttons }],
    });
    const io = {
        paddle: jest.fn(),
        buttonDown: jest.fn(),
        buttonUp: jest.fn(),
        keyDown: jest.fn(),
        keyUp: jest.fn(),
    };
    initGamepad();
    processGamepad(io as unknown as Apple2IO);
    expect(io.paddle).toHaveBeenCalledWith(0, expect.any(Number));
    const paddleCalls = io.paddle.mock.calls as [number, number][];
    expect(paddleCalls.find(([axis]) => axis === 0)?.[1]).toBeGreaterThan(0.9);
    expect(io.buttonDown).toHaveBeenCalledWith(0);
});

it('maps Start to the Apple II one-player key and Select to Escape', () => {
    const buttons = Array.from({ length: 16 }, () => ({ pressed: false }));
    Object.defineProperty(navigator, 'getGamepads', {
        configurable: true,
        value: () => [{ axes: [0, 0], buttons }],
    });
    const io = {
        paddle: jest.fn(),
        buttonDown: jest.fn(),
        buttonUp: jest.fn(),
        keyDown: jest.fn(),
        keyUp: jest.fn(),
    };
    initGamepad();
    buttons[9].pressed = true;
    processGamepad(io as unknown as Apple2IO);
    expect(io.keyDown).toHaveBeenCalledWith('1'.charCodeAt(0));
    buttons[9].pressed = false;
    processGamepad(io as unknown as Apple2IO);
    expect(io.keyUp).toHaveBeenCalled();
    buttons[8].pressed = true;
    processGamepad(io as unknown as Apple2IO);
    expect(io.keyDown).toHaveBeenLastCalledWith(0x1b);
});
