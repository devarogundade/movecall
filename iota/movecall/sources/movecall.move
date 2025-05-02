// SPDX-License-Identifier: MIT
module movecall::movecall {    
    use std::string;
    use iota::event;
    use iota::table;
    use iota::balance;
    use iota::coin;
    use iota::bag;
    use iota::bcs;
    use iota::transfer;
    use iota::tx_context::{Self, TxContext};
    use iota::ed25519;

    use movecall::math;
    use movecall::utils;
    use movecall::token_bridge::{Self, TokenBridge};
    use movecall::message_bridge::{Self, MessageBridge};

    // Constants
    // BPS is the basis points for the multipliers of the coins in the quorum
    const BPS: u64 = 10_000;

    // Errors
    const E_INVALID_QUORUM_WEIGHT: u64 = 0;
    const E_INSUFFICIENT_QUORUM_WEIGHT: u64 = 1;
    const E_ALREADY_ATTESTED: u64 = 3;
    const E_INSUFICCIENT_CUMM_WEIGHT: u64 = 4;

    // Structs
    public struct Quorum has store, drop {
        coin_types: vector<string::String>,
        multipliers: vector<u64>
    }

    public struct MoveCall has key {
        id: UID,
        stake_vaults: bag::Bag,
        registered_coin_types: vector<string::String>,
        stake_allocations: table::Table<address, table::Table<string::String, u64>>,
        min_weight: u64,
        quorum: Quorum,
        stake_vault_balances: table::Table<string::String, u64>
    }

    public struct MoveCallCap has key {
        id: UID,
    }

    public struct StakeVault<phantom CoinType> has store {
        balance_underlying: balance::Balance<CoinType>
    }

    fun init(
        ctx: &mut TxContext
    ) {
        transfer::share_object(MoveCall {
            id: object::new(ctx),
            stake_vaults: bag::new(ctx),
            registered_coin_types: vector::empty<string::String>(),
            stake_allocations: table::new<address, table::Table<string::String, u64>>(ctx),
            min_weight: 0,
            quorum: Quorum {
                coin_types: vector::empty<string::String>(),
                multipliers: vector::empty<u64>()
            },
            stake_vault_balances: table::new<string::String, u64>(ctx)
        });

        transfer::transfer(MoveCallCap {
            id: object::new(ctx)
        }, tx_context::sender(ctx));
    }

    // ========== Mutable Functions ========== //

    public entry fun stake<CoinType>(
        move_call: &mut MoveCall,
        coin_staked: coin::Coin<CoinType>,
        ctx: &mut TxContext
    ) {        
        let validator = tx_context::sender(ctx);
        let coin_type = utils::get_coin_type<CoinType>();

        let stake_vault = bag::borrow_mut<string::String, StakeVault<CoinType>>(
            &mut move_call.stake_vaults, coin_type
        );

        let amount_staked = coin::value(&coin_staked);
        let balance_staked = coin::into_balance(coin_staked);
        balance::join(&mut stake_vault.balance_underlying, balance_staked);

        if (!table::contains(&move_call.stake_allocations, validator)) {
            table::add(&mut move_call.stake_allocations, validator, table::new<string::String, u64>(ctx));
        };

        let validator_stakes = table::borrow_mut(&mut move_call.stake_allocations, validator);
        if (!table::contains(validator_stakes, coin_type)) {
            table::add(validator_stakes, coin_type, amount_staked);
        } else {
            let prev_amount_staked = table::borrow_mut(validator_stakes, coin_type);
            *prev_amount_staked = *prev_amount_staked + amount_staked;
        };

        let prev_stake_vault_balance = table::borrow_mut(&mut move_call.stake_vault_balances, coin_type);
        *prev_stake_vault_balance = *prev_stake_vault_balance + amount_staked;
    }

    public entry fun unstake<CoinType>(
        move_call: &mut MoveCall,
        amount_unstake: u64,
        ctx: &mut TxContext
    ) {

    }

    // ========== Admin Functions ========== //

    public entry fun attest_message(
        _: &MoveCallCap,
        move_call: &MoveCall,
        bridge: &mut MessageBridge,
        validators: vector<address>,
        signatures: vector<vector<u8>>,
        source_uid: vector<u8>,
        source_chain: u64,
        from: vector<u8>,
        to: address,
        payload: vector<u8>,
        ctx: &mut TxContext
    ) {
        validate_attest(move_call, validators, signatures, source_uid);

        message_bridge::receive_message(
            bridge,
            source_uid,
            source_chain,
            from,
            to,
            payload,
            ctx
        );
    }   

    public entry fun attest_token_claim<CoinType>(
        _: &MoveCallCap,
        move_call: &MoveCall,
        bridge: &mut TokenBridge,
        coin_metadata: &coin::CoinMetadata<CoinType>,
        validators: vector<address>,
        signatures: vector<vector<u8>>,
        source_uid: vector<u8>,
        source_chain: u64,
        amount: u64,
        decimals: u8,
        receiver: address,
        ctx: &mut TxContext
    ) {
        validate_attest(move_call, validators, signatures, source_uid);

        token_bridge::attest_token_claim<CoinType>(
            bridge,
            coin_metadata,
            source_uid,
            source_chain,
            amount,
            decimals,
            receiver,
            ctx
        ); 
    }

