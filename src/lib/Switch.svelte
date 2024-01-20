<script>
    import { createEventDispatcher } from 'svelte';
  
    export let options = []; // Expects an array like ['off', 'on', 'auto']
    export let initialChoice = 0; // Index of the initial choice in the options array
    export let value = options[initialChoice] || options[0]; // Set initial value
  
    const dispatch = createEventDispatcher();
  
    function selectOption(selectedValue) {
      value = selectedValue;
      dispatch('change', value);
    }
  </script>
  
  <div class="s s--inner">
    {#each options as option, index}
      <button
        role="switch"
        class:selected={option === value}
        on:click={() => selectOption(option)}>
        {option}
      </button>
    {/each}
  </div>
  
  <style>
    :root {
      --accent-color: #30a2a7; /* Teal for selection */
    }
  
    .s--inner {
      display: flex;
      width: 100%;
      overflow: hidden;
    }
  
    .s--inner button {
      flex: 1;
      padding: 0.5em;
      background: lightgrey; /* Very light grey for button background */
      border: none;
      color: #191818; /* Darker grey for non-selected text */
      font-size: 1rem;
      text-align: center;
      transition: background-color 0.3s;
    }
  
    .s--inner button.selected {
      background-color: var(--accent-color);
      color: #ffffff; /* White text for better readability on accent color */
    }
  
    .s--inner button:focus {
      outline: var(--accent-color) solid 1px;
    }
  </style>
  