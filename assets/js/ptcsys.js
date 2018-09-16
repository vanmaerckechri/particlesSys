"use strict";

/*// -- TOOLS --
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
};*/

// -- PARTICLES SYSTEM OBJECT --
let PtcSys = class
{
	constructor()
	{
		this.canvas = document.getElementById("ptcSysCanvas");
		this.ctx = this.canvas.getContext("2d");

		this.startStopButton = document.getElementById("ptcSysStartStopButton");
		this.densitySlider = document.getElementById("ptcSysDensitySlider");
		this.emitterSpeedSlider = document.getElementById("ptcSysEmitterSpeedSlider");
		this.emitterSpeedDisplayValue = document.getElementById("ptcSysEmitterSpeedValue");
		this.densityDisplayValue = document.getElementById("ptcSysDensityValue");

		this.particlesTimeStart;

		this.particlesEngine = 
		{
			mainLoop: null,
			density: 1,
			emitterSpeed: 1,
			gravity: 9.8
		}
		this.particles = [];
		// var: frames by sec
		this.frameBySec = 60;
		this.frameBySecTimeStart;
	}

	deleteParticles(particlesToDelete)
	{
		particlesToDelete = typeof particlesToDelete == "number" ? [particlesToDelete] : particlesToDelete;

		if (particlesToDelete.length != 0)
		{
			for (let i = particlesToDelete.length - 1; i >= 0; i--)
			{
				this.particles[particlesToDelete[i]] = null;
				this.particles.splice(particlesToDelete[i], 1);
			}
		}
	}

	drawCanvasLimits()
	{
		let actifCanvasWidth = this.canvas.width - 100;
		let actifCanvasHeight = this.canvas.height - 100;

		this.ctx.beginPath();
		this.ctx.lineWidth = "1";
		this.ctx.strokeStyle = "black";
		this.ctx.rect(50, 50, actifCanvasWidth, actifCanvasHeight);	
		this.ctx.stroke();	
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
		particle["posY"] += particle["gravity"] / 10;
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
				// list particles to delete
				if (this.particles[i]["posY"] < canvasTop - 100 || this.particles[i]["posY"] > canvasHeight + 100 || this.particles[i]["posX"] < -100 || this.particles[i]["posX"] > canvasWidth + 100)
				{
					particlesToDelete.push(i);
				}
			}
		}
		// delete particle(s)
		this.deleteParticles(particlesToDelete);
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

	createParticles()
	{
		let ptcSysShape = document.getElementById("ptcSysShape").value;
		let ptcSysSize = document.getElementById("ptcSysSize").value;
		let particlesTimeStartSave = this.particlesTimeStart;
		this.particlesTimeStart = this.countTime(this.particlesTimeStart, this.particlesEngine["emitterSpeed"]);// need to link millisec with emitter speed

		if (particlesTimeStartSave != this.particlesTimeStart)
		{
			// create
			let widthPart = this.canvas.width / this.particlesEngine["density"];
			let currentWidthPart = 0;
			for (let i = this.particlesEngine["density"] - 1; i >= 0; i--)
			{
				let particle = 
				{
					posX: 0,
					posY: 0,
					shape: "",
					color: "black",
					size: 1,
					gravity: this.particlesEngine["gravity"]
				}
				// shape
				particle["shape"] = ptcSysShape;
				particle["size"] = ptcSysSize;
				// position
				let widthStart = Math.round(currentWidthPart * widthPart);
				let widthEnd = Math.round((currentWidthPart * widthPart) + widthPart);
				particle["posX"] = Math.random() * (widthEnd - widthStart) + widthStart;

				this.particles.push(particle);
				currentWidthPart += 1;
			}
		}
	}

	updateDensity(that)
	{
		let canvasWidth = that.canvas.width;
		let densitySliderValue = that.densitySlider.value;
		
		that.particlesEngine["density"] = parseInt(densitySliderValue / 2, 10);
		that.densityDisplayValue.innerText = densitySliderValue;
	}

	updateEmitterSpeed(that)
	{
		that.particlesEngine["emitterSpeed"] = parseInt(30000 / that.emitterSpeedSlider.value, 10);
		that.emitterSpeedDisplayValue.innerText = that.emitterSpeedSlider.value;
	}

	launchMainLoop(that)
	{
		that.ctx.clearRect(0, 0, that.canvas.width, that.canvas.height);
		that.createParticles();
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

	updateCanvasSize(that)
	{
		let ptcSysActiveZoneCanvas = document.getElementById("ptcSysActiveZoneCanvas");

		that.canvas.width = window.innerWidth - document.getElementById("ptcSysUi").offsetWidth;
		that.canvas.height = window.innerHeight;
		that.particles = [];
	}

	init()
	{
		let that = this;
		this.updateCanvasSize(that);

		this.densitySlider.value = 1;
		this.emitterSpeedSlider.value = 1;
		this.updateDensity(that);
		this.updateEmitterSpeed(that);

		this.startStopButton.addEventListener("click", this.startStop.bind(this, that), false);
		this.densitySlider.addEventListener("input", this.updateDensity.bind(this, that), false);
		this.emitterSpeedSlider.addEventListener("input", this.updateEmitterSpeed.bind(this, that), false);

		window.addEventListener("resize", this.updateCanvasSize.bind(this, that), false);
	}
};

/*window.addEventListener("load", function()
{*/
		let ptcSys = new PtcSys();
		ptcSys.init();
//});