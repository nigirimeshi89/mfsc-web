/*===========================================================*/
/* グローバル変数と共通関数定義エリア */
/*===========================================================*/

// オーディオスペクトラム関連のグローバル変数
let pageTransitionOverlay;
let transitionSpectrumCanvas;
let tCtx;
let transitionAnimationFrameId;

// 遷移時スペクトラム用の高さ配列
const transitionNumBars = 64;
let transitionBarHeights = new Array(transitionNumBars).fill(0);
let transitionTargetHeights = new Array(transitionNumBars).fill(0);
const transitionSmoothFactor = 0.2;
const transitionDecayFactor = 0.97;

// メインスペクトラム関連のグローバル変数
let audioSpectrumCanvas;
let mainSpectrumCtx;
let mainSpectrumAnimationFrameId;
const mainSpectrumNumBars = 128;
let mainSpectrumCurrentBarHeights = new Array(mainSpectrumNumBars).fill(0);
let mainSpectrumTargetBarHeights = new Array(mainSpectrumNumBars).fill(0);
const mainSpectrumSmoothFactor = 0.15;
const mainSpectrumDecayFactor = 0.98;

// TypingInit用の配列 (js_typing)
var shuffleTextInstances = [];

// 画像のベースパス設定
const getJsRelativeImagePath = () => {
	const scripts = document.getElementsByTagName('script');
	let mainJsPath = '';
	for (let i = 0; i < scripts.length; i++) {
		if (scripts[i].src.includes('/js/main.js')) {
			mainJsPath = scripts[i].src;
			break;
		}
	}

	if (!mainJsPath) {
		return 'img/main/';
	}

	const mainJsDirPath = mainJsPath.substring(0, mainJsPath.lastIndexOf('/') + 1);
	const relativePathFromJsToImg = '../img/main/';

	return mainJsDirPath + relativePathFromJsToImg;
};

const IMAGE_BASE_PATH = getJsRelativeImagePath();


/*===========================================================*/
/* スクロールアニメーション関数群 */
/*===========================================================*/

// ドロップダウンメニューの制御
function mediaQueriesWin() {
	var width = $(window).width();
	if (width <= 960) {
		$(".has-child>a").off('click');
		$(".has-child>a").on('click', function () {
			var parentElem = $(this).parent();
			$(parentElem).toggleClass('active');
			$(parentElem).children('ul').stop().slideToggle(500);
			return false;
		});
	} else {
		$(".has-child>a").off('click');
		$(".has-child>a").removeClass('active');
		$('.has-child').children('ul').css("display", "");
	}
}

// スクロール途中からヘッダーを出現させる
function FixedAnime() {
	var serviceElem = $('#service');
	var elemTop = (serviceElem.length > 0) ? serviceElem.offset().top : $(document).height();
	var scroll = $(window).scrollTop();
	var header = $('#header');

	if (scroll <= 20) {
		header.removeClass('UpMove').addClass('DownMove');
	} else if (scroll >= elemTop) {
		header.removeClass('UpMove').addClass('DownMove');
	} else {
		if (header.hasClass('DownMove')) {
			header.removeClass('DownMove').addClass('UpMove');
		}
	}
}

// ハンバーガーメニュー
function setupHamburgerMenu() {
	$(".g-nav-openbtn").click(function () {
		$(this).toggleClass('active');
		$("#g-nav").toggleClass('panelactive');
	});
	$("#g-nav a").click(function () {
		$(".g-nav-openbtn").removeClass('active');
		$("#g-nav").removeClass('panelactive');
	});
}

// ページトップボタンの出現制御
function setFadeElement() {
	var windowH = $(window).height();
	var scroll = $(window).scrollTop();

	var contactElem = $('#contact');
	var footerElem = $('#footer');
	var pageTop = $("#page-top");

	var contactTop = contactElem.length ? Math.round(contactElem.offset().top) : $(document).height();
	var contactH = contactElem.length ? contactElem.outerHeight(true) : 0;
	var footerTop = footerElem.length ? Math.round(footerElem.offset().top) : $(document).height();
	var footerH = footerElem.length ? footerElem.outerHeight(true) : 0;

	if (scroll + windowH >= contactTop && scroll + windowH <= contactTop + contactH) {
		$("#page-top").addClass("LeftMove").removeClass("RightMove");
	}
	else if (scroll + windowH >= footerTop && scroll + windowH <= footerTop + footerH) {
		$("#page-top").addClass("LeftMove").removeClass("RightMove");
	}
	else {
		if (!pageTop.hasClass("hide-btn")) {
			$("#page-top").addClass("RightMove").removeClass("LeftMove");
		}
	}
}

