/* ************************************ */
/* Define helper functions */
/* ************************************ */

var pavlovia_init = {
	type: "pavlovia",
	command: "init",
	
    };


const pavlovia_finish = {
	type: "pavlovia",
	command: "finish",
	// OPTIONAL: You can add a message to show while data is saving.
	// message: "Please wait while your data is being saved...", 
	// OPTIONAL: specify data format if not 'csv' or 'json' (Pavlovia default)
	// data_format: 'csv', 
};

function assessPerformance() {
	/* Function to calculate the "credit_var", which is a boolean used to
	credit individual experiments in expfactory. */
	var experiment_data = jsPsych.data.getTrialsOfType('poldrack-single-stim')
	var missed_count = 0
	var trial_count = 0
	var rt_array = []
	var rt = 0
	//record choices participants made
	var choice_counts = {}
	choice_counts[-1] = 0
	for (var k = 0; k < choices.length; k++) {
		choice_counts[choices[k]] = 0
	}
	for (var i = 0; i < experiment_data.length; i++) {
		trial_count += 1
		rt = experiment_data[i].rt
		key = experiment_data[i].key_press
		choice_counts[key] += 1
		if (rt == -1) {
			missed_count += 1
		} else {
			rt_array.push(rt)
		}
	}
	//calculate average rt
	var sum = 0
	for (var j = 0; j < rt_array.length; j++) {
		sum += rt_array[j]
	}
	var avg_rt = sum / rt_array.length || -1
		//calculate whether response distribution is okay
	var responses_ok = true
	Object.keys(choice_counts).forEach(function(key, index) {
		if (choice_counts[key] > trial_count * 0.85) {
			responses_ok = false
		}
	})
	var missed_percent = missed_count/trial_count
	credit_var = (missed_percent < 0.4 && avg_rt > 200 && responses_ok)
	jsPsych.data.addDataToLastTrial({"credit_var": credit_var})
}

var getInstructFeedback = function() {
	return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
		'</p></div>'
}

var getTrialLength = function() {
	return Math.floor(Math.random() * 500) + 1750
}

getITI = function() {
	return Math.floor(Math.random() * 500) + 1750
}

/***********************************************
/** Modified JGL
/***********************************************
/**
 * Make a sinusoidal grating. Creates a texture that later needs 
 * to be used with jglCreateTexture. 
 * Note: 0 deg means horizontal grating. 
 * If you want to ramp the grating with 
 * 2D Gaussian, also call function jglMakeGaussian and average the 
 * results of both functions
 * @param {Number} width: in pixels
 * @param {Number} height: in pixels
 * @param {Number} sf: spatial frequency in number of cycles per degree of visual angle
 * @param {Number} angle: in degrees
 * @param {Number} phase: in degrees 
 * @param {Number} pixPerDeg: pixels per degree of visual angle 
 * @memberof module:jglUtils
 */
function jglMakeGrating(width, height, sf, angle, phase, pixPerDeg) {

	// Get sf in number of cycles per pixel
	sfPerPix = sf / pixPerDeg;
	// Convert angle to radians
	angleInRad = ((angle + 0) * Math.PI) / 180;
	// Phase to radians
	phaseInRad = (phase * Math.PI) * 180;

	// Get x and y coordinates for 2D grating
	xStep = 2 * Math.PI / width;
	yStep = 2 * Math.PI / height;
	x = jglMakeArray(-Math.PI, xStep, Math.PI + 1); // to nudge jglMakeArray to include +PI
	y = jglMakeArray(-Math.PI, yStep, Math.PI + 1);
	// To tilt the 2D grating, we need to tilt
	// x and y coordinates. These are tilting constants.
	xTilt = Math.cos(angleInRad) * sf * 2 * Math.PI;
	yTilt = Math.sin(angleInRad) * sf * 2 * Math.PI;

	//What is width and height? Are these in degrees of visual angle or pixels?
	//See how lines2d and dots work. For example, jglFillRect(x, y, size, color) uses size in pixels
	//

	//How does jgl compute size in degress of visual angle
	var ixX, ixY; // x and y indices for arrays
	var grating = []; // 2D array
	for (ixX = 0; ixX < x.length; ixX++) {
		currentY = y[ixY];
		grating[ixX] = [];
		for (ixY = 0; ixY < y.length; ixY++) {
			grating[ixX][ixY] = Math.cos(x[ixX] * xTilt + y[ixY] * yTilt);
			// Scale to grayscale between 0 and 255
			grating[ixX][ixY] = Math.round(((grating[ixX][ixY] + 1) / 2) * 255);
		}
	}
	return (grating);
}



