"use strict";

// -- TOOLS --
let createElem = function(createType, attributeType, attributeValue)
{
	let element = document.createElement(createType);
	if (Array.isArray(attributeType) && Array.isArray(attributeValue))
	{
		if (attributeType.length == attributeValue.length)
		{
			for (let i = attributeType.length - 1; i >= 0; i--)
			{
				element.setAttribute(attributeType[i], attributeValue[i]);
			}
			return element;
		}
		else
		{
			console.log("attributeType.length != attributeValue.length");
			return;
		}
	}
	if (typeof attributeType == "string" && typeof attributeValue == "string")
	{
		element.setAttribute(attributeType, attributeValue);
		return element;		
	}
	else
	{
		console.log("attributeType = "+ typeof attributeType);
		console.log("attributeValue = "+typeof attributeValue);				
	}
};

// -- PARTICLES SYSTEM OBJECT --
let PtcSys = class
{
	constructor()
	{
		this.canvas = document.getElementById("ptcSysCanvas");
		this.ctx = this.canvas.getContext("2d");

		this.mousePosX = 0;
		this.mousePosY = 0;

		this.startStopButton = document.getElementById("ptcSysStartStopButton");
		this.densitySlider = document.getElementById("ptcSysDensitySlider");
		this.emitterFrequencySlider = document.getElementById("ptcSysEmitterFrequencySlider");
		this.emitterInitialSpeedSlider = document.getElementById("ptcSysEmitterInitialSpeedSlider");
		this.emitterAngleSlider = document.getElementById("ptcSysEmitterAngleSlider");

		this.particlesTimeStart;

		this.particlesEngine = 
		{
			mainLoop: null,
			density: 1,
			emitterAngle: -45,
			emitterBirthFrenquency: 1,
			emitterInitialSpeed: 1,
			gravity: -0.98,
			forceX: 0,
			forceY: 0
		}
		this.particles = [];
		// var: frames by sec
		this.frameBySec = 60;
		this.frameBySecTimeStart;
	}

	countTime(timeStart, milliSec)
	{
		let currentTime = new Date().getTime();

		if ((currentTime - timeStart) >= milliSec || typeof timeStart == "undefined")
		{
			return new Date().getTime();
		}
		else
		{
			return timeStart;
		}
	}

	calculFrameBySec()
	{
		let frameBySecTimeStart = this.frameBySecTimeStart;
		this.frameBySecTimeStart = this.countTime(this.frameBySecTimeStart, 1000);
		if (frameBySecTimeStart != this.frameBySecTimeStart)
		{
			console.log(this.frameBySec);
			this.frameBySec = 0;
		}
		this.frameBySec += 1;
	}

	deleteParticles(particlesToDelete)
	{
		this.particles[particlesToDelete] = null;
		this.particles.splice(particlesToDelete, 1);
	}

	getParabolicTrajectory(gravity, particle)
	{
		let oldBirthDate = particle["birthDate"];
		particle["birthDate"] = this.countTime(particle["birthDate"], 100);
		if (oldBirthDate != particle["birthDate"])
		{
			particle["age"] += 1;
			particle["posX"] = particle["initialSpeedX"] * particle["age"] + particle["initialPosX"];
			particle["posY"] = (-0.5 * gravity) * Math.pow(particle["age"], 2) + (particle["initialSpeedY"] * particle["age"] + particle["initialPosY"]);
		}
	}

	drawParticles(particle)
	{
		this.ctx.beginPath();
		this.ctx.lineWidth = "1";
		this.ctx.strokeStyle = particle["color"];

		if (particle["shape"] == "circle")
		{
			this.ctx.arc(particle["posX"], particle["posY"], particle["size"], 0, Math.PI * 2, true);//(x, y, r, ?)
		}
		else if (particle["shape"] == "square")
		{
			this.ctx.rect(particle["posX"], particle["posY"], particle["size"], particle["size"]);
		}

		this.ctx.stroke();
	}

	listenParticles()
	{
		let gravity = this.particlesEngine["gravity"];
		let canvas = document.getElementById("ptcSysCanvas");
		let canvasHeight = canvas.offsetHeight;
		let canvasWidth = canvas.offsetWidth;
		let canvasTop = canvas.offsetTop;
		let canvasLeft = canvas.offsetLeft;

		for (let i = this.particles.length - 1; i >= 0; i--)
		{
			if (typeof this.particles[i] != "undefined")
			{
				// particle posX posY age + 1
				this.getParabolicTrajectory(gravity, this.particles[i])
				// draw
				this.drawParticles(this.particles[i]);
				// delete particle(s)
				if (this.particles[i]["posY"] < canvasTop - 100 || this.particles[i]["posY"] > canvasHeight + 100 || this.particles[i]["posX"] < -100 || this.particles[i]["posX"] > canvasWidth + 100)
				{
					this.deleteParticles(i);
				}
			}
		}
	}

	createParticles(idEmitterDummy, idBorderLimit)
	{
		let emitterDummy = document.getElementById(idEmitterDummy);
		let borderLimit = document.getElementById(idBorderLimit);

		let ptcSysShape = document.getElementById("ptcSysShape").value;
		let ptcSysSize = document.getElementById("ptcSysSize").value;
		let particlesTimeStartSave = this.particlesTimeStart;
		this.particlesTimeStart = this.countTime(this.particlesTimeStart, this.particlesEngine["emitterBirthFrenquency"]);// need to link millisec with emitter speed

		if (particlesTimeStartSave != this.particlesTimeStart)
		{
			// create
			let widthPart = emitterDummy.offsetWidth / this.particlesEngine["density"];
			let currentWidthPart = 0;
			for (let i = this.particlesEngine["density"] - 1; i >= 0; i--)
			{
				let widthStart = Math.round(currentWidthPart * widthPart);
				let widthEnd = Math.round((currentWidthPart * widthPart) + widthPart);
				let particlePosX = (emitterDummy.offsetLeft - borderLimit.offsetLeft)  + Math.random() * (widthEnd - widthStart) + widthStart;

				let emitterDummyTop = emitterDummy.offsetTop;
				let emitterDummyBottom = emitterDummyTop + emitterDummy.offsetHeight;
				let particlePosY = borderLimit.offsetTop + Math.random() * (emitterDummyBottom - emitterDummyTop) + emitterDummyTop;

				let initialAngle = this.particlesEngine["emitterAngle"] * Math.PI / 180.0;//angle => radian
				let inistialSpeedX = this.particlesEngine["emitterInitialSpeed"] * Math.cos(initialAngle);
				let inistialSpeedY = this.particlesEngine["emitterInitialSpeed"] * Math.sin(initialAngle);
				let particle = 
				{
					birthDate: new Date().getTime(),
					age: 0,
					initialSpeedX: inistialSpeedX,
					initialSpeedY: inistialSpeedY,
					initialAngle: initialAngle,
					initialPosX: particlePosX,
					initialPosY: particlePosY,
					posX: particlePosX,
					posY: particlePosY,
					shape: ptcSysShape,
					color: "black",
					size: ptcSysSize
				}
				this.particles.push(particle);
				currentWidthPart += 1;
			}
		}
	}
	// EMITTER

	modifyEmitterDummy(idElemToModify, idBorderLimit, event)
	{
		let borderLimit = document.getElementById(idBorderLimit);
		let borderLimitWidth = borderLimit.offsetWidth;
		let borderLimitLeft = borderLimit.offsetLeft;
		let borderLimitRight = borderLimitLeft + borderLimitWidth;
		let borderLimitTop = borderLimit.offsetTop;
		let borderLimitBottom = borderLimitTop + borderLimit.offsetHeight;

		let elemToModify = document.getElementById(idElemToModify);
		let elemToModifyWidth = elemToModify.offsetWidth;
		let elemToModifyHeight = elemToModify.offsetHeight;
		let elemToModifyLeft = elemToModify.offsetLeft;
		let elemToModifyTop = elemToModify.offsetTop;
		let elemToModifyBottom = elemToModifyTop + elemToModify.offsetHeight;
		let elemToModifyRight = elemToModifyLeft + elemToModify.offsetWidth;

		let mouseX = event.clientX;
		let mouseY = event.clientY;
		
		elemToModify.style.position = "absolute";
		// RESIZE
		// resize by left side		
		if (mouseX < elemToModifyLeft + 10 && mouseY > elemToModifyTop + 10 && mouseY < elemToModifyBottom - 10)
		{
			document.body.style.cursor = "col-resize";
			document.body.onmousemove = function(event)
			{
				mouseX = event.clientX
				if (mouseX > borderLimitLeft && mouseX < elemToModifyRight - 10)
				{				
					elemToModify.style.left = mouseX + "px";
					elemToModify.style.width = elemToModifyWidth - (elemToModify.offsetLeft - elemToModifyLeft) + "px";
				}
			}
		}
		// resize by right side
		else if (mouseX > elemToModifyRight - 10 && mouseY > elemToModifyTop + 10 && mouseY < elemToModifyBottom - 10)
		{
			document.body.style.cursor = "col-resize";
			document.body.onmousemove = function(event)
			{
				mouseX = event.clientX
				if (mouseX < borderLimitRight && mouseX > elemToModifyLeft + 10)
				{		
					elemToModify.style.width = mouseX - elemToModifyLeft + "px";
				}
			}
		}
		// resize by top side
		else if (mouseY < elemToModifyTop + 10 && mouseX > elemToModifyLeft + 10 && mouseX < elemToModifyRight - 10)
		{
			document.body.style.cursor = "row-resize";
			document.body.onmousemove = function(event)
			{
				mouseY = event.clientY
				if (mouseY > borderLimitTop && mouseY < elemToModifyBottom - 10)
				{	
					elemToModify.style.top = mouseY + "px";
					elemToModify.style.height = elemToModifyHeight - (elemToModify.offsetTop - elemToModifyTop) + "px";
				}
			}
		}
		// resize by bottom side
		else if (mouseY > elemToModifyBottom - 10 && mouseX > elemToModifyLeft + 10 && mouseX < elemToModifyRight - 10)
		{
			document.body.style.cursor = "row-resize";
			document.body.onmousemove = function(event)
			{
				mouseY = event.clientY
				if (mouseY < borderLimitBottom && mouseY > elemToModifyTop + 10)
				{	
					elemToModify.style.height = mouseY - elemToModifyTop + "px";
				}
			}
		}
		// DRAG AND DROP
		else
		{
			let deltaX = false;
			let deltaY = false;
			document.body.style.cursor = "move";
			document.body.onmousemove = function(event)
			{

				mouseX = event.clientX;
				mouseY = event.clientY;

				deltaX = deltaX == false ? mouseX - elemToModifyLeft : deltaX;
				deltaY = deltaY == false ? mouseY - elemToModifyTop : deltaY;

				let elemToModifyNewLeft = mouseX - deltaX;
				let elemToModifyNewTop = mouseY - deltaY;
				let elemToModifyNewBottom = elemToModifyNewTop + elemToModify.offsetHeight;
				let elemToModifyNewRight = elemToModifyNewLeft + elemToModify.offsetWidth;

				if (elemToModifyNewLeft > borderLimitLeft && elemToModifyNewRight < borderLimitRight)
				{
					elemToModify.style.left = elemToModifyNewLeft + "px";
				}
				else
				{
					elemToModifyLeft = elemToModify.offsetLeft;
					deltaX = false;
				}
				if (elemToModifyNewTop > borderLimitTop && elemToModifyNewBottom < borderLimitBottom)
				{
					elemToModify.style.top = elemToModifyNewTop + "px";
				}
				else
				{
					elemToModifyTop = elemToModify.offsetTop;
					deltaY = false;
				}
			}
		}
		document.onmouseup = function()
		{
			document.body.onmousemove = null;
			document.onmouseup = null;
			document.body.style.cursor = "";
		}
	}

	launchMainLoop(that)
	{
		that.ctx.clearRect(0, 0, that.canvas.width, that.canvas.height);
		that.createParticles("ptcSysEmitterDummy", "ptcSysCanvas");
		that.listenParticles();
		that.calculFrameBySec();
		that.particlesEngine["mainLoop"] = window.requestAnimationFrame(that.launchMainLoop.bind(this, that));
	}

	stopMainLoop(that)
	{
		window.cancelAnimationFrame(that.particlesEngine["mainLoop"]);
	}

	startStop(that)
	{
		if (that.startStopButton.innerText == "start")
		{
			that.startStopButton.innerText = "stop";
			that.launchMainLoop(that);
		}
		else
		{
			that.startStopButton.innerText = "start";	
			that.stopMainLoop(that);
		}
	}

	initEmitterDummy()
	{
		let emitterDummy = createElem("div", ["id", "class"], ["ptcSysEmitterDummy","ptcSysEmitterDummy"]);
		document.getElementById("ptcSysUi").appendChild(emitterDummy);
		return emitterDummy;
	}

	updateEmitterDensity(that)
	{
		let densitySliderValue = that.densitySlider.value;
		that.particlesEngine["density"] = parseInt(densitySliderValue, 10) + 1;
	}

	updateEmitterFrequency(that)
	{
		that.particlesEngine["emitterBirthFrenquency"] = parseInt(3000 / that.emitterFrequencySlider.value, 10);
	}

	updateEmitterInitialSpeed(that)
	{
		let emitterInitialSpeedSlider = that.emitterInitialSpeedSlider.value;
		that.particlesEngine["emitterInitialSpeed"] = parseInt(emitterInitialSpeedSlider, 10) / 2;
	}

	updateEmitterAngle(that)
	{
		let emitterAngleSlider = that.emitterAngleSlider.value;
		document.getElementById("ptcSysEmitterAngleOrientation").style.transform = "translate(0, -50%) rotateZ("+emitterAngleSlider+"deg)";
		that.particlesEngine["emitterAngle"] = parseInt(emitterAngleSlider, 10);		
	}

	updateGravity(that)
	{
		let ptcSysGravity = document.getElementById("ptcSysGravity").value;
		that.particlesEngine["gravity"] = -0.1 * parseInt(ptcSysGravity, 10);		
	}

	updateCanvasSize(that)
	{
		that.canvas.width = window.innerWidth - document.getElementById("ptcSysUi").offsetWidth;
		that.canvas.height = window.innerHeight;
		that.particles = [];
	}

	init()
	{
		let that = this;
		// Emitter
		let emitterDummy = this.initEmitterDummy();
		let gravitySlider = document.getElementById("ptcSysGravity");
		emitterDummy.addEventListener("mousedown", this.modifyEmitterDummy.bind(this, "ptcSysEmitterDummy", "ptcSysCanvas"), false);

		// Buttons, range sliders, etc.
		this.densitySlider.value = 1;
		this.emitterFrequencySlider.value = 1;
		this.emitterInitialSpeedSlider.value = 1;
		this.emitterAngleSlider.value = 0;
		gravitySlider.value = 9.8;

		this.updateEmitterDensity(that);
		this.updateEmitterFrequency(that);
		this.updateEmitterAngle(that);
		this.updateGravity(that);

		this.startStopButton.addEventListener("click", this.startStop.bind(this, that), false);
		this.densitySlider.addEventListener("input", this.updateEmitterDensity.bind(this, that), false);
		this.emitterFrequencySlider.addEventListener("input", this.updateEmitterFrequency.bind(this, that), false);
		this.emitterInitialSpeedSlider.addEventListener("input", this.updateEmitterInitialSpeed.bind(this, that), false);
		this.emitterAngleSlider.addEventListener("input", this.updateEmitterAngle.bind(this, that), false);

		gravitySlider.addEventListener("input", this.updateGravity.bind(this, that), false);

		// Resize...
		this.updateCanvasSize(that);
		window.addEventListener("resize", this.updateCanvasSize.bind(this, that), false);
	}
};

/*window.addEventListener("load", function()
{*/
		let ptcSys = new PtcSys();
		ptcSys.init();
//});