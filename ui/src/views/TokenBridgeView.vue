<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import ChevronDownIcon from '@/components/icons/ChevronDownIcon.vue';
import { Converter } from '@/scripts/converter';
import { tokens, chain, IOTA_COIN } from '@/scripts/constants';
import { CoinContract, TokenContract } from '@/scripts/erc20';
import { useWalletStore } from '@/stores/wallet';
import { formatUnits, parseUnits, zeroAddress, type Hex } from 'viem';
import AllAssets from '@/components/AllAssets.vue';
import NotifyPop from '@/components/NotifyPop.vue';
import type { Token } from '@/scripts/types';
import { HoleskyContract, IOTAContract } from '@/scripts/contract';
import { notify } from '@/reactives/notify';
import { useAdapter } from '@/scripts/config';

const { adapter } = useAdapter();
const walletStore = useWalletStore();
const allAssets = ref<boolean>(false);
const minting = ref<boolean>(false);
const approving = ref<boolean>(false);
const bridging = ref<boolean>(false);

const form = ref({
    fromChain: chain(17000)!,
    toChain: chain(0)!,
    token: tokens[0],
    amount: undefined as number | undefined,
    receiver: null as Hex | string | null,
});

const interChange = () => {
    let tempFromChain = form.value.fromChain;
    form.value.fromChain = form.value.toChain;
    form.value.toChain = tempFromChain;
};

const onTokenChanged = (token: Token) => {
    form.value.token = token;
    allAssets.value = false;
};

const mintHolesky = async () => {
    if (minting.value) return;
    if (!walletStore.holeskyAddress) return;

    minting.value = true;

    const tx = await TokenContract.mint(
        form.value.token.address[17000],
        parseUnits(form.value.token.faucetAmount.toString(), form.value.token.decimals[17000]),
    );

    if (tx) {
        notify.push({
            title: 'Minted',
            description: `Minted ${form.value.token.symbol}`,
            category: 'success',
            linkTitle: 'View Trx',
            linkUrl: `${import.meta.env.VITE_HOLESKY_EXPLORER_URL}/tx/${tx}`,
        });

        getBalances();
    } else {
        notify.push({
            title: 'Mint Failed',
            description: `Failed to mint ${form.value.token.symbol}`,
            category: 'error'
        });
    }

    minting.value = false;
};

const mintIota = async () => {
    if (minting.value) return;
    if (!adapter.value) return;
    if (!walletStore.iotaAddress) return;

    minting.value = true;

    const digest: string | null = await CoinContract.mint(
        adapter.value as any,
        form.value.token.module[0],
        form.value.token.faucet[0],
        form.value.token.address[0],
        parseUnits(form.value.token.faucetAmount.toString(), form.value.token.decimals[0]),
    );

    if (digest) {
        notify.push({
            title: 'Minted',
            description: `Minted ${form.value.token.symbol}`,
            category: 'success',
            linkTitle: 'View Trx',
            linkUrl: `${import.meta.env.VITE_IOTA_EXPLORER_URL}/txblock/${digest}?network=testnet`,
        });

        getBalances();
    } else {
        notify.push({
            title: 'Mint Failed',
            description: `Failed to mint ${form.value.token.symbol}`,
            category: 'error'
        });
    }

    minting.value = false;
};

const approve = async () => {
    if (approving.value) return;
    if (!walletStore.holeskyAddress) return;
    if (!form.value.amount) return;

    approving.value = true;

    const tx = await TokenContract.approve(
        form.value.token.address[17000],
        HoleskyContract.tokenBridge,
        parseUnits(form.value.amount.toString(), form.value.token.decimals[17000]),
    );

    if (tx) {
        notify.push({
            title: 'Approved',
            description: `Approved ${form.value.token.symbol}`,
            category: 'success',
            linkTitle: 'View Trx',
            linkUrl: `${import.meta.env.VITE_HOLESKY_EXPLORER_URL}/tx/${tx}`,
        });

        getApprovals();
    } else {
        notify.push({
            title: 'Approval Failed',
            description: `Failed to approve ${form.value.token.symbol}`,
            category: 'error'
        });
    }

    approving.value = false;
};