// ページトップボタンクリック設定
function setupPageTopButton() {
	$('#page-top').click(function () {
		$('body,html').animate({
			scrollTop: 0
		}, 500);
		return false;
	});
}

// タブメニュー
function GethashID(hashIDName) {
	var tabLi = $('.tab li');
	if (tabLi.length && hashIDName) {
		tabLi.find('a').each(function () {
			var idName = $(this).attr('href');
			if (idName == hashIDName) {
				var parentElm = $(this).parent();
				$('.tab li').removeClass("active");
				$(parentElm).addClass("active");
				$(".area").removeClass("is-active");
				$(hashIDName).addClass("is-active");
			}
		});
	}
}

// スクロール連動アニメーション
function fadeAnime() {
	$('.bgappearTrigger').each(function () {
		var elemPos = $(this).offset().top - 50;
		var scroll = $(window).scrollTop();
		var windowHeight = $(window).height();
		if (scroll >= elemPos - windowHeight) {
			$(this).addClass('bgappear');
		} else {
			$(this).removeClass('bgappear');
		}
	});
	$('.bgLRextendTrigger').each(function () {
		var elemPos = $(this).offset().top - 50;
		var scroll = $(window).scrollTop();
		var windowHeight = $(window).height();
		if (scroll >= elemPos - windowHeight) {
			$(this).addClass('bgLRextend');
		} else {
			$(this).removeClass('bgLRextend');
		}
	});
	$('.bgRLextendTrigger').each(function () {
		var elemPos = $(this).offset().top - 50;
		var scroll = $(window).scrollTop();
		var windowHeight = $(window).height();
		if (scroll >= elemPos - windowHeight) {
			$(this).addClass('bgRLextend');
		} else {
			$(this).removeClass('bgRLextend');
		}
	});
	var serviceArea = $('.service-area');
	if (serviceArea.length) {
		serviceArea.each(function () {
			var elemPos = $(this).offset().top - 50;
			var scroll = $(window).scrollTop();
			var windowHeight = $(window).height();
			if (scroll >= elemPos - windowHeight) {
				$(this).addClass('startwd');
			} else {
				$(this).removeClass('startwd');
			}
		});
	}
	var service1Area = $('#service1 .service-area');
	if (service1Area.length) {
		service1Area.each(function () {
			var elemPos = $(this).offset().top - 50;
			var scroll = $(window).scrollTop();
			var windowHeight = $(window).height();
			if (scroll >= elemPos - windowHeight) {
				$(this).addClass('startwd');
			} else {
				$(this).removeClass('startwd');
			}
		});
	}
	var newsImgWrapper = $('.news-img-wrapper');
	if (newsImgWrapper.length) {
		newsImgWrapper.each(function () {
			var elemPos = $(this).offset().top - 50;
			var scroll = $(window).scrollTop();
			var windowHeight = $(window).height();
			if (scroll >= elemPos - windowHeight) {
				$(this).addClass('bgRLextend');
			} else {
				$(this).removeClass('bgRLextend');
			}
		});
	}
}

// ShuffleText初期化
function TypingInit() {
	var jsTypingElements = $('.js_typing');
	if (jsTypingElements.length) {
		jsTypingElements.each(function (i) {
			if (!shuffleTextInstances[i]) {
				shuffleTextInstances[i] = new ShuffleText(this);
			}
		});
	}
}

// タイピングアニメーション実行
function TypingAnime() {
	var jsTypingElements = $(".js_typing");
	if (jsTypingElements.length) {
		jsTypingElements.each(function (i) {
			var elemPos = $(this).offset().top - 50;
			var scroll = $(window).scrollTop();
			var windowHeight = $(window).height();
			if (scroll >= elemPos - windowHeight) {
				if (!$(this).hasClass("endAnime")) {
					if (shuffleTextInstances[i]) {
						shuffleTextInstances[i].start();
						shuffleTextInstances[i].duration = 800;
						$(this).addClass("endAnime");
					}
				}
			}
		});
	}
}

