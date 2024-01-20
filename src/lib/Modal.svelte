<script>
    export let show;
    export let onClose;
    import { fade } from 'svelte/transition';


    // Function to close the modal
    function close() {
        if (onClose) {
            onClose();
        }
    }
</script>

{#if show}
<div class="modal" on:click={close} transition:fade={{ duration: 300 }}>
        <h2>Click anywhere to start!</h2>
    </div>
{/if}

<style>
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        z-index: 1000;
    }
</style>
