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
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;

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
	}

	drawParticles()
	{
		for (let i = this.particles.length - 1; i >= 0; i--)
		{
			this.ctx.beginPath();
			this.ctx.arc(this.particles[i]["posX"], this.particles[i]["posY"], 10, 0, Math.PI * 2, true);//(x, y, r, ?)
			this.ctx.stroke();
			this.particles[i]["posY"] += this.particles[i]["gravity"] / 10;
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

	deleteParticles()
	{
		
	}

	createParticles()
	{
		let particlesTimeStartSave = this.particlesTimeStart;
		this.particlesTimeStart = this.countTime(this.particlesTimeStart, 2000);// need to link millisec with emitter speed

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
					color: "white",
					gravity: this.particlesEngine["gravity"]
				}
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
		
		that.particlesEngine["density"] = parseInt(densitySliderValue, 10);
		that.densityDisplayValue.innerText = densitySliderValue;
	}

	updateEmitterSpeed(that)
	{
		that.particlesEngine["emitterSpeed"] = parseInt(that.emitterSpeedSlider, 10);
		that.emitterSpeedDisplayValue.innerText = that.emitterSpeedSlider.value;
	}

	launchMainLoop(that)
	{
		that.ctx.clearRect(0, 0, that.canvas.width, that.canvas.height);
		that.createParticles();
		that.drawParticles();
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

	init()
	{
		let that = this;

		this.densitySlider.value = 1;
		this.emitterSpeedSlider.value = 1;

		this.startStopButton.addEventListener("click", this.startStop.bind(this, that), false);
		this.densitySlider.addEventListener("input", this.updateDensity.bind(this, that), false);
		this.emitterSpeedSlider.addEventListener("input", this.updateEmitterSpeed.bind(this, that), false);
	}
};

/*window.addEventListener("load", function()
{*/
		let ptcSys = new PtcSys();
		ptcSys.init();
//});