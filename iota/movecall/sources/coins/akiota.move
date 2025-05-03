// SPDX-License-Identifier: MIT
module movecall::akiota {
    use iota::coin::{Self, Coin, TreasuryCap};
    use iota::transfer;
    use iota::tx_context::{Self, TxContext};
    use iota::balance::{Self, Balance};

    public struct AKIOTA has drop {}

    public struct Faucet<phantom AKIOTA> has key {
        id: UID,
        balance: Balance<AKIOTA>
    }

    fun init(
        witness: AKIOTA,
        ctx: &mut TxContext
    ) {
        let (treasury, metadata) = coin::create_currency(
            witness, 
            9, 
            b"akIOTA", 
            b"Ankr Liquid Staked Token", 
            b"", 
            option::none(), 
            ctx
        );

        let faucet = Faucet {
            id: object::new(ctx),
            balance: balance::zero<AKIOTA>()
        };

        transfer::share_object(faucet);
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, tx_context::sender(ctx))
    }

    public entry fun init_supply<AKIOTA>(
        treasury_cap: &mut TreasuryCap<AKIOTA>,
        faucet: &mut Faucet<AKIOTA>, 
        ctx: &mut TxContext,
    ) {
        let coin_minted = coin::mint(treasury_cap, 1_000_000_000_000_000, ctx);
        balance::join<AKIOTA>(&mut faucet.balance, coin_minted.into_balance<AKIOTA>());
    }

    public entry fun mint<AKIOTA>(
        faucet: &mut Faucet<AKIOTA>,
        amount: u64,
        receiver: address,
        ctx: &mut TxContext,
    ) {
        let coin_took = coin::take<AKIOTA>(&mut faucet.balance, amount, ctx);
        transfer::public_transfer(coin_took, receiver)
    }

    public fun get_faucet_balance(
        faucet: &Faucet<AKIOTA>,
    ): u64 {
        balance::value(&faucet.balance)
    }

    #[test_only]
    public(package) fun init_for_testing(
        ctx: &mut TxContext,
    ) {
        init(AKIOTA {}, ctx);
    }    
}