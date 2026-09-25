import { byte, memory, Memory, Restorable } from './types';
import { allocMemPages } from './util';

export interface RAMState {
    /** Copy of contents. */
    mem: memory;
}

/**
 * Represents RAM from the start page `sp` to end page `ep`. The memory
 * is addressed by `page` and `offset`.
 */
export default class RAM implements Memory, Restorable<RAMState> {
    private start_page: byte;
    private end_page: byte;
    private mem: memory;

    constructor(sp: byte, ep: byte) {
        this.start_page = sp;
        this.end_page = ep;

        this.mem = allocMemPages(ep - sp + 1);
    }

    public start(): byte {
        return this.start_page;
    }

    public end(): byte {
        return this.end_page;
    }

    public read(page: byte, offset: byte) {
        return this.mem[((page - this.start_page) << 8) | offset];
    }

    public write(page: byte, offset: byte, val: byte) {
        this.mem[((page - this.start_page) << 8) | offset] = val;
    }

    public getState(): RAMState {
        return {
            mem: new Uint8Array(this.mem),
        };
    }

    public setState(state: RAMState) {
        if (state.mem.length !== this.mem.length) {
            throw new Error('RAM snapshot size mismatch');
        }
        // Video pages hold subarray views into this buffer. Replacing it would
        // leave the display reading stale bytes after a snapshot restore.
        this.mem.set(state.mem);
    }

    public getBuffer(start: byte, end: byte): memory {
        return this.mem.subarray(
            start << (8 - this.start_page),
            end << (8 - this.start_page)
        );
    }
}
