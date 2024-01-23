<script>
  // @ts-nocheck

  import Keyboard from "./lib/Keyboard.svelte";
  import Modal from "./lib/Modal.svelte";
  import RangeSlider from "svelte-range-slider-pips";
  import RNBO from "@rnbo/js";
  import { MIDIEvent, TimeNow } from "@rnbo/js";
  import Switch from "./lib/Switch.svelte";
  import Options from "./lib/Options.svelte"
  // ----

  let rnboParamSelector;
  let rnboParamFilterOnOff;
  let rnboParamCutoff;
  let rnboParamEnvelope;
  let successMessage = "";

  let showModal = true;

  function closeModal() {
    showModal = false;
  }

  const WAContext = window.AudioContext;
  const context = new WAContext(); // creating the new audio context
  const outputNode = context.createGain(); // creating a gain node
  outputNode.gain.value = 0.35; // Example initial volume, adjust as needed
  outputNode.connect(context.destination); // connecting the gain node to the output of the audio context

  let device;

  const rnboSetup = async () => {
    try {
      //grab the JSON file and access it as json
      let rawPatcher = await fetch("samplerRussSines8.export.json");

      let patcher = await rawPatcher.json();

      device = await RNBO.createDevice({ context, patcher });

      // This connects the device to audio output, but you may still need to call context.resume()
      // from a user-initiated function.
      device.node.connect(outputNode);

      //resume Audio Context on a click on the body
      document.body.onclick = () => context.resume();


      rnboParamSelector = device.parametersById.get("selector");
      rnboParamCutoff = device.parametersById.get("cutoff");
      rnboParamFilterOnOff = device.parametersById.get("filterOnOff");
      rnboParamEnvelope = device.parametersById.get("envelope");
      
    // Default values
    const defaultDuration = "200";
    const defaultPolarity = "Sub";

    // Call changeSample with default values
    changeSample({
      detail: {
        stimulusDuration: defaultDuration,
        stimulusPolarity: defaultPolarity
      }
    });


      console.log("success  RNBO");
    } catch (err) {
      console.error("Error setting up RNBO device:", err);
    }
  };

  rnboSetup();

  function externalMIDIsetup() {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

      function onMIDISuccess(midiAccess) {
        for (var input of midiAccess.inputs.values()) {
          input.onmidimessage = getMIDIMessage;
        }
      }

      function onMIDIFailure() {
        console.error("Could not access your MIDI devices.");
      }

      function getMIDIMessage(message) {
        var command = message.data[0];
        var note = message.data[1];
        var velocity = message.data.length > 2 ? message.data[2] : 0; // a velocity value might not be included with a noteOff command

        if (command === 144) {
          // note on
          if (velocity > 0) {
            noteOn(note, velocity);
          } else {
            noteOff(note);
          }
        } else if (command === 128) {
          // note off
          noteOff(note);
        }
      }

      function noteOn(note, velocity) {
      console.log("Note on:", note, "Velocity:", velocity);

        // Constructing a note-on event
        let midiChannel = 0;
        let noteOnMessage = [
          144 + midiChannel, // Code for a note on: 10010000 & MIDI channel (0-15)
          note, // MIDI Note
          velocity, // MIDI Velocity
        ];

        let midiPort = 0;
        // @ts-ignore
        let noteOnEvent = new MIDIEvent(TimeNow, midiPort, noteOnMessage);
        device.scheduleEvent(noteOnEvent);
        // Handle note on
      }

      function noteOff(note) {
        // Constructing a note-off event
        let midiChannel = 0;
        let noteOffMessage = [
          128 + midiChannel, // Code for a note on: 10010000 & MIDI channel (0-15)
          note, // MIDI Note
          0, // MIDI Velocity
        ];

        let midiPort = 0;
        // @ts-ignore
        let noteOffEvent = new MIDIEvent(TimeNow, midiPort, noteOffMessage);
        device.scheduleEvent(noteOffEvent);
      }
    } else {
      console.log("Web MIDI API not supported!");
    }
  }

  externalMIDIsetup();

  playScale();

  //on screen midi setup

  // keys pressed on other inputs like MIDI, typing keyboard, etc.
  let keysPressed = [];

  function noteOn(event) {
    // Constructing a note-on event
    let midiChannel = 0;
    let pitch = event.detail;
    let noteOnMessage = [
      144 + midiChannel, // Code for a note on: 10010000 & MIDI channel (0-15)
      pitch, // MIDI Note
      100, // MIDI Velocity
    ];

    let midiPort = 0;
    // @ts-ignore
    let noteOnEvent = new MIDIEvent(TimeNow, midiPort, noteOnMessage);
    device.scheduleEvent(noteOnEvent);
  }

  function noteOff(event) {
    // Constructing a note-off event
    let midiChannel = 0;
    let pitch = event.detail;
    let noteOffMessage = [
      128 + midiChannel, // Code for a note on: 10010000 & MIDI channel (0-15)
      pitch, // MIDI Note
      0, // MIDI Velocity
    ];

    let midiPort = 0;
    // @ts-ignore
    let noteOffEvent = new MIDIEvent(TimeNow, midiPort, noteOffMessage);
    device.scheduleEvent(noteOffEvent);
  }

  //startup music stuff

    // Function to play a note
    function playNote(pitch, duration) {
    noteOn({ detail: pitch });
    setTimeout(() => noteOff({ detail: pitch }), duration);
  }

  function playScale() {
  const gDorian = [43, 45, 46, 48, 50, 52, 53, 55, 57, 59, 60, 62, 67];
  const noteDuration = 150; // Duration for each note in milliseconds

  gDorian.forEach((note, index) => {
    setTimeout(() => playNote(note, noteDuration), index * noteDuration);
  });

  // Schedule the final note to play after the last note of the scale
  const totalDuration = gDorian.length * noteDuration;
  setTimeout(() => playNote(43, 500), totalDuration);
}


  // Function to handle the gain slider change event
  function gainValueChange(event) {
    const newGainValue = event.detail.value;
    console.log("gain Slider Value:", newGainValue);

    const rampTime = 0.05; // time in seconds for the ramp
    const currentTime = context.currentTime;
    outputNode.gain.linearRampToValueAtTime(
      newGainValue,
      currentTime + rampTime
    );
  }

  function cutoffValueChange(event) {
    rnboParamCutoff.value = parseFloat(event.detail.value);
  }
  function selectorValueChange(event) {
    console.log(event.detail);
    switch (event.detail) {
      case "russ":
        rnboParamSelector.value = 0;
        break;
      case "sine":
        rnboParamSelector.value = 1;
        break;
    }
  }

  function filterOnOffValueChange(event) {
    switch (event.detail) {
      case "Filter On":
        rnboParamFilterOnOff.value = 2;
        break;
      case "Filter Off":
        rnboParamFilterOnOff.value = 1;
        break;
    }
  }

  function envelopeValueChange(event) {
    console.log(event.detail);
    switch (event.detail) {
      case "Piano Envelope":
        rnboParamEnvelope.value = 0;
        break;
      case "Flat Envelope":
        rnboParamEnvelope.value = 1;
        break;
    }
  }
  

 

