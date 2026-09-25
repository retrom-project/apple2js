import { externalFirmware } from '../../js/external_firmware';

describe('host supplied Apple IIe firmware', () => {
    it('rejects missing or incorrectly sized firmware', () => {
        expect(() => externalFirmware(new Uint8Array(), new Uint8Array(4096))).toThrow();
        expect(() => externalFirmware(new Uint8Array(16384), new Uint8Array(2048))).toThrow();
    });

    it('copies the supplied bytes before exposing them to the emulator', () => {
        const system = new Uint8Array(16384);
        const character = new Uint8Array(4096);
        system[0] = 0x42;
        character[0] = 0x21;
        const firmware = externalFirmware(system, character);
        system[0] = 0;
        character[0] = 0;
        expect(firmware.system.read(0xc0, 0)).toBe(0x42);
        expect(firmware.character[0]).toBe(0x21);
    });
});
