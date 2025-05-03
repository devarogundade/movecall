// SPDX-License-Identifier: MIT
module movecall::btc {
    use iota::coin::{Self, Coin, TreasuryCap};
    use iota::transfer;
    use iota::tx_context::{Self, TxContext};
    use iota::balance::{Self, Balance};

    public struct BTC has drop {}

    public struct Faucet<phantom BTC> has key {
        id: UID,
        balance: Balance<BTC>
    }

    fun init(
        witness: BTC,
        ctx: &mut TxContext
    ) {
        let (treasury, metadata) = coin::create_currency(
            witness, 
            8, 
            b"BTC", 
            b"Bitcoin", 
            b"", 
            option::none(), 
            ctx
        );

        let faucet = Faucet {
            id: object::new(ctx),
            balance: balance::zero<BTC>()
        };

        transfer::share_object(faucet);
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, tx_context::sender(ctx))
    }

    public entry fun init_supply<BTC>(
        treasury_cap: &mut TreasuryCap<BTC>,
        faucet: &mut Faucet<BTC>, 
        ctx: &mut TxContext,
    ) {
        let coin_minted = coin::mint(treasury_cap, 1_000_000_000_000_000, ctx);
        balance::join<BTC>(&mut faucet.balance, coin_minted.into_balance<BTC>());
    }

    public entry fun mint<BTC>(
        faucet: &mut Faucet<BTC>,
        amount: u64,
        receiver: address,
        ctx: &mut TxContext,
    ) {
        let coin_took = coin::take<BTC>(&mut faucet.balance, amount, ctx);
        transfer::public_transfer(coin_took, receiver)
    }

    public fun get_faucet_balance(
        faucet: &Faucet<BTC>,
    ): u64 {
        balance::value(&faucet.balance)
    }

    #[test_only]
    public(package) fun init_for_testing(
        ctx: &mut TxContext,
    ) {
        init(BTC {}, ctx);
    }    
}