const changeSample = async (event) => {
    
  const {stimulusDuration,stimulusPolarity } = event.detail;
  // Construct file names
  console.log(event.detail);
    const fileNames = [
        `media/Russell_G1_${stimulusDuration}_${stimulusPolarity}.wav`,
        `media/Russell_C2_${stimulusDuration}_${stimulusPolarity}.wav`,
        `media/Russell_G2_${stimulusDuration}_${stimulusPolarity}.wav`
    ];
    console.log(fileNames);

    // Buffer names corresponding to each file
    const bufferNames = ["one", "two", "three"];
try {
      // Load each sample and set the DataBuffer on the device
      for (let i = 0; i < fileNames.length; i++) {
        const fileResponse = await fetch(fileNames[i]);
        const arrayBuf = await fileResponse.arrayBuffer();
        const audioBuf = await context.decodeAudioData(arrayBuf);
        await device.setDataBuffer(bufferNames[i], audioBuf);
    }
    successMessage = 'Success! New samples are loaded.';
        setTimeout(() => { successMessage = ''; }, 3000); // Clear message after 3 seconds
    } catch (error) {
        console.error('Error loading samples:', error);
        successMessage = 'Failed to load samples.';
        setTimeout(() => { successMessage = ''; }, 3000);
    }
}



</script>

<svelte:head>
  <title>russelFFRSines</title>
</svelte:head>
<Modal show={showModal} onClose={closeModal} />
<Keyboard octaves={2} on:noteon={noteOn} on:noteoff={noteOff} {keysPressed} />

<div class="range-slider-container">
  <RangeSlider
    id="volumeSlider"
    values={[0.35]}
    min={0}
    max={0.7}
    step={0.01}
    on:change={gainValueChange}
  />
  <label for="volumeSlider">Volume</label>
</div>

<div class="range-slider-container">
  <RangeSlider
    id="cutoffSlider"
    values={[4000]}
    min={20}
    max={8000}
    step={1}
    float
    on:change={cutoffValueChange}
  />
  <label for="cutoffSlider">Filter Cutoff</label>
</div>

<div class="switch-container">
  <Switch
  options={['russ', 'sine']}
  initialChoice={0}
  on:change={selectorValueChange}
  />
</div>

<div class="switch-container">
  <Switch
  options={['Filter Off', 'Filter On']}
  initialChoice={0}
  on:change={filterOnOffValueChange}
  />
</div>

<div class="switch-container">
  <Switch
  options={['Piano Envelope', 'Flat Envelope']}
  initialChoice={0}
  on:change={envelopeValueChange}
  />
</div>

<div class="switch-container">
<Options on:change={changeSample} />
<p class='successMessage'>{successMessage}</p>
</div>



<style>
  /* ... [your existing styles] ... */

  /* Style for the Range Sliders */
  .range-slider-container {
    padding-top: 15px; /* Adds space below each slider */
    width: 100%; /* Adjust this value as needed */
    max-width: 500px; /* Max width for larger screens */
    margin: auto; /* Centers the slider */
  }
  /* Style for the Switches */
  .switch-container {
    margin-top: 20px; /* Adds space above the switch */
    width: 100%; /* Adjust this value as needed */
    max-width: 1280px; /* Max width for larger screens */
    display: block;
    justify-content: center; /* Centers the switch */
  }

  .successMessage {
    position: absolute;
        color: green; /* Or any color you prefer */
        font-weight: bold;
        text-align: center;
        margin-top: 20px;
    }
  
</style>
