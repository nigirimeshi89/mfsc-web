/*===========================================================*/
/* グローバル変数と共通関数定義エリア */
/*===========================================================*/

// オーディオスペクトラム関連のグローバル変数
// これらは関数スコープではなく、ファイルスコープで定義し、必要に応じて関数内で参照します。
let pageTransitionOverlay;
let transitionSpectrumCanvas;
let tCtx;
let transitionAnimationFrameId;

// 遷移時スペクトラム用の高さ配列
const transitionNumBars = 64;
let transitionBarHeights = new Array(transitionNumBars).fill(0);
let transitionTargetHeights = new Array(transitionNumBars).fill(0);
const transitionSmoothFactor = 0.2; // この値は関数内で上書きされますが、定義は残します
const transitionDecayFactor = 0.97; // この値は関数内で上書きされますが、定義は残します

// メインスペクトラム関連のグローバル変数
let audioSpectrumCanvas;
let mainSpectrumCtx; // ctxという名前は衝突しやすいのでmainSpectrumCtxに変更
let mainSpectrumAnimationFrameId;
const mainSpectrumNumBars = 128;
let mainSpectrumCurrentBarHeights = new Array(mainSpectrumNumBars).fill(0);
let mainSpectrumTargetBarHeights = new Array(mainSpectrumNumBars).fill(0);
const mainSpectrumSmoothFactor = 0.15; // この値は関数内で上書きされますが、定義は残します
const mainSpectrumDecayFactor = 0.98; // この値は関数内で上書きされますが、定義は残します

// TypingInit用の配列 (js_typing)
var shuffleTextInstances = [];

// 画像のベースパスをJavaScriptファイル（limited.js）からの相対パスとして決定する
// HTMLからの深さを問わず、常にjs/limited.jsからの相対パスでimg/main/にアクセスできるよう調整
const getJsRelativeImagePath = () => {
	const scripts = document.getElementsByTagName('script');
	let scriptSrc = ''; // 実行中のスクリプトの src 属性を保持

	// 実行中の limited.js のパスを見つける
	for (let i = 0; i < scripts.length; i++) {
		// scripts[i].src の末尾が '/js/limited.js' であるか、またはそのパスを含むか確認
		if (scripts[i].src.endsWith('/js/limited.js') || scripts[i].src.includes('/js/limited.js?')) {
			scriptSrc = scripts[i].src;
			break;
		}
	}

	if (!scriptSrc) {
		console.error("limited.js script path not found. Please ensure the script tag includes '/js/limited.js' in its src attribute.");
		// フォールバック（プロジェクトルートからの相対パスと仮定）
		return '/img/main/';
	}

	const scriptUrl = new URL(scriptSrc);
	const scriptDirPath = scriptUrl.pathname.substring(0, scriptUrl.pathname.lastIndexOf('/') + 1);

	// ★ 修正点: relativePathFromJsToImg を ../img/main/ に変更
	// js/limited.js から見て、一つ上の階層 (プロジェクトルート) に img/main/ がある場合
	const relativePathFromJsToImg = '../img/main/';

	// 最終的な画像ベースURLを構築
	const imgMainAbsoluteUrl = new URL(relativePathFromJsToImg, scriptUrl).href;
	return imgMainAbsoluteUrl;
};

// この関数を呼び出して、動的な画像ベースパスを設定
const IMAGE_BASE_PATH = getJsRelativeImagePath();


/*===========================================================*/
/* スクロールアニメーション関数群 */
/*===========================================================*/

// ドロップダウンメニューの制御 (jQuery)
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

// スクロール途中からヘッダーを出現させる (jQuery)
function FixedAnime() {
	var serviceElem = $('#service');
	// #service が存在しないページ (例: GALLERY.html) の場合を考慮してオフセットを取得
	var elemTop = (serviceElem.length > 0) ? serviceElem.offset().top : $(document).height();

	var scroll = $(window).scrollTop();
	var header = $('#header');

	if (scroll <= 20) {
		header.removeClass('UpMove').addClass('DownMove');
	} else if (scroll >= elemTop) { // #service の位置まできたら
		header.removeClass('UpMove').addClass('DownMove');
	} else { // それ以外
		if (header.hasClass('DownMove')) {
			header.removeClass('DownMove').addClass('UpMove');
		}
	}
}