/**
 * Function to make array starting at low,
 * going to high, stepping by step.
 * Note: the last element is not "high" but high-step
 * @param {Number} low The low bound of the array
 * @param {Number} step the step between two elements of the array
 * @param {Number} high the high bound of the array
 */
function jglMakeArray(low, step, high) {
	if (step === undefined) {
		step = 1;
	}
	var size = 0
	var array = []
	if (low < high) {
		size = Math.floor((high - low) / step);
		array = new Array(size);
		array[0] = low;
		for (var i = 1; i < array.length; i++) {
			array[i] = array[i - 1] + step;
		}
		return array;
	} else if (low > high) {
		size = Math.floor((low - high) / step);
		array = new Array(size);
		array[0] = low;
		for (var j = 1; j < array.length; j++) {
			array[j] = array[j - 1] - step;
		}
		return array;
	}
	return [low];
}


function Canvas(id, back_id) {
	this.canvas = document.getElementById(id);
	this.context = this.canvas.getContext("2d"); // main on-screen context
	this.backCanvas = document.getElementById(back_id);
	this.backCtx = this.backCanvas.getContext("2d");
	this.height = $("#canvas").height(); // height of screen
	this.width = $("#canvas").width(); // width of screen
	this.canvas.height = 579
	this.canvas.width = 579
}

function jglCreateTexture(canvas, array, mask, contrast) {

	/* Note on how imageData's work.
	 * ImageDatas are returned from createImageData,
	 * they have an array called data. The data array is
	 * a 1D array with 4 slots per pixel, R,G,B,Alpha. A
	 * greyscale texture is created by making all RGB values
	 * equals and Alpha = 255. The main job of this function
	 * is to translate the given array into this data array.
	 */
	if (!$.isArray(array)) {
		return;
	}
	var image;

	// 2D array passed in
	image = canvas.backCtx.createImageData(array.length, array.length);
	var row = 0;
	var col = 0;
	for (var i = 0; i < image.data.length; i += 4) {
		mask_val = mask[row][col]
		ran_val = Math.random() * 256
		image.data[i + 0] = ran_val * (1 - contrast) + array[row][col] * contrast;
		image.data[i + 1] = ran_val * (1 - contrast) + array[row][col] * contrast;
		image.data[i + 2] = ran_val * (1 - contrast) + array[row][col] * contrast;
		image.data[i + 3] = mask_val;
		col++;
		if (col == array[row].length) {
			col = 0;
			row++;
		}
	}
	return image;
}

/***********************************************
/** Make Gaussian Mask
/***********************************************/

function twoDGaussian(amplitude, x0, y0, sigmaX, sigmaY, x, y) {
	var exponent = -((Math.pow(x - x0, 2) / (2 * Math.pow(sigmaX, 2))) + (Math.pow(y - y0, 2) / (2 *
		Math.pow(sigmaY, 2))));
	return amplitude * Math.pow(Math.E, exponent);
}

function make2dMask(arr, amp, s) {
	var midX = Math.floor(arr.length / 2)
	var midY = Math.floor(arr[0].length / 2)
	var mask = []
	for (var i = 0; i < arr.length; i++) {
		var col = []
		for (var j = 0; j < arr[0].length; j++) {
			col.push(twoDGaussian(amp * 255, midX, midY, s, s, i, j))
		}
		mask.push(col)
	}
	return mask
}

function applyMask(arr, mask) {
	var masked_arr = []
	for (var i = 0; i < arr.length; i++) {
		var col = []
		for (var j = 0; j < arr[0].length; j++) {
			col.push(arr[i][j] * mask[i][j])
		}
		masked_arr.push(col)
	}
	return masked_arr
}

function makeStim(canvas, backcanvas, angle, contrast) {
	var jgl_canvas = new Canvas(canvas, backcanvas)
	var arr = jglMakeGrating(500, 500, 2, angle, 0, 0)
	var mask = make2dMask(arr, 1, 100)
	var drawing = jglCreateTexture(jgl_canvas, arr, mask, contrast)
	jgl_canvas.context.putImageData(drawing, 0, 0)
}