const bridgeHolesky = async () => {
    if (bridging.value) return;
    if (!walletStore.holeskyAddress) return;

    if (!form.value.amount) {
        notify.push({
            title: 'Amount Required',
            description: `Please enter an amount`,
            category: 'error'
        });
        return;
    }

    if (!form.value.receiver) {
        notify.push({
            title: 'Receiver Required',
            description: `Please enter a receiver address`,
            category: 'error'
        });
        return;
    }

    bridging.value = true;

    let tx: Hex | null = null;

    if (form.value.token.address == zeroAddress) {
        tx = await HoleskyContract.tokenTransferETH(
            parseUnits(form.value.amount.toString(), form.value.token.decimals[17000]),
            form.value.toChain.id,
            form.value.receiver as Hex,
        );
    } else {
        tx = await HoleskyContract.tokenTransfer(
            form.value.token.address[17000],
            parseUnits(form.value.amount.toString(), form.value.token.decimals[17000]),
            form.value.toChain.id,
            form.value.receiver as Hex,
        );
    }

    if (tx) {
        notify.push({
            title: 'Bridged',
            description: `Bridged ${form.value.token.symbol}`,
            category: 'success',
            linkTitle: 'View Trx',
            linkUrl: `${import.meta.env.VITE_HOLESKY_EXPLORER_URL}/tx/${tx}`,
        });

        form.value.amount = undefined;
        form.value.receiver = null;

        getBalances();
        getApprovals();
    } else {
        notify.push({
            title: 'Bridge Failed',
            description: `Failed to bridge ${form.value.token.symbol}`,
            category: 'error'
        });
    }

    bridging.value = false;
};

const bridgeIota = async () => {
    if (bridging.value) return;
    if (!adapter.value) return;
    if (!walletStore.iotaAddress) return;

    if (!form.value.amount) {
        notify.push({
            title: 'Amount Required',
            description: `Please enter an amount`,
            category: 'error'
        });
        return;
    }

    if (!form.value.receiver) {
        notify.push({
            title: 'Receiver Required',
            description: `Please enter a receiver address`,
            category: 'error'
        });
        return;
    }

    bridging.value = true;

    let digest: string | null = await IOTAContract.transferToken(
        adapter.value as any,
        parseUnits(form.value.amount.toString(), form.value.token.decimals[0]),
        form.value.token.address[0],
        form.value.token.metadata[0],
        form.value.toChain.id,
        form.value.receiver
    );

    if (digest) {
        notify.push({
            title: 'Bridged',
            description: `Bridged ${form.value.token.symbol}`,
            category: 'success',
            linkTitle: 'View Trx',
            linkUrl: `${import.meta.env.VITE_IOTA_EXPLORER_URL}/txblock/${digest}?network=testnet`,
        });

        form.value.amount = undefined;
        form.value.receiver = null;

        getBalances();
        getApprovals();
    } else {
        notify.push({
            title: 'Bridge Failed',
            description: `Failed to bridge ${form.value.token.symbol}`,
            category: 'error'
        });
    }

    bridging.value = false;
};

const getBalances = async () => {
    for (let i = 0; i < tokens.length; i++) {
        if (walletStore.holeskyAddress) {
            const balanceA = await TokenContract.getTokenBalance(
                tokens[i].address[17000],
                walletStore.holeskyAddress);

            walletStore.setBalance(tokens[i].address[17000], Number(formatUnits(balanceA, tokens[i].decimals[17000])));
        }
        if (walletStore.iotaAddress) {
            const balanceB = await CoinContract.getCoinBalance(
                tokens[i].address[0],
                walletStore.iotaAddress
            );

            walletStore.setBalance(
                tokens[i].address[0], Number(formatUnits(balanceB, tokens[i].decimals[0]))
            );
        }
    }
};