// 検索オーバーレイ設定
function setupSearchOverlay() {
	var searchWrap = $("#search-wrap");
	var openBtn = $(".search-open-btn");
	var closeBtn = $(".close-btn");

	if (openBtn.length) {
		openBtn.click(function () {
			if (searchWrap.length) {
				searchWrap.addClass('panelactive');
				var passInput = $('#pass');
				if (passInput.length) {
					passInput.focus();
				}
			}
		});
	}
	if (closeBtn.length) {
		closeBtn.click(function () {
			if (searchWrap.length) {
				searchWrap.removeClass('panelactive');
			}
		});
	}
}

// アコーディオン設定
function setupAccordion() {
	$('.title3').on('click', function () {
		var findElm = $(this).next(".box3");
		$(findElm).slideToggle();

		if ($(this).hasClass('close')) {
			$(this).removeClass('close');
		} else {
			$(this).addClass('close');
		}
	});
}

/*===========================================================*/
/* オーディオスペクトラム描画関数 */
/*===========================================================*/

// 擬似スペクトラム（メイン用）
function drawPseudoSpectrum() {
	mainSpectrumAnimationFrameId = requestAnimationFrame(drawPseudoSpectrum);

	if (typeof mainSpectrumCtx === 'undefined' || !mainSpectrumCtx || typeof audioSpectrumCanvas === 'undefined' || !audioSpectrumCanvas) {
		cancelAnimationFrame(mainSpectrumAnimationFrameId);
		mainSpectrumAnimationFrameId = null;
		return;
	}

	mainSpectrumCtx.clearRect(0, 0, audioSpectrumCanvas.width, audioSpectrumCanvas.height);

	const centerX = audioSpectrumCanvas.width / 2;
	const centerY = audioSpectrumCanvas.height / 2;
	const baseRadius = Math.min(centerX, centerY) * 0.5;
	const maxBarHeight = 280;

	const bpm = 40;
	const beatPhase = (Date.now() / 1000) * (2 * Math.PI * (bpm / 60));
	let beatStrength = (Math.sin(beatPhase) + 1) / 2;
	beatStrength = Math.pow(beatStrength, 2.5);
	if (beatStrength > 0.6) beatStrength = 0.6 + (beatStrength - 0.6) * 0.3;

	const timePhase = Date.now() * 0.002;

	for (let i = 0; i < mainSpectrumNumBars; i++) {
		const angle = (i / mainSpectrumNumBars) * Math.PI * 2;
		const normalizedIndex = i / mainSpectrumNumBars;
		const beatInfluence = 1 - Math.pow(normalizedIndex, 1.0);

		const noise1 = Math.sin(timePhase * 0.4 + i * 0.05) * 0.5 + 0.5;
		const noise2 = Math.sin(timePhase * 1.0 + i * 0.1) * 0.5 + 0.5;

		let rawHeight = (
			0.1 +
			(0.7 * Math.sin(angle * 2 + timePhase * 0.8) * noise1 +
				0.3 * Math.cos(angle * 5 + timePhase * 1.2) * noise2) *
			(0.4 + beatStrength * 0.6 * beatInfluence)
		);
		rawHeight = Math.max(0, rawHeight);

		mainSpectrumTargetBarHeights[i] = maxBarHeight * rawHeight;

		const currentToTargetDiff = mainSpectrumTargetBarHeights[i] - mainSpectrumCurrentBarHeights[i];
		if (currentToTargetDiff > 0) {
			mainSpectrumCurrentBarHeights[i] += currentToTargetDiff * 0.2;
		} else {
			mainSpectrumCurrentBarHeights[i] += currentToTargetDiff * 0.05;
		}

		mainSpectrumCurrentBarHeights[i] *= 0.98;
		mainSpectrumCurrentBarHeights[i] = Math.max(mainSpectrumCurrentBarHeights[i], 1);

		const startX = centerX + Math.cos(angle) * baseRadius;
		const startY = centerY + Math.sin(angle) * baseRadius;
		const endX = centerX + Math.cos(angle) * (baseRadius + mainSpectrumCurrentBarHeights[i]);
		const endY = centerY + Math.sin(angle) * (baseRadius + mainSpectrumCurrentBarHeights[i]);

		const currentHeightRatio = mainSpectrumCurrentBarHeights[i] / maxBarHeight;
		const baseHue = (timePhase * 10 + i * 0.3) % 360;
		const hue = (baseHue + beatStrength * 30) % 360;
		const saturation = `${80 + beatStrength * 20 + currentHeightRatio * 10}%`;
		const lightness = `${40 + currentHeightRatio * 20 + beatStrength * 20}%`;
		mainSpectrumCtx.strokeStyle = `hsl(${hue}, ${saturation}, ${lightness})`;
		mainSpectrumCtx.lineWidth = 4;

		mainSpectrumCtx.beginPath();
		mainSpectrumCtx.moveTo(startX, startY);
		mainSpectrumCtx.lineTo(endX, endY);
		mainSpectrumCtx.stroke();
	}
}