// クリックしたらナビが上から下に出現 (ハンバーガーメニュー) (jQuery)
// イベントリスナーはDOM Ready (DOMContentLoaded) で設定するため、ここでは関数定義のみ。
function setupHamburgerMenu() {
	$(".g-nav-openbtn").click(function () {
		$(this).toggleClass('active');
		$("#g-nav").toggleClass('panelactive');
	});
	$("#g-nav a").click(function () { // ナビゲーションのリンクがクリックされたら閉じる
		$(".g-nav-openbtn").removeClass('active');
		$("#g-nav").removeClass('panelactive');
	});
}


// ページの指定範囲内で出現 (ページトップボタン) (jQuery)
function setFadeElement() {
	var windowH = $(window).height();
	var scroll = $(window).scrollTop();

	var contactElem = $('#contact');
	var footerElem = $('#footer');
	var pageTop = $("#page-top");

	// #contact と #footer が存在しないページを考慮
	var contactTop = contactElem.length ? Math.round(contactElem.offset().top) : $(document).height();
	var contactH = contactElem.length ? contactElem.outerHeight(true) : 0;
	var footerTop = footerElem.length ? Math.round(footerElem.offset().top) : $(document).height();
	var footerH = footerElem.length ? footerElem.outerHeight(true) : 0;

	// 出現範囲内に入ったかどうかをチェック
	if (scroll + windowH >= contactTop && scroll + windowH <= contactTop + contactH) {
		$("#page-top").addClass("LeftMove").removeClass("RightMove");
	}
	// 2つ目の出現範囲に入ったかどうかをチェック
	else if (scroll + windowH >= footerTop && scroll + windowH <= footerTop + footerH) {
		$("#page-top").addClass("LeftMove").removeClass("RightMove");
	}
	// それ以外は
	else {
		// サイト表示時にRightMoveクラスを一瞬付与させないためのクラス付けは、
		// CSSで初期状態を非表示にしておき、JSで表示を制御する方が確実です。
		if (!pageTop.hasClass("hide-btn")) { // hide-btnクラスがない場合のみ動作 (HTMLにhide-btnクラスが設定されている前提)
			$("#page-top").addClass("RightMove").removeClass("LeftMove");
		}
	}
}

// #page-topをクリックした際の設定 (jQuery)
function setupPageTopButton() {
	$('#page-top').click(function () {
		$('body,html').animate({
			scrollTop: 0
		}, 500);
		return false;
	});
}

