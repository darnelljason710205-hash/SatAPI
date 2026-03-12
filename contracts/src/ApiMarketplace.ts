import { u256 } from '@btc-vision/as-bignum/assembly';
import {
    OP_NET,
    Blockchain,
    Calldata,
    BytesWriter,
    StoredU256,
    StoredU256Array,
    StoredAddressArray,
    Revert,
    EMPTY_POINTER,
} from '@btc-vision/btc-runtime/runtime';

const ZERO: u256 = u256.Zero;
const ONE: u256 = u256.One;

@final
export class ApiMarketplace extends OP_NET {
    // ── Storage Pointers ──────────────────────────────
    private nextApiIdPointer: u16 = Blockchain.nextPointer;
    private nextApiIdStore: StoredU256 = new StoredU256(this.nextApiIdPointer, EMPTY_POINTER);

    private ownersPointer: u16 = Blockchain.nextPointer;
    private metadataIdsPointer: u16 = Blockchain.nextPointer;
    private pricesPointer: u16 = Blockchain.nextPointer;
    private activesPointer: u16 = Blockchain.nextPointer;
    private totalCallsPointer: u16 = Blockchain.nextPointer;

    // Reserved pointers for internal array storage
    private _r01: u16 = Blockchain.nextPointer;
    private _r02: u16 = Blockchain.nextPointer;
    private _r03: u16 = Blockchain.nextPointer;
    private _r04: u16 = Blockchain.nextPointer;
    private _r05: u16 = Blockchain.nextPointer;
    private _r06: u16 = Blockchain.nextPointer;
    private _r07: u16 = Blockchain.nextPointer;
    private _r08: u16 = Blockchain.nextPointer;
    private _r09: u16 = Blockchain.nextPointer;
    private _r10: u16 = Blockchain.nextPointer;
    private _r11: u16 = Blockchain.nextPointer;
    private _r12: u16 = Blockchain.nextPointer;
    private _r13: u16 = Blockchain.nextPointer;
    private _r14: u16 = Blockchain.nextPointer;
    private _r15: u16 = Blockchain.nextPointer;
    private _r16: u16 = Blockchain.nextPointer;
    private _r17: u16 = Blockchain.nextPointer;
    private _r18: u16 = Blockchain.nextPointer;
    private _r19: u16 = Blockchain.nextPointer;
    private _r20: u16 = Blockchain.nextPointer;
    private _r21: u16 = Blockchain.nextPointer;
    private _r22: u16 = Blockchain.nextPointer;
    private _r23: u16 = Blockchain.nextPointer;
    private _r24: u16 = Blockchain.nextPointer;
    private _r25: u16 = Blockchain.nextPointer;
    private _r26: u16 = Blockchain.nextPointer;
    private _r27: u16 = Blockchain.nextPointer;
    private _r28: u16 = Blockchain.nextPointer;
    private _r29: u16 = Blockchain.nextPointer;
    private _r30: u16 = Blockchain.nextPointer;
    private _r31: u16 = Blockchain.nextPointer;
    private _r32: u16 = Blockchain.nextPointer;
    private _r33: u16 = Blockchain.nextPointer;
    private _r34: u16 = Blockchain.nextPointer;
    private _r35: u16 = Blockchain.nextPointer;
    private _r36: u16 = Blockchain.nextPointer;
    private _r37: u16 = Blockchain.nextPointer;
    private _r38: u16 = Blockchain.nextPointer;
    private _r39: u16 = Blockchain.nextPointer;
    private _r40: u16 = Blockchain.nextPointer;

    public constructor() {
        super();
    }

    public override onDeployment(_calldata: Calldata): void {
        this.nextApiIdStore.value = ZERO;
    }

    // ── Array Helpers ──────────────────────────────────
    private getOwners(): StoredAddressArray {
        return new StoredAddressArray(this.ownersPointer, EMPTY_POINTER);
    }

    private getMetadataIds(): StoredU256Array {
        return new StoredU256Array(this.metadataIdsPointer, EMPTY_POINTER);
    }

    private getPrices(): StoredU256Array {
        return new StoredU256Array(this.pricesPointer, EMPTY_POINTER);
    }

