import { Apple2, type State } from './apple2';
import { base64_json_parse, base64_json_stringify } from './base64';
import DiskII from './cards/disk2';
import { FLOPPY_FORMATS, type FloppyFormat } from './formats/types';
import { initGamepad } from './ui/gamepad';
import { Audio } from './ui/audio';
import KeyBoard from './ui/keyboard';

export interface MountInput {
    canvas: HTMLCanvasElement;
    systemRom: Uint8Array;
    characterRom: Uint8Array;
    diskRom: Uint8Array;
    diskName: string;
    diskBytes: Uint8Array;
}

export async function mount(input: MountInput) {
    if (input.diskRom.byteLength !== 256) {
        throw new Error('Disk II bootstrap ROM must contain 256 bytes');
    }
    const extension = input.diskName.split('.').at(-1)?.toLowerCase();
    if (!extension || !FLOPPY_FORMATS.includes(extension as FloppyFormat)) {
        throw new Error('Unsupported Apple II floppy format');
    }
    const machine = new Apple2({
        canvas: input.canvas,
        characterRom: '',
        characterRomBytes: input.characterRom,
        e: true,
        enhanced: true,
        gl: false,
        rom: '',
        romBytes: input.systemRom,
        tick: () => {},
    });
    await machine.ready;
    const disk = new DiskII(machine.getIO(), {
        driveLight: () => {}, dirty: () => {}, label: () => {},
    }, 16, input.diskRom, false);
    machine.getIO().setSlot(6, disk);
    const audio = new Audio(machine.getIO());
    await audio.ready;
    const keyboardElement = document.createElement('div');
    keyboardElement.id = 'retrom-apple2-keyboard';
    keyboardElement.hidden = true;
    document.body.append(keyboardElement);
    const keyboard = new KeyBoard(machine.getCPU(), machine.getIO(), 'apple2e');
    keyboard.create('#retrom-apple2-keyboard');
    const bytes = new Uint8Array(input.diskBytes);
    await disk.setBinary(1, input.diskName, extension as FloppyFormat, bytes.buffer);
    initGamepad();
    machine.reset();
    machine.run();
    return {
        pause: () => machine.stop(),
        resume: () => machine.run(),
        reset: () => machine.reset(),
        checkpoint: () => base64_json_stringify(machine.getState()),
        restore: (value: string) => machine.setState(base64_json_parse(value) as State),
        exit: () => {
            machine.stop();
            keyboard.dispose();
            keyboardElement.remove();
            void audio.dispose();
        },
    };
}

Object.assign(window, { RetromApple2: { mount } });
