<script setup lang="ts">
import { config, chains, useAdapter } from '@/scripts/config';
import { useWalletStore } from '@/stores/wallet';
import { createWeb3Modal } from '@web3modal/wagmi/vue';
import { useWeb3Modal } from '@web3modal/wagmi/vue';
import { watchAccount } from '@wagmi/core';
import { onMounted, watch } from 'vue';
import { Converter } from '@/scripts/converter';
import { useRoute } from 'vue-router';

createWeb3Modal({
    wagmiConfig: config,
    projectId: import.meta.env.VITE_PROJECT_ID,
    // @ts-ignore
    chains: chains,
    enableAnalytics: true,
    themeMode: 'dark'
});

const route = useRoute();
const modal = useWeb3Modal();
const walletStore = useWalletStore();
const { adapter, initAdapter } = useAdapter();

watch(adapter, (newAdapter) => {
    newAdapter?.on('connect', (accounts) => {
        if (accounts.length > 0) {
            walletStore.setIotaAddress(accounts[0].address);
        }
    });

    newAdapter?.on('change', (adapter) => {
        if (adapter.accounts?.length) {
            walletStore.setIotaAddress(adapter.accounts?.[0].address);
        }
    });

    newAdapter?.on('disconnect', () => {
        walletStore.setIotaAddress(null);
    });
});

onMounted(() => {
    initAdapter();
    watchAccount(config, {
        onChange(account) {
            if (account.address) {
                walletStore.setHoleskyAddress(account.address);
            }
        },
    });
});
</script>

<template>
    <section>
        <div class="app_width">
            <header>
                <div class="logo">
                    <h3>Move<span>Call.</span></h3>
                    <p>|</p>
                    <div class="tabs">
                        <RouterLink to="/">
                            <button :class="route.name === 'token-bridge' ? 'tab tab_active' : 'tab'">Token
                                Bridge</button>
                        </RouterLink>
                        <a href="https://github.com/devarogundade/movecall?tab=readme-ov-file#building-a-cross-chain-dapp-message-bridge"
                            target="_blank">
                            <button :class="route.name === 'message-bridge' ? 'tab tab_active' : 'tab'">Message
                                Bridge</button>
                        </a>
                        <RouterLink to="/stake">
                            <button :class="route.name === 'stake' ? 'tab tab_active' : 'tab'">Stake to
                                Earn</button>
                        </RouterLink>
                        <a href="https://github.com/devarogundade/movecall" target="_blank">
                            <button class="tab">Docs</button>
                        </a>
                    </div>

                    <RouterLink to="/ai"><button class="ai">Ask AI</button></RouterLink>
                </div>

                <div class="actions">

                    <button @click="modal.open()">
                        {{ walletStore.holeskyAddress ?
                            Converter.trimAddress(walletStore.holeskyAddress, 4) :
                            'Connect to Holesky'
                        }}
                    </button>

                    <button @click="adapter?.connect()">
                        {{ walletStore.iotaAddress ?
                            Converter.trimAddress(walletStore.iotaAddress, 4) :
                            'Connect to IOTA'
                        }}
                    </button>
                </div>
            </header>
        </div>
    </section>
</template>

<style scoped>
section {
    position: sticky;
    top: 0;
    z-index: 99;
    background: var(--dark);
    border-bottom: 1px solid var(--bg-lightest);
}

header {
    height: 70px;
    display: grid;
    align-items: center;
    grid-template-columns: 1fr auto;
    gap: 40px;
}

.logo {
    display: flex;
    align-items: center;
    gap: 30px;
}

.logo p {
    font-size: 18px;
    font-weight: 500;
    color: var(--tx-dimmed);
}

.logo h3 {
    font-size: 24px;
    font-weight: 500;
    color: var(--tx-normal);
    font-style: italic;
}

.logo h3 span {
    color: var(--primary-light);
    font-style: normal;
}

.tabs {
    display: flex;
    align-items: center;
    gap: 4px;
}

.tab {
    padding: 0 20px;
    height: 36px;
    border-radius: 12px;
    color: var(--tx-semi);
    background: none;
    border: 1px solid transparent;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.tab img {
    width: 16px;
    height: 16px;
}

.tab_active {
    color: var(--tx-normal);
    background: var(--bg-lighter);
    border: 1px solid var(--bg-lightest);
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: 20px;
}

.actions button {
    padding: 0 20px;
    height: 40px;
    border-radius: 8px;
    color: var(--tx-normal);
    background: var(--primary);
    border: 1px solid transparent;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.ai {
    color: var(--tx-normal);
    padding: 14px 20px;
    border-radius: 14px;
    font-size: 16px;
    border: 0;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    cursor: pointer;
    box-shadow: rgba(255, 255, 255, 0.1) -3px -3px 9px inset, rgba(255, 255, 255, 0.15) 0 3px 9px inset, rgba(255, 255, 255, 0.6) 0 1px 1px inset, rgba(0, 0, 0, 0.3) 0 -8px 36px inset, rgba(255, 255, 255, 0.6) 0 1px 5px inset, rgba(0, 0, 0, 0.2) 2px 19px 31px;
    background-color: var(--accent-red);
    background-image: radial-gradient(93% 87% at 87% 89%, rgba(0, 0, 0, .23) 0, transparent 86.18%), radial-gradient(66% 66% at 26% 20%, rgba(255, 255, 255, .55) 0, rgba(255, 255, 255, 0) 69.79%, rgba(255, 255, 255, 0) 100%);
    transition: all 150ms ease-in-out;
}

.ai:hover {
    filter: brightness(1.05);
}

.ai:active {
    transform: scale(.95);
}
</style>