import ROM from './roms/rom';
import type { rom } from './types';

/** Firmware supplied by the host. The Web build must not distribute Apple ROMs. */
export function externalFirmware(system: Uint8Array, character: Uint8Array): {
    system: ROM;
    character: rom;
} {
    if (system.byteLength !== 0x4000 || character.byteLength !== 0x1000) {
        throw new Error('Apple IIe firmware must contain a 16 KiB system ROM and 4 KiB character ROM');
    }
    return {
        system: new ROM(0xc0, 0xff, new Uint8Array(system)),
        character: new Uint8Array(character),
    };
}
