// SPDX-License-Identifier: MIT
module movecall::link {
    use iota::coin::{Self, Coin, TreasuryCap};
    use iota::transfer;
    use iota::tx_context::{Self, TxContext};
    use iota::balance::{Self, Balance};

    public struct LINK has drop {}

    public struct Faucet<phantom LINK> has key {
        id: UID,
        balance: Balance<LINK>
    }

    fun init(
        witness: LINK,
        ctx: &mut TxContext
    ) {
        let (treasury, metadata) = coin::create_currency(
            witness, 
            9, 
            b"LINK", 
            b"Chainlink", 
            b"", 
            option::none(), 
            ctx
        );

        let faucet = Faucet {
            id: object::new(ctx),
            balance: balance::zero<LINK>()
        };

        transfer::share_object(faucet);
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, tx_context::sender(ctx))
    }

    public entry fun init_supply<LINK>(
        treasury_cap: &mut TreasuryCap<LINK>,
        faucet: &mut Faucet<LINK>, 
        ctx: &mut TxContext,
    ) {
        let coin_minted = coin::mint(treasury_cap, 1_000_000_000_000_000, ctx);
        balance::join<LINK>(&mut faucet.balance, coin_minted.into_balance<LINK>());
    }

    public entry fun mint<LINK>(
        faucet: &mut Faucet<LINK>,
        amount: u64,
        receiver: address,
        ctx: &mut TxContext,
    ) {
        let coin_took = coin::take<LINK>(&mut faucet.balance, amount, ctx);
        transfer::public_transfer(coin_took, receiver)
    }

    public fun get_faucet_balance(
        faucet: &Faucet<LINK>,
    ): u64 {
        balance::value(&faucet.balance)
    }

    #[test_only]
    public(package) fun init_for_testing(
        ctx: &mut TxContext,
    ) {
        init(LINK {}, ctx);
    }    
}