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
    } as unknown as Apple2IO;
    initGamepad();
    processGamepad(io);
    expect(io.paddle).toHaveBeenCalledWith(0, expect.any(Number));
    expect((io.paddle as jest.Mock).mock.calls.find(([axis]) => axis === 0)?.[1]).toBeGreaterThan(0.9);
    expect(io.buttonDown).toHaveBeenCalledWith(0);
});
