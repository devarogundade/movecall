// SPDX-License-Identifier: MIT
module movecall::message_bridge {
    use std::string;
    use iota::event;
    use iota::table;
    use iota::balance;
    use iota::coin;
    use iota::bag;
    use iota::iota::{IOTA};
    use iota::bcs;
    use iota::transfer;
    use iota::tx_context::{Self, TxContext};

    // Errors
    const E_ALREADY_RECEIVED: u64 = 1;
    const E_INSUFFICIENT_FEE: u64 = 2;
    const E_MESSAGE_NOT_FOUND: u64 = 3;

    // Structs
    public struct MessageBridge has key {
        id: UID,
        nonce: u64,
        fee: u64,
        fee_collector: balance::Balance<IOTA>,
        receiveds: table::Table<vector<u8>, bool>
    }  

    public struct MessageBridgeCap has key {
        id: UID
    }

    // Events
    public struct MessageSent has copy, drop {
        uid: vector<u8>,
        to_chain: u64,
        block_number: u64,
        to: vector<u8>,
        payload: vector<u8>
    }

    public struct MessageReceived has copy, drop {
        uid: vector<u8>,
        source_chain: u64,
        source_block_number: u64,
        from: vector<u8>,
        to: address
    }

    fun init(
        ctx: &mut TxContext
    ) {
        transfer::share_object(MessageBridge {
            id: object::new(ctx),
            nonce: 0,
            fee: 10_000,
            fee_collector: balance::zero<IOTA>(),
            receiveds: table::new<vector<u8>, bool>(ctx)
        });

        transfer::transfer(MessageBridgeCap {
            id: object::new(ctx)
        }, tx_context::sender(ctx));
    }

    // ========== Mutable Functions ========== //

    public entry fun send_message(
        bridge: &mut MessageBridge,
        coin_fee: coin::Coin<IOTA>,
        to_chain: u64,
        to: vector<u8>,
        payload: vector<u8>,
        ctx: &mut TxContext
    ): vector<u8> {
        let uid = get_uid(bridge, ctx);

        let amount_fee = coin::value(&coin_fee);
        assert!(amount_fee >= bridge.fee, E_INSUFFICIENT_FEE);

        let balance_fee = coin::into_balance(coin_fee);
        balance::join(&mut bridge.fee_collector, balance_fee);

        event::emit(MessageSent {
            uid,
            to_chain,
            block_number: tx_context::epoch(ctx),
            to,
            payload
        });

        uid
    }   

    // ========== Package Functions ========== //

    public(package) fun receive_message(
        bridge: &mut MessageBridge,
        source_uid: vector<u8>,
        source_chain: u64,
        source_block_number: u64,
        from: vector<u8>,
        to: address,
        _: vector<u8>,
        ctx: &mut TxContext
    ) {
        if (!table::contains(&bridge.receiveds, source_uid)) {
            table::add(&mut bridge.receiveds, source_uid, false);
        };

        let received = table::borrow_mut(&mut bridge.receiveds, source_uid);

        assert!(!*received, E_ALREADY_RECEIVED);
        
        event::emit(MessageReceived {
            uid: source_uid,
            source_chain,
            source_block_number,
            from,
            to
        });

        *received = true;
    }

    // ========== Views Functions ========== //

    public fun get_uid(
        bridge: &MessageBridge,
        ctx: &mut TxContext
    ): vector<u8> {
        let mut root = vector::empty<u8>();
        vector::append(&mut root, bcs::to_bytes(&bridge.nonce));
        vector::append(&mut root, bcs::to_bytes(&tx_context::sender(ctx)));
        root        
    }
}