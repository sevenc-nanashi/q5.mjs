Q5.modules.display = ($) => {
	if (!$.canvas || $._scope == 'graphics') return;

	let c = $.canvas;

	if (Q5._instanceCount == 0 && !Q5._nodejs) {
		document.head.insertAdjacentHTML(
			'beforeend',
			`<style>
html, body {
	margin: 0;
	padding: 0;
}
.q5Canvas {
	outline: none;
	-webkit-touch-callout: none;
	-webkit-text-size-adjust: none;
	-webkit-user-select: none;
	overscroll-behavior: none;
}
.q5-pixelated {
	image-rendering: pixelated;
	font-smooth: never;
	-webkit-font-smoothing: none;
}
.q5-centered,
.q5-fullscreen {
  display: flex;
	align-items: center;
	justify-content: center;
}
main.q5-centered,
.q5-fullscreen {
	height: 100vh;
}
main {
	overscroll-behavior: none;
}
</style>`
		);
	}

	$._displayMode = () => {
		let s = c.style;
		if (!s || !c.displayMode) return;
		let p = c.parentElement;
		if (c.renderQuality == 'pixelated') {
			c.classList.add('q5-pixelated');
			$.pixelDensity(1);
			if ($.noSmooth) $.noSmooth();
			if ($.textFont) $.textFont('monospace');
		}
		if (c.displayMode == 'normal') {
			p.classList.remove('q5-centered', 'q5-fullscreen');
			s.width = c.w * c.displayScale + 'px';
			s.height = c.h * c.displayScale + 'px';
		} else {
			p.classList.add('q5-' + c.displayMode);
			p = p.getBoundingClientRect();
			if (c.w / c.h > p.width / p.height) {
				if (c.displayMode == 'centered') {
					s.width = c.w * c.displayScale + 'px';
					s.maxWidth = '100%';
				} else s.width = '100%';
				s.height = 'auto';
				s.maxHeight = '';
			} else {
				s.width = 'auto';
				s.maxWidth = '';
				if (c.displayMode == 'centered') {
					s.height = c.h * c.displayScale + 'px';
					s.maxHeight = '100%';
				} else s.height = '100%';
			}
		}
	};

	$.displayMode = (displayMode, renderQuality = 'default', displayScale = 1) => {
		if (typeof displayScale == 'string') {
			displayScale = parseFloat(displayScale.slice(1));
		}
		Object.assign(c, { displayMode, renderQuality, displayScale });
		$._displayMode();
	};
};