// 擬似スペクトラム（遷移用）
function drawTransitionSpectrum() {
	if (pageTransitionOverlay && !pageTransitionOverlay.classList.contains('initial-load-active')) {
		if (transitionAnimationFrameId) {
			cancelAnimationFrame(transitionAnimationFrameId);
			transitionAnimationFrameId = null;
		}
		return;
	}

	transitionAnimationFrameId = requestAnimationFrame(drawTransitionSpectrum);

	if (typeof tCtx === 'undefined' || !tCtx || typeof transitionSpectrumCanvas === 'undefined' || !transitionSpectrumCanvas) {
		cancelAnimationFrame(transitionAnimationFrameId);
		transitionAnimationFrameId = null;
		return;
	}

	tCtx.clearRect(0, 0, transitionSpectrumCanvas.width, transitionSpectrumCanvas.height);

	const centerX = transitionSpectrumCanvas.width / 2;
	const centerY = transitionSpectrumCanvas.height / 2;
	const baseRadiusX = centerX * 0.75;
	const baseRadiusY = centerY * 0.45;
	const maxBarHeight = 120;

	const bpm = 50;
	const beatPhase = (Date.now() / 1000) * (2 * Math.PI * (bpm / 60));
	let beatStrength = (Math.sin(beatPhase) + 1) / 2;
	beatStrength = Math.pow(beatStrength, 2.0);
	if (beatStrength > 0.5) beatStrength = 0.5 + (beatStrength - 0.5) * 0.4;

	const currentPhase = (Date.now() * 0.005) % (Math.PI * 2);

	for (let i = 0; i < transitionNumBars; i++) {
		const angle = (i / transitionNumBars) * Math.PI * 2;
		const normalizedIndex = i / transitionNumBars;
		const beatInfluence = 1 - Math.pow(normalizedIndex, 0.8);

		const noise1 = Math.sin(currentPhase * 0.6 + i * 0.08) * 0.5 + 0.5;
		const noise2 = Math.cos(currentPhase * 1.2 + i * 0.1) * 0.5 + 0.5;

		let rawHeight = (
			0.2 +
			(0.6 * Math.sin(angle * 3 + currentPhase * 1.0) * noise1 +
				0.4 * Math.cos(angle * 5 + currentPhase * 1.5) * noise2) * (0.5 + beatStrength * 0.8 * beatInfluence)
		);
		rawHeight = Math.max(0, rawHeight);

		transitionTargetHeights[i] = maxBarHeight * rawHeight;

		const currentToTargetDiff = transitionTargetHeights[i] - transitionBarHeights[i];
		if (currentToTargetDiff > 0) {
			transitionBarHeights[i] += currentToTargetDiff * 0.25;
		} else {
			transitionBarHeights[i] += currentToTargetDiff * 0.1;
		}

		transitionBarHeights[i] *= 0.97;
		transitionBarHeights[i] = Math.max(transitionBarHeights[i], 1);

		const startX = centerX + Math.cos(angle) * baseRadiusX;
		const startY = centerY + Math.sin(angle) * baseRadiusY;
		const endX = centerX + Math.cos(angle) * (baseRadiusX + transitionBarHeights[i]);
		const endY = centerY + Math.sin(angle) * (baseRadiusY + transitionBarHeights[i]);

		const currentHeightRatio = transitionBarHeights[i] / maxBarHeight;
		const baseHue = (currentPhase * 20 + i * 0.5) % 360;
		const hue = (baseHue + beatStrength * 40) % 360;
		const saturation = `${90 + beatStrength * 10 + currentHeightRatio * 5}%`;
		const lightness = `${50 + currentHeightRatio * 20 + beatStrength * 15}%`;
		tCtx.strokeStyle = `hsl(${hue}, ${saturation}, ${lightness})`;
		tCtx.lineWidth = 5;

		tCtx.beginPath();
		tCtx.moveTo(startX, startY);
		tCtx.lineTo(endX, endY);
		tCtx.stroke();
	}
}


