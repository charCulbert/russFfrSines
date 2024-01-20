<script>
  import { createEventDispatcher } from "svelte";
  let time = "500"; // Default
  let option = "Sub"; // Default

  const dispatch =  createEventDispatcher();

  // You can handle the change of each toggle using functions or inline in the markup
  function handleTimeChange(newTime) {
    time = newTime;
  }

  function handleOptionChange(newOption) {
    option = newOption;
  }

  // Dispatch event when either time or option changes
  $: if (time && option) {
    dispatch("change", { stimulusDuration: time, stimulusPolarity: option });  }
</script>

<!-- Millisecond Toggle Group -->
<div class="toggle-group">
  <button
    on:click={() => handleTimeChange("200")}
    class:selected={time === "200"}>200ms</button
  >
  <button
    on:click={() => handleTimeChange("500")}
    class:selected={time === "500"}>500ms</button
  >
</div>

<!-- Polarity Toggle Group -->
<div class="toggle-group">
  <button
    on:click={() => handleOptionChange("Add")}
    class:selected={option === "Add"}>Add</button
  >
  <button
    on:click={() => handleOptionChange("Sub")}
    class:selected={option === "Sub"}>Sub</button
  >
  <button
    on:click={() => handleOptionChange("A")}
    class:selected={option === "A"}>A</button
  >
  <button
    on:click={() => handleOptionChange("B")}
    class:selected={option === "B"}>B</button
  >
</div>

<!-- Display Output -->

<style>
    :root {
      --accent-color: #30a2a7; /* Teal for selection */
    }
  
    .toggle-group {
      display: flex;
      width: 100%; /* Ensure group takes full width */
      justify-content: stretch; /* Stretch the buttons to fill the container */
      margin-bottom: 10px;
    }
  
    .toggle-group button {
      flex: 1; /* Make each button take equal space */
      padding: 0.5em;
      background: lightgrey; /* Very light grey for button background */
      border: none;
      color: #191818; /* Darker grey for non-selected text */
      font-size: 1rem;
      text-align: center;
      transition: background-color 0.3s;
    }
  
    .toggle-group button.selected {
      background-color: var(--accent-color);
      color: #ffffff; /* White text for better readability on accent color */
    }
  
    .toggle-group button:focus {
      outline: var(--accent-color) solid 1px;
    }
  </style>