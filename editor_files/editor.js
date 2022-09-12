/*

サーバへの画像データの送信テスト
送信するデータ
・インデックスデータ(index-data)
・パレットデータ(palette-data)

レイヤー構造
・ワークレイヤー
・描画レイヤー

to do
・グリッド表示(グリッドをどのレイヤーに描くか)(完了)
・パレットの表示(完了)
・ツールチップの表示(CSSアニメーションで表示)(完了)
・ツールバーを上に配置(完了)
・画像の投稿(完了)
・塗りつぶし長方形ツール(完了)
・パレットの初期位置設定(完了)
・キャンバスのサイズ指定(完了)
・塗りつぶし楕円ツール(完了)
・等倍表示ウィンドウ(完了)
・倍率の表示(完了)
・ショートカットキー(Alt)＋クリックでスポイト(完了)
・画面を閉じるときにアラート(完了)
・HSVの色選択(完了)
・描画時に連続データを一つの長方形にして描画負荷軽減(完了)
・矩形での範囲選択(完了)
・コピー、切り取り、貼り付け、移動
・選択範囲の拡大、縮小時の動作、グリッド対応
・大グリッド表示(完了)
・DOMに関係しているところとエディタ機能の部分を切り離す
・デバッグ用にファイルからの読み込み(完了)
・スポイトツール(完了)
	・1回選択したら前に使用していたツールに戻す
・画面遷移(完了)

・画面レイアウトの変更
・初期化処理の整理
・パレット周りのデータ構造の整理
・抜き色、透明色の扱い
・ツールアイコンの整理
・Undo
・Redo
・レイヤー
・キーコンフィグ
・オプション
	・グリッド
・環境データの保存
・ペンの太さ変更
・画像のスクロール(Shift + マウスドラッグ)
・アニメーション
・キャンバスの外からの選択範囲の開始

・使用しているパレットインデックスの最大値に応じて再描画の負荷を減らす
・既存の絵の編集
・サーバ連携部分の分離
・スクリプトのミニファイ
・画像のアトラス化
・選択ツールでクリックした時に1ドット選択にする

bug
・グリッドオフにしたときに線が残る(fix)
・最初から選択されているツールの選択状態が解除されていない(fix)
・パレットの移動がパレットから外れるとキャンセルされる
・ツールで描画中にグリッドが指定倍数以下でも表示される(fix)
・初期状態のキャンバスサイズが拡大、縮小した場合と違う(fix)
・矩形、直線ツールで座標がオーバーしている(fix)
・再描画したときにパレット総数を反映していない(fix)
・画面サイズを変えたときにマウスの座標が合っていない(fix)
・Undoしたときにプレビューウィンドウが更新されない(fix)
・塗りつぶし円が横にはみ出した時に回りこむ(fix)
・円が横にはみ出した時に回りこむ(fix)
・回転すると画像がずれる(fix)
・ツールをキャンセルしたときにグリッドが消える(fix)
・右端からペンで線を描いたときに左端に1ドット描画される(fix)
・円が表示されない(fix)
・パレットでドラッグしても色が変わっていない(fix)
・キーを押した時にdownだと複数回呼ばれてしまう(fix)
・キーでツールを切り替えてもボタンが選択状態にならない(fix)
・塗りつぶし円の真ん中が正しく塗りつぶされていない場合がある(fix)
・カラーピッカーを出すのに2回クリックしないといけない(fix)
・画像を読み込んだ時にグリッドが消える(fix)
・スクロールしてペンで描画すると位置がずれている(fix)
・細長い楕円の描画が途中で切れている(fix)
・パレットに数値入力した時にキャンバスのサイズがおかしくなる(fix)
・選択範囲を回転するときに選択範囲の大きさが変わっていない(fix)

・拡大縮小、選択範囲などを使用した時にグリッドが等倍でも出てしまう
・プレビューウィンドウで右クリックすると下のキャンバスの色をスポイトしてしまう
・描画時にキャンバス外で右クリックしてもキャンセルされない
・HSVのカラー選択で表示される数値が変わっていない
・楕円で(0, 0, 15, 15)の大きさで描画したときに円の形がおかしい
・スクロールしていると新規作成のフェードが画面全体にかからない

画面遷移
サイズ選択ダイアログ
→エディタ
→投稿ダイアログ
→ビューアページ

memo
・描画領域をブラウザ全体にしてしまうほうがいいかも
・ヘッダとフッタだけつけてその他のナビゲーションを排除
・パレットは右に固定
・選択範囲は一番上に置いておかないとドラッグできない

feedback
・色の指定を2次元の領域でしたい(HSVみたいな)
・ドラッグでカラーバーを変更
・カーソルの位置に何か出して欲しい
・パレットの初期色
・等倍表示ウィンドウ

editor: Editor
	layers[]: Layer
	activeLayer
	palette: Palette
	selection
	work
	context
	config
	keymap
	history

必要なモジュール
・color.js       Color
・palette.js     Palette
・colorpicker.js
・selection.js
・keymapper.js   KeyMapper
・base64.js      Base64
・canvas.js

必要なアイコン
・拡大
・縮小
・グリッド
・やり直し
・ペン
・直線
・矩形
・円
・塗りつぶし
・範囲選択
・コピー
・投稿

*/