    private getActives(): StoredU256Array {
        return new StoredU256Array(this.activesPointer, EMPTY_POINTER);
    }

    private getTotalCallsArray(): StoredU256Array {
        return new StoredU256Array(this.totalCallsPointer, EMPTY_POINTER);
    }

    // ── registerAPI(metadataId, priceSats) → apiId ────
    public registerAPI(calldata: Calldata): BytesWriter {
        const metadataId = calldata.readU256();
        const priceSats = calldata.readU256();
        const sender = Blockchain.tx.sender;

        if (priceSats == ZERO) throw new Revert('Price must be greater than 0');

        const apiId = this.nextApiIdStore.value;

        const owners = this.getOwners();
        const metadataIds = this.getMetadataIds();
        const prices = this.getPrices();
        const actives = this.getActives();
        const totalCallsArr = this.getTotalCallsArray();

        owners.push(sender);
        metadataIds.push(metadataId);
        prices.push(priceSats);
        actives.push(ONE);
        totalCallsArr.push(ZERO);

        owners.save();
        metadataIds.save();
        prices.save();
        actives.save();
        totalCallsArr.save();

        this.nextApiIdStore.value = u256.add(apiId, ONE);

        const writer = new BytesWriter(32);
        writer.writeU256(apiId);
        return writer;
    }

    // ── payAndCall(apiId) → bool ──────────────────────
    public payAndCall(calldata: Calldata): BytesWriter {
        const apiId = calldata.readU256();
        const id = apiId.toU64() as i32;
        const total = this.nextApiIdStore.value.toU64() as i32;

        if (id >= total) throw new Revert('API does not exist');

        const actives = this.getActives();
        const active = actives.get(id);
        if (active == ZERO) throw new Revert('API is not active');

        // Increment call counter
        const totalCallsArr = this.getTotalCallsArray();
        const calls = totalCallsArr.get(id);
        totalCallsArr.set(id, u256.add(calls, ONE));
        totalCallsArr.save();

        const writer = new BytesWriter(1);
        writer.writeBoolean(true);
        return writer;
    }

    // ── getAPI(apiId) → {owner, metadataId, price, active, calls} ──
    public getAPI(calldata: Calldata): BytesWriter {
        const apiId = calldata.readU256();
        const id = apiId.toU64() as i32;
        const total = this.nextApiIdStore.value.toU64() as i32;

        if (id >= total) throw new Revert('API does not exist');

        const owner = this.getOwners().get(id);
        const metadataId = this.getMetadataIds().get(id);
        const price = this.getPrices().get(id);
        const active = this.getActives().get(id);
        const calls = this.getTotalCallsArray().get(id);

        const writer = new BytesWriter(160);
        writer.writeAddress(owner);
        writer.writeU256(metadataId);
        writer.writeU256(price);
        writer.writeBoolean(active != ZERO);
        writer.writeU256(calls);
        return writer;
    }

    // ── getNextApiId() → u256 ─────────────────────────
    public getNextApiId(calldata: Calldata): BytesWriter {
        const writer = new BytesWriter(32);
        writer.writeU256(this.nextApiIdStore.value);
        return writer;
    }

    // ── getTotalAPIs() → u256 ─────────────────────────
    public getTotalAPIs(calldata: Calldata): BytesWriter {
        const writer = new BytesWriter(32);
        writer.writeU256(this.nextApiIdStore.value);
        return writer;
    }

    // ── deactivateAPI(apiId) → bool ───────────────────
    public deactivateAPI(calldata: Calldata): BytesWriter {
        const apiId = calldata.readU256();
        const id = apiId.toU64() as i32;
        const total = this.nextApiIdStore.value.toU64() as i32;

        if (id >= total) throw new Revert('API does not exist');

        const owner = this.getOwners().get(id);
        const sender = Blockchain.tx.sender;

        if (!owner.equals(sender)) throw new Revert('Only owner can deactivate');

        const actives = this.getActives();
        actives.set(id, ZERO);
        actives.save();

        const writer = new BytesWriter(1);
        writer.writeBoolean(true);
        return writer;
    }
}