//タブメニュー (jQuery)
function GethashID(hashIDName) {
	var tabLi = $('.tab li');
	if (tabLi.length && hashIDName) { // タブが存在し、ハッシュIDが渡された場合のみ
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

// Vegas.js の画像パスを動的に決定し、Vegasスライダーを初期化 (jQuery)
function initVegasSlider() {
	var sliderElem = $('#slider');
	if (sliderElem.length) { // #slider要素が存在する場合のみ実行
		sliderElem.vegas({
			overlay: false,
			transition: 'fade2',
			transitionDuration: 1500,
			delay: 4000,
			animationDuration: 1500,
			animation: 'random',
			slides: getResponsiveImages(), // limited.js 用の画像配列を取得
			timer: false,
		});
	}
}

// Vegas.js 用の responsiveImage 配列をデバイス幅に応じて返す (limited.js用)
// ここで limited.js のための特定の画像パスを指定します
function getResponsiveImages() {
	const windowwidth = window.innerWidth || document.documentElement.clientWidth || 0;
	let responsiveImage;

	// ここにlimited.js用のVegas画像パスを記述
	// IMAGE_BASE_PATH は getJsRelativeImagePath() によって正しく設定されます
	if (windowwidth > 768) { // PC用の画像
		responsiveImage = [
			{ src: IMAGE_BASE_PATH + 'top8.jpg' },
			{ src: IMAGE_BASE_PATH + 'top9.jpg' },
			{ src: IMAGE_BASE_PATH + 'top10.jpg' },
			{ src: IMAGE_BASE_PATH + 'top11.jpg' },
			{ src: IMAGE_BASE_PATH + 'top12.jpg' },
			{ src: IMAGE_BASE_PATH + 'top13.jpg' }
		];
	} else { // タブレットサイズ（768px）以下用の画像
		responsiveImage = [
			{ src: IMAGE_BASE_PATH + 'top1.jpg' },
			{ src: IMAGE_BASE_PATH + 'top2.jpg' },
			{ src: IMAGE_BASE_PATH + 'top3.jpg' },
			{ src: IMAGE_BASE_PATH + 'top4.jpg' },
			{ src: IMAGE_BASE_PATH + 'top5.jpg' },
			{ src: IMAGE_BASE_PATH + 'top6.jpg' }
		];
	}
	return responsiveImage;
}


// スクロール連動アニメーション (jQuery)
function fadeAnime() {
	// .eachループ内で要素のオフセットを繰り返し取得していますが、多数の要素がある場合はパフォーマンスに影響する可能性も。
	// bgappearTrigger (背景色が伸びて出現中の要素が出現)
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
	// bgLRextendTrigger (背景色が伸びて出現（左から）)
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
	// bgRLextendTrigger (背景色が伸びて出現（右から）)
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
	// service-area (サービスエリアのアニメーション開始)
	var serviceArea = $('.service-area');
	if (serviceArea.length) { // 要素が存在する場合のみ
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
	// #service1 .service-area (GALLERY.html用)
	var service1Area = $('#service1 .service-area');
	if (service1Area.length) { // 要素が存在する場合のみ
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
	// news-img-wrapper
	var newsImgWrapper = $('.news-img-wrapper');
	if (newsImgWrapper.length) { // 要素が存在する場合のみ
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

// アルファベットがランダムに変化して出現 (ShuffleText) (jQuery)
function TypingInit() {
	var jsTypingElements = $('.js_typing');
	if (jsTypingElements.length) { // 要素が存在する場合のみ
		jsTypingElements.each(function (i) {
			if (!shuffleTextInstances[i]) { // 既にインスタンスが存在しない場合にのみ作成
				shuffleTextInstances[i] = new ShuffleText(this);
			}
		});
	}
}

// スクロールした際のアニメーションの設定（一度実行されたらリセットしないバージョン）
function TypingAnime() {
	var jsTypingElements = $(".js_typing");
	if (jsTypingElements.length) { // 要素が存在する場合のみ
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
			// else ブロックを削除：一度アニメーションしたらリセットしない挙動を維持
		});
	}
}

// 虫眼鏡マークをクリックすると全画面表示で検索窓が出現 (jQuery)
function setupSearchOverlay() {
	var searchWrap = $("#search-wrap");
	var openBtn = $(".search-open-btn");
	var closeBtn = $(".close-btn");

	if (openBtn.length) { // 要素が存在する場合のみ
		openBtn.click(function () {
			if (searchWrap.length) {
				searchWrap.addClass('panelactive');
				var passInput = $('#pass'); // IDは'pass'
				if (passInput.length) {
					passInput.focus();
				}
			}
		});
	}
	if (closeBtn.length) { // 要素が存在する場合のみ
		closeBtn.click(function () {
			if (searchWrap.length) {
				searchWrap.removeClass('panelactive');
			}
		});
	}
}

//アコーディオン (jQuery)
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

	// ページ読み込み時に最初のアコーディオンを開く (loadイベントで実行)
	// $(window).on('load', function() { ... }); の中に移動
}

/*===========================================================*/
/* オーディオスペクトラム描画関数 */
/*===========================================================*/

// 擬似スペクトラムの描画関数 (メインコンテンツ背景用)
function drawPseudoSpectrum() {
	mainSpectrumAnimationFrameId = requestAnimationFrame(drawPseudoSpectrum);

	// canvas contextのチェック
	if (typeof mainSpectrumCtx === 'undefined' || !mainSpectrumCtx || typeof audioSpectrumCanvas === 'undefined' || !audioSpectrumCanvas) {
		console.error("Main audioSpectrumCanvas context not initialized. Skipping animation.");
		cancelAnimationFrame(mainSpectrumAnimationFrameId);
		mainSpectrumAnimationFrameId = null; // IDをリセット
		return;
	}

	mainSpectrumCtx.clearRect(0, 0, audioSpectrumCanvas.width, audioSpectrumCanvas.height);

	const centerX = audioSpectrumCanvas.width / 2;
	const centerY = audioSpectrumCanvas.height / 2;
	const baseRadius = Math.min(centerX, centerY) * 0.5;

	const maxBarHeight = 280; // 最大の高さを少し上げる（重低音のインパクト）

	// 重低音の拍動をシミュレートする時間ベースの強度 (ゆっくり、重く)
	const bpm = 40; // BPMを低くしてゆっくりとした拍動に
	const beatPhase = (Date.now() / 1000) * (2 * Math.PI * (bpm / 60));
	let beatStrength = (Math.sin(beatPhase) + 1) / 2; // 0から1の間で変化
	// 急激な立ち上がりと非常にゆっくりとした減衰を表現
	beatStrength = Math.pow(beatStrength, 2.5); // 立ち上がりをさらに強調し、ピークを鋭く
	if (beatStrength > 0.6) beatStrength = 0.6 + (beatStrength - 0.6) * 0.3; // ピーク後の減衰を非常に緩やかに

	const timePhase = Date.now() * 0.002; // 全体的な揺らぎのテンポをさらにゆっくりに

	for (let i = 0; i < mainSpectrumNumBars; i++) {
		const angle = (i / mainSpectrumNumBars) * Math.PI * 2;

		// 中心に近いバーほど重低音の拍動の影響を強く受ける
		const normalizedIndex = i / mainSpectrumNumBars;
		// 外側に行くほど影響が減少するが、全体的に影響は残す
		const beatInfluence = 1 - Math.pow(normalizedIndex, 1.0); // 外側でも影響を感じるように

		// ノイズの周期と振幅を調整
		const noise1 = Math.sin(timePhase * 0.4 + i * 0.05) * 0.5 + 0.5; // ゆっくりとした低周波ノイズ
		const noise2 = Math.sin(timePhase * 1.0 + i * 0.1) * 0.5 + 0.5; // 少し早い中周波ノイズ

		// 拍動の強度を組み込んだ高さ計算
		let rawHeight = (
			0.1 + // ベースの高さ
			(0.7 * Math.sin(angle * 2 + timePhase * 0.8) * noise1 +
				0.3 * Math.cos(angle * 5 + timePhase * 1.2) * noise2) * // 中音域の細かい波
			(0.4 + beatStrength * 0.6 * beatInfluence) // 重低音の拍動による影響を強く
		);
		rawHeight = Math.max(0, rawHeight);

		mainSpectrumTargetBarHeights[i] = maxBarHeight * rawHeight;

		// スムージングと減衰を、重低音の重さを表現するように調整
		const currentToTargetDiff = mainSpectrumTargetBarHeights[i] - mainSpectrumCurrentBarHeights[i];
		if (currentToTargetDiff > 0) { // 立ち上がる時
			mainSpectrumCurrentBarHeights[i] += currentToTargetDiff * 0.2; // 立ち上がりは少し速く
		} else { // 減衰する時
			mainSpectrumCurrentBarHeights[i] += currentToTargetDiff * 0.05; // 減衰を非常にゆっくりに
		}

		mainSpectrumCurrentBarHeights[i] *= 0.98; // 減衰係数を高くして、残響を長く残す
		mainSpectrumCurrentBarHeights[i] = Math.max(mainSpectrumCurrentBarHeights[i], 1);


		const startX = centerX + Math.cos(angle) * baseRadius;
		const startY = centerY + Math.sin(angle) * baseRadius;
		const endX = centerX + Math.cos(angle) * (baseRadius + mainSpectrumCurrentBarHeights[i]);
		const endY = centerY + Math.sin(angle) * (baseRadius + mainSpectrumCurrentBarHeights[i]);

		// 色の調整：重低音のピーク時に、色相を深め、彩度と明るさを強調
		const currentHeightRatio = mainSpectrumCurrentBarHeights[i] / maxBarHeight;
		const baseHue = (timePhase * 10 + i * 0.3) % 360; // 色相の変化をよりゆっくりに
		const hue = (baseHue + beatStrength * 30) % 360; // 拍動時に色相を少しずらす
		const saturation = `${80 + beatStrength * 20 + currentHeightRatio * 10}%`; // 拍動時に彩度を強く
		const lightness = `${40 + currentHeightRatio * 20 + beatStrength * 20}%`; // 拍動時に明るさを強調
		mainSpectrumCtx.strokeStyle = `hsl(${hue}, ${saturation}, ${lightness})`;
		mainSpectrumCtx.lineWidth = 4; // 線を太くして重厚感を出す

		mainSpectrumCtx.beginPath();
		mainSpectrumCtx.moveTo(startX, startY);
		mainSpectrumCtx.lineTo(endX, endY);
		mainSpectrumCtx.stroke();
	}
}

// 擬似スペクトラムの描画関数 (画面遷移用)
// この関数は、初期ロード時（pageTransitionOverlayにinitial-load-activeクラスがある場合）のみ呼び出されます。
function drawTransitionSpectrum() {
	// この関数が意図せず呼び出された場合を警告
	if (pageTransitionOverlay && !pageTransitionOverlay.classList.contains('initial-load-active')) {
		console.warn("drawTransitionSpectrum was called unexpectedly. It should only run on initial page load with 'initial-load-active' class.");
		if (transitionAnimationFrameId) {
			cancelAnimationFrame(transitionAnimationFrameId);
			transitionAnimationFrameId = null;
		}
		return;
	}

	transitionAnimationFrameId = requestAnimationFrame(drawTransitionSpectrum);

	// tCtx が存在するかチェック
	if (typeof tCtx === 'undefined' || !tCtx || typeof transitionSpectrumCanvas === 'undefined' || !transitionSpectrumCanvas) {
		console.error("transitionSpectrumCanvas context not initialized. Skipping transition animation.");
		cancelAnimationFrame(transitionAnimationFrameId);
		transitionAnimationFrameId = null; // IDをリセット
		return;
	}

	tCtx.clearRect(0, 0, transitionSpectrumCanvas.width, transitionSpectrumCanvas.height);

	const centerX = transitionSpectrumCanvas.width / 2;
	const centerY = transitionSpectrumCanvas.height / 2;
	const baseRadiusX = centerX * 0.75;   // 横に広め
	const baseRadiusY = centerY * 0.45;  // 縦にやや抑えめ

	const maxBarHeight = 120; // バーの長さもやや大きめ

	// 重低音の拍動 (遷移用なのでメインよりは少し速めだが、重さは残す)
	const bpm = 50; // メインより少し速いBPM
	const beatPhase = (Date.now() / 1000) * (2 * Math.PI * (bpm / 60));
	let beatStrength = (Math.sin(beatPhase) + 1) / 2;
	beatStrength = Math.pow(beatStrength, 2.0); // 立ち上がりを強調
	if (beatStrength > 0.5) beatStrength = 0.5 + (beatStrength - 0.5) * 0.4; // 減衰を緩やかに

	const currentPhase = (Date.now() * 0.005) % (Math.PI * 2); // 全体的な揺らぎのテンポ

	for (let i = 0; i < transitionNumBars; i++) {
		const angle = (i / transitionNumBars) * Math.PI * 2;

		const normalizedIndex = i / transitionNumBars;
		const beatInfluence = 1 - Math.pow(normalizedIndex, 0.8); // 拍動の影響を全体的に強く

		const noise1 = Math.sin(currentPhase * 0.6 + i * 0.08) * 0.5 + 0.5;
		const noise2 = Math.cos(currentPhase * 1.2 + i * 0.1) * 0.5 + 0.5;

		// 拍動の強度を組み込んだ高さ計算
		let rawHeight = (
			0.2 +
			(0.6 * Math.sin(angle * 3 + currentPhase * 1.0) * noise1 +
				0.4 * Math.cos(angle * 5 + currentPhase * 1.5) * noise2) * (0.5 + beatStrength * 0.8 * beatInfluence) // 拍動の影響をより強く
		);
		rawHeight = Math.max(0, rawHeight);

		transitionTargetHeights[i] = maxBarHeight * rawHeight;

		// 立ち上がりと減衰の調整 (遷移用なので、ある程度のキレは残しつつ重さを表現)
		const currentToTargetDiff = transitionTargetHeights[i] - transitionBarHeights[i];
		if (currentToTargetDiff > 0) {
			transitionBarHeights[i] += currentToTargetDiff * 0.25; // 立ち上がりはそこそこ速く
		} else {
			transitionBarHeights[i] += currentToTargetDiff * 0.1; // 減衰をゆっくりに
		}

		transitionBarHeights[i] *= 0.97; // 残響を少し長く
		transitionBarHeights[i] = Math.max(transitionBarHeights[i], 1);

		const startX = centerX + Math.cos(angle) * baseRadiusX;
		const startY = centerY + Math.sin(angle) * baseRadiusY;
		const endX = centerX + Math.cos(angle) * (baseRadiusX + transitionBarHeights[i]);
		const endY = centerY + Math.sin(angle) * (baseRadiusY + transitionBarHeights[i]);

		// 色の調整：重低音のピーク時に、色相を深め、彩度と明るさを強調
		const currentHeightRatio = transitionBarHeights[i] / maxBarHeight;
		const baseHue = (currentPhase * 20 + i * 0.5) % 360;
		const hue = (baseHue + beatStrength * 40) % 360; // 拍動時に色相を大きくずらす
		const saturation = `${90 + beatStrength * 10 + currentHeightRatio * 5}%`; // 拍動時に彩度を強調
		const lightness = `${50 + currentHeightRatio * 20 + beatStrength * 15}%`; // 拍動時に明るさを強調
		tCtx.strokeStyle = `hsl(${hue}, ${saturation}, ${lightness})`;
		tCtx.lineWidth = 5; // 線を太くして重厚感を出す

		tCtx.beginPath();
		tCtx.moveTo(startX, startY);
		tCtx.lineTo(endX, endY);
		tCtx.stroke();
	}
}


/*===========================================================*/
/* ページロード時の初期化とイベントリスナー設定 (DOMContentLoaded & Load) */
/*===========================================================*/

// DOMContentLoaded イベントリスナー: DOM構築後、画像などのリソース読み込み前
document.addEventListener("DOMContentLoaded", () => {
	// Light/Dark Mode Toggle
	const toggleBtn = document.getElementById("modeToggle");
	const icon = document.getElementById("modeIcon");
	const body = document.body;

	if (toggleBtn && icon) {
		// localStorageから保存されたテーマを読み込み
		const savedTheme = localStorage.getItem("theme");
		if (savedTheme === "light") {
			body.classList.add("light-mode");
			body.classList.remove("dark-mode"); // デフォルトがdark-modeの場合に備えて
			icon.src = IMAGE_BASE_PATH + "light.svg"; // グローバル変数 IMAGE_BASE_PATH を使用
		} else {
			// デフォルトはダークモード (localStorageにthemeがないか、"dark"の場合)
			body.classList.add("dark-mode"); // bodyに明示的にクラスを追加
			body.classList.remove("light-mode");
			icon.src = IMAGE_BASE_PATH + "dark.svg"; // グローバル変数 IMAGE_BASE_PATH を使用
		}

		toggleBtn.addEventListener("click", () => {
			body.classList.toggle("light-mode");
			body.classList.toggle("dark-mode"); // light-modeとdark-modeを相互に切り替える
			const isLight = body.classList.contains("light-mode");
			icon.src = isLight ? IMAGE_BASE_PATH + "light.svg" : IMAGE_BASE_PATH + "dark.svg";
			localStorage.setItem("theme", isLight ? "light" : "dark");
		});
	}

	// --- メインページのオーディオスペクトラム (擬似データ生成) 初期化 ---
	audioSpectrumCanvas = document.getElementById('audioSpectrumCanvas'); // グローバル変数への代入
	if (audioSpectrumCanvas) {
		mainSpectrumCtx = audioSpectrumCanvas.getContext('2d'); // グローバル変数への代入
		audioSpectrumCanvas.style.display = 'none'; // 初期状態では非表示（loadイベント後に表示する）
		// キャンバスのサイズを動的に調整
		// DOMContentLoadedで一度設定し、resizeイベントリスナーで更新
		audioSpectrumCanvas.width = audioSpectrumCanvas.clientWidth;
		audioSpectrumCanvas.height = audioSpectrumCanvas.clientHeight;
	}


	// ページ遷移のクリックイベントを既存のナビゲーションリンクに適用
	const internalLinks = document.querySelectorAll(
		'#g-navi a, .btnlinestretches2, .freshman a, a[href^="Public/"], a[href$=".html"]'
	);

	internalLinks.forEach(link => {
		// 同じページ内へのアンカーリンクは対象外とする
		if (link.href.startsWith(window.location.origin + window.location.pathname + '#')) {
			return;
		}
		// 外部サイトへのリンクは対象外とする
		if (!link.href.startsWith(window.location.origin)) {
			return;
		}
		// ログインフォームのリンクはJSで制御されているため対象外 (ID: login_form)
		var loginForm = document.getElementById('login_form');
		if (loginForm && link.closest('#search-wrap')) { // search-wrap内のリンクはlogin_formと関連付けて除外
			return;
		}

		link.addEventListener('click', function (e) {
			e.preventDefault(); // デフォルトの遷移をキャンセル
			const targetUrl = this.href;

			// メインのスペクトラムアニメーションを停止
			if (mainSpectrumAnimationFrameId) {
				cancelAnimationFrame(mainSpectrumAnimationFrameId);
				mainSpectrumAnimationFrameId = null;
			}
			// 背景のオーディオスペクトラムを非表示にする
			if (audioSpectrumCanvas) {
				audioSpectrumCanvas.style.display = 'none';
			}

			// ページ遷移時のロード画面オーバーレイは表示しない
			if (pageTransitionOverlay) {
				pageTransitionOverlay.style.display = 'none';
				pageTransitionOverlay.classList.remove('active');
				pageTransitionOverlay.classList.remove('initial-load-active');
				if (transitionAnimationFrameId) {
					cancelAnimationFrame(transitionAnimationFrameId);
					transitionAnimationFrameId = null;
				}
			}

			// 実際のページ遷移をすぐに実行
			window.location.href = targetUrl;
		});
	});

	// 初回ロード時のオーバーレイ処理の初期設定
	pageTransitionOverlay = document.getElementById('page-transition-overlay'); // グローバル変数への代入
	if (pageTransitionOverlay) {
		transitionSpectrumCanvas = document.getElementById('transitionSpectrumCanvas'); // グローバル変数への代入
		if (transitionSpectrumCanvas) {
			tCtx = transitionSpectrumCanvas.getContext('2d'); // グローバル変数への代入
			transitionSpectrumCanvas.width = 300; // サイズ設定
			transitionSpectrumCanvas.height = 300;
		}
		// HTML側でinitial-load-activeクラスが付与されている場合のみ表示・アニメーション開始
		if (pageTransitionOverlay.classList.contains('initial-load-active')) {
			pageTransitionOverlay.style.display = 'flex';
			// drawTransitionSpectrum()はloadイベント内で実行されるため、ここでは呼び出さない
		} else {
			pageTransitionOverlay.style.display = 'none';
		}
	}
});


// $(window).on('load') イベントリスナー: ページ内の全てのリソース読み込み後
$(window).on('load', function () {

	// === ページ初期ロード時のオーディオスペクトラムオーバーレイの処理 ===
	pageTransitionOverlay = document.getElementById('page-transition-overlay'); // グローバル変数への代入
	// initial-load-activeクラスが付与されている場合のみ、ロード画面のアニメーションとフェードアウトを実行
	if (pageTransitionOverlay && pageTransitionOverlay.classList.contains('initial-load-active')) {
		// 初回ロード時はHTMLでinitial-load-activeクラスが付与されているので、アニメーションを開始する
		drawTransitionSpectrum();

		const initialLoadFadeOutDelay = 1500; // ロードアニメーションを表示する時間
		const fadeOutDuration = 500; // ロード画面がフェードアウトする時間

		setTimeout(() => {
			pageTransitionOverlay.classList.remove('initial-load-active'); // ロード画面クラスを削除
			pageTransitionOverlay.classList.remove('active'); // CSSでactiveクラスでアニメーションを制御している場合

			setTimeout(() => {
				if (transitionAnimationFrameId) {
					cancelAnimationFrame(transitionAnimationFrameId);
					transitionAnimationFrameId = null;
				}
				pageTransitionOverlay.style.display = 'none'; // ロード画面を完全に非表示にする

				if (audioSpectrumCanvas) {
					audioSpectrumCanvas.style.display = 'block'; // メインスペクトラムを表示
					drawPseudoSpectrum(); // メインスペクトラムアニメーションを開始
				}
			}, fadeOutDuration); // フェードアウトが完了するのを待ってからdisplay:noneにする
		}, initialLoadFadeOutDelay);
	} else {
		// initial-load-activeクラスがない場合（例: 戻るボタンでページに戻ってきた、またはHTMLにinitial-load-activeがない）
		// ロード画面は表示せず、すぐにメインコンテンツとメインスペクトラムを表示する
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


	// --- 既存のローディング完了後の処理 ---
	$('body').addClass('appear');

	// 共通の機能呼び出し
	mediaQueriesWin();
	FixedAnime();
	setFadeElement();
	setupHamburgerMenu(); // ハンバーガーメニューの初期化

	// タブメニューの初期化
	var tabLiFirst = $('.tab li:first-of-type');
	var areaFirst = $('.area:first-of-type');
	if (tabLiFirst.length && areaFirst.length) { // 要素が存在する場合のみ
		tabLiFirst.addClass("active");
		areaFirst.addClass("is-active");
		var hashName = location.hash;
		GethashID(hashName);
	}

	// フェードアニメーション
	fadeAnime();

	// タイピングアニメーションの初期化と実行
	var jsTypingElements = $(".js_typing");
	if (jsTypingElements.length) {
		TypingInit(); // 全js_typing要素をShuffleTextインスタンス化
		// 修正点: load時にもTypingAnime()を実行して、スクロール前にアニメーションを開始させる
		TypingAnime();
	}

	// Vegas.js スライダーの初期化
	initVegasSlider();

	// Muuriギャラリープラグイン設定
	var gridElem = $('.grid');
	if (gridElem.length) { // .grid要素が存在する場合のみ
		var grid = new Muuri('.grid', {
			showDuration: 600,
			showEasing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
			hideDuration: 600,
			hideEasing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
			visibleStyles: { opacity: '1', transform: 'scale(1)' },
			hiddenStyles: { opacity: '0', transform: 'scale(0.5)' }
		});

		// 並び替えボタン設定
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


	// Fancyboxの設定
	var fancyboxElements = $('[data-fancybox]');
	if (fancyboxElements.length) {
		fancyboxElements.fancybox({
			thumbs: { autoStart: true },
		});
	}

	//アコーディオンの初期表示
	var accordionArea = $('.accordion-area li:first-of-type section');
	if (accordionArea.length) {
		accordionArea.addClass("open");
		accordionArea.each(function (index, element) {
			// 修正点: titleクラスではなくtitle3クラス、boxクラスではなくbox3クラスを参照
			var Title = $(element).children('.title3');
			$(Title).addClass('close');
			var Box = $(element).children('.box3');
			$(Box).slideDown(500);
		});
	}

	// 修正点：setupSearchOverlay() をここに追加
	setupSearchOverlay();
});


// スクロールイベントは$(window).on('scroll', ...)でまとめて管理します。
$(window).scroll(function () {
	FixedAnime();
	setFadeElement();
	fadeAnime();
	// TypingInit() は load 時に一度だけ呼び出すべきなので、ここから削除
	TypingAnime(); // スクロール時にアニメーションを制御
});

// resizeイベントはwindow.addEventListenerでまとめて管理します。
// window.addEventListener("resize", function () { ... }); はファイルの冒頭付近に定義済みです。

// アコーディオンのイベントリスナー設定 (DOMContentLoaded または $(document).ready() で一度だけ実行)
$(function () { // jQuery shorthand for $(document).ready(function() { ... });
	setupAccordion(); // アコーディオンのイベントリスナー設定
	// タブメニューのクリックイベント設定もここに移動 (もしGethashIDを使わない場合)
	$('.tab a').on('click', function () {
		var idName = $(this).attr('href');
		GethashID(idName); // 設定したタブの読み込み
		return false; // aタグを無効にする
	});
});