/*===========================================================*/
/* ページロード時の初期化とイベントリスナー設定 */
/*===========================================================*/

document.addEventListener("DOMContentLoaded", () => {
	const toggleBtn = document.getElementById("modeToggle");
	const icon = document.getElementById("modeIcon");
	const body = document.body;

	if (toggleBtn && icon) {
		const savedTheme = localStorage.getItem("theme");
		if (savedTheme === "light") {
			body.classList.add("light-mode");
			body.classList.remove("dark-mode");
			icon.src = IMAGE_BASE_PATH + "light.svg";
		} else {
			body.classList.add("dark-mode");
			body.classList.remove("light-mode");
			icon.src = IMAGE_BASE_PATH + "dark.svg";
		}

		toggleBtn.addEventListener("click", () => {
			body.classList.toggle("light-mode");
			body.classList.toggle("dark-mode");
			const isLight = body.classList.contains("light-mode");
			icon.src = isLight ? IMAGE_BASE_PATH + "light.svg" : IMAGE_BASE_PATH + "dark.svg";
			localStorage.setItem("theme", isLight ? "light" : "dark");
		});
	}

	audioSpectrumCanvas = document.getElementById('audioSpectrumCanvas');
	if (audioSpectrumCanvas) {
		mainSpectrumCtx = audioSpectrumCanvas.getContext('2d');
		audioSpectrumCanvas.width = audioSpectrumCanvas.clientWidth;
		audioSpectrumCanvas.height = audioSpectrumCanvas.clientHeight;
		audioSpectrumCanvas.style.display = 'none';
	}

	const internalLinks = document.querySelectorAll(
		'#g-navi a, .btnlinestretches2, .freshman a, a[href^="Public/"], a[href$=".html"]'
	);

	internalLinks.forEach(link => {
		if (link.href.startsWith(window.location.origin + window.location.pathname + '#')) {
			return;
		}
		if (!link.href.startsWith(window.location.origin)) {
			return;
		}
		var loginForm = document.getElementById('login_form');
		if (loginForm && link.closest('#search-wrap')) {
			return;
		}

		link.addEventListener('click', function (e) {
			e.preventDefault();
			const targetUrl = this.href;

			if (mainSpectrumAnimationFrameId) {
				cancelAnimationFrame(mainSpectrumAnimationFrameId);
				mainSpectrumAnimationFrameId = null;
			}
			if (audioSpectrumCanvas) {
				audioSpectrumCanvas.style.display = 'none';
			}
			if (pageTransitionOverlay) {
				pageTransitionOverlay.style.display = 'none';
				pageTransitionOverlay.classList.remove('active');
				if (transitionAnimationFrameId) {
					cancelAnimationFrame(transitionAnimationFrameId);
					transitionAnimationFrameId = null;
				}
			}
			window.location.href = targetUrl;
		});
	});

	pageTransitionOverlay = document.getElementById('page-transition-overlay');
	if (pageTransitionOverlay) {
		transitionSpectrumCanvas = document.getElementById('transitionSpectrumCanvas');
		if (transitionSpectrumCanvas) {
			tCtx = transitionSpectrumCanvas.getContext('2d');
			transitionSpectrumCanvas.width = 300;
			transitionSpectrumCanvas.height = 300;
		}
		if (pageTransitionOverlay.classList.contains('initial-load-active')) {
			pageTransitionOverlay.style.display = 'flex';
			drawTransitionSpectrum();
		} else {
			pageTransitionOverlay.style.display = 'none';
		}
	}
});

