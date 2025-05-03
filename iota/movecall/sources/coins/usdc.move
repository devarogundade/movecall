// SPDX-License-Identifier: MIT
module movecall::usdc {
    use iota::coin::{Self, Coin, TreasuryCap};
    use iota::transfer;
    use iota::tx_context::{Self, TxContext};
    use iota::balance::{Self, Balance};

    public struct USDC has drop {}

    public struct Faucet<phantom USDC> has key {
        id: UID,
        balance: Balance<USDC>
    }

    fun init(
        witness: USDC,
        ctx: &mut TxContext
    ) {
        let (treasury, metadata) = coin::create_currency(
            witness, 
            6, 
            b"USDC", 
            b"USDC", 
            b"", 
            option::none(), 
            ctx
        );

        let faucet = Faucet {
            id: object::new(ctx),
            balance: balance::zero<USDC>()
        };

        transfer::share_object(faucet);
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, tx_context::sender(ctx))
    }

    public entry fun init_supply<USDC>(
        treasury_cap: &mut TreasuryCap<USDC>,
        faucet: &mut Faucet<USDC>, 
        ctx: &mut TxContext,
    ) {
        let coin_minted = coin::mint(treasury_cap, 1_000_000_000_000_000, ctx);
        balance::join<USDC>(&mut faucet.balance, coin_minted.into_balance<USDC>());
    }

    public entry fun mint<USDC>(
        faucet: &mut Faucet<USDC>,
        amount: u64,
        receiver: address,
        ctx: &mut TxContext,
    ) {
        let coin_took = coin::take<USDC>(&mut faucet.balance, amount, ctx);
        transfer::public_transfer(coin_took, receiver)
    }

    public fun get_faucet_balance(
        faucet: &Faucet<USDC>,
    ): u64 {
        balance::value(&faucet.balance)
    }

    #[test_only]
    public(package) fun init_for_testing(
        ctx: &mut TxContext,
    ) {
        init(USDC {}, ctx);
    }    
}