(function (global, $) {
  'use strict';

  // サーバのURL
  let docId = 0,
    canvas,
    ctx,
    work,
    errorCtx,
    preview,
    selectionCtx,
    indexData,
    paletteData,
    palette,
    down = false,
    paletteIndex = 1,
    prevTool = 'pen',
    tool = 'pen',
    dropper = false,
    mode,
    storageMode = false,
    scroll = false;

  const $grid = $('grid');
  const $selection = $('selection');

  let points = [];
  const background = {
    position: 'middle',
    color: 'rgba(0, 0, 0, 1)',
    fit: true,
  };
  const option = {};
  option.scales = [1, 2, 4, 6, 8, 12, 16, 20, 24];
  option.zoom = 7;
  option.scale = option.scales[option.zoom];
  option.gridOn = true;
  option.grid = {
    color0: '#808080',
    color1: '#C0C0C0',
    size: 4, // 太線を引くグリッド数
    enable: false,
  };

  option.orimono = {
    kihon_tate: 0,
    kihon_yoko: 0,
    soshiki_tate: 0,
    soshiki_yoko: 0,
    waku_maisu: 0,
    kihon_data: [],
    soshiki_data: [],
    monsen_data: [],
    hikikomi_data: [],
  };

  let undoData = [],
    redoData = [];

  let activeTool, selectHandler;

  // 描画状態
  const context = {
    paletteIndex: 1,
    layers: [],
    tool: 'pen',
    prevTool: 'pen',
    dropper: false,
    down: false,
  };
  // 選択範囲
  const selection = {
    region: { x: 0, y: 0, w: 0, h: 0 },
    enable: false,
    indexData: null,
    transparent: false,
  };

  // プレビュー画像を描画する
  function drawPreview() {
    preview.canvas.width = indexData.width;
    preview.canvas.height = indexData.height;
    Palette.convert(paletteData);
    drawIndexedImageData(preview, indexData, paletteData, 1);
  }

  // キャンバスをリサイズする
  function resize() {
    canvas.width = indexData.width * option.scale;
    canvas.height = indexData.height * option.scale;
    option.canvasWidth = canvas.width;
    option.canvasHeight = canvas.height;
    work.canvas.width = canvas.width;
    work.canvas.height = canvas.height;
    errorCtx.canvas.width = canvas.width;
    errorCtx.canvas.height = canvas.height;
    if (selection.enable) {
    }
    for (let i = 0; i < Layer.count(); i++) {
      let layer = Layer.get(i).canvas;
      layer.width = canvas.width;
      layer.height = canvas.height;
    }
    ctx.translate(0, canvas.height); // 原点を左下に移動
    ctx.scale(1, -1); // 上記に伴いY軸の図り方を反転
    work.translate(0, canvas.height); // 原点を左下に移動
    work.scale(1, -1); // 上記に伴いY軸の図り方を反転
    errorCtx.translate(0, canvas.height); // 原点を左下に移動
    errorCtx.scale(1, -1); // 上記に伴いY軸の図り方を反転
  }

  function zoom() {
    option.scale = option.scales[option.zoom];
    resize();
    //		drawIndexedImage(ctx, indexData, palette, option.scale, paletteData);
    for (let i = 0; i < Layer.count(); i++) {
      let layer = Layer.get(i),
        trans = Palette.getTransparentIndex();
      drawIndexedImage(
        layer.ctx,
        layer.indexData,
        palette,
        option,
        paletteData,
        trans
      );
    }
    //		$('#zoomRate').text('x ' + option.scale);
  }

  // 拡大
  function zoomIn() {
    deselect();
    console.time('zoomIn');
    option.zoom++;
    if (option.zoom >= option.scales.length) {
      option.zoom = option.scales.length - 1;
    } else {
      zoom();
      grid();
    }
    console.timeEnd('zoomIn');
  }

  // 縮小
  function zoomOut() {
    deselect();
    option.zoom--;
    if (option.zoom < 0) {
      option.zoom = 0;
    } else {
      zoom();
      grid();
    }
  }

  // 等倍
  function zoomDefault() {
    deselect();
    option.zoom = 0;
    zoom();
  }

  // グリッドの表示
  function grid() {
    if (option.gridOn && option.zoom > 2) {
      drawGrid(work, option, indexData);
    }
  }

  // グリッドの表示切替
  function toggleGrid() {
    $grid.classList.toggle('selected');
    option.gridOn = !option.gridOn;
    option.imageWidth = indexData.width;
    if (option.gridOn) {
      grid();
    } else {
      work.clearRect(0, 0, work.canvas.width, work.canvas.height);
      // draw selection region
      // 選択範囲の再描画
    }
  }

  // 選択範囲の移動
  function moveSelection(ox, oy, x, y) {
    x = (x - ox + option.selection.region.x) * option.scale + 1;
    y = option.selection.region.y * option.scale + 1;
    $.position($selection, x, y);
  }

  // 垂直反転
  function flipVert() {
    if (selection.enable) {
      flipV(selectionCtx, selection.indexData);
    } else {
      record();
      flipV(ctx, indexData);
      drawPreview();
    }
  }

  // 水平反転
  function flipHorz() {
    if (selection.enable) {
      flipH(selectionCtx, selection.indexData);
    } else {
      record();
      flipH(ctx, indexData);
      drawPreview();
    }
  }

  // 回転
  function rotateRight() {
    if (selection.enable) {
      // 長方形の選択範囲を回転させるには一旦別の領域にコピーしておかないと消えてしまう
      $.size($selection, selectionCtx.canvas.height, selectionCtx.canvas.width);
      rotate90R(selectionCtx, selection.indexData);
      selection.region.w = selection.indexData.width;
      selection.region.h = selection.indexData.height;
    } else {
      record();
      rotate90R(ctx, indexData);
      drawPreview();
    }
  }

  function selectAll() {
    let r = selection.region;
    toggleTool('select')();
    $.position($selection, 0, 0);
    $.size($selection, ctx.canvas.width, ctx.canvas.height);
    r.x = 0;
    r.y = 0;
    r.w = indexData.width;
    r.h = indexData.height;
    selectHandler.enable = true;
    $.show($selection);
  }

  function shift(x, y) {
    if (selection.enable) {
      if (x !== 0) shiftH(selectionCtx, selection.indexData, x, option.scale);
      if (y !== 0) shiftV(selectionCtx, selection.indexData, y, option.scale);
    } else {
      record();
      if (x !== 0) shiftH(ctx, indexData, x, option.scale);
      if (y !== 0) shiftV(ctx, indexData, y, option.scale);
      drawPreview();
    }
  }

  function selectTool(t) {
    return () => {
      tool = t;
    };
  }

  // keymap登録
  const keymap = [
    { key: 'Z', f: zoomIn, name: '拡大' },
    { key: 'X', f: zoomOut, name: '縮小' },
    { key: 'C', f: zoomDefault, name: '等倍' },
    { key: 'P', f: selectTool('pen'), name: 'ペン' },
    { key: 'L', f: selectTool('line'), name: '直線' },
    { key: 'R', f: selectTool('rect'), name: '矩形' },
    { key: 'F', f: selectTool('paint'), name: '塗りつぶし' },
    { key: 'M', f: selectTool('select'), name: '範囲選択' },
    { key: 'Shift+3', f: toggleGrid, name: 'グリッド' },
    { key: 'Ctrl+Z', f: undo, name: '元に戻す' },
  ];

  KeyMapper.assign('Z', zoomIn);
  KeyMapper.assign('X', zoomOut);
  KeyMapper.assign('C', zoomDefault);
  KeyMapper.assign('P', toggleTool('pen'));
  KeyMapper.assign('L', toggleTool('line'));
  KeyMapper.assign('F', toggleTool('paint'));
  KeyMapper.assign('R', toggleTool('rect'));
  KeyMapper.assign('Ctrl+Z', undo);
  KeyMapper.assign('Ctrl+Y', redo);
  KeyMapper.assign('M', toggleTool('select'));
  KeyMapper.assign('H', () => {
    shiftH(ctx, indexData, 1, option.scale);
  });
  KeyMapper.assign('V', () => {
    shiftV(ctx, indexData, 1, option.scale);
  });
  KeyMapper.assign('Ctrl+A', selectAll);
  // 選択範囲の解除
  KeyMapper.assign('Ctrl+D', deselect);
  KeyMapper.assign('Shift+3', toggleGrid);
  KeyMapper.assign('Ctrl+S', () => {
    saveStorage('0');
  });
  KeyMapper.assign('Ctrl+L', () => {
    loadStorage('0');
  });
  KeyMapper.assign('O', toggleTool('outline'));
  KeyMapper.bind(document, 'trigger');

  function createImage(w, h) {
    option.imageWidth =
      option.orimono.soshiki_tate + option.orimono.waku_maisu + 1;
    option.imageHeight =
      option.orimono.soshiki_yoko + option.orimono.waku_maisu + 1;
    indexData = createIndexData(option.imageWidth, option.imageHeight);
    return indexData;
  }

  function initEditor() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    // ツール用のレイヤーを生成
    work = document.getElementById('work').getContext('2d');

    // 選択範囲のレイヤーを作成
    selectionCtx = document.getElementById('selection').getContext('2d');

    // エラー用レイヤー
    errorCtx = document.getElementById('background').getContext('2d');

    // パレットデータの作成
    paletteData = createPaletteData(256);
  }

  let hash = location.hash.slice(1),
    param = hash.split('=');

  if (param.length === 1) {
  } else {
    mode = param[0];
    docId = param[1];
  }

  initEditor();

  function toggleTool(t) {
    return () => {
      tool = t;
      activeTool && activeTool.classList.remove('selected');
      activeTool = $(t);
      activeTool.classList.add('selected');
      // 選択範囲解除
      if (tool !== 'select' && selectHandler.enable) {
        deselect();
        $.hide($selection);
      }
      dropper = false;
    };
  }

  if (typeof Palette !== 'undefined') {
    Palette.create('palette');
    Palette.setColorPicker((e) => {
      $.toggle($('color-picker'));
      const color = Color.strToRGB(Palette.getFrontColor());
      ColorPicker.setColor(color);
    });
    ColorPicker('color-picker', (c) => {
      Palette.setColor(Color.rgb(c[0], c[1], c[2]));
    });
  }

  if (typeof Widget !== 'undefined') {
    new Widget('palette');
    new Widget('color-picker');
    new Widget('view');
    new Widget('layers');
    preview = $('view').lastElementChild.getContext('2d');
  }

  let usedPalette = {};
  function usePalette(index, color) {
    usedPalette[index] = color;
  }

  let left = canvas.getBoundingClientRect().left,
    top = canvas.getBoundingClientRect().top;

  $.position($('palette'), left + 420, top + 4);
  $.position($('view'), left + 420, top + 300);
  $.position($('layers'), left + 420, top + 380);
  $.show($('overlay'));

  // ローカルファイルの読み込み
  FileLoader.onload = (i, p) => {
    record();
    deselect();
    clearLayer();
    indexData = i;
    paletteData = p;
    selection.indexData = createIndexData(indexData.width, indexData.height);
    Palette.setPaletteData(paletteData, true);
    Palette.setFrontColor(0);
    palette = Palette.getPaletteData();
    resize();
    drawIndexedImage(ctx, indexData, palette, option, paletteData);
    grid();
    drawPreview();
    Layer.clear();
    Layer.set(ctx, ctx.canvas, indexData);
  };
  FileLoader.bind($('container'));

  activeTool = $('pen');

  // Tool
  $.bind($('zoomin'), 'click', zoomIn);
  $.bind($('zoomout'), 'click', zoomOut);
  $.bind($('grid'), 'click', toggleGrid);
  $.bind($('undo'), 'click', undo);
  $.bind($('redo'), 'click', redo);
  $.bind($('paint'), 'click', toggleTool('paint'));
  $.bind($('pen'), 'click', toggleTool('pen'));
  $.bind($('line'), 'click', toggleTool('line'));
  $.bind($('rect'), 'click', toggleTool('rect'));
  $.bind($('frect'), 'click', toggleTool('frect'));
  $.bind($('ellipse'), 'click', toggleTool('ellipse'));
  $.bind($('fellipse'), 'click', toggleTool('fellipse'));
  $.bind($('select'), 'click', toggleTool('select'));
  $.bind($('copy'), 'click', paste);
  $.bind($('flipv'), 'click', flipVert);
  $.bind($('fliph'), 'click', flipHorz);
  $.bind($('rotater'), 'click', rotateRight);

  // スポイトツール
  $.bind($('dropper'), 'click', () => {
    prevTool = activeTool;
    activeTool && activeTool.classList.remove('selected');
    activeTool = $('dropper');
    activeTool.classList.add('selected');
    dropper = true;
  });

  $.bind($('twitter'), 'click', () => {
    window.open('/auth/twitter');
  });

  $.bind($('save'), 'click', () => {
    openStorageDialog(true);
  });
  $.bind($('load'), 'click', () => {
    openStorageDialog(false);
  });

  $.bind($('tools'), 'click', () => {
    $.toggle($('tools-2'));
    $('tools').classList.toggle('selected');
  });

  $.bind($('outline'), 'click', toggleTool('outline'));
  $.bind($('shiftl'), 'click', shift.bind(null, -1, 0));
  $.bind($('shiftr'), 'click', shift.bind(null, 1, 0));
  $.bind($('shiftu'), 'click', shift.bind(null, 0, -1));
  $.bind($('shiftd'), 'click', shift.bind(null, 0, 1));
  $.bind($('open-image'), 'click', () => {
    $('open-button').click();
  });

  $.bind($('open-button'), 'change', (e) => {
    FileLoader.load(e.target.files[0]);
    e.target.value = null;
  });

  $.bind($('layer'), 'click', () => {
    $.toggle($('layers'));
    $('layer').classList.toggle('selected');
  });
  // $.bind($('scroll'), 'click', e => {
  // 	$('scroll').classList.toggle('selected');
  // 	scroll = !scroll;
  // 	if (scroll) {
  // 	}
  // });
  $.bind($('tone'), 'click', toggleTool('tone'));
  $.bind($('transparent'), 'click', () => {
    $('transparent').classList.toggle('selected');
  });

  $.bind($('monnsenhikikomi'), 'click', () => {
    // 空の紋栓データを生成する
    let new_monsen_data = [];
    for (let i = 0; i < option.orimono.waku_maisu; i++) {
      new_monsen_data[i] = new Uint8Array(option.orimono.soshiki_yoko);
    }

    // 空の引込データを生成する
    let new_hikikomi_data = [];
    for (let i = 0; i < option.orimono.soshiki_tate; i++) {
      new_hikikomi_data[i] = new Uint8Array(option.orimono.waku_maisu);
    }

    let monsen_rows = []; // 組織図の列ごとに紋栓図の何列目かを保管する配列
    for (let i = 0; i < option.orimono.soshiki_tate; i++) {
      let monsen_row; // 紋栓図の列番号（左から何列目か）
      for (let j = 0; j < new_monsen_data.length; j++) {
        // 紋栓図の列が空白の場合は、組織図から紋栓図の列を作成する
        // または紋栓図の列の内容が組織図の列の内容と同じだった場合は同じ列として扱う
        if (
          new_monsen_data[j].every((e) => e === 0) ||
          JSON.stringify(new_monsen_data[j]) ==
            JSON.stringify(option.orimono.soshiki_data[i])
        ) {
          monsen_row = j;
          new_monsen_data[monsen_row] = option.orimono.soshiki_data[i];
          new_hikikomi_data[i][monsen_row] = 1;
          break;
        }
      }
      // 紋栓図の列と合致しない場合はnull。次の処理で赤列にしてエラー出力
      monsen_rows[i] = monsen_row ?? null;
    }

    errorCtx.fillStyle = 'rgb(255, 194, 194)';
    for (let i = 0; i < monsen_rows.length; i++) {
      if (monsen_rows[i] == null) {
        drawErrorRow(
          errorCtx,
          option.orimono.soshiki_min_x + i,
          option.orimono.soshiki_min_x + i,
          option.orimono.soshiki_min_y,
          option.orimono.soshiki_max_y,
          option.scale
        );
      }
    }

    if (monsen_rows.some((e) => e === null)) {
      // 1つでも紋栓を計算できなければ処理終了
      toastr.error('綜絖枚数内で紋栓を計算できませんでした', '', {
        timeOut: 2000,
      });
      return;
    }

    // 紋栓図、引込図は先に全てクリアする
    clearDots(
      ctx,
      option.orimono.monsen_min_x,
      option.orimono.monsen_min_y,
      option.orimono.monsen_max_x,
      option.orimono.monsen_max_y,
      indexData,
      option.scale
    );
    clearDots(
      ctx,
      option.orimono.hikikomi_min_x,
      option.orimono.hikikomi_min_y,
      option.orimono.hikikomi_max_x,
      option.orimono.hikikomi_max_y,
      indexData,
      option.scale
    );

		for (let i = 0; i < option.orimono.soshiki_tate; i++) {
			// 紋線図を作成
      for (let k = 0; k < option.orimono.soshiki_yoko; k++) {
        let x = monsen_rows[i];
        let y = k + option.orimono.monsen_min_y;
        if (option.orimono.soshiki_data[i][k] != 0){
          drawDotOrimono(
            ctx,
            x,
            y,
            indexData,
            1, // 紋栓図は必ず1
            option.scale,
            option
          );
        }
			}
			// 引込図を作成
      for (let k = 0; k < option.orimono.waku_maisu; k++) {
        let x = i + option.orimono.hikikomi_min_x;
        let y = k + option.orimono.hikikomi_min_y;
        if (k == monsen_rows[i]) {
          drawDotOrimono(
            ctx,
            x,
            y,
            indexData,
            1, // 引込図は必ず1
            option.scale,
            option
          );
        }
      }
    }
    option.orimono.monsen_data = new_monsen_data.map((list) => ({ ...list })); // ディープコピー
    option.orimono.hikikomi_data = new_hikikomi_data.map((list) => ({
      ...list,
    })); // ディープコピー
  });

  $.bind($('monsen'), 'click', () => {
    // 空の紋栓データを生成する
    let new_monsen_data = [];
    for (let i = 0; i < option.orimono.waku_maisu; i++) {
      new_monsen_data[i] = new Uint8Array(option.orimono.soshiki_yoko);
    }

    for (let i = 0; i < option.orimono.soshiki_tate; i++) {
      let monsen_row; // 紋栓図の列番号（左から何列目か）
      for (let j = 0; j < option.orimono.hikikomi_data[i].length; j++) {
        // 引込図の列の中でONになっているドットが紋栓図の列番号を表現している
        if (option.orimono.hikikomi_data[i][j] != 0) {
          // 引き込み図の列の中でONになるのは1つだけなので見つかった時点でbreak
          console.log('i:' + i + ' j:' + j);
          monsen_row = j;
          break;
        }
      }

      if (
        monsen_row !== undefined &&
        new_monsen_data[monsen_row].every((e) => e === 0)
      ) {
        // 対象の組織図の列の引込図に紋栓図の列番号が指定されており、
        // かつその紋栓図の列が未指定の場合、対象の組織図の列を紋栓図の列にコピーする
        new_monsen_data[monsen_row] = option.orimono.soshiki_data[i];
        for (let k = 0; k < option.orimono.soshiki_data[i].length; k++) {
          let x = monsen_row;
          let y = k + option.orimono.soshiki_min_y;
          if (option.orimono.soshiki_data[i][k] == 0) {
            clearDotOrimono(ctx, x, y, indexData, option);
          } else {
            drawDotOrimono(
              ctx,
              x,
              y,
              indexData,
              1, // 紋栓図は必ず1
              option.scale,
              option
            );
          }
        }
      } else if (
        monsen_row !== undefined &&
        JSON.stringify(new_monsen_data[monsen_row]) !=
          JSON.stringify(option.orimono.soshiki_data[i])
      ) {
        // 対象の組織図の列の引込図に紋栓図の列番号が指定されており、
        // 紋栓図と組織図の内容が異なる場合は、
        toastr.error('綜絖枚数内で紋栓を計算できませんでした', '', {
          timeOut: 2000,
        });
        break;
      }
    }
    option.orimono.monsen_data = new_monsen_data.map((list) => ({ ...list })); // ディープコピー
  });

  $.bind($('hikikomi'), 'click', () => {
    // 空の引込データを生成する
    let new_hikikomi_data = [];
    for (let i = 0; i < option.orimono.soshiki_tate; i++) {
      new_hikikomi_data[i] = new Uint8Array(option.orimono.waku_maisu);
    }
    for (let i = 0; i < option.orimono.soshiki_tate; i++) {
      let monsen_row; // 紋栓図の列番号（左から何列目か）
      for (let j = 0; j < option.orimono.waku_maisu; j++) {
        if (
          JSON.stringify(option.orimono.monsen_data[j]) ==
          JSON.stringify(option.orimono.soshiki_data[i])
        ) {
          monsen_row = j;
          new_hikikomi_data[i][monsen_row] = 1;
          break;
        }
      }
      for (let k = 0; k < option.orimono.waku_maisu; k++) {
        let x = i + option.orimono.hikikomi_min_x;
        let y = k + option.orimono.hikikomi_min_y;
        if (monsen_row !== undefined && k == monsen_row) {
          drawDotOrimono(
            ctx,
            x,
            y,
            indexData,
            1, // 引込図は必ず1
            option.scale,
            option
          );
        } else {
          clearDotOrimono(ctx, x, y, indexData, option);
        }
      }
    }
    option.orimono.hikikomi_data = new_hikikomi_data.map((list) => ({
      ...list,
    })); // ディープコピー
  });

  $.bind($('soshiki'), 'click', () => {
    paletteIndex = Palette.getFrontIndex();
    for (let i = 0; i < option.orimono.soshiki_tate; i++) {
      let monsen_count = option.orimono.hikikomi_data[i].findIndex(
        (element) => {
          return element == 1;
        }
      );
      if (monsen_count == -1) continue;
      let monsen_column = option.orimono.monsen_data[monsen_count];
      for (let j = 0; j < option.orimono.soshiki_yoko; j++) {
        option.orimono.soshiki_data[i][j] = monsen_column[j];
        let x = option.orimono.soshiki_min_x + i;
        let y = option.orimono.soshiki_min_y + j;
        if (monsen_column[j] == 0) {
          // console.log('clear:'+j);
          clearDot(ctx, x, y, indexData, option.scale);
          // 組織図の一番左下からみた座標
          let x_at_soshiki = x - option.orimono.soshiki_min_x;
          let y_at_soshiki = y - option.orimono.soshiki_min_y;
          option.orimono.soshiki_data[x_at_soshiki][y_at_soshiki] = 0;
        } else {
          // console.log('draw:' + j);
          drawDot(ctx, x, y, indexData, paletteIndex, option.scale);
          // 組織図の一番左下からみた座標
          let x_at_soshiki = x - option.orimono.soshiki_min_x;
          let y_at_soshiki = y - option.orimono.soshiki_min_y;
          option.orimono.soshiki_data[x_at_soshiki][y_at_soshiki] = 1;
        }
      }
    }
  });

  // サイズの指定
  $.bind($('new-image-submit'), 'click', (e) => {
    $.hide($('new-image'));
    //			$('#overlay').fadeOut();
    $.fadeOut($('overlay'));
    KeyMapper.bind(document, 'trigger');
    option.orimono.kihon_tate = Number($('kihon_tate').value);
    option.orimono.kihon_yoko = Number($('kihon_yoko').value);
    option.orimono.soshiki_tate = Number($('soshiki_tate').value);
    option.orimono.soshiki_yoko = Number($('soshiki_yoko').value);
    option.orimono.waku_maisu = Number($('waku_maisu').value);
    selection.indexData = createImage(
      option.orimono.soshiki_tate,
      option.orimono.soshiki_yoko
    );

    // 基本データを生成する
    let i = 0;
    let j = 0;
    let k = 0;
    let kihon_count = 0;
    let kihon_tate_count = Math.ceil(
      option.orimono.soshiki_yoko / option.orimono.kihon_yoko
    ); //組織の縦に基本が何枚入るか計算
    let kihon_yoko_count = Math.ceil(
      option.orimono.soshiki_tate / option.orimono.kihon_tate
    ); //組織の横に基本が何枚入るか計算
    for (i = 0; i < kihon_tate_count; i++) {
      for (j = 0; j < kihon_yoko_count; j++) {
        for (k = 0; k < option.orimono.kihon_yoko; k++) {
          option.orimono.kihon_data[kihon_count] = [];
          option.orimono.kihon_data[kihon_count][k] = new Uint8Array(
            option.orimono.kihon_tate
          );
        }
        option.orimono.kihon_data[kihon_count].kihon_min_x =
          option.orimono.waku_maisu + 1 + option.orimono.kihon_yoko * j;
        option.orimono.kihon_data[kihon_count].kihon_min_y =
          option.orimono.waku_maisu + 1 + option.orimono.kihon_tate * i;
        option.orimono.kihon_data[kihon_count].kihon_max_x =
          option.orimono.kihon_data[kihon_count].kihon_min_x +
          option.orimono.kihon_yoko -
          1;
        option.orimono.kihon_data[kihon_count].kihon_max_y =
          option.orimono.kihon_data[kihon_count].kihon_min_y +
          option.orimono.kihon_tate -
          1;
        kihon_count++;
      }
    }

    // 組織データを生成する
    for (i = 0; i < option.orimono.soshiki_tate; i++) {
      option.orimono.soshiki_data[i] = new Uint8Array(
        option.orimono.soshiki_yoko
      );
    }
    option.orimono.soshiki_min_x = option.orimono.waku_maisu + 1; // 空白の+1
    option.orimono.soshiki_min_y = option.orimono.waku_maisu + 1; // 空白の+1
    option.orimono.soshiki_max_x =
      option.orimono.soshiki_min_x + option.orimono.soshiki_tate;
    option.orimono.soshiki_max_y =
      option.orimono.soshiki_min_y + option.orimono.soshiki_yoko;

    // 紋栓データを生成する
    for (i = 0; i < option.orimono.waku_maisu; i++) {
      option.orimono.monsen_data[i] = new Uint8Array(
        option.orimono.soshiki_yoko
      );
    }
    option.orimono.monsen_min_x = 0;
    option.orimono.monsen_min_y = option.orimono.waku_maisu + 1; // 空白の+1
    option.orimono.monsen_max_x =
      option.orimono.monsen_min_x + option.orimono.waku_maisu;
    option.orimono.monsen_max_y =
      option.orimono.monsen_min_y + option.orimono.soshiki_yoko;

    // 引込データを生成する
    for (i = 0; i < option.orimono.soshiki_tate; i++) {
      option.orimono.hikikomi_data[i] = new Uint8Array(
        option.orimono.waku_maisu
      );
    }
    option.orimono.hikikomi_min_x = option.orimono.waku_maisu + 1; // 空白の+1
    option.orimono.hikikomi_min_y = 0;
    option.orimono.hikikomi_max_x =
      option.orimono.hikikomi_min_x + option.orimono.soshiki_yoko;
    option.orimono.hikikomi_max_y =
      option.orimono.hikikomi_min_y + option.orimono.waku_maisu;

    resize();
    grid();
    ctx.fillStyle = palette[0];
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawPreview();
    Layer.set(ctx, ctx.canvas, indexData);

    // 一番下にスクロール
    // scrollHeight ページの高さ clientHeight ブラウザの高さ
    let elm = document.documentElement;
    let bottom = elm.scrollHeight - elm.clientHeight;
    // 垂直方向へ移動
    window.scroll(0, bottom);
  });

  if (mode === 'fork' || mode === 'edit') {
    $.hide($('new-image'));

    load(docId, (data) => {
      $.hide($('loading'));
      Base64.decode(data.palette, paletteData.data);
      indexData = createIndexData(data.width, data.height);
      Base64.decode(data.index, indexData.data);

      palette = [];
      for (let i = 0, j = 0; i < paletteData.data.length; i++, j += 4) {
        palette.push(
          Color.rgb(
            paletteData.data[j],
            paletteData.data[j + 1],
            paletteData.data[j + 2]
          )
        );
      }

      selection.indexData = createIndexData(data.width, data.height);
      Palette.setPaletteData(palette, true);
      resize();
      ctx.fillStyle = palette[0];
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      drawIndexedImage(ctx, indexData, palette, option, paletteData);
      drawPreview();
    });
  } else {
    palette = [
      '#FFFFFF',
      '#000000',
      '#FF0000',
      '#00FF00',
      '#0000FF',
      '#FFFF00',
      '#FF00FF',
      '#00FFFF',
      '#808080',
      '#FF8080',
      '#80FF80',
      '#8080FF',
      '#FFFF80',
      '#80FFFF',
      '#FF80FF',
    ];

    Palette.setPaletteData(palette, false);
    Palette.convert(paletteData);

    selection.indexData = createImage(32, 32, 2);
    resize();
    ctx.fillStyle = palette[0];
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawPreview();
    //			$('#overlay').fadeIn();
    $.show($('overlay'));
  }

  Palette.change((e) => {
    // パレットが変更された際のイベント
    Palette.convert(paletteData);
    for (let i = 0; i < Layer.count(); i++) {
      let layer = Layer.get(i);
      if (e !== undefined) {
        // 色の入れ替え
        swapColor(layer.indexData, e[0], e[1]);
      }
      drawIndexedImage(
        layer.ctx,
        layer.indexData,
        palette,
        option,
        paletteData,
        Palette.getTransparentIndex()
      );
    }
    drawPreview();
  });

  Palette.setFrontColor(1);
  palette = Palette.getPaletteData();

  $.bind($('palette-opt'), 'click', () => {
    record();
    removeUnusedColor(indexData, paletteData);
    Palette.setPaletteData(paletteData, true);
  });

  $.bind($('work'), 'contextmenu', (e) => {
    let r = work.canvas.getBoundingClientRect();
    left = window.scrollX + r.left;
    top = window.scrollY + r.top;
    let x = e.pageX - left,
      y = work.canvas.height - (e.pageY - top); // Y軸は下から数えたいため
    points[0] = (y / option.scale) ^ 0;
    points[1] = (x / option.scale) ^ 0;
    paletteIndex = indexData.data[y * indexData.width + x];
    clearDotOrimono(ctx, points[1], points[0], indexData, option);
    e.preventDefault();
    e.stopPropagation();
    return false;
  });

  // 範囲選択
  selectHandler = {
    enable: false,
    transparent: false,
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    down: function (x, y) {
      let s = option.scale;
      this.x = x * s;
      this.y = y * s;
      this.w = ctx.canvas.width;
      this.h = ctx.canvas.height;

      if (this.enable) {
        deselect();
        this.enable = false;
      }

      selectionCtx.clearRect(
        0,
        0,
        selectionCtx.canvas.width,
        selectionCtx.canvas.height
      );

      $.position($selection, this.x, this.y);
      $.hide($selection);
      selectionCtx.canvas.classList.remove('active');
    },
    move: function (x, y) {
      let s = option.scale,
        sx = this.x,
        sy = this.y;

      x = x * s;
      y = y * s;

      x = x < 0 ? 0 : x >= this.w ? this.w : x;
      y = y < 0 ? 0 : y >= this.h ? this.h : y;

      let w = Math.abs(x - sx),
        h = Math.abs(y - sy);

      x = sx > x ? x : sx;
      y = sy > y ? y : sy;

      if (w === 0) w = s;
      if (h === 0) h = s;

      if (w > 0 && h > 0) {
        $.position($selection, x, y);
        $.size($selection, w, h);
        $.show($selection);
      }
    },
    up: function (x, y, px, py) {
      let s = option.scale,
        r = selection.region,
        sx = this.x,
        sy = this.y;

      x = x * s;
      y = y * s;

      x = x < 0 ? 0 : x >= this.w ? this.w : x;
      y = y < 0 ? 0 : y >= this.h ? this.h : y;

      let w = Math.abs(x - sx),
        h = Math.abs(y - sy);

      if (w === 0) w = s;
      if (h === 0) h = s;

      x = this.x > x ? x : this.x;
      y = this.y > y ? y : this.y;

      r.x = (x / s) ^ 0;
      r.y = (y / s) ^ 0;
      r.w = (w / s) ^ 0;
      r.h = (h / s) ^ 0;

      if (w > 0 && h > 0) {
        selectionCtx.canvas.width = w;
        selectionCtx.canvas.height = h;
        $.size($selection, w, h);
        $.show($selection);
        cut(this.transparent);
        this.enable = true;
        selection.transparent = this.transparent;
        selection.enable = true;
        selectionCtx.canvas.classList.add('active');
      }
    },
  };

  $.bind($('work'), 'mousedown', (e) => {
    let r = work.canvas.getBoundingClientRect();

    left = window.scrollX + r.left;
    top = window.scrollY + r.top;
    let x = e.pageX - left,
      y = work.canvas.height - (e.pageY - top), // Y軸は下から数えたいため
      size = option.scale;
    points[0] = (y / size) ^ 0;
    points[1] = (x / size) ^ 0;

    if (e.altKey) {
      // スポイト
      paletteIndex = indexData.data[points[0] * indexData.width + points[1]];
      Palette.setFrontColor(paletteIndex);
    } else if (dropper) {
      paletteIndex = indexData.data[points[0] * indexData.width + points[1]];
      Palette.setFrontColor(paletteIndex);

      // ツールアイコンをもとに戻す
      if (dropper) {
        activeTool && activeTool.classList.remove('selected');
        activeTool = prevTool;
        activeTool.classList.add('selected');
        // 選択範囲解除
        if (tool !== 'select' && selectHandler.enable) {
          deselect();
          $.hide($selection);
        }
        dropper = false;
      }
    } else if (e.shiftKey) {
      // スクロール
    } else if (e.button === 0) {
      record();
      paletteIndex = Palette.getFrontIndex();
      ctx.fillStyle = Palette.getFrontColor();

      if (paletteIndex === Palette.getTransparentIndex()) {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }

      work.fillStyle = ctx.fillStyle;
      switch (tool) {
        case 'pen':
          down = true;
          //				if(paletteIndex === 0) {
          //					clearDot(ctx, points[1], points[0], indexData, paletteIndex, option.scale);
          //				} else {
          drawDotOrimono(
            ctx,
            points[1],
            points[0],
            indexData,
            paletteIndex,
            option.scale,
            option
          );
          //				}
          break;
        case 'paint':
          paint(
            ctx,
            points[1],
            points[0],
            indexData,
            paletteIndex,
            option.scale
          );
          break;
        case 'outline':
          drawOutline(
            ctx,
            points[1],
            points[0],
            indexData,
            paletteIndex,
            option.scale
          );
          break;
        case 'line':
        case 'rect':
        case 'frect':
          drawDot(work, points[1], points[0], null, paletteIndex, option.scale);
        case 'ellipse':
        case 'fellipse':
          down = true;
          break;
        case 'select':
        case 'move':
          //				if(option.selection.enable && rectIn(option.selection.region, x, y)) {
          //					tool = 'move';
          //				}
          //				down = true;
          selectHandler.transparent = e.ctrlKey;
          selectHandler.down(points[1], points[0]);
          down = true;
          break;
        case 'tone':
          paintTone(
            ctx,
            points[1],
            points[0],
            indexData,
            paletteIndex,
            option.scale
          );
          break;
        default:
      }

      $.bind('mouseup', mouseupHandler);
      $.bind('mousemove', mousemoveHandler);
    } else if (e.button === 1) {
    }
    // Google Chromeで選択カーソルになるのを防ぐ
    e.preventDefault();
  });

  function mousemoveHandler(e) {
    if (down) {
      let size = option.scale,
        x = ((e.pageX - left) / size) ^ 0,
        y = ((e.pageY - top) / size) ^ 0,
        w = work.canvas.width,
        h = work.canvas.height,
        context = { palette: paletteIndex, option: option },
        dummy = { width: indexData.width, height: indexData.height };
      if (points[1] === x && points[0] === y) {
        return false;
      }
      work.clearRect(0, 0, w, h);
      switch (tool) {
        // TODO 現行にないのでコメントアウト
        // case 'pen':
        // 	let px = points[1],
        // 		py = points[0];
        // 	context.data = indexData.data;
        // 	drawLine(ctx, px, py, x, y, indexData, paletteIndex, option.scale);
        // 	points[0] = y;
        // 	points[1] = x;
        // 	break;
        case 'line':
          drawLine(
            work,
            points[1],
            points[0],
            x,
            y,
            dummy,
            paletteIndex,
            option.scale
          );
          break;
        case 'rect':
          drawRect(
            work,
            points[1],
            points[0],
            x,
            y,
            dummy,
            paletteIndex,
            option.scale
          );
          break;
        case 'frect':
          fillRect(
            work,
            points[1],
            points[0],
            x,
            y,
            dummy,
            paletteIndex,
            option.scale
          );
          break;
        case 'ellipse':
          drawEllipse(
            work,
            points[1],
            points[0],
            x,
            y,
            dummy,
            paletteIndex,
            option.scale
          );
          break;
        case 'fellipse':
          fillEllipse(
            work,
            points[1],
            points[0],
            x,
            y,
            dummy,
            paletteIndex,
            option.scale
          );
          break;
        case 'select':
          selectHandler.move(x, y, points[1], points[0]);
          break;
      }
      grid();
    }
    e.preventDefault();
    return false;
  }

  function mouseupHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.button === 0 && down) {
      down = false;
      let size = option.scale,
        x = ((e.pageX - left) / size) ^ 0,
        y = ((e.pageY - top) / size) ^ 0;
      work.clearRect(0, 0, work.canvas.width, work.canvas.height);
      // 実際のレイヤーに描画する
      if (tool === 'line') {
        drawLine(
          ctx,
          points[1],
          points[0],
          x,
          y,
          indexData,
          paletteIndex,
          option.scale
        );
      } else if (tool === 'rect') {
        drawRect(
          ctx,
          points[1],
          points[0],
          x,
          y,
          indexData,
          paletteIndex,
          option.scale
        );
      } else if (tool === 'frect') {
        fillRect(
          ctx,
          points[1],
          points[0],
          x,
          y,
          indexData,
          paletteIndex,
          option.scale
        );
      } else if (tool === 'ellipse') {
        drawEllipse(
          ctx,
          points[1],
          points[0],
          x,
          y,
          indexData,
          paletteIndex,
          option.scale
        );
      } else if (tool === 'fellipse') {
        fillEllipse(
          ctx,
          points[1],
          points[0],
          x,
          y,
          indexData,
          paletteIndex,
          option.scale
        );
      } else if (tool === 'select') {
        selectHandler.up(x, y, points[1], points[0]);
      }
      grid();
    }

    $.unbind('mouseup', mouseupHandler);
    $.unbind('mousemove', mousemoveHandler);

    // 等倍ウィンドウの更新
    drawPreview();
    return false;
  }

  let offsetX, offsetY;

  const moveHandler = {
    offsetX: 0,
    offsetY: 0,
    left: 0,
    top: 0,
    down: function (e) {
      this.offsetX = e.pageX;
      this.offsetY = e.pageY;
    },
    move: function (e) {
      if (down) {
        e.preventDefault();
        e.stopPropagation();
        let s = option.scale,
          x = (((e.pageX - offsetX + left) / s) ^ 0) * s,
          y = (((e.pageY - offsetY + top) / s) ^ 0) * s;
        $.position($selection, x, y);
      }
      return false;
    },
    up: function (e) {
      if (down) {
        e.preventDefault();
        e.stopPropagation();
        let s = option.scale,
          x = ((e.pageX - offsetX + left) / s) ^ 0,
          y = ((e.pageY - offsetY + top) / s) ^ 0;

        selection.region.x = x;
        selection.region.y = y;

        $.unbind('mouseup', moveHandler.up);
        $.unbind('mousemove', moveHandler.move);

        down = false;
      }
    },
  };

  $.bind($selection, 'mousedown', (e) => {
    left = e.target.offsetLeft;
    top = e.target.offsetTop;
    down = true;
    offsetX = e.pageX;
    offsetY = e.pageY;
    moveHandler.offsetX = e.pageX;
    moveHandler.offsetY = e.pageY;
    $.bind('mouseup', moveHandler.up);
    $.bind('mousemove', moveHandler.move);
    e.preventDefault();
  });

  let $layerList = $('layer-list'),
    $templateLayer = $('layer-list-template'),
    $currentLayer = $layerList.lastElementChild;

  $.bind($('layer-list'), 'click', (e) => {
    const target = e.target.parentNode;
    if ($currentLayer === target) {
      return;
    }
    if (target.localName === 'li') {
      if ($currentLayer) {
        $currentLayer.classList.remove('selected');
      }
      $currentLayer = target;
      $currentLayer.classList.add('selected');
      let id = $currentLayer.getAttribute('data-canvas-id');
      if (id) {
        const layer = Layer.find(id);
        indexData = layer.indexData;
        ctx = layer.ctx;
        drawPreview();
      }
    }
  });

  $.bind($('layer-list'), 'focusout', (e) => {
    const target = e.target;
    if (target.localName === 'div') {
      target.setAttribute('contenteditable', false);
    }
  });

  $.bind($('layer-list'), 'dblclick', (e) => {
    const target = e.target;
    if (target.localName === 'div') {
      target.setAttribute('contenteditable', true);
    }
  });

  $.bind($layerList, 'change', (e) => {
    let id = e.target.parentNode.parentNode.getAttribute('data-canvas-id');
    if (id) {
      $(id).style.display = e.target.checked ? 'block' : 'none';
      let layer = Layer.find(id);
      layer.visibility = !layer.visibility;
    }
  });

  function addLayer(width, height) {
    let item = $templateLayer.cloneNode(true);

    $layerList.insertBefore(item, $layerList.firstElementChild);
    let layer = Layer.add(width, height);
    layer.canvas.width = canvas.width;
    layer.canvas.height = canvas.height;
    item.removeAttribute('id');
    item.setAttribute('data-canvas-id', layer.canvas.id);
    item.lastChild.textContent = 'レイヤー' + (layer.index + 1);
    $('editor-canvas').appendChild(layer.canvas);

    return layer;
  }

  $.bind($('layer-add'), 'click', () => {
    if ($layerList.childElementCount <= 8) {
      addLayer(indexData.width, indexData.height);
    }
  });

  $.bind($('layer-remove'), 'click', () => {
    if ($layerList.childElementCount > 1) {
      if ($currentLayer) {
        let removeLayer = $currentLayer,
          id = removeLayer.getAttribute('data-canvas-id');

        if (id) {
          Layer.remove(id);
          $('editor-canvas').removeChild($(id));
        }

        if ($currentLayer.nextElementSibling) {
          $currentLayer = $currentLayer.nextElementSibling;
        } else {
          $currentLayer = $currentLayer.previousElementSibling;
        }
        $currentLayer.classList.add('selected');
        $layerList.removeChild(removeLayer);

        id = $currentLayer.getAttribute('data-canvas-id');
        if (id) {
          const layer = Layer.find(id);
          indexData = layer.indexData;
          ctx = layer.ctx;
          drawPreview();
        }
      }
    }
  });

  $.bind($('layer-up'), 'click', () => {
    if ($currentLayer && $currentLayer.previousElementSibling) {
      let id = $currentLayer.getAttribute('data-canvas-id');
      if (id) {
        Layer.up(id);
      }
      $layerList.insertBefore(
        $currentLayer,
        $currentLayer.previousElementSibling
      );
    }
  });

  $.bind($('layer-down'), 'click', () => {
    if ($currentLayer && $currentLayer.nextElementSibling) {
      let id = $currentLayer.getAttribute('data-canvas-id');
      if (id) {
        Layer.down(id);
      }
      $layerList.insertBefore(
        $currentLayer,
        $currentLayer.nextElementSibling.nextElementSibling
      );
    }
  });

  $.bind($('layer-merge'), 'click', () => {
    if ($currentLayer && $currentLayer.nextElementSibling) {
      let removeLayer = $currentLayer,
        removeId = removeLayer.getAttribute('data-canvas-id');

      if (removeId) {
        const layer = Layer.find(removeId);

        $('editor-canvas').removeChild($(removeId));

        if ($currentLayer.nextElementSibling) {
          $currentLayer = $currentLayer.nextElementSibling;
        } else {
          $currentLayer = $currentLayer.previousElementSibling;
        }
        $currentLayer.classList.add('selected');

        let id = $currentLayer.getAttribute('data-canvas-id');
        const baseLayer = Layer.find(id);

        baseLayer.ctx.drawImage(layer.canvas, 0, 0);
        mergeIndexData(
          layer.indexData,
          baseLayer.indexData,
          Palette.getTransparentIndex()
        );

        $layerList.removeChild(removeLayer);

        indexData = baseLayer.indexData;
        ctx = baseLayer.ctx;

        Layer.merge(removeId);

        drawPreview();
      }
    }
  });

  // レイヤーを1つ残して削除する
  function clearLayer() {
    let baseLayer = Layer.get(0);
    ctx = baseLayer.ctx;
    indexData = baseLayer.indexData;
    for (let i = 1; i < Layer.count(); i++) {
      let layer = Layer.get(i);
      $('editor-canvas').removeChild(layer.canvas);
    }

    for (let i = $layerList.childElementCount - 2; i >= 0; i--) {
      $layerList.removeChild($layerList.children[i]);
    }
    $currentLayer = $layerList.children[0];
    $currentLayer.classList.add('selected');
    $currentLayer.setAttribute('data-canvas-id', baseLayer.canvas.id);
    Layer.clear();
    return Layer.set(ctx, ctx.canvas, indexData);
  }

  // window.onbeforeunload = () => {
  // 	return 'ページを移動すると編集した情報が失われます';
  // };

  // 保存ダイアログのイベント設定
  for (let i = 0; i < 9; i++) {
    $.bind($('storage-' + i), 'click', (e) => {
      $.hide($('storage'));
      const name = e.target.id.slice(-1);
      if (storageMode) {
        saveStorage(name);
      } else {
        loadStorage(name);
      }
      const $overlay = $('overlay');
      $.fadeOut($overlay);
    });
  }

  $.bind($('storage-cancel'), 'click', () => {
    $.hide($('storage'));
    const $overlay = $('overlay');
    $.fadeOut($overlay);
  });

  // 保存ダイアログ表示
  function openStorageDialog(isSave) {
    const $overlay = $('overlay');
    const $storage = $('storage');
    const $caption = $('storage-caption');

    $.fadeIn($overlay, 0.5);
    $.show($storage);
    if (isSave) {
      $caption.textContent = 'Save';
      $storage.classList.add('save-dialog');
      $storage.classList.remove('load-dialog');
    } else {
      $caption.textContent = 'Load';
      $storage.classList.add('load-dialog');
      $storage.classList.remove('save-dialog');
    }
    storageMode = isSave;

    const p = createPaletteData(256);
    const idx = createIndexData(64, 64);
    for (let i = 0; i < 9; i++) {
      const canvas = $('storage-' + i);
      const ctx = canvas.getContext('2d');
      const json = Storage.load(i.toString());
      if (json) {
        const data = JSON.parse(json);
        Base64.decode(data.indexData[0], idx.data);
        Base64.decode(data.paletteData, p.data);
        idx.width = data.width;
        idx.height = data.height;
        const x = ((32 - idx.width) / 2) ^ 0;
        const y = ((32 - idx.height) / 2) ^ 0;
        drawIndexedImageData(ctx, idx, p, 1, 256, x, y);
      }
    }
  }

  function saveFile() {
    let png = document.getElementById('canvas').toDataURL();
    //png = png.replace("image/png", "image/octet-stream");
    window.open(png, 'save');
  }

  // ローカルストレージに保存
  function saveStorage(name) {
    let layers = [];
    for (let i = 0; i < Layer.count(); i++) {
      let layer = Layer.get(i);
      layers.push(Base64.encode(layer.indexData.data));
    }

    let json = JSON.stringify({
      indexData: layers,
      width: indexData.width,
      height: indexData.height,
      paletteData: Base64.encode(paletteData.data),
      transparent: Palette.getTransparentIndex(),
    });
    Storage.save(name, json);
  }

  // ローカルストレージから読み込み
  function loadStorage(name) {
    let json = Storage.load(name);
    if (json) {
      let data = JSON.parse(json);
      record();
      deselect();
      clearLayer();
      indexData = createIndexData(data.width, data.height);
      option.imageWidth = indexData.width;
      Layer.clear();
      Layer.set(ctx, ctx.canvas, indexData);
      Base64.decode(data.indexData[0], indexData.data);
      for (let i = 1; i < data.indexData.length; i++) {
        let layer = addLayer(data.width, data.height);
        layer.canvas.width = ctx.canvas.width;
        layer.canvas.height = ctx.canvas.height;
        Base64.decode(data.indexData[i], layer.indexData.data);
      }
      Base64.decode(data.paletteData, paletteData.data);
      selection.indexData = createIndexData(indexData.width, indexData.height);
      Palette.setPaletteData(paletteData, true);
      Palette.setFrontColor(0);
      Palette.setTransparentIndex(data.transparent);
      palette = Palette.getPaletteData();
      zoom();
      grid();
      drawPreview();
    }
  }

  // 編集履歴を記録する
  // コマンドが確定した時点で呼び出す(コマンドがキャンセルされることがあるため)
  function record() {
    if (pushRecord(undoData)) {
      redoData.length = 0;
    }
  }

  function pushRecord(tempData) {
    let diff = true;
    if (tempData.length > 0) {
      let back = tempData[tempData.length - 1];
      diff = hasDiffIndexData(back.data, indexData.data);
    }

    // 画像に差があるときだけ保存する
    if (diff) {
      let temp = createIndexData(indexData.width, indexData.height);

      copyRangeIndexData(indexData, temp);
      tempData.push(temp);
    }

    return diff;
  }

  // 取り消し
  function undo() {
    let temp = undoData.pop();

    if (temp) {
      if (!hasDiffIndexData(temp.data, indexData.data)) {
        temp = undoData.pop();
      }
    }

    if (temp) {
      pushRecord(redoData);

      copyRangeIndexData(temp, indexData);
      drawIndexedImage(ctx, indexData, palette, option, paletteData);
      drawPreview();
    }
  }

  // やり直し
  function redo() {
    let temp = redoData.pop();

    if (temp) {
      pushRecord(undoData);

      copyRangeIndexData(temp, indexData);
      drawIndexedImage(ctx, indexData, palette, option, paletteData);
      drawPreview();
    }
  }

  // 切り取り
  function cut(transparent) {
    let s = option.scale,
      r = selection.region,
      x = r.x * s,
      y = r.y * s,
      w = r.w * s,
      h = r.h * s;

    x = x < 0 ? 0 : x;
    y = y < 0 ? 0 : y;

    if (!transparent) {
      selectionCtx.fillStyle = palette[Palette.getTransparentIndex()];
      selectionCtx.fillRect(0, 0, w, h);
    }
    selectionCtx.drawImage(ctx.canvas, x, y, w, h, 0, 0, w, h);

    ctx.fillStyle = palette[Palette.getTransparentIndex()];
    ctx.fillRect(r.x * s, r.y * s, r.w * s, r.h * s);
    selection.indexData.width = r.w;
    selection.indexData.height = r.h;
    copyIndexData(indexData, selection.indexData, r.x, r.y, r.w, r.h);
    fillIndexData(indexData, Palette.getTransparentIndex(), r.x, r.y, r.w, r.h);
    //		drawIndexedImage(selectionCtx, selection.indexData, palette, option.scale);

    //		if(option.gridOn && option.zoom > 2) {
    //			drawGrid(selectionCtx, option, option.scale);
    //		}
    if (transparent) {
      // 背景色を抜く
      drawClearColor(
        selectionCtx,
        selection.indexData,
        Palette.getTransparentIndex(),
        option.scale
      );
    }
  }

  // 選択解除
  function deselect() {
    if (!selection.enable) return;
    selection.enable = false;
    let s = option.scale,
      r = selection.region,
      x = r.x * s,
      y = r.y * s,
      transparentIndex = selection.transparent
        ? Palette.getTransparentIndex()
        : 256;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(selectionCtx.canvas, x, y);
    copyIndexData(
      selection.indexData,
      indexData,
      0,
      0,
      r.w,
      r.h,
      r.x,
      r.y,
      transparentIndex
    );
    $.hide($selection);

    drawPreview();
  }

  // 貼り付け
  function paste() {
    if (!selection.enable) return;

    deselect();
    $.position($selection, 0, 0);
    selection.region.x = 0;
    selection.region.y = 0;
    $.show($selection);
    selection.enable = true;
  }

  // 画面更新
  //	function refresh() {
  //		drawIndexedImage(ctx, indexData, palette, option);
  //	}

  // サブウィンドウから呼び出すための関数
  global.getImage = () => {
    Palette.convert(paletteData);
    return {
      indexData: indexData,
      paletteData: paletteData,
    };
  };
})(this, Selector);
