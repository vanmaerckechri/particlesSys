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
		this.emitterImpulsionSlider = document.getElementById("ptcSysEmitterImpulsionSlider");

		this.particlesTimeStart;

		this.particlesEngine = 
		{
			mainLoop: null,
			density: 1,
			emitterSpeed: 1,
			emitterImpulsion: 1,
			gravity: 9.8,
			forceX: 0,
			forceY: 0
		}
		this.particles = [];
		// var: frames by sec
		this.frameBySec = 60;
		this.frameBySecTimeStart;
	}

	deleteParticles(particlesToDelete)
	{
		this.particles[particlesToDelete] = null;
		this.particles.splice(particlesToDelete, 1);
	}

	drawParticles(particle)
	{
		this.ctx.beginPath();
		this.ctx.lineWidth = "1";
		this.ctx.strokeStyle = particle["color"];

		particle["posX"] = particle["posX"] + this.particlesEngine["forceX"];
		particle["posY"] = particle["posY"] + this.particlesEngine["forceY"] + this.particlesEngine["gravity"] / 10 + particle["impulsion"];

		if (particle["shape"] == "circle")
		{
			this.ctx.arc(particle["posX"], particle["posY"], particle["size"], 0, Math.PI * 2, true);//(x, y, r, ?)
		}
		else if (particle["shape"] == "square")
		{
			this.ctx.rect(particle["posX"], particle["posY"], particle["size"], particle["size"]);
		}

		this.ctx.stroke();


		// le reste pue => besoin d'une maj connaissances physiques basiques
		if (particle["impulsion"] > 0)
		{
			if (this.particlesEngine["forceX"] != 0)
			{
				particle["impulsion"] = particle["impulsion"] - (particle["impulsion"] / 10);
			}
		}
		else
		{
			particle["impulsion"] = 0;
		}
	}

	listenParticles()
	{
		let particlesToDelete = [];
		let canvasHeight = this.canvas.offsetHeight;
		let canvasWidth = this.canvas.offsetWidth;
		let canvasTop = this.canvas.offsetTop;
		let canvasLeft = this.canvas.offsetLeft;

		for (let i = this.particles.length - 1; i >= 0; i--)
		{
			if (typeof this.particles[i] != "undefined")
			{
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

	createParticles(idEmitterDummy, idBorderLimit)
	{
		let emitterDummy = document.getElementById(idEmitterDummy);
		let borderLimit = document.getElementById(idBorderLimit);

		let ptcSysShape = document.getElementById("ptcSysShape").value;
		let ptcSysSize = document.getElementById("ptcSysSize").value;
		let particlesTimeStartSave = this.particlesTimeStart;
		this.particlesTimeStart = this.countTime(this.particlesTimeStart, this.particlesEngine["emitterSpeed"]);// need to link millisec with emitter speed

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

				let particle = 
				{
					posX: particlePosX,
					posY: particlePosY,
					shape: ptcSysShape,
					color: "black",
					impulsion: this.particlesEngine["emitterImpulsion"],
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
		that.particlesEngine["emitterSpeed"] = parseInt(30000 / that.emitterFrequencySlider.value, 10);
	}

	updateEmitterImpulsion(that)
	{
		let impulsionSliderValue = that.emitterImpulsionSlider.value;
		that.particlesEngine["emitterImpulsion"] = parseInt(impulsionSliderValue, 10) / 10;
	}

	launchMainLoop(that)
	{
		that.ctx.clearRect(0, 0, that.canvas.width, that.canvas.height);
		that.createParticles("ptcSysEmitterDummy", "ptcSysCanvas");
		that.listenParticles();
		that.calculFrameBySec();
		that.particlesEngine["mainLoop"] = window.requestAnimationFrame(that.launchMainLoop.bind(this, that));
	}

	initWind()
	{
		let windDummyImg = createElem("img", ["src", "class"], ["assets/img/arrow.svg","windDummyImg"]);
		let windDummyContainer = createElem("div", ["id", "class"], ["windDummyContainer","windDummyContainer"]);
		windDummyContainer.appendChild(windDummyImg);
		document.getElementById("ptcSysUi").appendChild(windDummyContainer);
		windDummyContainer.style.left = this.canvas.width / 2 + 250 + "px";
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
		emitterDummy.addEventListener("mousedown", this.modifyEmitterDummy.bind(this, "ptcSysEmitterDummy", "ptcSysCanvas"), false);
		this.emitterImpulsionSlider.addEventListener("input", this.updateEmitterImpulsion.bind(this, that), false);

		// Buttons, range sliders, etc.
		this.densitySlider.value = 1;
		this.emitterFrequencySlider.value = 1;
		this.emitterImpulsionSlider.value = 1;

		this.updateEmitterDensity(that);
		this.updateEmitterFrequency(that);

		this.startStopButton.addEventListener("click", this.startStop.bind(this, that), false);
		this.densitySlider.addEventListener("input", this.updateEmitterDensity.bind(this, that), false);
		this.emitterFrequencySlider.addEventListener("input", this.updateEmitterFrequency.bind(this, that), false);
		this.emitterImpulsionSlider.addEventListener("input", this.updateEmitterImpulsion.bind(this, that), false);

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