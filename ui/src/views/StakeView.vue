<script setup lang="ts">
// import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon.vue';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon.vue';
import OutIcon from '@/components/icons/OutIcon.vue';
import { notify } from '@/reactives/notify';
import { useWalletStore } from '@/stores/wallet';
import { strategies, findStrategy, IOTA_COIN } from '@/scripts/constants';
import { StakeContract } from '@/scripts/contract';
import { Converter } from '@/scripts/converter';
import type { Strategy, } from '@/scripts/types';
import { computed, onMounted, watch, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAdapter } from '@/scripts/config';
import { CoinContract } from '@/scripts/erc20';
import { formatUnits, parseUnits } from 'viem';

const route = useRoute();
const { adapter } = useAdapter();
const walletStore = useWalletStore();
const amount = ref<number | undefined>(undefined);
const strategy = ref<Strategy | undefined>(strategies[0]);
const weight = ref<number | undefined>(undefined);
const minting = ref<boolean>(false);
const staking = ref<boolean>(false);

const onStrategyChanged = (e: any) => {
    strategy.value = findStrategy(e.target.value);
};

const getBalances = async () => {
    if (!walletStore.iotaAddress) return;
    for (let i = 0; i < strategies.length; i++) {
        const balance = await CoinContract.getCoinBalance(
            strategies[i].address,
            walletStore.iotaAddress
        );

        walletStore.setBalance(
            strategies[i].address, Number(formatUnits(balance, strategies[i].decimals))
        );
    }
};

const getShares = async () => {
    if (!walletStore.iotaAddress) return;
    const shares = await StakeContract.getValidatorShares(
        walletStore.iotaAddress,
        strategies.map(strategy => strategy.address.replace('0x', ''))
    );
    shares.forEach((share, i) => walletStore.setShares(
        strategies[i].address, Number(formatUnits(share, strategies[i].decimals))
    ));
};

const getWeight = async () => {
    if (!walletStore.iotaAddress) return;
    weight.value = await StakeContract.getValidatorWeight(walletStore.iotaAddress);
};

const setAmount = (div: number = 1) => {
    if (!strategy.value) return;
    amount.value = walletStore.balances[strategy.value.address] / div;
};

const mint = async () => {
    if (minting.value) return;
    if (!strategy.value) return;
    if (!adapter.value) return;
    if (!walletStore.iotaAddress) return;

    minting.value = true;

    const digest: string | null = await CoinContract.mint(
        adapter.value as any,
        strategy.value.module,
        strategy.value.faucet,
        strategy.value.address,
        parseUnits(strategy.value.faucetAmount.toString(), strategy.value.decimals),
    );

    if (digest) {
        notify.push({
            title: 'Minted',
            description: `Minted ${strategy.value.symbol}`,
            category: 'success',
            linkTitle: 'View Trx',
            linkUrl: `${import.meta.env.VITE_IOTA_EXPLORER_URL}/txblock/${digest}?network=testnet`,
        });

        getBalances();
    } else {
        notify.push({
            title: 'Mint Failed',
            description: `Failed to mint ${strategy.value.symbol}`,
            category: 'error'
        });
    }

    minting.value = false;
};

const stake = async () => {
    if (staking.value) return;
    if (!strategy.value) return;

    if (!amount.value) {
        notify.push({
            title: 'Amount Required',
            description: `Please enter an amount`,
            category: 'error'
        });
        return;
    }

    staking.value = true;

    const digest: string | null = await StakeContract.stake(
        adapter.value as any,
        parseUnits(amount.value.toString(), strategy.value.decimals),
        strategy.value.address
    );

    if (digest) {
        notify.push({
            title: 'Staked',
            description: `Staked ${strategy.value.symbol}`,
            category: 'success',
            linkTitle: 'View Trx',
            linkUrl: `${import.meta.env.VITE_IOTA_EXPLORER_URL}/txblock/${digest}?network=testnet`,
        });

        amount.value = undefined;

        getBalances();
        getShares();
        getWeight();
    } else {
        notify.push({
            title: 'Stake Failed',
            description: `Failed to bridge ${strategy.value.symbol}`,
            category: 'error'
        });
    }

    staking.value = false;
};

watch(computed(() => walletStore.iotaAddress), () => {
    getBalances();
    getWeight();
    getShares();
});


watch(strategy, () => {
    getWeight();
    getShares();
});

onMounted(() => { });
</script>

