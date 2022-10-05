/*



*/

(function (global, $) {
  ('use strict');

  // サーバのURL
  let docId = 0,
    canvas,
    ctx,
    work,
    errorCtx,
    charCtx,
    preview,
    selectionCtx,
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
  option.scales = [6, 8, 12, 16, 20, 24];
  option.fontSizes = [6, 8, 10, 14, 16, 20];
  option.zoom = 4;
  option.scale = option.scales[option.zoom];
  option.fontSize = option.fontSizes[option.zoom];
  option.gridOn = true;
  option.grid = {
    color0: '#808080',
    color1: '#C0C0C0',
    size: 4, // 太線を引くグリッド数
    enable: false,
  };

  let orimonoData = {
    kihon_tate: 0,
    kihon_yoko: 0,
    soshiki_tate: 0,
    soshiki_yoko: 0,
    waku_maisu: 0,
    kihon_data: [],
    soshiki_data: [],
    monsen_data: [],
    hikikomi_data: [],
    monsen_color_data: [],
    monsen_char_data: [],
    hikikomi_color_data: [],
    hikikomi_char_data: [],
    osawari_data: [],
    monsen_color_min_x: 0,
    monsen_color_min_y: 0,
    monsen_color_max_x: 0,
    monsen_color_max_y: 0,
    monsen_char_min_x: 0,
    monsen_char_min_y: 0,
    monsen_char_max_x: 0,
    monsen_char_max_y: 0,
    hikikomi_color_min_x: 0,
    hikikomi_color_min_y: 0,
    hikikomi_color_max_x: 0,
    hikikomi_color_max_y: 0,
    hikikomi_char_min_x: 0,
    hikikomi_char_min_y: 0,
    hikikomi_char_max_x: 0,
    hikikomi_char_max_y: 0,
    osawari_min_x: 0,
    osawari_min_y: 0,
    osawari_max_x: 0,
    osawari_max_y: 0,
    kanren_min_x: 0,
    kanren_min_y: 0,
    kanren_max_x: 0,
    kanren_max_y: 0,
    soshiki_min_x: 0,
    soshiki_min_y: 0,
    soshiki_max_x: 0,
    soshiki_max_y: 0,
    monsen_min_x: 0,
    monsen_min_y: 0,
    monsen_max_x: 0,
    monsen_max_y: 0,
    hikikomi_min_x: 0,
    hikikomi_min_y: 0,
    hikikomi_max_x: 0,
    hikikomi_max_y: 0,
    select_x: 0,
    select_y: 0,
  };

  let undoData = [],
    redoData = [];

  let activeTool, selectHandler;

  // 描画状態
  const context = {
    paletteIndex: 1,
    tool: 'pen',
    prevTool: 'pen',
    dropper: false,
    down: false,
  };
  // 選択範囲
  const selection = {
    region: { x: 0, y: 0, w: 0, h: 0 },
    enable: false,
    selectionData: [],
    transparent: false,
    type: null,
  };

  // Canvasを生成
  $.bind($('generate-canvas'), 'click', (e) => {
    if (
      400 < Number($('kihon_tate').value) ||
      400 < Number($('kihon_yoko').value) ||
      400 < Number($('soshiki_tate').value) ||
      400 < Number($('soshiki_yoko').value) ||
      1 > Number($('kihon_tate').value) ||
      1 > Number($('kihon_yoko').value) ||
      1 > Number($('soshiki_tate').value) ||
      1 > Number($('soshiki_yoko').value)
    ) {
      toastr.error('たて糸本数・よこ糸本数は1〜400を指定して下さい。');
      return;
    }
    if (
      Number($('soshiki_tate').value) < Number($('kihon_tate').value) ||
      Number($('soshiki_yoko').value) < Number($('kihon_yoko').value)
    ) {
      toastr.error('基本サイズは組織サイズより小さくしてください。');
      return;
    }
    if (
      24 < Number($('waku_maisu').value) ||
      1 > Number($('waku_maisu').value)
    ) {
      toastr.error('枠枚数は1〜24を指定して下さい。');
      return;
    }
    $.hide($('new-image'));
    $.fadeOut($('overlay'));
    KeyMapper.bind(document, 'trigger');
    orimonoData = createOrimonoData(
      Number($('kihon_tate').value),
      Number($('kihon_yoko').value),
      Number($('soshiki_tate').value),
      Number($('soshiki_yoko').value),
      Number($('waku_maisu').value)
    );

    resize();
    grid();
    ctx.fillStyle = palette[0];
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawPreview();

    // 一番下にスクロール
    // scrollHeight ページの高さ clientHeight ブラウザの高さ
    let elm = document.documentElement;
    let bottom = elm.scrollHeight - elm.clientHeight;
    // 垂直方向へ移動
    window.scroll(0, bottom);
  });

  // プレビュー画像を描画する
  function drawPreview() {
    preview.canvas.width = 84;
    preview.canvas.height = 84;
    // TODOプレビューはちゃんと作り込みが必要
    // drawOrimonoData(preview, orimonoData, paletteData, 1);
  }

  function getCanvasWidth() {
    // canvasの横幅は、枠枚数＋１（空白列）＋組織図の経糸本数をスケールで掛ける
    let width = orimonoData.soshiki_max_x * option.scale + 1; // translateで開始位置をX,Yとも1ずらして線が消えないようにしているのでキャンバスサイズも+1px
    return width;
  }

  function getCanvasHeight() {
    // canvasの横幅は、枠枚数＋１（空白列）＋組織図の緯糸本数をスケールで掛ける
    let width = orimonoData.soshiki_max_y * option.scale + 1; // translateで開始位置をX,Yとも1ずらして線が消えないようにしているのでキャンバスサイズも+1px
    return width;
  }
  // キャンバスをリサイズする
  function resize() {
    // canvas上で文字がぼやけるのを防ぐために利用する
    // https://qiita.com/udoP_/items/bba03df1825023fba63b
    let ratio = window.devicePixelRatio;

    canvas.width = getCanvasWidth();
    canvas.height = getCanvasHeight();
    option.canvasWidth = canvas.width;
    option.canvasHeight = canvas.height;
    work.canvas.width = canvas.width;
    work.canvas.height = canvas.height;
    errorCtx.canvas.width = canvas.width;
    errorCtx.canvas.height = canvas.height;
    charCtx.canvas.width = canvas.width * ratio; // canvas上で文字がぼやけるのを防ぐ
    charCtx.canvas.height = canvas.height * ratio; // canvas上で文字がぼやけるのを防ぐ

    // editor-canvasにもheightを指定することでselectionCtxをbottomから指定できるようにする（widthはついで）
    let canvasWidth = canvas.width + 'px';
    let canvasHeight = canvas.height + 'px';
    document.getElementById('editor-canvas').style.width = canvasWidth;
    document.getElementById('editor-canvas').style.height = canvasHeight;

    // 文字がにじむのでcanvaサイズを指定する
    document.getElementById('char').style.width = canvasWidth;
    document.getElementById('char').style.height = canvasHeight;

    ctx.translate(1, canvas.height - 1); // 原点を左下に移動
    ctx.scale(1, -1); // 上記に伴いY軸の図り方を反転
    work.translate(1, canvas.height - 1); // 原点を左下に移動
    work.scale(1, -1); // 上記に伴いY軸の図り方を反転
    errorCtx.translate(1, canvas.height - 1); // 原点を左下に移動
    errorCtx.scale(1, -1); // 上記に伴いY軸の図り方を反転
    selectionCtx.translate(1, canvas.height - 1); // 原点を左下に移動
    selectionCtx.scale(1, -1); // 上記に伴いY軸の図り方を反転
    // charCtx.translate(ratio, canvas.height * ratio - 1); // 文字が反転してしまうので利用しない
    charCtx.scale(ratio, ratio); // canvas上で文字がぼやけるのを防ぐ
  }

  function zoom() {
    option.scale = option.scales[option.zoom];
    option.fontSize = option.fontSizes[option.zoom];
    resize();
    drawOrimonoData(ctx, charCtx, orimonoData, palette, option, paletteData);
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

  // グリッドの表示
  function grid() {
    if (option.gridOn) {
      drawGrid(work, option, orimonoData);
    }
  }

  // グリッドの表示切替
  function toggleGrid() {
    $grid.classList.toggle('selected');
    option.gridOn = !option.gridOn;
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
    // 織方図では組織図の垂直反転だけでよい
    clearCanvas(errorCtx);
    clearCanvas(selectionCtx);
    deselect();
    record();
    flipV(ctx, charCtx, orimonoData, palette, option, paletteData);
    drawPreview();
  }

  // 水平反転
  function flipHorz() {
    // 織方図では組織図の水平反転だけでよい
    clearCanvas(errorCtx);
    clearCanvas(selectionCtx);
    deselect();
    record();
    flipH(ctx, charCtx, orimonoData, palette, option, paletteData);
    drawPreview();
  }

  // 回転
  function rotateRight() {
    // 織方図では組織図の回転だけでよい
    clearCanvas(errorCtx);
    clearCanvas(selectionCtx);
    deselect();
    record();
    rotate90R(ctx, charCtx, orimonoData, palette, option, paletteData);
    drawPreview();
  }

  // 裏返し
  function reverse() {
    // 織方図では組織図の裏返しだけでよい
    clearCanvas(errorCtx);
    clearCanvas(selectionCtx);
    deselect();
    record();
    reverseSoshiki(ctx, charCtx, orimonoData, palette, option, paletteData);
    drawPreview();
  }

  // 印刷
  async function print() {
    // 子どもノードをすべて消す（プリントを押すたびに増えてしまうので）
    // https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
    document.getElementById('printArea').innerHTML = '';

    // ctx,workは左下から数える
    let w = (orimonoData.kihon_data[0].kihon_max_x + 1) * option.scale + 1;
    let h = (orimonoData.kihon_data[0].kihon_max_y + 1) * option.scale + 1;
    // charは右上から数える

    let printCanvasElement = document.createElement('canvas');
    let printCanvas = printCanvasElement.getContext('2d');
    printCanvas.canvas.width = w;
    printCanvas.canvas.height = h;

    printCanvas.fillStyle = 'rgb( 255, 255, 255)';
    printCanvas.fillRect(0, 0, w, h);

    let y = ctx.canvas.height - h; // yは上からしか測れないdrawImage仕様のため。
    let y2 = orimonoData.monsen_max_y * option.scale - h;

    printCanvas.drawImage(ctx.canvas, 0, y, w, h, 0, 0, w, h);
    printCanvas.drawImage(work.canvas, 0, y, w, h, 0, 0, w, h);
    printCanvas.drawImage(charCtx.canvas, 0, y2 * 2, w * 2, h * 2, 0, 0, w, h); // charCtxは文字がにじまないようにcanvasサイズを2倍にしているので*2している

    // デフォルト（option.zoom == 4）
    let maxHeightDot = 32;
    let maxWidthDot = 48;
    if (option.zoom == 3) {
      maxHeightDot = 40;
      maxWidthDot = 60;
    } else if (option.zoom == 2) {
      maxHeightDot = 60;
      maxWidthDot = 90;
    } else if (option.zoom == 1) {
      maxHeightDot = 80;
      maxWidthDot = 120;
    } else if (option.zoom == 0) {
      maxHeightDot = 100;
      maxWidthDot = 150;
    } else if (option.zoom == 5) {
      maxHeightDot = 24;
      maxWidthDot = 36;
    }
    let heightCount = Math.ceil(
      orimonoData.kihon_data[0].kihon_max_y / maxHeightDot
    );
    let widthCount = Math.ceil(
      orimonoData.kihon_data[0].kihon_max_x / maxWidthDot
    );
    let printHeight = maxHeightDot * option.scale + 1;
    let printWidth = maxWidthDot * option.scale + 1;

    await (() => {
      for (let i = 0; i < heightCount; i++) {
        for (let j = 0; j < widthCount; j++) {
          let tempElement = document.createElement('canvas');
          let tempCanvas = tempElement.getContext('2d');
          tempCanvas.canvas.width = 1050; // A4一枚に入る範囲としている
          tempCanvas.canvas.height = 700; // A4一枚に入る範囲としている
          tempCanvas.drawImage(
            printCanvas.canvas,
            printWidth * j,
            h - printHeight - printHeight * i,
            printWidth,
            printHeight,
            0,
            0,
            printWidth,
            printHeight
          );
          let newImg = document.createElement('img');
          newImg.src = tempElement.toDataURL();
          document.getElementById('printArea').appendChild(newImg);
        }
      }
    })();

    // 画像としてダウンロード
    // var image = printCanvas.canvas
    //   .toDataURL('image/png')
    //   .replace('image/png', 'image/octet-stream');
    // window.location.href = image;

    document.getElementById('content').style.width = ctx.canvas.width + 'px';
    document.getElementById('content').style.height = ctx.canvas.height + 'px';
    window.print();

    return false;
  }

  function shift(x, y) {
    if (selection.enable) {
      if (x !== 0) shiftH(selectionCtx, selection.orimonoData, x, option.scale);
      if (y !== 0) shiftV(selectionCtx, selection.orimonoData, y, option.scale);
    } else {
      record();
      if (x !== 0) shiftH(ctx, orimonoData, x, option.scale);
      if (y !== 0) shiftV(ctx, orimonoData, y, option.scale);
      drawPreview();
    }
  }

  // keymap登録
  const keymap = [
    { key: 'Shift+3', f: toggleGrid, name: 'グリッド' },
    { key: 'Ctrl+Z', f: undo, name: 'もとに戻す' },
    { key: 'Ctrl+Y', f: redo, name: 'やり直し' },
    { key: 'ARROWUP', f: arrow('up'), name: '上に1つ移動' },
    { key: 'ARROWDOWN', f: arrow('down'), name: '下に1つ移動' },
    { key: 'ARROWLEFT', f: arrow('left'), name: '左に1つ移動' },
    { key: 'ARROWRIGHT', f: arrow('right'), name: '右に1つ移動' },
    { key: ' ', f: arrow('right'), name: 'クリア' },
    { key: 'BACKSPACE', f: clearByKeyboard(), name: 'クリア' },
    { key: ',', f: clearByKeyboard(), name: '書き込み' },
    { key: '.', f: draw('clear'), name: 'クリア' },
  ];

  KeyMapper.assign('Ctrl+Z', undo);
  KeyMapper.assign('Ctrl+Y', redo);

  KeyMapper.assign('ARROWUP', arrow('up'));
  KeyMapper.assign('ARROWDOWN', arrow('down'));
  KeyMapper.assign('ARROWLEFT', arrow('left'));
  KeyMapper.assign('ARROWRIGHT', arrow('right'));
  KeyMapper.assign(',', draw('draw'));
  KeyMapper.assign('.', draw('clear'));
  KeyMapper.assign('DRAWCHAR', drawCharByKeyboard());
  KeyMapper.assign(' ', clearByKeyboard());
  KeyMapper.assign('BACKSPACE', clearByKeyboard());
  KeyMapper.bind(document, 'trigger');

  function drawCharByKeyboard() {
    return (char) => {
      if (
        selection.type == 'monsen-char' ||
        selection.type == 'hikikomi-char'
      ) {
        let x = selection.region.x;
        let y = selection.region.y;
        clearChar(charCtx, x, y, option);
        drawChar(charCtx, char, x, y, option);
        if (selection.type == 'monsen-char') {
          orimonoData.monsen_char_data[y - orimonoData.monsen_char_min_y] =
            char;
        } else {
          orimonoData.hikikomi_char_data[x - orimonoData.hikikomi_char_min_x] =
            char;
        }
      }
    };
  }

  function clearByKeyboard() {
    return () => {
      if (
        selection.type == 'monsen-char' ||
        selection.type == 'hikikomi-char'
      ) {
        let x = selection.region.x;
        let y = selection.region.y;
        clearChar(charCtx, x, y, option);
        if (selection.type == 'monsen-char') {
          orimonoData.monsen_char_data[y - orimonoData.monsen_char_min_y] =
            undefined;
        } else {
          orimonoData.hikikomi_char_data[x - orimonoData.hikikomi_char_min_x] =
            undefined;
        }
      }
    };
  }
  function arrow(direction) {
    return () => {
      if (direction == 'up') {
        selection.region.y = selection.region.y + 1;
      } else if (direction == 'down') {
        selection.region.y = selection.region.y - 1;
      } else if (direction == 'left') {
        selection.region.x = selection.region.x - 1;
      } else if (direction == 'right') {
        selection.region.x = selection.region.x + 1;
      }

      selectHandler.down(selection.region.x, selection.region.y);
      selectHandler.up(false);
    };
  }

  function draw(draw) {
    return () => {
      if (selection.type == null || selection.type == 'other') return;
      clearCanvas(selectionCtx);
      if (draw == 'draw') {
        let = paletteIndex = Palette.getColorIndex();
        drawDotOrimono(
          ctx,
          selection.region.x,
          selection.region.y,
          orimonoData,
          paletteIndex,
          option
        );
      } else {
        clearDotOrimono(
          ctx,
          selection.region.x,
          selection.region.y,
          orimonoData,
          option
        );
      }
    };
  }

  function initEditor() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    // ツール用のレイヤーを生成
    work = document.getElementById('work').getContext('2d');

    // 選択範囲のレイヤーを作成
    selectionCtx = document.getElementById('selection').getContext('2d');

    // 文字用レイヤー（translateすると文字が反転するのでしない）
    charCtx = document.getElementById('char').getContext('2d');

    // エラー用レイヤー
    errorCtx = document.getElementById('error').getContext('2d');
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
      if (tool !== 'select') {
        deselect();
      }
      dropper = false;
    };
  }

  if (typeof Palette !== 'undefined') {
    Palette.create('palette');
  }

  if (typeof Widget !== 'undefined') {
    new Widget('palette');
    new Widget('color-picker');
    new Widget('view');
    preview = $('view').lastElementChild.getContext('2d');
  }

  let usedPalette = {};
  function usePalette(index, color) {
    usedPalette[index] = color;
  }

  let left = canvas.getBoundingClientRect().left,
    top = canvas.getBoundingClientRect().top;

  $.positionTop($('view'), left + 420, top + 300);
  $.hide($('palette'));
  $.hide($('view'));
  $.show($('overlay'));

  // ローカルファイルの読み込み
  FileLoader.onload = (i, p) => {
    record();
    deselect();
    orimonoData = i;
    paletteData = p;
    selection.orimonoData = createOrimonoData(
      orimonoData.width,
      orimonoData.height
    );
    Palette.setColor(0);
    // palette = Palette.getPaletteData();
    resize();
    drawOrimonoData(ctx, charCtx, orimonoData, palette, option, paletteData);
    grid();
    drawPreview();
  };
  FileLoader.bind($('container'));

  activeTool = $('pen');

  // Tool
  $.bind($('zoomin'), 'click', zoomIn);
  $.bind($('zoomout'), 'click', zoomOut);
  $.bind($('grid'), 'click', toggleGrid);
  $.bind($('undo'), 'click', undo);
  $.bind($('redo'), 'click', redo);
  $.bind($('pen'), 'click', toggleTool('pen'));
  $.bind($('select'), 'click', toggleTool('select'));
  $.bind($('copy'), 'click', paste);
  $.bind($('clear'), 'click', clear);
  $.bind($('flipv'), 'click', flipVert);
  $.bind($('fliph'), 'click', flipHorz);
  $.bind($('rotate'), 'click', rotateRight);
  $.bind($('reverse'), 'click', reverse);
  $.bind($('print'), 'click', print);

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

  $.bind($('tone'), 'click', toggleTool('tone'));
  $.bind($('transparent'), 'click', () => {
    $('transparent').classList.toggle('selected');
  });

  $.bind($('monsenhikikomi'), 'click', () => {
    // キャンバスをリセット
    clearCanvas(errorCtx);

    // 空の紋栓データを生成する
    let new_monsen_data = [];
    let new_monsen_data_set = [];
    for (let i = 0; i < orimonoData.waku_maisu; i++) {
      new_monsen_data[i] = new Uint8Array(orimonoData.soshiki_yoko);
      // 紋栓データがセット済みかのフラグ。
      new_monsen_data_set[i] = false;
    }

    // 空の引込データを生成する
    let new_hikikomi_data = [];
    for (let i = 0; i < orimonoData.soshiki_tate; i++) {
      new_hikikomi_data[i] = new Uint8Array(orimonoData.waku_maisu);
    }

    let monsen_rows = []; // 組織図の列ごとに紋栓図の何列目かを保管する配列
    for (let i = 0; i < orimonoData.soshiki_tate; i++) {
      let monsen_row; // 紋栓図の列番号（左から何列目か）
      for (let j = 0; j < new_monsen_data.length; j++) {
        // 紋栓図の列がセット済みでない場合は、組織図から紋栓図の列を作成する
        // または紋栓図の列の内容が組織図の列の内容と同じだった場合は同じ列として扱う
        if (
          new_monsen_data_set[j] == false ||
          JSON.stringify(new_monsen_data[j]) ==
            JSON.stringify(orimonoData.soshiki_data[i])
        ) {
          monsen_row = j;
          new_monsen_data[monsen_row] = orimonoData.soshiki_data[i];
          new_hikikomi_data[i][monsen_row] = 1;
          new_monsen_data_set[j] = true;
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
          orimonoData.soshiki_min_x + i,
          orimonoData.soshiki_min_x + i,
          orimonoData.soshiki_min_y,
          orimonoData.soshiki_max_y,
          option.scale
        );
      }
    }

    if (monsen_rows.some((e) => e === null)) {
      // 1つでも紋栓を計算できなければ処理終了
      toastr.error('綜絖枚数内で紋栓を計算できませんでした');
      return;
    }

    orimonoData.monsen_data = structuredClone(new_monsen_data); // ディープコピー
    orimonoData.hikikomi_data = structuredClone(new_hikikomi_data); // ディープコピー
    drawOrimonoData(ctx, charCtx, orimonoData, palette, option, paletteData);
  });

  $.bind($('monsen'), 'click', () => {
    // キャンバスをリセット
    clearCanvas(errorCtx);

    // 空の紋栓データを生成する
    let new_monsen_data = [];
    for (let i = 0; i < orimonoData.waku_maisu; i++) {
      new_monsen_data[i] = new Uint8Array(orimonoData.soshiki_yoko);
    }

    for (let i = 0; i < orimonoData.soshiki_tate; i++) {
      let monsen_row; // 紋栓図の列番号（左から何列目か）
      for (let j = 0; j < orimonoData.hikikomi_data[i].length; j++) {
        // 引込図の列の中でONになっているドットが紋栓図の列番号を表現している
        if (orimonoData.hikikomi_data[i][j] != 0) {
          // 引き込み図の列の中でONになるのは1つだけなので見つかった時点でbreak
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
        new_monsen_data[monsen_row] = orimonoData.soshiki_data[i];
      } else if (
        monsen_row !== undefined &&
        JSON.stringify(new_monsen_data[monsen_row]) !=
          JSON.stringify(orimonoData.soshiki_data[i])
      ) {
        // 対象の組織図の列の引込図に紋栓図の列番号が指定されており、
        // 紋栓図と組織図の内容が異なる場合は、
        toastr.error('綜絖枚数内で紋栓を計算できませんでした');
        return;
      }
    }
    orimonoData.monsen_data = structuredClone(new_monsen_data); // ディープコピー
    drawOrimonoData(ctx, charCtx, orimonoData, palette, option, paletteData);
  });

  $.bind($('hikikomi'), 'click', () => {
    // キャンバスをリセット
    clearCanvas(errorCtx);

    // 空の引込データを生成する
    let new_hikikomi_data = [];
    for (let i = 0; i < orimonoData.soshiki_tate; i++) {
      new_hikikomi_data[i] = new Uint8Array(orimonoData.waku_maisu);
    }
    for (let i = 0; i < orimonoData.soshiki_tate; i++) {
      let monsen_row; // 紋栓図の列番号（左から何列目か）
      for (let j = 0; j < orimonoData.waku_maisu; j++) {
        if (
          JSON.stringify(orimonoData.monsen_data[j]) ==
          JSON.stringify(orimonoData.soshiki_data[i])
        ) {
          monsen_row = j;
          new_hikikomi_data[i][monsen_row] = 1;
          break;
        }
      }
    }
    orimonoData.hikikomi_data = structuredClone(new_hikikomi_data); // ディープコピー
    drawOrimonoData(ctx, charCtx, orimonoData, palette, option, paletteData);
  });

  $.bind($('soshiki'), 'click', () => {
    // キャンバスをリセット
    clearCanvas(errorCtx);

    // 空の引込データを生成する
    let new_soshiki_data = [];
    for (let i = 0; i < orimonoData.soshiki_tate; i++) {
      new_soshiki_data[i] = new Uint8Array(orimonoData.soshiki_yoko);
    }

    for (let i = 0; i < orimonoData.soshiki_tate; i++) {
      let monsen_count = orimonoData.hikikomi_data[i].findIndex((element) => {
        return element == 1;
      });
      if (monsen_count == -1) continue;
      let monsen_column = orimonoData.monsen_data[monsen_count];
      for (let j = 0; j < orimonoData.soshiki_yoko; j++) {
        new_soshiki_data[i][j] = monsen_column[j];
        if (monsen_column[j] != 0) {
          // drawDot(ctx, x, y, option.scale);
          // 組織図の一番左下からみた座標
          let x_at_soshiki = i;
          let y_at_soshiki = j;
          new_soshiki_data[x_at_soshiki][y_at_soshiki] = 1;
        }
      }
    }
    orimonoData.soshiki_data = structuredClone(new_soshiki_data); // ディープコピー
    drawOrimonoData(ctx, charCtx, orimonoData, palette, option, paletteData);
  });

  if (mode === 'fork' || mode === 'edit') {
    $.hide($('new-image'));

    load(docId, (data) => {
      $.hide($('loading'));
      Base64.decode(data.palette, paletteData.data);
      orimonoData = createOrimonoData(data.width, data.height);
      Base64.decode(data.index, orimonoData.data);

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

      selection.orimonoData = createOrimonoData(data.width, data.height);
      resize();
      ctx.fillStyle = palette[0];
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      drawOrimonoData(ctx, charCtx, orimonoData, palette, option, paletteData);
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

    // selection.orimonoData = createImage(32, 32, 2);
    resize();
    ctx.fillStyle = palette[0];
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawPreview();
    //			$('#overlay').fadeIn();
    $.show($('overlay'));
  }

  Palette.setColor(1);

  // 右クリック
  $.bind($('work'), 'contextmenu', (e) => {
    record();
    deselect();
    let r = work.canvas.getBoundingClientRect();
    left = window.scrollX + r.left;
    top = window.scrollY + r.top;
    let x = e.pageX - left,
      y = work.canvas.height - (e.pageY - top); // Y軸は下から数えたいため
    points[0] = (y / option.scale) ^ 0;
    points[1] = (x / option.scale) ^ 0;
    clearDotOrimono(ctx, points[1], points[0], orimonoData, option);
    e.preventDefault();
    e.stopPropagation();
    return false;
  });

  // 範囲選択
  selectHandler = {
    transparent: false,
    start_x: 0, // 最初に選んだグリッド
    start_y: 0, // 最初に選んだグリッド
    end_x: 0, // 最後に選んだグリッド
    end_y: 0, // 最後に選んだグリッド
    left_bottom_x: 0, // 範囲選択の左下グリッド
    left_bottom_y: 0, // 範囲選択の左下グリッド
    w: 0, // 範囲選択の高さグリッド数
    h: 0, // 範囲選択の左下グリッド数
    down: function (x, y) {
      this.start_x = x;
      this.start_y = y;
      this.left_bottom_x = x;
      this.left_bottom_y = y;
      this.w = 1;
      this.h = 1;

      deselect();

      // 最初に選択(down)した場所が組織図、紋栓図、引込図のどれかを判断
      // ドラッグ(move)した際に組織図、紋栓図、引込図の範囲を超えさせないために必要
      selection.type = getArea(x, y, orimonoData);

      $.hide($selection);
      $.position(
        $selection,
        this.start_x * option.scale,
        this.start_y * option.scale
      );
      $.size($selection, this.w * option.scale, this.h * option.scale);
      $.show($selection);
      selectionCtx.canvas.classList.remove('active');
    },
    move: function (x, y) {
      // 組織図、紋栓図、引込図の範囲を超えないようにする
      let min_x, max_x, min_y, max_y;
      if (selection.type == 'soshiki') {
        min_x = orimonoData.soshiki_min_x;
        max_x = orimonoData.soshiki_max_x;
        min_y = orimonoData.soshiki_min_y;
        max_y = orimonoData.soshiki_max_y;
      } else if (selection.type == 'monsen') {
        min_x = orimonoData.monsen_min_x;
        max_x = orimonoData.monsen_max_x;
        min_y = orimonoData.monsen_min_y;
        max_y = orimonoData.monsen_max_y;
      } else if (selection.type == 'hikikomi') {
        min_x = orimonoData.hikikomi_min_x;
        max_x = orimonoData.hikikomi_max_x;
        min_y = orimonoData.hikikomi_min_y;
        max_y = orimonoData.hikikomi_max_y;
      } else {
        return;
      }
      this.end_x = getAreaEnd(x, min_x, max_x);
      this.end_y = getAreaEnd(y, min_y, max_y);

      this.w = Math.abs(this.end_x - this.start_x) + 1;
      this.h = Math.abs(this.end_y - this.start_y) + 1;

      // 最初に選んだグリッドと最後に選んだグリッドの小さい方を左下グリッドとする
      // 左下から範囲選択エリアを描画するために必要
      this.left_bottom_x =
        this.end_x < this.start_x ? this.end_x : this.start_x;
      this.left_bottom_y =
        this.end_y < this.start_y ? this.end_y : this.start_y;

      // 左下グリッドから高さと幅を範囲選択する
      $.position(
        $selection,
        this.left_bottom_x * option.scale,
        this.left_bottom_y * option.scale
      );
      $.size($selection, this.w * option.scale, this.h * option.scale);
      $.show($selection);
    },
    up: function (enable) {
      // enableがtrueだと選択を解除(deselect)した際に選択範囲をコピーする
      // 範囲選択時はtrue,ペン選択・矢印カーソル移動はfalseが渡ってくる
      let r = selection.region;
      r.x = this.left_bottom_x;
      r.y = this.left_bottom_y;
      r.w = this.w;
      r.h = this.h;

      $.size($selection, this.w * option.scale, this.h * option.scale);
      $.show($selection);
      cut();
      selection.transparent = this.transparent;
      selection.enable = enable;
      selectionCtx.canvas.classList.add('active');
    },
  };

  function getAreaEnd(value, min, max) {
    // 選択エリアの終端を取得する
    // 最小値よりも小さければ最小値を返却
    // 最大値よりも大きければ最大値-1を返却（最大値から選択エリアを生成するとはみ出してしまう）
    // それ以外はそのままの値を返却
    return value < min ? min : value >= max ? max - 1 : value;
  }

  function getAreaEndWithArea(value, min, max, area) {
    // 選択エリアの終端を取得する
    // 最小値よりも小さければ最小値を返却
    // 最大値よりも大きければ最大値-1を返却（最大値から選択エリアを生成するとはみ出してしまう）
    // それ以外はそのままの値を返却
    return value < min ? min : value + area >= max ? max - area : value;
  }

  $.bind($('work'), 'mousedown', (e) => {
    let r = work.canvas.getBoundingClientRect();
    left = window.scrollX + r.left;
    top = window.scrollY + r.top;
    // mousedownのx,yはmoveやupでも使うのでpointsに保管する
    points[0] = ((work.canvas.height - (e.pageY - top)) / option.scale) ^ 0;
    points[1] = ((e.pageX - left) / option.scale) ^ 0;

    if (e.shiftKey) {
      // スクロール
    } else if (e.button === 0) {
      $.hide($('palette'));
      record();
      paletteIndex = Palette.getColorIndex();
      switch (tool) {
        case 'pen':
          down = true;
          drawDotOrimono(
            ctx,
            points[1],
            points[0],
            orimonoData,
            paletteIndex,
            option
          );
          selectHandler.down(points[1], points[0]);
          selectHandler.up(false);
          let type = getArea(points[1], points[0], orimonoData);
          if (type == 'monsen-color' || type == 'hikikomi-color') {
            $.show($('palette'));
          }
          break;
        case 'select':
        case 'move':
          selectHandler.transparent = e.ctrlKey;
          selectHandler.down(points[1], points[0]);
          down = true;
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
      let r = work.canvas.getBoundingClientRect();
      left = window.scrollX + r.left;
      top = window.scrollY + r.top;
      let x = ((e.pageX - left) / option.scale) ^ 0,
        y = ((work.canvas.height - (e.pageY - top)) / option.scale) ^ 0, // Y軸は下から数えたいため
        w = work.canvas.width,
        h = work.canvas.height,
        dummy = { width: orimonoData.width, height: orimonoData.height };
      if (points[1] === x && points[0] === y) {
        return false;
      }
      work.clearRect(0, 0, w, h);
      switch (tool) {
        // TODO 現行にないのでコメントアウト
        // case 'pen':
        // 	let px = points[1],
        // 		py = points[0];
        // 	context.data = orimonoData.data;
        // 	drawLine(ctx, px, py, x, y, orimonoData, paletteIndex, option.scale);
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
      let r = work.canvas.getBoundingClientRect();
      left = window.scrollX + r.left;
      top = window.scrollY + r.top;
      let x = ((e.pageX - left) / option.scale) ^ 0,
        y = ((work.canvas.height - (e.pageY - top)) / option.scale) ^ 0; // Y軸は下から数えたいため
      work.clearRect(0, 0, work.canvas.width, work.canvas.height);
      // 実際のレイヤーに描画する
      if (tool === 'line') {
        drawLine(
          ctx,
          points[1],
          points[0],
          x,
          y,
          orimonoData,
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
          orimonoData,
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
          orimonoData,
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
          orimonoData,
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
          orimonoData,
          paletteIndex,
          option.scale
        );
      } else if (tool === 'select') {
        selectHandler.up(true);
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
          x = ((e.pageX - offsetX + left) / s) ^ 0,
          y = ((work.canvas.height - e.pageY + top) / s) ^ 0;

        let min_x, max_x, min_y, max_y;
        if (selection.type == 'soshiki') {
          min_x = orimonoData.soshiki_min_x;
          max_x = orimonoData.soshiki_max_x;
          min_y = orimonoData.soshiki_min_y;
          max_y = orimonoData.soshiki_max_y;
        } else if (selection.type == 'monsen') {
          min_x = orimonoData.monsen_min_x;
          max_x = orimonoData.monsen_max_x;
          min_y = orimonoData.monsen_min_y;
          max_y = orimonoData.monsen_max_y;
        } else if (selection.type == 'hikikomi') {
          min_x = orimonoData.hikikomi_min_x;
          max_x = orimonoData.hikikomi_max_x;
          min_y = orimonoData.hikikomi_min_y;
          max_y = orimonoData.hikikomi_max_y;
        } else {
          return;
        }
        x = getAreaEndWithArea(x, min_x, max_x, selection.region.w);
        y = getAreaEndWithArea(y, min_y, max_y, selection.region.h);

        selection.region.x = x;
        selection.region.y = y;
        $.position($selection, x * s, y * s);
      }
      return false;
    },
    up: function (e) {
      if (down) {
        e.preventDefault();
        e.stopPropagation();

        $.unbind('mouseup', moveHandler.up);
        $.unbind('mousemove', moveHandler.move);

        down = false;
      }
    },
  };

  $.bind($selection, 'mousedown', (e) => {
    left = e.target.offsetLeft;
    // top = e.target.offsetTop;
    down = true;
    offsetX = e.pageX;
    offsetY = e.pageY;
    moveHandler.offsetX = e.pageX;
    moveHandler.offsetY = e.pageY;
    $.bind('mouseup', moveHandler.up);
    $.bind('mousemove', moveHandler.move);
    e.preventDefault();
  });

  $.bind($('selection'), 'contextmenu', (e) => {
    deselect();
    e.preventDefault();
    e.stopPropagation();
    return false;
  });

  // TODO vscodeのauto reloadと相性が悪いので一時的にコメントアウト
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
    const idx = createOrimonoData(64, 64);
    for (let i = 0; i < 9; i++) {
      const canvas = $('storage-' + i);
      const ctx = canvas.getContext('2d');
      const json = Storage.load(i.toString());
      if (json) {
        const data = JSON.parse(json);
        Base64.decode(data.orimonoData[0], idx.data);
        Base64.decode(data.paletteData, p.data);
        idx.width = data.width;
        idx.height = data.height;
        const x = ((32 - idx.width) / 2) ^ 0;
        const y = ((32 - idx.height) / 2) ^ 0;
        drawOrimonoData(ctx, charCtx, idx, p, option, 256, x, y);
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
    let json = JSON.stringify({
      width: orimonoData.width,
      height: orimonoData.height,
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
      orimonoData = createOrimonoData(data.width, data.height);
      option.imageWidth = orimonoData.width;
      Base64.decode(data.orimonoData[0], orimonoData.data);
      Base64.decode(data.paletteData, paletteData.data);
      selection.orimonoData = createOrimonoData(
        orimonoData.width,
        orimonoData.height
      );
      Palette.setColor(0);
      Palette.setTransparentIndex(data.transparent);
      // palette = Palette.getPaletteData();
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
      diff = hasDiffOrimonoData(back, orimonoData);
    }

    // 画像に差があるときだけ保存する
    if (diff) {
      let temp = copyOrimonoData(orimonoData);
      tempData.push(temp);
    }
    return diff;
  }

  // 取り消し
  function undo() {
    let temp = undoData.pop();

    if (temp) {
      if (!hasDiffOrimonoData(temp, orimonoData)) {
        temp = undoData.pop();
      }
    }

    if (temp) {
      pushRecord(redoData);
      orimonoData = copyOrimonoData(temp);
      clearCanvas(ctx);
      drawOrimonoData(ctx, charCtx, orimonoData, palette, option, paletteData);
      drawPreview();
    }
  }

  // やり直し
  function redo() {
    let temp = redoData.pop();

    if (temp) {
      pushRecord(undoData);
      orimonoData = copyOrimonoData(temp);
      drawOrimonoData(ctx, charCtx, orimonoData, palette, option, paletteData);
      drawPreview();
    }
  }

  // 切り取り
  function cut() {
    let s = option.scale,
      r = selection.region,
      x = r.x * s,
      y = r.y * s,
      w = r.w * s,
      h = r.h * s;
    y = ctx.canvas.height - (y + h); // yは上からしか測れないdrawImage仕様のため。

    selection.selectionData = new Array(r.w);
    for (let i = 0; i < r.w; i++) {
      selection.selectionData[i] = new Uint8Array(r.h);
      for (let j = 0; j < r.h; j++) {
        if (selection.type == 'soshiki') {
          selection.selectionData[i][j] =
            orimonoData.soshiki_data[
              i + selection.region.x - orimonoData.soshiki_min_x
            ][j + selection.region.y - orimonoData.soshiki_min_y];
        } else if (selection.type == 'monsen') {
          selection.selectionData[i][j] =
            orimonoData.monsen_data[
              i + selection.region.x - orimonoData.monsen_min_x
            ][j + selection.region.y - orimonoData.monsen_min_y];
        } else if (selection.type == 'hikikomi') {
          selection.selectionData[i][j] =
            orimonoData.hikikomi_data[
              i + selection.region.x - orimonoData.hikikomi_min_x
            ][j + selection.region.y - orimonoData.hikikomi_min_y];
        }
      }
    }

    // 確定した範囲選択の高さと幅を指定する
    //ctxからselectionCtxの画像を作るために必要
    selectionCtx.canvas.width = w;
    selectionCtx.canvas.height = h;
    selectionCtx.drawImage(ctx.canvas, x, y, w, h, 0, 0, w, h);
  }

  // 選択解除
  function deselect() {
    selectionCtx.clearRect(
      0,
      0,
      selectionCtx.canvas.width,
      selectionCtx.canvas.height
    );
    $.hide($selection);

    if (!selection.enable) return;
    selection.enable = false;

    if (selection.type == 'soshiki') {
      for (let i = 0; i < selection.selectionData.length; i++) {
        for (let j = 0; j < selection.selectionData[i].length; j++) {
          orimonoData.soshiki_data[
            i + selection.region.x - orimonoData.soshiki_min_x
          ][j + selection.region.y - orimonoData.soshiki_min_y] =
            selection.selectionData[i][j];
        }
      }
    } else if (selection.type == 'monsen') {
      for (let i = 0; i < selection.selectionData.length; i++) {
        for (let j = 0; j < selection.selectionData[i].length; j++) {
          orimonoData.monsen_data[
            i + selection.region.x - orimonoData.monsen_min_x
          ][j + selection.region.y - orimonoData.monsen_min_y] =
            selection.selectionData[i][j];
        }
      }
    } else if (selection.type == 'hikikomi') {
      for (let i = 0; i < selection.selectionData.length; i++) {
        for (let j = 0; j < selection.selectionData[i].length; j++) {
          orimonoData.hikikomi_data[
            i + selection.region.x - orimonoData.hikikomi_min_x
          ][j + selection.region.y - orimonoData.hikikomi_min_y] =
            selection.selectionData[i][j];
        }
      }
    }
    drawOrimonoData(ctx, charCtx, orimonoData, palette, option, paletteData);
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

  // クリア
  function clear() {
    if (!selection.enable) return;
    for (let i = 0; i < selection.selectionData.length; i++) {
      for (let j = 0; j < selection.selectionData[i].length; j++) {
        selection.selectionData[i][j] = 0;
      }
    }
    deselect();
  }

  // 画面更新
  //	function refresh() {
  //		drawOrimonoData(ctx, orimonoData, palette, option);
  //	}

  // サブウィンドウから呼び出すための関数
  global.getImage = () => {
    return {
      orimonoData: orimonoData,
      paletteData: paletteData,
    };
  };
})(this, Selector);