    public entry fun init_stake_vault<CoinType>(
        _: &MoveCallCap,
        move_call: &mut MoveCall,
    ) {
        let coin_type = utils::get_coin_type<CoinType>();

        vector::push_back(&mut move_call.registered_coin_types, coin_type);
        bag::add(&mut move_call.stake_vaults, coin_type, StakeVault<CoinType> {
            balance_underlying: balance::zero<CoinType>()
        }); 
        table::add(&mut move_call.stake_vault_balances, coin_type, 0);
    }

    public entry fun set_min_weight(
        _: &MoveCallCap,
        move_call: &mut MoveCall,
        min_weight: u64,
        ctx: &mut TxContext
    ) {
        move_call.min_weight = min_weight;
    }


    public entry fun set_quorum(
        _: &MoveCallCap,
        move_call: &mut MoveCall,
        coin_types: vector<string::String>,
        multipliers: vector<u64>
    ) {
        validate_quorum(Quorum { coin_types, multipliers });
        move_call.quorum = Quorum { coin_types, multipliers };
    }

    // ========== View Functions ========== //

    public fun get_validator_shares(
        move_call: &MoveCall,        
        validator: address,
        coin_types: vector<string::String>
    ): vector<u64> {
        let mut validator_shares = vector::empty<u64>();

        let mut i: u64 = 0;
        let len = vector::length(&coin_types);

        while (i < len) {
            let coin_type = *vector::borrow(&coin_types, i);

            if (!table::contains(&move_call.stake_allocations, validator)) {
                vector::push_back(&mut validator_shares, 0);
                continue;
            };

            let shares = table::borrow(&move_call.stake_allocations, validator);
            if (!table::contains(shares, coin_type)) {
                vector::push_back(&mut validator_shares, 0);
                continue;
            };

            vector::push_back(&mut validator_shares, *table::borrow(shares, coin_type));

            i = i + 1;
        };

        validator_shares
    }

    public fun get_validator_weight(
        move_call: &MoveCall,        
        validator: address,
    ): u64 {
        let mut validator_weight: u64 = 0;

        let mut i: u64 = 0;
        let len = vector::length(&move_call.quorum.multipliers);

        let shares = get_validator_shares(move_call, validator, move_call.quorum.coin_types);

        while (i < len) {
            validator_weight = validator_weight + (*vector::borrow(&move_call.quorum.multipliers, i) * *vector::borrow(&shares, i));
            i = i + 1;
        };

        math::div(validator_weight, BPS)
    }

    public fun get_weight(
        move_call: &MoveCall,        
        coin_type: string::String,
        value: u64
    ): u64 {
        let mut multiplier: u64 = 0;

        let mut i: u64 = 0;
        let len = vector::length(&move_call.quorum.multipliers);

        while (i < len) {
            let hay_coin_type = *vector::borrow(&move_call.quorum.coin_types, i);
            if (hay_coin_type == coin_type) {
                multiplier = *vector::borrow(&move_call.quorum.multipliers, i);
                break;
            };
            i = i + 1;
        };

        math::mul(multiplier, value)
    }

    public fun get_cumm_weight(
        move_call: &MoveCall
    ): u64 {    
        let mut cumm_weight = 0;

        let mut i: u64 = 0;
        let len = vector::length(&move_call.registered_coin_types);

        while (i < len) {
            let coin_type = *vector::borrow(&move_call.registered_coin_types, i);
            let stake_vault_balance = *table::borrow(&move_call.stake_vault_balances, coin_type);
            cumm_weight = cumm_weight + get_weight(move_call, coin_type, stake_vault_balance);
            i = i + 1;
        };

        cumm_weight
    }

    // ========== Private Functions ========== //

    fun validate_attest(
        move_call: &MoveCall,
        validators: vector<address>,
        signatures: vector<vector<u8>>,
        source_uid: vector<u8>
    ) {
        let mut i = 0;
        let len = vector::length(&signatures);

        let mut cumm_weight_attested = 0;
        let mut attest_validators = vector::empty<address>();

        let cumm_weight = get_cumm_weight(move_call);

        while (i < len) {
            let validator = *vector::borrow(&validators, i);
            let signature = *vector::borrow(&signatures, i);

            // Check if the claim is already attested by validator
            assert!(!vector::contains(&attest_validators, &validator), E_ALREADY_ATTESTED);
            
            if (!ed25519::ed25519_verify(&signature, &bcs::to_bytes(&validator), &source_uid)) continue;

            let validator_weight = get_validator_weight(move_call, validator);
            if (validator_weight < move_call.min_weight) continue;

            cumm_weight_attested = cumm_weight_attested + validator_weight;
            vector::push_back(&mut attest_validators, validator);           

            i = i + 1;
        };
        
        assert!(cumm_weight_attested > math::mul_div(cumm_weight, 10, 4), E_INSUFICCIENT_CUMM_WEIGHT);
    }

    fun validate_quorum(
        quorum: Quorum,
    ) {
        let mut total_multiplier: u64 = 0;

        assert!(vector::length(&quorum.coin_types) == vector::length(&quorum.multipliers), E_INVALID_QUORUM_WEIGHT);

        let mut i: u64 = 0;
        let len = vector::length(&quorum.multipliers);

        while (i < len) {
            total_multiplier = total_multiplier + *vector::borrow(&quorum.multipliers, i);
            i = i + 1;
        };

        assert!(total_multiplier == BPS, E_INVALID_QUORUM_WEIGHT);
    }
}