/** @jest-environment jsdom */
import type Apple2IO from '../../js/apple2io';
import type { CPU6502 } from '@whscullin/cpu6502';
import KeyBoard from '../../js/ui/keyboard';

it('forwards physical keys to Apple II and removes its listeners on exit', () => {
    document.body.innerHTML = '<div id="keyboard" hidden></div>';
    const io = { keyDown: jest.fn(), keyUp: jest.fn() } as unknown as Apple2IO;
    const keyboard = new KeyBoard({ reset: jest.fn() } as unknown as CPU6502, io, 'apple2e');
    keyboard.create('#keyboard');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', keyCode: 32 }));
    expect(io.keyDown).toHaveBeenCalledWith(32);
    window.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', keyCode: 32 }));
    expect(io.keyUp).toHaveBeenCalledTimes(1);

    keyboard.dispose();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', keyCode: 32 }));
    expect(io.keyDown).toHaveBeenCalledTimes(1);
});