$(window).on('load', function () {
	pageTransitionOverlay = document.getElementById('page-transition-overlay');
	if (pageTransitionOverlay && pageTransitionOverlay.classList.contains('initial-load-active')) {
		const initialLoadFadeOutDelay = 1500;
		const fadeOutDuration = 500;

		setTimeout(() => {
			pageTransitionOverlay.classList.remove('initial-load-active');
			pageTransitionOverlay.classList.remove('active');

			setTimeout(() => {
				if (transitionAnimationFrameId) {
					cancelAnimationFrame(transitionAnimationFrameId);
					transitionAnimationFrameId = null;
				}
				pageTransitionOverlay.style.display = 'none';

				if (audioSpectrumCanvas) {
					audioSpectrumCanvas.style.display = 'block';
					drawPseudoSpectrum();
				}
			}, fadeOutDuration);
		}, initialLoadFadeOutDelay);
	} else {
		if (pageTransitionOverlay) {
			pageTransitionOverlay.style.display = 'none';
			pageTransitionOverlay.classList.remove('active');
			pageTransitionOverlay.classList.remove('initial-load-active');
			if (transitionAnimationFrameId) {
				cancelAnimationFrame(transitionAnimationFrameId);
				transitionAnimationFrameId = null;
			}
		}
		if (audioSpectrumCanvas) {
			audioSpectrumCanvas.style.display = 'block';
			drawPseudoSpectrum();
		}
	}

	$('body').addClass('appear');

	mediaQueriesWin();
	FixedAnime();
	setFadeElement();
	setupHamburgerMenu();

	var tabLiFirst = $('.tab li:first-of-type');
	var areaFirst = $('.area:first-of-type');
	if (tabLiFirst.length && areaFirst.length) {
		tabLiFirst.addClass("active");
		areaFirst.addClass("is-active");
		var hashName = location.hash;
		GethashID(hashName);
	}

	fadeAnime();

	var jsTypingElements = $(".js_typing");
	if (jsTypingElements.length) {
		TypingInit();
		TypingAnime();
	}

	// ==========================================================
	// Vegasの記述を完全に削除しました。
	// エラーを消すために、Astro側でVegasを初期化してください。
	// ==========================================================

	var gridElem = $('.grid');
	if (gridElem.length) {
		var grid = new Muuri('.grid', {
			showDuration: 600,
			showEasing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
			hideDuration: 600,
			hideEasing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
			visibleStyles: { opacity: '1', transform: 'scale(1)' },
			hiddenStyles: { opacity: '0', transform: 'scale(0.5)' }
		});

		var sortBtn = $('.sort-btn li');
		if (sortBtn.length) {
			sortBtn.on('click', function () {
				$(".sort-btn .active").removeClass("active");
				var className = $(this).attr("class");
				className = className.split(' ');
				$("." + className[0]).addClass("active");
				if (className[0] == "sort00") {
					grid.show('');
				} else {
					grid.filter("." + className[0]);
				}
			});
		}
	}

	var fancyboxElements = $('[data-fancybox]');
	if (fancyboxElements.length) {
		fancyboxElements.fancybox({
			thumbs: { autoStart: true },
		});
	}

	var accordionArea = $('.accordion-area li:first-of-type section');
	if (accordionArea.length) {
		accordionArea.addClass("open");
		accordionArea.each(function (index, element) {
			var Title = $(element).children('.title3');
			$(Title).addClass('close');
			var Box = $(element).children('.box3');
			$(Box).slideDown(500);
		});
	}

	setupSearchOverlay();
});

$(window).scroll(function () {
	FixedAnime();
	setFadeElement();
	fadeAnime();
	TypingAnime();
});

$(function () {
	setupAccordion();
	$('.tab a').on('click', function () {
		var idName = $(this).attr('href');
		GethashID(idName);
		return false;
	});
});