const getApprovals = async () => {
    if (!walletStore.holeskyAddress) return;
    for (let i = 0; i < tokens.length; i++) {
        const approval = await TokenContract.getAllowance(
            tokens[i].address[17000],
            walletStore.holeskyAddress,
            HoleskyContract.tokenBridge,
        );

        walletStore.setApproval(
            tokens[i].address[17000],
            Number(formatUnits(approval, tokens[i].decimals[17000]))
        );
    }
};

watch(computed(() => walletStore.iotaAddress), () => {
    getBalances();
});

watch(computed(() => walletStore.holeskyAddress), () => {
    getBalances();
    getApprovals();
});

onMounted(() => {
    getBalances();
    getApprovals();
});
</script>

<template>
    <AppHeader />
    <section>
        <div class="app_width">
            <div class="form">
                <div class="scroll">
                    <div class="container">
                        <span>Bridge</span>

                        <div class="input" @click="interChange">
                            <label>From</label>
                            <div class="chain">
                                <img :src="form.fromChain.image" :alt="form.fromChain.name">
                                <p>{{ form.fromChain.name }}</p>
                                <ChevronDownIcon />
                            </div>
                        </div>

                        <div class="input" @click="interChange">
                            <label>To</label>
                            <div class="chain">
                                <img :src="form.toChain.image" :alt="form.toChain.name">
                                <p>{{ form.toChain.name }}</p>
                                <ChevronDownIcon />
                            </div>
                        </div>

                        <div class="input">
                            <label>Asset</label>
                            <div class="chain" @click="allAssets = true">
                                <img :src="form.token.image" :alt="form.token.name">
                                <p>{{ form.token.symbol }}</p>
                                <ChevronDownIcon />
                            </div>
                        </div>

                        <div class="input2">
                            <div class="labels">
                                <label>Amount</label>
                                <div class="bal">
                                    <p>Bal: {{
                                        Converter.toMoney(walletStore.balances[form.token.address[form.fromChain.id]])
                                    }} {{
                                            form.token.symbol }}
                                    </p>
                                    <a href="https://cloud.google.com/application/web3/faucet/ethereum/holesky"
                                        target="_blank"
                                        v-if="form.fromChain.id === 17000 && form.token.address[17000] == zeroAddress">
                                        <button>Request Test ETH</button>
                                    </a>
                                    <a href="https://docs.iota.org/developer/getting-started/get-coins" target="_blank"
                                        v-else-if="form.fromChain.id === 0 && form.token.address[0] == IOTA_COIN">
                                        <button>Request Test IOTA</button>
                                    </a>
                                    <button v-else-if="form.fromChain.id === 17000" @click="mintHolesky">
                                        {{ minting ? '•••' : 'Mint Test ' + form.token.symbol }}
                                    </button>
                                    <button v-else @click="mintIota">
                                        {{ minting ? '•••' : 'Mint Test ' + form.token.symbol }}
                                    </button>
                                </div>
                            </div>
                            <input type="number" placeholder="0.00" v-model="form.amount" />
                        </div>

                        <div class="input2">
                            <label>Receiver ({{ form.toChain.name }} address)
                                <button v-if="form.fromChain.id === 0 && walletStore.holeskyAddress"
                                    @click="form.receiver = walletStore.holeskyAddress">
                                    Use connected wallet
                                </button>

                                <button v-else-if="form.fromChain.id === 17000 && walletStore.iotaAddress"
                                    @click="form.receiver = walletStore.iotaAddress">
                                    Use connected wallet
                                </button>
                            </label>
                            <input type="text" placeholder="0x264d28e6e65e...688d81d7804ddd9" v-model="form.receiver" />
                        </div>
                    </div>
                </div>

                <div class="actions"
                    v-if="walletStore.balances[form.token.address[form.fromChain.id]] < (form.amount || 0)">
                    <button disabled>Insufficient Bal</button>
                </div>

                <div class="actions" v-else>
                    <button v-if="form.token.address != zeroAddress && form.fromChain.id === 17000" @click="approve"
                        :disabled="!form.amount || form.amount == 0 || walletStore.approvals[form.token.address[form.fromChain.id]] >= form.amount">{{
                            approving ? '•••' : 'Approve' }}</button>

                    <button v-if="form.token.address != zeroAddress && form.fromChain.id === 17000"
                        @click="bridgeHolesky"
                        :disabled="!form.amount || form.amount == 0 || walletStore.approvals[form.token.address[form.fromChain.id]] < form.amount">
                        {{ bridging ? '•••' : 'Bridge' }}</button>

                    <button v-else-if="form.fromChain.id === 17000" @click="bridgeHolesky"
                        :disabled="!form.amount || form.amount == 0">
                        {{ bridging ? '•••' : 'Bridge' }}</button>

                    <button v-else @click="bridgeIota" :disabled="!form.amount || form.amount == 0">
                        {{ bridging ? '•••' : 'Bridge' }}</button>
                </div>
            </div>
        </div>

        <AllAssets v-if="allAssets" @change="onTokenChanged" :balances="walletStore.balances" :chain="form.fromChain"
            :tokens="tokens" @close="allAssets = false" />
        <NotifyPop />
    </section>
