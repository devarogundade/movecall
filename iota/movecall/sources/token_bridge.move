// SPDX-License-Identifier: MIT
module movecall::token_bridge {
    use std::string;
    use iota::event;
    use iota::table;
    use iota::balance;
    use iota::coin;
    use iota::bag;
    use iota::bcs;
    use iota::transfer;
    use iota::tx_context::{Self, TxContext};

    use movecall::math;
    use movecall::utils;

    // Errors
    const E_ALREADY_CLAIMED: u64 = 1;

    // Structs
    public struct Pool<phantom CoinType> has store {
        balance_underlying: balance::Balance<CoinType>
    }

    public struct TokenBridge has key {
        id: UID,
        nonce: u64,
        pools: bag::Bag,
        claimeds: table::Table<vector<u8>, bool>
    }

    public struct TokenBridgeCap has key { 
        id: UID
    }

    // Events
    public struct TokenTransfer has copy, drop {
        uid: vector<u8>,
        coin_type: string::String,
        decimals: u8,
        amount: u64,
        to_chain: u64,
        receiver: vector<u8>
    }

    public struct TokenClaimed has copy, drop {
        claim_root: vector<u8>,
        receiver: address,
        coin_type: string::String,
        decimals: u8,
        amount: u64
    }

    fun init(
        ctx: &mut TxContext
    ) {
        transfer::share_object(TokenBridge { 
            id: object::new(ctx),
            nonce: 0,
            pools: bag::new(ctx),
            claimeds: table::new<vector<u8>, bool>(ctx)
        });

        transfer::transfer(TokenBridgeCap { 
            id: object::new(ctx) 
        }, tx_context::sender(ctx));
    }

    // ========== Mutable Functions ========== //

    public entry fun token_tranfer<CoinType>(
        bridge: &mut TokenBridge,
        coin_transfer: coin::Coin<CoinType>,
        coin_metadata: &coin::CoinMetadata<CoinType>,
        to_chain: u64,
        receiver: vector<u8>,
        ctx: &mut TxContext
    ) {
        let coin_type = utils::get_coin_type<CoinType>();

        let pool = bag::borrow_mut<string::String, Pool<CoinType>>(&mut bridge.pools, coin_type);

        let amount_transfer = coin::value(&coin_transfer);
        let balance_transfer = coin::into_balance(coin_transfer);

        balance::join(&mut pool.balance_underlying, balance_transfer);

        let decimals = coin::get_decimals(coin_metadata);

        event::emit(TokenTransfer {
            uid: bcs::to_bytes(&bridge.nonce),
            coin_type,
            decimals,
            amount: amount_transfer,
            to_chain,
            receiver
        });

        bridge.nonce = bridge.nonce + 1;
    } 

    // ========== Package Functions ========== //

    public(package) fun attest_token_claim<CoinType>(
        bridge: &mut TokenBridge,
        coin_metadata: &coin::CoinMetadata<CoinType>,
        source_uid: vector<u8>,
        source_chain: u64,
        amount: u64,
        decimals: u8,
        receiver: address,
        ctx: &mut TxContext
    ) {
        let claim_root = get_claim_root(source_uid, source_chain, amount, decimals, receiver);

        if (!table::contains(&bridge.claimeds, claim_root)) {
            table::add(&mut bridge.claimeds, claim_root, false);
        };

        let claimed = table::borrow_mut(&mut bridge.claimeds, claim_root);
        assert!(!*claimed, E_ALREADY_CLAIMED);

        let coin_type = utils::get_coin_type<CoinType>();
        let pool = bag::borrow_mut<string::String, Pool<CoinType>>(&mut bridge.pools, coin_type);
        let coin_decimals = coin::get_decimals(coin_metadata);
        let amount_claimed = math::scale(amount, decimals, coin_decimals);
        let balance_claimed = balance::split(&mut pool.balance_underlying, amount_claimed);
        let coin_claimed = coin::from_balance(balance_claimed, ctx);
        transfer::public_transfer(coin_claimed, receiver);

        event::emit(TokenClaimed {
            claim_root,
            receiver,
            coin_type,
            decimals,
            amount
        });
        
        *claimed = true;   
    }

    // ========== Admin Functions ========== //

    public entry fun deposit<CoinType>(
        _: &TokenBridgeCap,
        bridge: &mut TokenBridge,
        coin_deposited: coin::Coin<CoinType>,
        ctx: &mut TxContext
    ) {
        let coin_type = utils::get_coin_type<CoinType>();
        if (!bag::contains(&bridge.pools, coin_type)) {
            bag::add(&mut bridge.pools, coin_type, Pool<CoinType> {
                balance_underlying: balance::zero<CoinType>()
            });
        };
        let mut pool = bag::borrow_mut<string::String, Pool<CoinType>>(&mut bridge.pools, coin_type);
        let balance_deposited = coin::into_balance(coin_deposited);
        balance::join(&mut pool.balance_underlying, balance_deposited);
    }

    public entry fun withdraw<CoinType>(
        _: &TokenBridgeCap,
        bridge: &mut TokenBridge,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let coin_type = utils::get_coin_type<CoinType>();
        let mut pool = bag::borrow_mut<string::String, Pool<CoinType>>(&mut bridge.pools, coin_type);
        let balance_withdrawn = balance::split(&mut pool.balance_underlying, amount);
        let coin_withdrawn = coin::from_balance(balance_withdrawn, ctx);
        transfer::public_transfer(coin_withdrawn, tx_context::sender(ctx));
    }

    // ========== View Functions ========== //

    public fun get_nonce(
        bridge: &TokenBridge
    ): u64 {
        bridge.nonce
    }

    public fun get_claim_root(
        source_uid: vector<u8>,
        source_chain: u64,
        amount: u64,
        decimals: u8,
        receiver: address
    ): vector<u8> {
        let mut root = vector::empty<u8>();
        vector::append(&mut root, source_uid);
        vector::append(&mut root, bcs::to_bytes(&source_chain));
        vector::append(&mut root, bcs::to_bytes(&amount));
        vector::append(&mut root, bcs::to_bytes(&decimals));
        vector::append(&mut root, bcs::to_bytes(&receiver));
        root
    }

    #[test_only]
    public(package) fun init_for_testing(
        ctx: &mut TxContext,
    ) {
        init(ctx);
    }
}