<template>
    <section>
        <div class="app_width">
            <div class="stake" v-if="strategy">
                <div class="stake_wrapper">
                    <div class="head">
                        <RouterLink to="/">
                            <div class="back">
                                <ChevronLeftIcon />
                                <p>Exit</p>
                            </div>
                        </RouterLink>
                    </div>

                    <div class="box">
                        <div class="label">Select a strategy</div>

                        <select @change="onStrategyChanged">
                            <option v-for="strategy in strategies" :value="strategy.address">
                                {{ strategy.name }}
                            </option>
                        </select>

                        <div class="label">You're staking</div>

                        <div class="input">
                            <input type="number" v-model="amount" placeholder="0.00">
                            <div class="helper">
                                <p>{{ Converter.toMoney(walletStore.balances[strategy.address]) }} {{
                                    strategy.symbol }}</p>
                                <div class="buttons">
                                    <button @click="setAmount(4)">25%</button>
                                    <button @click="setAmount(2)">50%</button>
                                    <button @click="setAmount()">Max</button>
                                </div>
                            </div>
                        </div>

                        <button class="restake" @click="stake">{{ staking ? '•••' : 'Stake' }}</button>
                    </div>

                </div>

                <div class="stake_info">
                    <div class="stats">
                        <div class="stat">
                            <p>Wallet Balance</p>
                            <div class="value">
                                <p>{{ Converter.toMoney(walletStore.balances[strategy.address]) }}</p>
                                <span>{{ strategy.symbol }}</span>
                            </div>
                        </div>

                        <div class="stat">
                            <p>Value Staked</p>
                            <div class="value">
                                <p>{{ Converter.toMoney(walletStore.shares[strategy.address]) }}</p>
                            </div>
                        </div>

                        <div class="stat">
                            <p>Weight </p>
                            <div class="value">
                                <p>{{ weight }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="coin">
                        <div class="title">
                            <h3>About</h3>
                        </div>

                        <div class="coin_info">
                            <img :src="'/images/iota.png'" alt="btc">
                            <p>{{ strategy.name }} <span>{{ strategy.symbol }}</span></p>
                        </div>

                        <div class="description">{{ strategy.about }}</div>

                        <a v-if="strategy.link" :href="strategy.link" target="_blank" class="link">
                            <p>Learn more</p>
                            <OutIcon />
                        </a>
                    </div>

                    <div class="faucet" v-if="true">
                        <div class="title">
                            <h3>Faucet</h3>
                        </div>

                        <a href="https://docs.iota.org/developer/getting-started/get-coins"
                            v-if="strategy.address == IOTA_COIN" target="_blank">
                            <button class="mint"> Request Test IOTA </button>
                        </a>
                        <button v-else class="mint" @click="mint">
                            {{ minting ? '•••' : `Mint ${Converter.toMoney(strategy.faucetAmount)} ${strategy.symbol}`
                            }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.stake {
    padding: 30px 0;
    display: grid;
    grid-template-columns: 800px 600px;
    gap: 20px;
    justify-content: center;
}

.stake_wrapper {
    background: var(--bg-light);
    border: 1px solid var(--bg-lighter);
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    height: fit-content;
}

.head {
    display: flex;
    align-items: center;
}

.back {
    display: flex;
    align-items: center;
    gap: 8px;
}

.back p {
    font-size: 14px;
    color: var(--tx-semi);
}

.label {
    font-size: 14px;
    color: var(--tx-dimmed);
    margin-top: 20px;
}

.input {
    margin-top: 10px;
    background: var(--bg-lighter);
    border: 1px solid var(--bg-lightest);
    padding: 16px;
    border-radius: 8px;
}

.input input {
    font-size: 30px;
    font-weight: 500;
    background: none;
    outline: none;
    border: none;
    color: var(--tx-normal);
}

select {
    font-size: 14px;
    background: var(--bg-lighter);
    outline: none;
    border: 1px solid var(--bg-lightest);
    border-radius: 8px;
    color: var(--tx-normal);
    width: 100%;
    height: 40px;
    margin-top: 10px;
    padding: 0 16px;
}

.helper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
}

.helper>p {
    font-size: 14px;
    color: var(--tx-dimmed);
}

.helper .buttons {
    display: flex;
    align-items: center;
    gap: 10px;
}

.helper .buttons button {
    height: 30px;
    padding: 0 16px;
    border-radius: 4px;
    border: none;
    background: var(--bg-lightest);
    color: var(--tx-semi);
    cursor: pointer;
}

.restake {
    margin-top: 20px;
    width: 100%;
    height: 50px;
    border: none;
    background: var(--primary-light);
    font-weight: 500;
    font-size: 16px;
    cursor: pointer;
    color: var(--bg);
    border-radius: 30px;
}

.stake_info {
    height: fit-content;
}

.stat {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 50px;
    border-bottom: 1px solid var(--bg-lighter);
}

.stat>p {
    font-size: 14px;
    color: var(--tx-semi);
    text-transform: uppercase;
}

.stat .value {
    display: flex;
    align-items: center;
    gap: 8px;
}

.stat .value p {
    font-size: 14px;
    color: var(--tx-normal);
}

.stat .value span {
    background: var(--bg-lighter);
    font-size: 12px;
    color: var(--tx-dimmed);
    padding: 4px 6px;
    border-radius: 4px;
}


.coin {
    margin-top: 20px;
}

.coin .title h3 {
    font-size: 16px;
    color: var(--tx-dimmed);
    font-weight: 500;
}

.coin_info {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 16px;
}

.coin_info img {
    height: 28px;
    width: 28px;
    border-radius: 20px;
}

.coin_info p {
    font-size: 16px;
    color: var(--tx-semi);
}

.coin_info p span {
    margin-left: 8px;
    color: var(--tx-dimmed);
}

.coin .description {
    margin: 10px 0;
    font-size: 14px;
    color: var(--tx-dimmed);
    line-height: 20px;
}

.link {
    width: fit-content;
    display: flex;
    align-items: center;
    gap: 8px;
}

.link p {
    font-size: 11px;
    color: var(--accent-green);
}

.faucet {
    margin-top: 20px;
}

.faucet .title h3 {
    font-size: 16px;
    color: var(--tx-dimmed);
    font-weight: 500;
}

.mint {
    margin-top: 20px;
    width: 100%;
    height: 45px;
    border: none;
    background: var(--accent-red);
    font-size: 14px;
    cursor: pointer;
    color: var(--tx-normal);
    border-radius: 8px;
}
</style>