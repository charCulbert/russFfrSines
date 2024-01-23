<script>
    export let octaves = 2;
    export let middleC = 48;
    export let keysPressed = [];

    import Key from "./Key.svelte";

    const specialKeys = [43, 48, 55]; // Replace with the MIDI numbers of your special keys


    let keys;

    $: keys = [...Array(octaves * 12 + 1).keys()].map(
        (i) => i + (middleC - Math.floor(octaves / 2) * 12)
    );
</script>

<div class="keyboard">
    <div>
        {#each keys as note}
            <Key noteNum={note} on:noteon on:noteoff pressed={keysPressed.includes(note)} specialKey={specialKeys.includes(note)}/>
        {/each}
    </div>
</div>

<style>
    .keyboard {
        display: flex;
        justify-content: center;
    }

    .keyboard > div {
        display: flex;
        overflow: auto;
        padding: 8px;
        height: 192px;
    }
</style>