function getStim() {
	var angle = Math.random() * 180
	var sides = jsPsych.randomization.shuffle(['left', 'right'])
	var stim = '<div class = ' + sides[0] + 'box><canvas id = canvas1></canvas></div>' +
		'<div class = ' + sides[1] + 'box><canvas id = canvas2></canvas></div>' +
		'<canvas id = backCanvas1></canvas><canvas id = backCanvas2></canvas>'
	var display_el = jsPsych.getDisplayElement()
	display_el.append($('<div>', {
		html: stim,
		id: 'jspsych-poldrack-single-stim-stimulus'
	}));
	makeStim('canvas1', 'backCanvas1', 0, 0)
	makeStim('canvas2', 'backCanvas2', angle, contrast)
	curr_data.angle = angle
	curr_data.contrast = contrast
	curr_data.reference_side = sides[0]
	correct_response = choices[['left', 'right'].indexOf(sides[1])]
	curr_data.correct_response = correct_response
}

function getEasyStim() {
	var angle = Math.random() * 180
	var sides = jsPsych.randomization.shuffle(['left', 'right'])
	var stim = '<div class = ' + sides[0] + 'box><canvas id = canvas1></canvas></div>' +
		'<div class = ' + sides[1] + 'box><canvas id = canvas2></canvas></div>' +
		'<canvas id = backCanvas1></canvas><canvas id = backCanvas2></canvas>'
	var display_el = jsPsych.getDisplayElement()
	display_el.append($('<div>', {
		html: stim,
		id: 'jspsych-poldrack-single-stim-stimulus'
	}));
	makeStim('canvas1', 'backCanvas1', 0, 0)
	makeStim('canvas2', 'backCanvas2', angle, 0.2)
	curr_data.angle = angle
	curr_data.contrast = contrast
	correct_response = choices[['left', 'right'].indexOf(sides[1])]
	curr_data.correct_response = correct_response
}

var randomDraw = function(lst) {
	var index = Math.floor(Math.random() * (lst.length))
	return lst[index]
}

var post_trial_gap = function() {
	gap = Math.floor(Math.random() * 500) + 750
	return gap;
}

/* Append data */
var appendData = function(data) {
	correct = false
	if (data.key_press == curr_data.correct_response) {
		correct = true
	}
	curr_data.trial_num = current_trial
	curr_data.correct = correct
	jsPsych.data.addDataToLastTrial(curr_data)
	curr_data = {}
	current_trial = current_trial + 1
}

/* Append data and progress staircase*/
var afterTrialUpdate = function(data) {
	correct = false
	if (data.key_press == curr_data.correct_response) {
		correct = true
	}
	curr_data.trial_num = current_trial
	curr_data.correct = correct
	jsPsych.data.addDataToLastTrial(curr_data)
	curr_data = {}
	current_trial = current_trial + 1
	//2 up 1 down staircase
	contrast = 0.2*Math.random()
	/*if (data.key_press != -1) {
		if (correct === false) {
			contrast += 0.005
		} else {
			correct_counter += 1
			if (correct_counter == 2) {
				contrast -= 0.005
				correct_counter = 0
			}
		}
	}*/
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = true

// task specific variables
var practice_len = 5
var exp_len = 5
var contrast = 0.1
var correct_counter = 0
var current_trial = 0
var choices = [37, 39]
var curr_data = {}
var confidence_choices = [49, 50, 51, 52]
var catch_trials = [25, 57, 150, 220, 270]
var confidence_response_area =
	'<div class = centerbox><div class = fixation>+</div></div><div class = response_div>' +
	'<button class = response_button id = Confidence_1>1:<br> Not Confident At All</button>' +
	'<button class = response_button id = Confidence_2>2</button>' +
	'<button class = response_button id = Confidence_3>3</button>' +
	'<button class = response_button id = Confidence_4>4:<br> Very Confident</button>'

var confidence_response_area_key =
	'<div class = centerbox><div class = fixation>+</div></div><div class = response_div>' +
	'<button class = response_button_key id = Confidence_1>1:<br> Not Confident At All</button>' +
	'<button class = response_button_key id = Confidence_2>2</button>' +
	'<button class = response_button_key id = Confidence_3>3</button>' +
	'<button class = response_button_key id = Confidence_4>4:<br> Very Confident</button>'

var stimulusDifferencePerception =
	'<p> About which of the previous two trials were you more certain? </p><p>Press 1 for the first. Press 2 for the second</p>' +
    '<div class = centerbox><div class = fixation>+</div></div><div class = response_div>' +
	'<button class = response_button id = First_trial>1:<br> Not Confident At All</button>' +
	'<button class = response_button id = Second_trial>2</button>' 

var stimulusDifferencePerceptionKey =
    '<div class="centerbox">' + // Ensure text is also centered if desired.
        '<p class="center-block-text">About which of the previous two trials were you more certain?</p>' +
        '<p class="center-block-text">Press 1 for the first. Press 2 for the second.</p>' +
        '<div class="fixation">+</div>' +
    '</div>';


/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
//Set up post task questionnaire
var post_task_block = {
   type: 'survey-text',
   data: {
       trial_id: "post task questions"
   },
   questions: ['<p class = center-block-text style = "font-size: 20px">Please summarize what you were asked to do in this task.</p>',
              '<p class = center-block-text style = "font-size: 20px">Do you have any comments about this task?</p>'],
   rows: [15, 15],
   columns: [60,60]
};

/* define static blocks */
var end_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "end",
		exp_id: 'perceptual_metacognition'
	},
	timing_response: 180000,
	text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <strong>enter</strong> to continue.</p></div>',
	cont_key: [13],
	timing_post_trial: 0,
	on_finish: assessPerformance
};