</template>

<style scoped>
.app_width {
    max-width: 100%;
}



.about span {
    font-size: 16px;
    color: var(--tx-semi);
}

.about h1 {
    font-size: 30px;
    font-weight: 500;
    color: var(--tx-normal);
    margin-top: 20px;
}

.about p {
    font-size: 14px;
    color: var(--tx-semi);
    margin-top: 10px;
    line-height: 26px;
}

.about button {
    width: 100%;
    height: 50px;
    margin-top: 40px;
    font-size: 16px;
    padding: 10px 20px;
    background: var(--accent-red);
    color: var(--tx-normal);
    border-radius: 8px;
    border: none;
    cursor: pointer;
}

.scroll {
    height: calc(100vh - 250px);
    overflow: auto;
}

.form {
    padding: 30px;
    position: relative;
    min-height: calc(100vh - 70px - 1px);
}

.form span {
    font-size: 16px;
    color: var(--tx-semi);
}

.input {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 40px;
}

.input_disabled .chain {
    cursor: not-allowed;
}

.input label {
    font-size: 40px;
    color: var(--tx-dimmed)
}

.labels {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.bal {
    display: flex;
    align-items: center;
    gap: 20px;
}

.bal p {
    font-size: 16px;
    color: var(--tx-dimmed)
}

.bal button {
    height: 30px;
    font-size: 14px;
    padding: 0 16px;
    background: var(--accent-green);
    color: var(--tx-normal);
    border-radius: 8px;
    border: none;
    cursor: pointer;
}

.input2 {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-bottom: 40px;
    gap: 10px;
}

label button {
    height: 30px;
    margin-left: 10px;
    font-size: 16px;
    background: none;
    color: var(--primary-light);
    font-weight: 500;
    border: none;
    cursor: pointer;
}

.input2:last-child {
    margin-bottom: 0;
}

.input2 label {
    font-size: 20px;
    color: var(--tx-dimmed)
}

.input2 input {
    width: 100%;
    height: 70px;
    padding: 0 20px;
    font-size: 40px;
    border: none;
    outline: none;
    border-bottom: 1px solid var(--bg-lighter);
    background: var(--bg-light);
    color: var(--tx-normal);
}

.chain {
    display: flex;
    align-items: center;
    gap: 20px;
    border-bottom: 2px dashed var(--bg-lightest);
    height: 80px;
    cursor: pointer;
}

.chain img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

.chain p {
    font-size: 40px;
    color: var(--tx-normal)
}

.chain svg {
    width: 40px;
    height: 40px;
}

.actions {
    display: flex;
    align-items: center;
    gap: 20px;
    padding-top: 30px;
}

.actions button {
    width: 100%;
    height: 80px;
    font-size: 18px;
    padding: 0 20px;
    background: var(--primary-light);
    color: var(--bg);
    border-radius: 8px;
    border: none;
    cursor: pointer;
}

.actions button:disabled {
    background: var(--bg-lighter);
    color: var(--tx-dimmed);
    cursor: not-allowed;
}
</style>
