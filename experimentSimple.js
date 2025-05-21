// In experiment.js

// Define a simple test trial (assuming you have jspsych-html-keyboard-response.js loaded)
var test_trial_1 = {
    type: 'html-keyboard-response',
    stimulus: '<p>If you see this, jsPsych and the html-keyboard-response plugin are working!</p><p>Press any key to continue.</p>',
    choices: 'ALL_KEYS'
};

// Define another simple test trial using a different common plugin
var test_trial_2 = {
    type: 'text', // Assuming you have jspsych-text.js loaded
    text: '<p>This is a text trial. Press any key.</p>',
    choices: 'ALL_KEYS'
};


// Define your core timeline for testing
var perceptual_metacognition_experiment = [];

// Add only the simple test trials for now
perceptual_metacognition_experiment.push(test_trial_1);
perceptual_metacognition_experiment.push(test_trial_2);

// ********* IMPORTANT: Make sure these are commented out for this test *********
// perceptual_metacognition_experiment.push(pavlovia_init);
// perceptual_metacognition_experiment.push(instruction_node);
// for (var i = 0; i < practice_len; i++) { /* ... */ }
// perceptual_metacognition_experiment.push(pavlovia_finish);


// Your jsPsych.init call
jsPsych.init({
    timeline: perceptual_metacognition_experiment,
    fullscreen: true,
    // Comment out on_trial_finish for this test, as it might rely on poldrack_utils
    // on_trial_finish: function(data) {
    //     if (typeof addID === 'function') {
    //         addID('perceptual-metacognition');
    //     } else {
    //         console.warn("addID function not found. Ensure poldrack_utils.js is loaded and addID is global.");
    //     }
    // },
    on_finish: function() {
        // Check if jsPsych is truly loaded and its version
        if (typeof jsPsych !== 'undefined' && jsPsych.version) {
            console.log("jsPsych Version on Finish:", jsPsych.version());
        } else {
            console.log("jsPsych object not fully defined on finish.");
        }
        document.body.innerHTML = '<p>Experiment finished. Check console for logs.</p>';
    }
});

// You might also comment out the `$(document).ready(function() { ... });` wrapper
// if your original experiment.js was wrapped in it, just to simplify execution.
// For now, let's assume it's just the jsPsych.init call directly.