var feedback_instruct_text =
	'Welcome to the experiment. This experiment should take about 30 minutes. Press <strong>enter</strong> to begin.'
var feedback_instruct_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "instruction"
	},
	cont_key: [13],
	text: getInstructFeedback,
	timing_post_trial: 0,
	timing_response: 180000
};
/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.


var instructions_block = {
    type: 'poldrack-instructions',
    data: {
        trial_id: "instruction"
    },
    pages: [
        // Example new page 1:
        '<div class = centerbox><p class = block-text>In this experiment, you will see two patches of random noise. ' +
        'In one of the patches (either left or right) there will be a faint striped pattern (a grating). ' +
        'Your task is to indicate whether the grating appeared in the <strong>left</strong> or <strong>right</strong> patch using the arrow keys. ' +
        'Keep your eyes on the fixation cross (+) in the middle of the screen, as the patches appear very briefly.</p>' +
        '<p class = block-text>You will perform this task for a pair of trials. After each pair, you will be asked a follow-up question.</p></div>',

        // Example new page 2 (describing the difference perception task):
        '<div class = centerbox><p class = block-text>After each pair of discrimination trials, you will be asked: ' +
        '<strong>"About which of the previous two trials were you more certain?"</strong></p>' +
        '<p class = block-text>You will respond by pressing the <strong>\'1\' key</strong> if you were more certain about the first trial in the pair, ' +
        'or the <strong>\'2\' key</strong> if you were more certain about the second trial in the pair.</p>' +
        '<p class = block-text>We will begin with some practice trials shortly.</p></div>'
    ],
    allow_keys: false,
    show_clickable_nav: true,
    timing_post_trial: 1000
};

// instruction_node remains structurally the same but will use the updated instructions_block
var instruction_node = {
    timeline: [feedback_instruct_block, instructions_block],
    loop_function: function(data) { /* ... your existing loop function ... */ }
};

var instruction_node = {
	timeline: [feedback_instruct_block, instructions_block],
	/* This function defines stopping criteria */
	loop_function: function(data) {
		for (i = 0; i < data.length; i++) {
			if ((data[i].trial_type == 'poldrack-instructions') && (data[i].rt != -1)) {
				rt = data[i].rt
				sumInstructTime = sumInstructTime + rt
			}
		}
		if (sumInstructTime <= instructTimeThresh * 1000) {
			feedback_instruct_text =
				'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <strong>enter</strong> to continue.'
			return true
		} else if (sumInstructTime > instructTimeThresh * 1000) {
			feedback_instruct_text =
				'Done with instructions. Press <strong>enter</strong> to continue.'
			return false
		}
	}
}

