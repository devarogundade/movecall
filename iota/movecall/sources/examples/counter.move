// SPDX-License-Identifier: MIT
module movecall::counter {
    use iota::bcs;
    use iota::transfer;
    use iota::tx_context::{TxContext};

    use movecall::movecall::{MoveCallCap};

    // Structs
    public struct Counter has key {
        id: UID,
        value: u64
    }

    fun init(
        ctx: &mut TxContext
    ) {
        transfer::share_object(Counter {
            id: object::new(ctx),
            value: 0
        });
    }

    public entry fun move_call_message(
        _: &MoveCallCap,
        source_chain: u64,
        from: vector<u8>,
        payload: vector<u8>,
        counter: &mut Counter,
        ctx: &mut TxContext
    ) {
        let mut data = bcs::new(payload);
        counter.value = counter.value + bcs::peel_u64(&mut data);
    }

    #[test_only]
    public(package) fun init_for_testing(
        ctx: &mut TxContext,
    ) {
        init(ctx);
    }    
}