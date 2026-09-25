import RAM from '../../js/ram';

describe('RAM snapshots', () => {
    it('restores through the existing buffer used by video pages', () => {
        const ram = new RAM(0, 1);
        const video = ram.getBuffer(0, 1);
        const saved = ram.getState();
        saved.mem[0x20] = 0x44;
        ram.setState(saved);
        expect(video[0x20]).toBe(0x44);
        ram.write(0, 0x20, 0x55);
        expect(video[0x20]).toBe(0x55);
    });
});