var start_test_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "end"
	},
	timing_response: 180000,
	text: '<div class = centerbox><p class = center-block-text>We are done with practice. We will now start the test. This will be identical to the practice - your task is to indicate where the grating is by pressing the arrow keys.</p><p class = center-block-text>Press <strong>enter</strong> to continue.</p></div>',
	cont_key: [13],
	timing_post_trial: 0
};

var fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	timing_stim: 1000,
	timing_response: 1000,
	choices: 'none',
	is_html: true,
	data: {
		trial_id: 'fixation'
	},
	timing_post_trial: 0
}

var test_block = {
	type: 'poldrack-single-stim',
	stimulus: getStim,
	timing_stim: 33,
	response_ends_trial: true,
	is_html: true,
	data: {
		trial_id: "stim",
		exp_stage: "test"
	},
	choices: [37, 39],
	timing_post_trial: 0,
	prompt: '<div class = centerbox><div class = fixation>+</div></div>',
	on_finish: function(data) {
		afterTrialUpdate(data)
	}
};

var easy_block = {
	type: 'poldrack-single-stim',
	stimulus: getEasyStim,
	timing_stim: 33,
	response_ends_trial: true,
	is_html: true,
	data: {
		trial_id: "catch",
		exp_stage: "test"
	},
	choices: [37, 39],
	timing_post_trial: 0,
	prompt: '<div class = centerbox><div class = fixation>+</div></div>',
	on_finish: function(data) {
		appendData(data)
	}
};

//below are two different response options - either button click or key press
var confidence_block = {
	type: 'single-stim-button',
	stimulus: confidence_response_area,
	button_class: 'response_button',
	data: {
		trial_id: 'confidence_rating',
		exp_stage: 'test'
	},
	//timing_stim: 4000,
	//timing_response: 4000,
	response_ends_trial: true,
	timing_post_trial: 0,
    on_finish: function(data) {
        console.log("data.BUTTONkey_press: " + data.key_press)
    }
}

var confidence_key_block = {
	type: 'poldrack-single-stim',
	stimulus: confidence_response_area_key,
	choices: confidence_choices,
	data: {
		trial_id: 'confidence_rating',
		exp_stage: 'test'
	},
	is_html: true,
	//timing_stim: 4000,
	//timing_response: 4000,
	response_ends_trial: true,
	timing_post_trial: 0,
	on_finish: function(data) {
		var index = confidence_choices.indexOf(data.key_press)
		jsPsych.data.addDataToLastTrial({confidence: 'confidence_' + (index+1)})
	}
}

//below are two different response options - either button click or key press
/*var differencePerception = {
	type: 'single-stim-button',
	stimulus: stimulusDifferencePerception,
	button_class: 'response_button',
	data: {
		trial_id: 'difference_rating',
		exp_stage: 'test'
	},
	timing_stim: 4000,
	timing_response: 4000,
	response_ends_trial: true,
	timing_post_trial: 0,
    on_finish: function(data) {
        console.log("data.BUTTONkey_press: " + data.key_press)
    }
}*/

var differencePerception_key = {
    type: 'poldrack-single-stim',
    // Assuming your choices parameter is now something like [49, 50] or ['1', '2']
    // If data.key_press is giving you keyCodes (like 50), using [49, 50] for choices is clear.
    choices: [49, 50], // Or ['1', '2'] if that also results in data.key_press being a keyCode
    stimulus: stimulusDifferencePerceptionKey,
    data: {
        trial_id: 'difference_rating',
        exp_stage: 'test'
    },
    is_html: true,
    //timing_stim: 4000,
    //timing_response: 4000,
    response_ends_trial: true,
    timing_post_trial: 0,
    on_finish: function(data) {
        var keyPressedCode = data.key_press; // This is the keyCode, e.g., 49 for '1', 50 for '2'
        var participantSemanticResponse;

        // Map the keyCode to your semantic response values (1 or 2)
        if (keyPressedCode == 49) { // '1' key was pressed
            participantSemanticResponse = 1;
        } else if (keyPressedCode == 50) { // '2' key was pressed
            participantSemanticResponse = 2;
        } else {
            // Handle cases where no valid key was pressed or an unexpected keyCode appears
            participantSemanticResponse = undefined; // Or -1, or however you want to note an invalid/missing response
        }

        var priorData = jsPsych.data.getData();
        // Ensure these indices are correct for your full experiment structure.
        // For [fixation, test, test, difference_perception], length-2 and length-3 are correct.
        var lastDataEntryContrast = priorData[priorData.length-2]['contrast'];
        var secondToLastDataEntryContrast = priorData[priorData.length-3]['contrast'];

        var actualMoreDifference = null; // This will be 1 or 2 (semantic)
        if (lastDataEntryContrast > secondToLastDataEntryContrast) {
            actualMoreDifference = 2; // Higher contrast in the second trial (T2) -> should choose 2
        } else {
            actualMoreDifference = 1; // Higher or equal contrast in the first trial (T1) -> should choose 1
        }
        
        var clickedCorrectDifference = false;
        if (participantSemanticResponse !== undefined) {
            clickedCorrectDifference = (participantSemanticResponse == actualMoreDifference);
        }

        // Updated console logs for clarity
        console.log("Last Data Contrast (T2): " + lastDataEntryContrast);
        console.log("Second to Last Data Contrast (T1): " + secondToLastDataEntryContrast);
        console.log("Actual More Difference (Correct Semantic Choice): " + actualMoreDifference);
        console.log("Key Pressed Code (from data.key_press): " + keyPressedCode);
        console.log("Participant's Semantic Response: " + participantSemanticResponse);
        console.log("Clicked Correct Difference: " + clickedCorrectDifference);

        jsPsych.data.addDataToLastTrial({
            correctDifferenceConfidence: clickedCorrectDifference,
            participantSemanticResponse: participantSemanticResponse, // Good to save this
            actualMoreDifference: actualMoreDifference, // And this for easier checking
            keyPressedCode: keyPressedCode // And the raw key code
        });
    }
};

//participants evaluate the difference between their control of the previous two tests
var differencePerception = {
    type: "html-keyboard-response",
    stimulus: `
    <p> About which of the previous two trials were you more certain? </p><p>Press 1 for the first. Press 2 for the second</p>
        `,
    choices: ['1', '2'],
    data: {
        correct_response: function(){
            var priorData = jsPsych.data.get().filter({exp_stage: 'test'}).values()
            // check what this spits out
            lastDataEntry = priorData[priorData.length-1]
            secondToLastDataEntry = priorData[priorData.length-2]
            console.log("lastDataEntry: " + lastDataEntry);
            console.log("secondToLastDataEntry: " + secondToLastDataEntry);
            //for (let key in priorData) {
              //  console.log(key + ": ", priorData[key]);
            //}
            
            if (firstDifference>secondDifference){
                return '1'
            }
            else{
                return '2'
                
            }
        
        
        },
        test_part: 'perceived_difference'
    },
    on_finish: function(data){
        data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response);
        console.log("data.correct: " + data.correct)
    }
};

/* create experiment definition array */
var perceptual_metacognition_experiment = [];
perceptual_metacognition_experiment.push(pavlovia_init);

perceptual_metacognition_experiment.push(instruction_node);

for (var i = 0; i < practice_len; i++) {
	perceptual_metacognition_experiment.push(fixation_block);
	perceptual_metacognition_experiment.push(easy_block);
	perceptual_metacognition_experiment.push(easy_block);
	perceptual_metacognition_experiment.push(differencePerception_key);
	// perceptual_metacognition_experiment.push(confidence_key_block);
}
perceptual_metacognition_experiment.push(start_test_block)
for (var i = 0; i < exp_len; i++) {
	perceptual_metacognition_experiment.push(fixation_block);
	if (jQuery.inArray(i,catch_trials) !== -1) {
		perceptual_metacognition_experiment.push(easy_block)
		perceptual_metacognition_experiment.push(easy_block)
		perceptual_metacognition_experiment.push(differencePerception_key);

	} else {
		perceptual_metacognition_experiment.push(test_block);
		perceptual_metacognition_experiment.push(test_block);
		perceptual_metacognition_experiment.push(differencePerception_key);

	}
	//perceptual_metacognition_experiment.push(confidence_key_block);
}
perceptual_metacognition_experiment.push(post_task_block)
perceptual_metacognition_experiment.push(end_block);
perceptual_metacognition_experiment.push(pavlovia_finish);

console.log(jsPsych.version);





//var perceptual_metacognition_experiment = [fixation_block, test_block, test_block]