/*
 * canvas helper
 */

'use strict';

// キャンバスを消去する
function clearCanvas(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
// 破線の描画
function strokeDashLine(ctx, x0, y0, x1, y1, s) {
  let dx = x1 - x0,
    dy = y1 - y0,
    l = Math.sqrt(dx * dx + dy * dy),
    d = (l / s) ^ 0;
  ctx.beginPath();
  ctx.moveTo(x0 - 0.5, y0 - 0.5);
  for (let i = 1; i <= d; i += 2) {
    let sx = x0 + (dx * (i - 1)) / d - 0.5,
      sy = y0 + (dy * (i - 1)) / d - 0.5,
      ex = x0 + (dx * i) / d - 0.5,
      ey = y0 + (dy * i) / d - 0.5;
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
  }
  ctx.strokeStyle = '#000000';
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x0 - 0.5, y0 - 0.5);
  for (let i = 0; i <= d; i += 2) {
    let sx = x0 + (dx * (i - 1)) / d - 0.5,
      sy = y0 + (dy * (i - 1)) / d - 0.5,
      ex = x0 + (dx * i) / d - 0.5,
      ey = y0 + (dy * i) / d - 0.5;
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
  }
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();

  /*
	ctx.beginPath();
	ctx.arc(x0, y0, 2.0, 0, Math.PI * 2, true);
	ctx.arc(x1, y1, 2.0, 0, Math.PI * 2, true);
	ctx.fill();
	*/
}

// 選択範囲の表示
function drawSelectionRegion(ctx, x0, y0, x1, y1, scale) {
  let s = scale;
  ctx.strokeStyle = '#000000';
  strokeDashLine(ctx, x0 * s, y0 * s, x1 * s, y0 * s, 3);
  strokeDashLine(ctx, x0 * s, y1 * s, x1 * s, y1 * s, 3);
  strokeDashLine(ctx, x0 * s, y0 * s, x0 * s, y1 * s, 3);
  strokeDashLine(ctx, x1 * s, y0 * s, x1 * s, y1 * s, 3);
}

// 組織図、紋栓図、引込図、それ以外かを判定する
function getArea(x, y, orimonoData) {
  if (
    orimonoData.soshiki_min_x <= x &&
    orimonoData.soshiki_max_x > x &&
    orimonoData.soshiki_min_y <= y &&
    orimonoData.soshiki_max_y > y
  ) {
    return 'soshiki';
  } else if (
    orimonoData.monsen_min_x <= x &&
    orimonoData.monsen_max_x > x &&
    orimonoData.monsen_min_y <= y &&
    orimonoData.monsen_max_y > y
  ) {
    return 'monsen';
  } else if (
    orimonoData.hikikomi_min_x <= x &&
    orimonoData.hikikomi_max_x > x &&
    orimonoData.hikikomi_min_y <= y &&
    orimonoData.hikikomi_max_y > y
  ) {
    return 'hikikomi';
  } else if (
    orimonoData.monsen_color_min_x <= x &&
    orimonoData.monsen_color_max_x > x &&
    orimonoData.monsen_color_min_y <= y &&
    orimonoData.monsen_color_max_y > y
  ) {
    return 'monsen-color';
  } else if (
    orimonoData.monsen_char_min_x <= x &&
    orimonoData.monsen_char_max_x > x &&
    orimonoData.monsen_char_min_y <= y &&
    orimonoData.monsen_char_max_y > y
  ) {
    return 'monsen-char';
  } else if (
    orimonoData.hikikomi_color_min_x <= x &&
    orimonoData.hikikomi_color_max_x > x &&
    orimonoData.hikikomi_color_min_y <= y &&
    orimonoData.hikikomi_color_max_y > y
  ) {
    return 'hikikomi-color';
  } else if (
    orimonoData.hikikomi_char_min_x <= x &&
    orimonoData.hikikomi_char_max_x > x &&
    orimonoData.hikikomi_char_min_y <= y &&
    orimonoData.hikikomi_char_max_y > y
  ) {
    return 'hikikomi-char';
  } else if (
    orimonoData.osawari_min_x <= x &&
    orimonoData.osawari_max_x > x &&
    orimonoData.osawari_min_y <= y &&
    orimonoData.osawari_max_y > y
  ) {
    return 'osawari';
  } else {
    return 'other';
  }
}

// ドットの表示
function drawDotOrimono(ctx, x, y, orimonoData, paletteIndex, option) {
  let blackIndex = 1; // 黒塗り項目用（紋栓色、引込色以外はこれ）
  let type = getArea(x, y, orimonoData);
  if (type == 'soshiki') {
    // 組織図にドットを描画する
    // 組織図の場合は1つのドットではなく、基本サイズ毎の同じ座標にドットを描画する必要がある
    orimonoData.soshiki_data[x - orimonoData.soshiki_min_x][
      y - orimonoData.soshiki_min_y
    ] = blackIndex;
    let dot_at_kihon_x = 0,
      dot_at_kihon_y = 0;
    for (let i = 0; i < orimonoData.kihon_data.length; i++) {
      if (
        orimonoData.kihon_data[i].kihon_min_x <= x &&
        x <= orimonoData.kihon_data[i].kihon_max_x &&
        orimonoData.kihon_data[i].kihon_min_y <= y &&
        y <= orimonoData.kihon_data[i].kihon_max_y
      ) {
        dot_at_kihon_x = x - orimonoData.kihon_data[i].kihon_min_x;
        dot_at_kihon_y = y - orimonoData.kihon_data[i].kihon_min_y;
        break;
      }
    }

    for (let i = 0; i < orimonoData.kihon_data.length; i++) {
      // 表全体の一番左下からみた座標（基本毎の最小座標と基本毎の座標を加算）
      let x_at_all = orimonoData.kihon_data[i].kihon_min_x + dot_at_kihon_x;
      let y_at_all = orimonoData.kihon_data[i].kihon_min_y + dot_at_kihon_y;
      drawDot(ctx, x_at_all, y_at_all, option.scale);
      // 基本図の一番左下からみた座標（上記から枠枚数と空白1を減算）
      let x_at_soshiki = x_at_all - orimonoData.soshiki_min_x;
      let y_at_soshiki = y_at_all - orimonoData.soshiki_min_y;
      orimonoData.soshiki_data[x_at_soshiki][y_at_soshiki] = blackIndex;
    }
  } else if (type == 'monsen') {
    // 紋栓図にドットを描画する
    // 紋栓図の場合は1つのドットを描画するだけ
    drawDot(ctx, x, y, option.scale);
    orimonoData.monsen_data[x - orimonoData.monsen_min_x][
      y - orimonoData.monsen_min_y
    ] = blackIndex;
  } else if (type == 'hikikomi') {
    // 引込図にドットを描画する
    // 引込図の場合は1列に1ドットと決まっているので、列のドットをクリアしてからドットを描画する
    for (
      let i = orimonoData.hikikomi_min_y;
      i <= orimonoData.hikikomi_max_y;
      i++
    ) {
      clearDot(ctx, x, i, option.scale);
      orimonoData.hikikomi_data[x - orimonoData.hikikomi_min_x][i] = 0;
    }
    drawDot(ctx, x, y, option.scale);
    orimonoData.hikikomi_data[x - orimonoData.hikikomi_min_x][
      y - orimonoData.hikikomi_min_y
    ] = blackIndex;
  } else if (type == 'osawari') {
    drawDot(ctx, x, y, option.scale);
    orimonoData.osawari_data[x - orimonoData.osawari_min_x] = blackIndex;
  } else if (type == 'monsen-color') {
    drawDot(ctx, x, y, option.scale, 0, paletteIndex);
    orimonoData.monsen_color_data[y - orimonoData.monsen_color_min_y] =
      paletteIndex;
  } else if (type == 'monsen-char') {
  } else if (type == 'hikikomi-color') {
    drawDot(ctx, x, y, option.scale, 0, paletteIndex);
    orimonoData.hikikomi_color_data[x - orimonoData.hikikomi_color_min_x] =
      paletteIndex;
  } else if (type == 'hikikomi-char') {
  } else {
    // 上記以外の場所がクリックされてもドットは描画しない
  }
}

function clearDotOrimono(ctx, x, y, orimonoData, option) {
  let type = getArea(x, y, orimonoData);
  if (type == 'soshiki') {
    orimonoData.soshiki_data[x - orimonoData.soshiki_min_x][
      y - orimonoData.soshiki_min_y
    ] = 0;
    let dot_at_kihon_x = 0,
      dot_at_kihon_y = 0;
    for (let i = 0; i < orimonoData.kihon_data.length; i++) {
      if (
        orimonoData.kihon_data[i].kihon_min_x <= x &&
        x <= orimonoData.kihon_data[i].kihon_max_x &&
        orimonoData.kihon_data[i].kihon_min_y <= y &&
        y <= orimonoData.kihon_data[i].kihon_max_y
      ) {
        dot_at_kihon_x = x - orimonoData.kihon_data[i].kihon_min_x;
        dot_at_kihon_y = y - orimonoData.kihon_data[i].kihon_min_y;
        break;
      }
    }
    for (let i = 0; i < orimonoData.kihon_data.length; i++) {
      let x_at_all = orimonoData.kihon_data[i].kihon_min_x + dot_at_kihon_x;
      let y_at_all = orimonoData.kihon_data[i].kihon_min_y + dot_at_kihon_y;
      clearDot(ctx, x_at_all, y_at_all, option.scale);
      let x_at_soshiki = x_at_all - orimonoData.soshiki_min_x;
      let y_at_soshiki = y_at_all - orimonoData.soshiki_min_y;
      orimonoData.soshiki_data[x_at_soshiki][y_at_soshiki] = 0;
    }
  } else if (type == 'monsen') {
    clearDot(ctx, x, y, option.scale);
    orimonoData.monsen_data[x - orimonoData.monsen_min_x][
      y - orimonoData.monsen_min_y
    ] = 0;
  } else if (type == 'hikikomi') {
    clearDot(ctx, x, y, option.scale);
    orimonoData.hikikomi_data[x - orimonoData.hikikomi_min_x][
      y - orimonoData.hikikomi_min_y
    ] = 0;
  } else if (type == 'osawari') {
    clearDot(ctx, x, y, option.scale);
    orimonoData.osawari_data[x - orimonoData.osawari_min_x] = 0;
  } else if (type == 'monsen-color') {
    clearDot(ctx, x, y, option.scale);
    orimonoData.monsen_color_data[x - orimonoData.monsen_color_min_x] = 0;
  } else if (type == 'monsen-char') {
    clearDot(ctx, x, y, option.scale);
    orimonoData.monsen_char_data[x - orimonoData.monsen_char_min_x] = 0;
  } else if (type == 'hikikomi-color') {
    clearDot(ctx, x, y, option.scale);
    orimonoData.hikikomi_color_data[x - orimonoData.hikikomi_color_min_x] = 0;
  } else if (type == 'hikikomi-char') {
    clearDot(ctx, x, y, option.scale);
    orimonoData.hikikomi_char_data[x - orimonoData.hikikomi_char_min_x] = 0;
  }
}

// ドットの表示
function selectDot(ctx, x, y, scale, padding = 0) {
  let s = scale,
    b = s - padding;
  ctx.fillStyle = 'rgba(' + [0, 0, 255, 0.5] + ')';
  ctx.fillRect(x * s + padding, y * s - padding, b, b);
}

// ドットの表示
function drawDot(ctx, x, y, scale, padding = 0, paletteIndex = 1) {
  ctx.fillStyle = Palette.getColorByIndex(paletteIndex);
  let s = scale,
    b = s - padding;
  ctx.fillRect(x * s + padding, y * s - padding, b, b);
}

function clearDot(ctx, x, y, scale, padding = 0) {
  let s = scale,
    b = s - padding;
  ctx.clearRect(x * s + padding, y * s - padding, b, b);
}

function clearDots(ctx, start_x, start_y, end_x, end_y, scale, padding = 0) {
  let s = scale,
    b = s - padding;
  for (let x = start_x; x <= end_x; x++) {
    for (let y = start_y; y <= end_y; y++) {
      ctx.clearRect(x * s + padding, y * s - padding, b, b);
    }
  }
}

function drawChar(charCtx, char, x, y, option) {
  let padding_x = option.fontSize / 4;
  let padding_y = option.fontSize / 4 - 1;
  charCtx.font = option.fontSize + 'px sans-serif';
  charCtx.fillText(
    char,
    x * option.scale + padding_x,
    charCtx.canvas.height / 2 - y * option.scale - padding_y
  );
}

function clearChar(charCtx, x, y, option) {
  let padding_x = option.fontSize / 4;
  let padding_y = option.fontSize / 4 - 1;
  charCtx.clearRect(
    x * option.scale + padding_x,
    charCtx.canvas.height / 2 - y * option.scale - padding_y,
    option.scale,
    -option.scale
  );
}

function drawErrorRow(errorCtx, start_x, end_x, start_y, end_y, scale) {
  let padding = 1;
  errorCtx.fillRect(
    start_x * scale,
    start_y * scale - padding,
    scale + scale * (end_x - start_x),
    scale + scale * (end_y - start_y)
  );
}

// 直線の描画
function drawLine(
  ctx,
  x0,
  y0,
  x1,
  y1,
  indexData,
  paletteIndex,
  scale,
  padding = 0
) {
  let dx = Math.abs(x1 - x0),
    dy = Math.abs(y1 - y0),
    dx2 = dx * 2,
    dy2 = dy * 2,
    sx = x1 > x0 ? 1 : -1,
    sy = y1 > y0 ? 1 : -1,
    x = x0,
    y = y0,
    data = indexData.data,
    w = indexData.width,
    h = indexData.height,
    s = scale,
    b = s - padding;
  ctx.beginPath();
  if (dx >= dy) {
    let e = -dx;
    for (let i = 0; i <= dx; i++) {
      if (x < 0 || x >= w || y < 0 || y >= h) {
        break;
      }
      ctx.rect((x * s) ^ 0, (y * s) ^ 0, b, b);
      if (data) {
        data[y * w + x] = paletteIndex;
      }
      x += sx;
      e += dy2;
      if (e >= 0) {
        y += sy;
        e -= dx2;
      }
    }
  } else {
    let e = -dy;
    for (let i = 0; i <= dy; i++) {
      if (x < 0 || x >= w || y < 0 || y >= h) {
        break;
      }
      ctx.rect((x * s) ^ 0, (y * s) ^ 0, b, b);
      if (data) {
        data[y * w + x] = paletteIndex;
      }
      y += sy;
      e += dx2;
      if (e >= 0) {
        x += sx;
        e -= dy2;
      }
    }
  }
  ctx.fill();
}

// 矩形
function drawRect(ctx, x0, y0, x1, y1, indexData, paletteIndex, scale) {
  let left = Math.min(x0, x1),
    right = Math.max(x0, x1),
    top = Math.min(y0, y1),
    bottom = Math.max(y0, y1),
    s = scale,
    data = indexData ? indexData.data : null,
    w = indexData ? indexData.width : 0,
    h = indexData ? indexData.height : 0;

  ctx.beginPath();
  for (let i = top; i <= bottom; i++) {
    let y = i * s;
    ctx.rect(left * s, y, s, s);
    ctx.rect(right * s, y, s, s);
    if (data) {
      if (0 <= i && i < h) {
        if (left >= 0) {
          data[i * w + left] = paletteIndex;
        }
        if (right < w) {
          data[i * w + right] = paletteIndex;
        }
      }
    }
  }
  for (let j = left + 1; j < right; j++) {
    let x = j * s;
    ctx.rect(x, top * s, s, s);
    ctx.rect(x, bottom * s, s, s);
    if (data) {
      if (0 <= j && j < w) {
        data[top * w + j] = paletteIndex;
        data[bottom * w + j] = paletteIndex;
      }
    }
  }
  ctx.fill();
}

// 塗りつぶし矩形
function fillRect(ctx, x0, y0, x1, y1, indexData, paletteIndex, scale) {
  let left = Math.min(x0, x1),
    right = Math.max(x0, x1),
    top = Math.min(y0, y1),
    bottom = Math.max(y0, y1),
    s = scale,
    data = indexData.data,
    w = indexData.width;

  if (left < 0) left = 0;
  if (right >= w) right = w - 1;
  if (top < 0) top = 0;
  if (bottom >= w) bottom = w - 1;

  if (data) {
    for (let i = top; i <= bottom; i++) {
      let y = i * w;
      for (let j = left; j <= right; j++) {
        data[y + j] = paletteIndex;
      }
    }
  }
  ctx.fillRect(
    left * s,
    top * s,
    (right - left + 1) * s,
    (bottom - top + 1) * s
  );
}

// 塗りつぶし
function paint(ctx, x, y, indexData, paletteIndex, scale, padding = 0) {
  let data = indexData.data,
    w = indexData.width,
    h = indexData.height,
    c = data[y * w + x],
    s = scale,
    b = s - padding;

  if (c == paletteIndex) {
    return;
  }

  ctx.beginPath();
  (function f(x, y) {
    if (x >= w || x < 0) return;
    if (y >= h || y < 0) return;
    if (data[y * w + x] === c) {
      data[y * w + x] = paletteIndex;
      ctx.rect((x * s) ^ 0, (y * s) ^ 0, b, b);
      f(x - 1, y);
      f(x + 1, y);
      f(x, y - 1);
      f(x, y + 1);
    }
  })(x, y);
  ctx.fill();
}

// トーンで塗りつぶし
function paintTone(ctx, x, y, indexData, paletteIndex, scale) {
  let data = indexData.data,
    w = indexData.width,
    h = indexData.height,
    c = data[y * w + x],
    s = scale,
    tmpIndexData = createOrimonoData(w, h),
    tmp = tmpIndexData.data,
    tone = (x & 1) ^ (y & 1);

  if (c == paletteIndex) {
    return;
  }

  (function f(x, y) {
    if (x >= w || x < 0) return;
    if (y >= h || y < 0) return;
    const k = y * w + x;
    if (data[k] === c && tmp[k] === 0) {
      tmp[k] = 1;

      f(x - 1, y);
      f(x + 1, y);
      f(x, y - 1);
      f(x, y + 1);
    }
  })(x, y);

  ctx.beginPath();
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      let k = i * w + j;
      if (tmp[k] === 1) {
        if (((j & 1) ^ (i & 1)) === tone) {
          data[k] = paletteIndex;
          ctx.rect((j * s) ^ 0, (i * s) ^ 0, s, s);
        }
      }
    }
  }
  ctx.fill();
}

// アウトライン描画
function drawOutline(ctx, x, y, indexData, paletteIndex, scale) {
  let data = indexData.data,
    w = indexData.width,
    h = indexData.height,
    c = data[y * w + x],
    s = scale,
    tmpIndexData = createOrimonoData(w, h),
    tmp = tmpIndexData.data;

  if (c == paletteIndex) {
    return;
  }

  (function f(x, y) {
    if (x >= w || x < 0) return;
    if (y >= h || y < 0) return;
    if (data[y * w + x] === c && tmp[y * w + x] === 0) {
      tmp[y * w + x] = 1;

      f(x - 1, y);
      f(x + 1, y);
      f(x, y - 1);
      f(x, y + 1);
    }
  })(x, y);

  ctx.beginPath();

  // 縮退させる
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      let k = i * w + j,
        p = tmp[k] === 1;

      if (p) {
        let b = false;
        if (i > 0) b |= tmp[k - w] === 0;
        if (i < h - 1) b |= tmp[k + w] === 0;
        if (j > 0) b |= tmp[k - 1] === 0;
        if (j < w - 1) b |= tmp[k + 1] === 0;
        if (b) {
          data[k] = paletteIndex;
          ctx.rect((j * s) ^ 0, (i * s) ^ 0, s, s);
        }
      }
    }
  }

  ctx.fill();
}

function eps(x0, y0, x1, y1, x, y) {
  let dx = x1 - x0,
    dy = y1 - y0,
    dx2 = dx * dx,
    dy2 = dy * dy,
    ex = 2 * x - x0 - x1,
    ey = 2 * y - y0 - y1,
    e = dx2 * dy2 - dy * dy * ex * ex - dx * dx * ey * ey;
  return e;
}

function setPixel(data, x, y, w, h, value) {
  if (data && x >= 0 && x < w && y >= 0 && y < h) {
    data[y * w + x] = value;
  }
}

// 円を描画する
function drawEllipse(ctx, x0, y0, x1, y1, indexData, paletteIndex, scale) {
  let left = Math.min(x0, x1),
    right = Math.max(x0, x1),
    top = Math.min(y0, y1),
    bottom = Math.max(y0, y1),
    data = indexData ? indexData.data : null;

  x0 = left;
  x1 = right;
  y0 = top;
  y1 = bottom;

  let dx = x1 - x0,
    dy = y1 - y0,
    dx2 = dx * dx,
    dy2 = dy * dy,
    a = dx >> 1,
    b = dy >> 1,
    w = scale,
    h = scale,
    iw = indexData.width,
    ih = indexData.height;

  ctx.beginPath();
  let x = ((x0 + x1) >> 1) * w;
  ctx.rect(x, y0 * h, w, h);
  ctx.rect(x, y1 * h, w, h);
  //	if(data) {
  //		data[y0 * iw + ((x0 + x1) >> 1)] = paletteIndex;
  //		data[y1 * iw + ((x0 + x1) >> 1)] = paletteIndex;
  //	}
  setPixel(data, (x0 + x1) >> 1, y0, iw, ih, paletteIndex);
  setPixel(data, (x0 + x1) >> 1, y1, iw, ih, paletteIndex);

  if (dx & 1) {
    ctx.rect(x + w, y0 * h, w, h);
    ctx.rect(x + w, y1 * h, w, h);
    //		if(data) {
    //			data[y0 * iw + ((x0 + x1) >> 1) + 1] = paletteIndex;
    //			data[y1 * iw + ((x0 + x1) >> 1) + 1] = paletteIndex;
    //		}
    setPixel(data, ((x0 + x1) >> 1) + 1, y0, iw, ih, paletteIndex);
    setPixel(data, ((x0 + x1) >> 1) + 1, y1, iw, ih, paletteIndex);
  }

  let y = ((y0 + y1) >> 1) * h;
  ctx.rect(x0 * w, y, w, h);
  ctx.rect(x1 * w, y, w, h);
  //	if(data) {
  //		data[((y0 + y1) >> 1)  * iw + x0] = paletteIndex;
  //		data[((y0 + y1) >> 1)  * iw + x1] = paletteIndex;
  //	}
  setPixel(data, x0, (y0 + y1) >> 1, iw, ih, paletteIndex);
  setPixel(data, x1, (y0 + y1) >> 1, iw, ih, paletteIndex);
  if (dy & 1) {
    ctx.rect(x0 * w, y + h, w, h);
    ctx.rect(x1 * w, y + h, w, h);
    //		if(data) {
    //			data[(((y0 + y1) >> 1)  + 1) * iw + x0] = paletteIndex;
    //			data[(((y0 + y1) >> 1)  + 1) * iw + x1] = paletteIndex;
    //		}
    setPixel(data, x0, ((y0 + y1) >> 1) + 1, iw, ih, paletteIndex);
    setPixel(data, x1, ((y0 + y1) >> 1) + 1, iw, ih, paletteIndex);
  }

  let a2 = a * a,
    b2 = b * b,
    f = b2 * (-2 * a + 1) + 2 * a2,
    o = (x * b2) / a2,
    cx = x0 + a,
    cy = y0 + b,
    cx1 = x1 - a,
    cy1 = y1 - b,
    n = a / Math.sqrt(b2 / a2 + 1) - 0.5;

  y = y1;
  x = (x0 + x1) >> 1;
  for (let i = 0; i < n; i++) {
    let e0 = eps(x0 + 0.5, y0 + 0.5, x1 + 0.5, y1 + 0.5, x - 1 + 0.5, y + 0.5),
      e1 = eps(
        x0 + 0.5,
        y0 + 0.5,
        x1 + 0.5,
        y1 + 0.5,
        x - 1 + 0.5,
        y - 1 + 0.5
      );

    if (Math.abs(e0) < Math.abs(e1)) {
      x = x - 1;
    } else {
      x = x - 1;
      y = y - 1;
    }
    ctx.rect(x * w, y * h, w, h);
    ctx.rect((x1 - x + x0) * w, y * h, w, h);
    ctx.rect(x * w, (y1 - y + y0) * h, w, h);
    ctx.rect((x1 - x + x0) * w, (y1 - y + y0) * h, w, h);
    if (data) {
      //			data[y * iw + x] = paletteIndex;
      //			data[y * iw + x1 - x + x0] = paletteIndex;
      //			data[(y1 - y + y0) * iw + x] = paletteIndex;
      //			data[(y1 - y + y0) * iw + x1 - x + x0] = paletteIndex;

      setPixel(data, x, y, iw, ih, paletteIndex);
      setPixel(data, x1 - x + x0, y, iw, ih, paletteIndex);
      setPixel(data, x, y1 - y + y0, iw, ih, paletteIndex);
      setPixel(data, x1 - x + x0, y1 - y + y0, iw, ih, paletteIndex);
    }
  }
  if (y - 1 <= cy) {
    ctx.fill();
    return;
  }

  y = (y0 + y1) >> 1;
  x = x1;
  n = b / Math.sqrt(a2 / b2 + 1);
  for (let i = 0; i < n; i++) {
    let e0 = eps(x0 + 0.5, y0 + 0.5, x1 + 0.5, y1 + 0.5, x + 0.5, y - 1 + 0.5),
      e1 = eps(
        x0 + 0.5,
        y0 + 0.5,
        x1 + 0.5,
        y1 + 0.5,
        x - 1 + 0.5,
        y - 1 + 0.5
      );
    if (Math.abs(e0) < Math.abs(e1)) {
      y = y - 1;
    } else {
      x = x - 1;
      y = y - 1;
    }
    ctx.rect(x * w, y * h, w, h);
    ctx.rect((x1 - x + x0) * w, y * h, w, h);
    ctx.rect(x * w, (y1 - y + y0) * h, w, h);
    ctx.rect((x1 - x + x0) * w, (y1 - y + y0) * h, w, h);
    if (data) {
      //            if(y >= 0 && y < ih) {
      //                if(x >= 0 && x < iw) data[y * iw + x] = paletteIndex;
      //                if(x1 - x + x0 >= 0 && x1 - x + x0 < iw) data[y * iw + x1 - x + x0] = paletteIndex;
      //            }
      setPixel(data, x, y, iw, ih, paletteIndex);
      setPixel(data, x1 - x + x0, y, iw, ih, paletteIndex);
      setPixel(data, x, y1 - y + y0, iw, ih, paletteIndex);
      setPixel(data, x1 - x + x0, y1 - y + y0, iw, ih, paletteIndex);

      //            if(y1 - y + y0 >= 0 && y1 - y + y0 < ih) {
      //                if(x >= 0 && x < iw) data[(y1 - y + y0) * iw + x] = paletteIndex;
      //                data[(y1 - y + y0) * iw + x1 - x + x0] = paletteIndex;
      //            }
    }
  }

  ctx.fill();
}

// 塗りつぶし円を描画する
function fillEllipse(ctx, x0, y0, x1, y1, indexData, paletteIndex, scale) {
  let left = Math.min(x0, x1),
    right = Math.max(x0, x1),
    top = Math.min(y0, y1),
    bottom = Math.max(y0, y1),
    data = indexData.data;
  x0 = left;
  x1 = right;
  y0 = top;
  y1 = bottom;

  let dx = x1 - x0,
    dy = y1 - y0,
    a = dx >> 1,
    b = dy >> 1,
    s = scale,
    iw = data ? indexData.width : 0,
    ih = data ? indexData.height : 0,
    x0c = x0 > 0 ? x0 : 0,
    x1c = x1 < iw ? x1 : iw - 1,
    y0c = y0 > 0 ? y0 : 0,
    y1c = y1 < ih ? y1 : ih - 1;

  ctx.beginPath();
  let x = ((x0 + x1) >> 1) * s;
  ctx.rect(x, y0 * s, s, (dy + 1) * s);

  if (data) {
    let ix = (x0 + x1) >> 1;
    if (0 <= ix && ix < iw) {
      for (let j = y0c; j <= y1c; j++) {
        data[j * iw + ix] = paletteIndex;
      }
    }
  }
  if (dx & 1) {
    ctx.rect(x + s, y0 * s, s, (dy + 1) * s);
    if (data) {
      let ix = ((x0 + x1) >> 1) + 1;
      if (0 <= ix && ix < iw) {
        for (let j = y0c; j <= y1c; j++) {
          data[j * iw + ix] = paletteIndex;
        }
      }
    }
  }

  let y = ((y0 + y1) >> 1) * s;

  ctx.rect(x0 * s, y, (dx + 1) * s, s);

  if (data) {
    let iy = ((y0 + y1) >> 1) * iw;
    if (0 <= iy && iy < ih * iw) {
      for (let j = x0c; j <= x1c; j++) {
        data[iy + j] = paletteIndex;
      }
    }
  }
  if (dy & 1) {
    ctx.rect(x0 * s, y + s, (dx + 1) * s, s);

    if (data) {
      let iy = (((y0 + y1) >> 1) + 1) * iw;
      if (0 <= iy && iy < ih * iw) {
        for (let j = x0c; j <= x1c; j++) {
          data[iy + j] = paletteIndex;
        }
      }
    }
  }

  let a2 = a * a,
    b2 = b * b,
    f = b2 * (-2 * a + 1) + 2 * a2,
    cx = x0 + a,
    cy = y0 + b,
    n = a / Math.sqrt(b2 / a2 + 1) - 0.5;

  //	console.log(n);

  y = y1;
  x = (x0 + x1) >> 1;
  for (let i = 0; i < n; i++) {
    let e0 = eps(x0 + 0.5, y0 + 0.5, x1 + 0.5, y1 + 0.5, x - 1 + 0.5, y + 0.5),
      e1 = eps(
        x0 + 0.5,
        y0 + 0.5,
        x1 + 0.5,
        y1 + 0.5,
        x - 1 + 0.5,
        y - 1 + 0.5
      );

    if (Math.abs(e0) < Math.abs(e1)) {
      x = x - 1;
    } else {
      x = x - 1;
      y = y - 1;
    }
    ctx.rect(x * s, y * s, (x1 + x0 - x * 2 + 1) * s, s);
    ctx.rect(x * s, (y1 - y + y0) * s, (x1 + x0 - x * 2 + 1) * s, s);

    if (data) {
      for (let j = x; j <= x1 - x + x0; j++) {
        if (0 <= j && j < iw) {
          data[y * iw + j] = paletteIndex;
          data[(y1 - y + y0) * iw + j] = paletteIndex;
        }
      }
    }
  }
  if (y - 1 <= cy) {
    ctx.fill();
    return;
  }

  y = (y0 + y1) >> 1;
  x = x1;
  n = b / Math.sqrt(a2 / b2 + 1);
  for (let i = 0; i < n; i++) {
    let e0 = eps(x0 + 0.5, y0 + 0.5, x1 + 0.5, y1 + 0.5, x + 0.5, y - 1 + 0.5),
      e1 = eps(
        x0 + 0.5,
        y0 + 0.5,
        x1 + 0.5,
        y1 + 0.5,
        x - 1 + 0.5,
        y - 1 + 0.5
      );
    if (Math.abs(e0) < Math.abs(e1)) {
      y = y - 1;
    } else {
      x = x - 1;
      y = y - 1;
    }

    ctx.rect((x1 - x + x0) * s, y * s, (x * 2 - x1 - x0 + 1) * s, s);
    ctx.rect(
      (x1 - x + x0) * s,
      (y1 - y + y0) * s,
      (x * 2 - x1 - x0 + 1) * s,
      s
    );

    if (data) {
      for (let j = x1 - x + x0; j <= x; j++) {
        if (0 <= j && j < iw) {
          data[y * iw + j] = paletteIndex;
          data[(y1 - y + y0) * iw + j] = paletteIndex;
        }
      }
    }
  }

  ctx.fill();
}

function drawTableGrid(ctx, size, x_min, y_min, x_max, y_max) {
  let x_start = x_min * size;
  let y_start = y_min * size;
  let tate_line_count = x_max - x_min + 1;
  let yoko_line_width = (x_max - x_min) * size;
  let yoko_line_count = y_max - y_min + 1;
  let tate_line_height = (y_max - y_min) * size;
  // 縦線
  for (let i = 0; i < tate_line_count; i++) {
    let x = x_start + (size * i - 0.5);
    ctx.moveTo(x, y_start);
    ctx.lineTo(x, y_start + tate_line_height);
  }
  // 横線
  for (let i = 0; i < yoko_line_count; i++) {
    let y = y_start + (size * i - 0.5);
    ctx.moveTo(x_start, y);
    ctx.lineTo(x_start + yoko_line_width, y);
  }
}
// グリッドを表示する
function drawGrid(ctx, option, orimonoData) {
  let size = option.scale;
  ctx.strokeStyle = option.grid.color1;
  ctx.lineWidth = 1.0;
  ctx.beginPath();

  // 関連図（関連図というのは造語。左下の紋栓図と引込図を関連付けるもの）
  drawTableGrid(
    ctx,
    size,
    orimonoData.kanren_min_x,
    orimonoData.kanren_min_y,
    orimonoData.kanren_max_x,
    orimonoData.kanren_max_y
  );

  // 関連図ドット（関連図だけ左下から右上に紋栓図と引込図を関連を表すドットが必要）
  ctx.fillStyle = 'rgb(0, 0, 0)';
  for (let i = 0; i < orimonoData.waku_maisu; i++) {
    drawDot(
      ctx,
      orimonoData.kanren_min_x + i,
      orimonoData.kanren_min_y + i,
      option.scale,
      0
    );
  }

  // 紋栓色
  drawTableGrid(
    ctx,
    size,
    orimonoData.monsen_color_min_x,
    orimonoData.monsen_color_min_y,
    orimonoData.monsen_color_max_x,
    orimonoData.monsen_color_max_y
  );

  // 紋栓文字
  drawTableGrid(
    ctx,
    size,
    orimonoData.monsen_char_min_x,
    orimonoData.monsen_char_min_y,
    orimonoData.monsen_char_max_x,
    orimonoData.monsen_char_max_y
  );

  // 紋栓図
  drawTableGrid(
    ctx,
    size,
    orimonoData.monsen_min_x,
    orimonoData.monsen_min_y,
    orimonoData.monsen_max_x,
    orimonoData.monsen_max_y
  );

  // 引込色
  drawTableGrid(
    ctx,
    size,
    orimonoData.hikikomi_color_min_x,
    orimonoData.hikikomi_color_min_y,
    orimonoData.hikikomi_color_max_x,
    orimonoData.hikikomi_color_max_y
  );

  // 引込文字
  drawTableGrid(
    ctx,
    size,
    orimonoData.hikikomi_char_min_x,
    orimonoData.hikikomi_char_min_y,
    orimonoData.hikikomi_char_max_x,
    orimonoData.hikikomi_char_max_y
  );

  // 筬割文字
  drawTableGrid(
    ctx,
    size,
    orimonoData.osawari_min_x,
    orimonoData.osawari_min_y,
    orimonoData.osawari_max_x,
    orimonoData.osawari_max_y
  );

  // 引込図
  drawTableGrid(
    ctx,
    size,
    orimonoData.hikikomi_min_x,
    orimonoData.hikikomi_min_y,
    orimonoData.hikikomi_max_x,
    orimonoData.hikikomi_max_y
  );

  // 組織図
  drawTableGrid(
    ctx,
    size,
    orimonoData.soshiki_min_x,
    orimonoData.soshiki_min_y,
    orimonoData.soshiki_max_x,
    orimonoData.soshiki_max_y
  );

  ctx.stroke();

  // // ここから基本サイズに沿った枠線を記載
  // ctx.strokeStyle = option.grid.color0;
  // ctx.beginPath();

  // // 紋栓図縦線太線
  // for (let i = 0; i <= orimonoData.waku_maisu; i++) {
  //   if (i % orimonoData.waku_maisu == 0) {
  //     let x = monsen_x_start + (size * i - (i == 0 ? -0.5 : 0.5)); // 紋栓図縦1本目はcanvasの縁になるので0.5にすると見えなくなる
  //     ctx.moveTo(x, monsen_y_start);
  //     ctx.lineTo(x, monsen_y_start + monsen_tate_length);
  //   }
  // }
  // // 紋栓図横線太線
  // for (let i = 0; i <= orimonoData.soshiki_yoko; i++) {
  //   if (i % orimonoData.kihon_yoko == 0) {
  //     let y = monsen_y_start + (size * i - 0.5);
  //     ctx.moveTo(monsen_x_start, y);
  //     ctx.lineTo(monsen_yoko_length, y);
  //   }
  // }

  // // 組織図縦線太線
  // for (let i = 0; i <= orimonoData.soshiki_tate; i++) {
  //   if (i % orimonoData.kihon_tate == 0) {
  //     let x = soshiki_x_start + (size * i - 0.5);
  //     ctx.moveTo(x, soshiki_y_start);
  //     ctx.lineTo(x, soshiki_y_start + soshiki_tate_length);
  //   }
  // }
  // // 組織図横線太線
  // for (let i = 0; i <= orimonoData.soshiki_yoko; i++) {
  //   if (i % orimonoData.kihon_yoko == 0) {
  //     let y = soshiki_y_start + (size * i - 0.5);
  //     ctx.moveTo(soshiki_x_start, y);
  //     ctx.lineTo(soshiki_x_start + soshiki_yoko_length, y);
  //   }
  // }

  // // 引込図縦線太線
  // for (let i = 0; i <= orimonoData.soshiki_tate; i++) {
  //   if (i % orimonoData.kihon_tate == 0) {
  //     let x = hikikomi_x_start + (size * i - 0.5);
  //     ctx.moveTo(x, hikikomi_y_start);
  //     ctx.lineTo(x, hikikomi_y_start + hikikomi_tate_length);
  //   }
  // }
  // // 引込図横線
  // for (let i = 0; i <= orimonoData.waku_maisu; i++) {
  //   if (i % orimonoData.waku_maisu == 0) {
  //     let y = hikikomi_y_start + (size * i - (i == 0 ? -0.5 : 0.5)); // 引込図横1本目はcanvasの縁になるので0.5にすると見えなくなる
  //     ctx.moveTo(hikikomi_x_start, y);
  //     ctx.lineTo(hikikomi_x_start + hikikomi_yoko_length, y);
  //   }
  // }
  // ctx.stroke();
  // ctx.strokeStyle = option.grid.color0;
  // ctx.beginPath();
  // for(let i = l; i < n; i += l) {
  // 	let x = size * i - 0.5;
  // 	ctx.moveTo(0.5, x);
  // 	ctx.lineTo(w + 0.5, x);
  // 	ctx.moveTo(x, 0.5);
  // 	ctx.lineTo(x, h + 0.5);
  // }
  // ctx.stroke();
}

/////////////////////////////////////////////////////
// indexed image
/////////////////////////////////////////////////////

// インデックスカラーイメージを描画する
function drawOrimonoData(
  ctx,
  charCtx,
  orimonoData,
  palette,
  option,
  paletteData,
  transparent
) {
  // 最初にキャンバスをクリアしておく
  clearCanvas(ctx);
  // 組織図を描画
  for (let x = 0; x < orimonoData.soshiki_tate; x++) {
    for (let y = 0; y < orimonoData.soshiki_yoko; y++) {
      if (orimonoData.soshiki_data[x][y] != 0) {
        drawDot(
          ctx,
          x + orimonoData.soshiki_min_x,
          y + orimonoData.soshiki_min_y,
          option.scale
        );
      }
    }
  }

  // 紋栓図を描画
  for (let x = 0; x < orimonoData.waku_maisu; x++) {
    for (let y = 0; y < orimonoData.soshiki_yoko; y++) {
      if (orimonoData.monsen_data[x][y] != 0) {
        drawDot(
          ctx,
          x + orimonoData.monsen_min_x,
          y + orimonoData.monsen_min_y,
          option.scale
        );
      }
    }
  }

  // 引込図を描画
  for (let x = 0; x < orimonoData.soshiki_tate; x++) {
    for (let y = 0; y < orimonoData.waku_maisu; y++) {
      if (orimonoData.hikikomi_data[x][y] != 0) {
        drawDot(
          ctx,
          x + orimonoData.hikikomi_min_x,
          y + orimonoData.hikikomi_min_y,
          option.scale
        );
      }
    }
  }

  // 紋栓文字を描画
  for (let y = 0; y < orimonoData.monsen_char_data.length; y++) {
    if (orimonoData.monsen_char_data[y] !== undefined) {
      drawChar(
        charCtx,
        orimonoData.monsen_char_data[y],
        orimonoData.monsen_char_min_x,
        y + orimonoData.monsen_char_min_y,
        option
      );
    }
  }

  // 引込文字を描画
  for (let x = 0; x < orimonoData.hikikomi_char_data.length; x++) {
    if (orimonoData.hikikomi_char_data[x] !== undefined) {
      drawChar(
        charCtx,
        orimonoData.hikikomi_char_data[x],
        x + orimonoData.hikikomi_char_min_x,
        orimonoData.hikikomi_char_min_y,
        option
      );
    }
  }

  // 紋栓色を描画
  for (let y = 0; y < orimonoData.monsen_color_data.length; y++) {
    let paletteIndex = orimonoData.monsen_color_data[y];
    if (paletteIndex !== undefined) {
      drawDot(
        ctx,
        orimonoData.monsen_color_min_x,
        y + orimonoData.monsen_color_min_y,
        option.scale,
        0,
        paletteIndex
      );
    }
  }

  // 引込色を描画
  for (let x = 0; x < orimonoData.hikikomi_color_data.length; x++) {
    let paletteIndex = orimonoData.hikikomi_color_data[x];
    if (paletteIndex !== undefined) {
      drawDot(
        ctx,
        x + orimonoData.hikikomi_color_min_x,
        orimonoData.hikikomi_color_min_y,
        option.scale,
        0,
        paletteIndex
      );
    }
  }

  // 筬割を描画
  for (let x = 0; x < orimonoData.osawari_data.length; x++) {
    let paletteIndex = orimonoData.osawari_data[x];
    if (paletteIndex !== undefined) {
      drawDot(
        ctx,
        x + orimonoData.osawari_min_x,
        orimonoData.osawari_min_y,
        option.scale,
        1,
        paletteIndex
      );
    }
  }
}

// 範囲指定してインデックスカラーイメージを描画する
function drawRangeIndexedImage(
  ctx,
  image,
  scale,
  paletteData,
  transparent,
  range
) {
  let data = image.data,
    size = scale,
    w = image.width,
    offsetX = range ? range.x : 0,
    offsetY = range ? range.y : 0,
    screenW = range ? range.w : 0,
    screenH = range ? range.h : 0;

  let dw = screenW * size,
    dh = screenH * size,
    dst = ctx.createImageData(dw, dh),
    u32image = new Uint32Array(dst.data.buffer),
    u32palette = new Uint32Array(paletteData.data.buffer),
    k = 0;
  for (let i = 0; i < dh; i++) {
    let y = (((i / size) ^ 0) + offsetY) * w;
    for (let j = 0; j < dw; j++) {
      let x = ((j / size) ^ 0) + offsetX,
        index = data[y + x];
      if (index !== transparent) {
        u32image[k] = u32palette[index];
      }
      k++;
    }
  }
  ctx.putImageData(dst, 0, 0);
}

// タイリングして描画する
function tilingIndexedImageData(
  ctx,
  image,
  palette,
  scale,
  transparent,
  width,
  height
) {
  let index = 0,
    data = image.data,
    paletteData = palette.data,
    dest = ctx.createImageData(image.width * scale, image.height * scale),
    w = dest.width,
    h = dest.height,
    stride = image.width,
    destData = dest.data,
    t = transparent === undefined ? 256 : transparent;
  for (let i = 0, p = 0; i < h; i++) {
    let y = (i / scale) ^ 0;
    for (let j = 0; j < w; j++) {
      let x = (j / scale) ^ 0;
      index = y * stride + x;
      let pindex = data[index] * 4;
      destData[p] = paletteData[pindex];
      destData[p + 1] = paletteData[pindex + 1];
      destData[p + 2] = paletteData[pindex + 2];
      destData[p + 3] = t === data[index] ? 0 : 255;
      p += 4;
    }
  }
  let offsetX = ((((width - w) / 2) ^ 0) % w) - w,
    offsetY = ((((height - h) / 2) ^ 0) % h) - h;
  for (let y = offsetY; y < height; y += h) {
    for (let x = offsetX; x < width; x += w) {
      ctx.putImageData(dest, x, y);
    }
  }
}

// 拡大して表示する
function drawImage(ctx, image, dx, dy, dw, dh) {
  let index = 0,
    data = image.data,
    c = '#000',
    scale = 8;
  dw = image.width;
  dh = image.height;

  //ctx.beginPath();
  let cx = ctx;
  for (let i = 0; i < dh; i++) {
    let y = i * scale;
    for (let j = 0; j < dw; j++) {
      let x = j * scale,
        color = rgb(data[index], data[index + 1], data[index + 2]);

      if (color !== c) {
        cx.fillStyle = color;
      }

      cx.fillRect(x, y, scale, scale);
      index += 4;
    }
  }
}

// 水平方向反転
function flipH(ctx, charCtx, orimonoData, palette, option, paletteData) {
  orimonoData.soshiki_data.reverse();
  drawOrimonoData(ctx, charCtx, orimonoData, palette, option, paletteData);
}

// 垂直方向反転
function flipV(ctx, charCtx, orimonoData, palette, option, paletteData) {
  for (let i = 0; i < orimonoData.soshiki_data.length; i++) {
    orimonoData.soshiki_data[i].reverse();
  }
  drawOrimonoData(ctx, charCtx, orimonoData, palette, option, paletteData);
}

// 右90度回転
function rotate90R(ctx, charCtx, orimonoData, palette, option, paletteData) {
  let soshiki_temp = Array(orimonoData.soshiki_yoko);
  for (let i = 0; i < soshiki_temp.length; i++) {
    soshiki_temp[i] = Array(orimonoData.soshiki_tate);
    for (let j = 0; j < soshiki_temp[i].length; j++) {
      soshiki_temp[i][j] = 0;
    }
  }
  for (let i = 0; i < orimonoData.soshiki_data.length; i++) {
    for (let j = 0; j < orimonoData.soshiki_data[i].length; j++) {
      soshiki_temp[j][orimonoData.soshiki_yoko - 1 - i] =
        orimonoData.soshiki_data[i][j];
    }
  }
  orimonoData.soshiki_data = soshiki_temp;
  drawOrimonoData(ctx, charCtx, orimonoData, palette, option, paletteData);
}

// 裏返し
function reverseSoshiki(
  ctx,
  charCtx,
  orimonoData,
  palette,
  option,
  paletteData
) {
  for (let i = 0; i < orimonoData.soshiki_data.length; i++) {
    for (let j = 0; j < orimonoData.soshiki_data[i].length; j++) {
      orimonoData.soshiki_data[i][j] =
        orimonoData.soshiki_data[i][j] == 0 ? 1 : 0;
    }
  }
  drawOrimonoData(ctx, charCtx, orimonoData, palette, option, paletteData);
}

// 指定のインデックスのピクセルを透明にする
function drawClearColor(ctx, indexData, index, scale) {
  let data = indexData.data,
    w = indexData.width,
    h = indexData.height,
    s = scale,
    l,
    i,
    j;
  for (i = 0; i < h; i++) {
    l = 0;
    for (j = 0; j < w; j++) {
      if (data[i * w + j] === index) {
        l++;
      } else if (l > 0) {
        ctx.clearRect((j - l) * s, i * s, s * l, s);
        l = 0;
      }
    }
    if (l > 0) {
      ctx.clearRect((j - l) * s, i * s, s * l, s);
    }
  }
}

// 入力した画像をインデックスカラーイメージに変換する
// 色数が256色を超えた時点でエラーにする
function convertIndexedImage(src, indexData, paletteData) {
  let count = 0,
    palette = [],
    data = src.data,
    idx = indexData.data,
    pal = paletteData.data;
  for (let i = 0, j = 0, n = data.length; i < n; i += 4, j++) {
    let r = data[i],
      g = data[i + 1],
      b = data[i + 2],
      a = data[i + 3],
      color = Color.rgb(r, g, b),
      index = palette.indexOf(color);
    if (index < 0) {
      palette.push(color);
      index = count++;
      let p = index * 4;
      pal[p] = r;
      pal[p + 1] = g;
      pal[p + 2] = b;
      pal[p + 3] = 255;

      if (count > 256) {
        throw '色数オーバー';
      }
    }
    idx[j] = index;
  }

  return pal;
}

// フルカラーイメージをインデックスイメージに変換する
function convertIndexedImageByPalette(src, indexData, paletteData, backIndex) {
  let data = src.data,
    idx = indexData.data,
    pal = paletteData.data;

  for (let i = 0, n = data.length; i < n; i += 4) {
    let r = data[i],
      g = data[i + 1],
      b = data[i + 2],
      a = data[i + 3],
      index = -1;

    for (let j = 0; j < pal.length; j += 4) {
      if (r === pal[j] && g === pal[j + 1] && b === pal[j + 2]) {
        index = j / 4;
        break;
      }
    }
    idx[i / 4] = index;
  }
}

// 画像の差分の最初と最後を取得する
function diffIndexData(src, dst) {
  let head = src.length,
    tail = 0,
    n = src.length;
  for (let i = 0; i < n; i++) {
    if (dst[i] !== src[i]) {
      head = i;
      break;
    }
  }
  for (let i = n - 1; i >= 0; i--) {
    if (dst[i] !== src[i]) {
      tail = i;
      break;
    }
  }
  return { head: head, tail: tail };
}

// 差分を適用する
function applyDiffIndexData(head, tail, diff, dst) {
  for (let i = head; i <= tail; i++) {
    let k = i - head;
    dst[i] = diff[k];
  }
}

// 画像に差分があるか判定する
function hasDiffOrimonoData(src, dst) {
  if (
    src.kihon_tate != dst.kihon_tate ||
    src.kihon_yoko != dst.kihon_yoko ||
    src.soshiki_tate != dst.soshiki_tate ||
    src.soshiki_yoko != dst.soshiki_yoko ||
    src.waku_maisu != dst.waku_maisu ||
    JSON.stringify(src.kihon_data) != JSON.stringify(dst.kihon_data) ||
    JSON.stringify(src.soshiki_data) != JSON.stringify(dst.soshiki_data) ||
    JSON.stringify(src.monsen_data) != JSON.stringify(dst.monsen_data) ||
    JSON.stringify(src.hikikomi_data) != JSON.stringify(dst.hikikomi_data)
  ) {
    // 1つでも違いがあればtrue
    return true;
  }
  return false;
}

// インデックスデータの作成
function createOrimonoData(
  kihon_tate,
  kihon_yoko,
  soshiki_tate,
  soshiki_yoko,
  waku_maisu
) {
  let kanren_min_x = 4; // 紋栓文字列＋空白列＋紋栓色列＋空白列
  let kanren_min_y = 6; // 引込文字行＋空白行＋引込色行＋空白行＋筬割行＋空白行
  let kanren_max_x = kanren_min_x + waku_maisu;
  let kanren_max_y = kanren_min_y + waku_maisu;

  let monsen_color_min_x = 0;
  let monsen_color_min_y = kanren_max_y + 1;
  let monsen_color_max_x = monsen_color_min_x + 1;
  let monsen_color_max_y = monsen_color_min_y + soshiki_yoko;

  let monsen_char_min_x = monsen_color_max_x + 1;
  let monsen_char_min_y = monsen_color_min_y;
  let monsen_char_max_x = monsen_char_min_x + 1; // 常に1列
  let monsen_char_max_y = monsen_color_max_y;

  let monsen_min_x = kanren_min_x;
  let monsen_min_y = monsen_color_min_y;
  let monsen_max_x = kanren_max_x;
  let monsen_max_y = monsen_color_max_y;

  let hikikomi_color_min_x = kanren_max_x + 1;
  let hikikomi_color_min_y = 0;
  let hikikomi_color_max_x = hikikomi_color_min_x + soshiki_tate;
  let hikikomi_color_max_y = hikikomi_color_min_y + 1;

  let hikikomi_char_min_x = hikikomi_color_min_x;
  let hikikomi_char_min_y = hikikomi_color_max_y + 1;
  let hikikomi_char_max_x = hikikomi_color_max_x;
  let hikikomi_char_max_y = hikikomi_char_min_y + 1;

  let osawari_min_x = hikikomi_color_min_x;
  let osawari_min_y = hikikomi_char_max_y + 1;
  let osawari_max_x = hikikomi_color_max_x;
  let osawari_max_y = osawari_min_y + 1;

  let hikikomi_min_x = hikikomi_color_min_x;
  let hikikomi_min_y = kanren_min_y;
  let hikikomi_max_x = hikikomi_color_max_x;
  let hikikomi_max_y = kanren_max_y;

  let soshiki_min_x = hikikomi_color_min_x;
  let soshiki_min_y = monsen_color_min_y;
  let soshiki_max_x = hikikomi_color_max_x;
  let soshiki_max_y = monsen_color_max_y;

  // 基本データを生成する
  let kihon_count = 0;

  //組織の縦に基本が何枚入るか計算
  let kihon_tate_count = Math.ceil(soshiki_yoko / kihon_yoko);

  //組織の横に基本が何枚入るか計算
  let kihon_yoko_count = Math.ceil(soshiki_tate / kihon_tate);

  // 組織データを生成する
  let soshiki_data = [];
  for (let i = 0; i < soshiki_tate; i++) {
    soshiki_data[i] = new Uint8Array(soshiki_yoko);
  }

  // 基本データを作成する
  let kihon_data = [];
  for (let i = 0; i < kihon_tate_count; i++) {
    for (let j = 0; j < kihon_yoko_count; j++) {
      for (let k = 0; k < kihon_yoko; k++) {
        kihon_data[kihon_count] = [];
        kihon_data[kihon_count][k] = new Uint8Array(kihon_tate);
      }
      kihon_data[kihon_count].kihon_min_x = soshiki_min_x + kihon_yoko * j;
      kihon_data[kihon_count].kihon_min_y = soshiki_min_y + kihon_tate * i;
      kihon_data[kihon_count].kihon_max_x =
        kihon_data[kihon_count].kihon_min_x + kihon_yoko - 1;
      kihon_data[kihon_count].kihon_max_y =
        kihon_data[kihon_count].kihon_min_y + kihon_tate - 1;
      kihon_count++;
    }
  }

  // 紋栓データを生成する
  let monsen_data = [];
  for (let i = 0; i < waku_maisu; i++) {
    monsen_data[i] = new Uint8Array(soshiki_yoko);
  }

  // 引込データを生成する
  let hikikomi_data = [];
  for (let i = 0; i < soshiki_tate; i++) {
    hikikomi_data[i] = new Uint8Array(waku_maisu);
  }

  return {
    kihon_tate: kihon_tate,
    kihon_yoko: kihon_yoko,
    soshiki_tate: soshiki_tate,
    soshiki_yoko: soshiki_yoko,
    waku_maisu: waku_maisu,
    kihon_data: kihon_data,
    soshiki_data: soshiki_data,
    monsen_data: monsen_data,
    hikikomi_data: hikikomi_data,
    osawari_data: Array(soshiki_tate),
    monsen_color_data: Array(soshiki_yoko),
    hikikomi_color_data: Array(soshiki_tate),
    monsen_char_data: Array(soshiki_yoko),
    hikikomi_char_data: Array(soshiki_tate),
    monsen_color_min_x: monsen_color_min_x,
    monsen_color_min_y: monsen_color_min_y,
    monsen_color_max_x: monsen_color_max_x,
    monsen_color_max_y: monsen_color_max_y,
    monsen_char_min_x: monsen_char_min_x,
    monsen_char_min_y: monsen_char_min_y,
    monsen_char_max_x: monsen_char_max_x,
    monsen_char_max_y: monsen_char_max_y,
    hikikomi_color_min_x: hikikomi_color_min_x,
    hikikomi_color_min_y: hikikomi_color_min_y,
    hikikomi_color_max_x: hikikomi_color_max_x,
    hikikomi_color_max_y: hikikomi_color_max_y,
    hikikomi_char_min_x: hikikomi_char_min_x,
    hikikomi_char_min_y: hikikomi_char_min_y,
    hikikomi_char_max_x: hikikomi_char_max_x,
    hikikomi_char_max_y: hikikomi_char_max_y,
    osawari_min_x: osawari_min_x,
    osawari_min_y: osawari_min_y,
    osawari_max_x: osawari_max_x,
    osawari_max_y: osawari_max_y,
    kanren_min_x: kanren_min_x,
    kanren_min_y: kanren_min_y,
    kanren_max_x: kanren_max_x,
    kanren_max_y: kanren_max_y,
    soshiki_min_x: soshiki_min_x,
    soshiki_min_y: soshiki_min_y,
    soshiki_max_x: soshiki_max_x,
    soshiki_max_y: soshiki_max_y,
    monsen_min_x: monsen_min_x,
    monsen_min_y: monsen_min_y,
    monsen_max_x: monsen_max_x,
    monsen_max_y: monsen_max_y,
    hikikomi_min_x: hikikomi_min_x,
    hikikomi_min_y: hikikomi_min_y,
    hikikomi_max_x: hikikomi_max_x,
    hikikomi_max_y: hikikomi_max_y,
  };
}

function copyOrimonoData(orimonoData) {
  return {
    kihon_tate: orimonoData.kihon_tate,
    kihon_yoko: orimonoData.kihon_yoko,
    soshiki_tate: orimonoData.soshiki_tate,
    soshiki_yoko: orimonoData.soshiki_yoko,
    waku_maisu: orimonoData.waku_maisu,
    kihon_data: structuredClone(orimonoData.kihon_data),
    soshiki_data: structuredClone(orimonoData.soshiki_data),
    monsen_data: structuredClone(orimonoData.monsen_data),
    hikikomi_data: structuredClone(orimonoData.hikikomi_data),
    osawari_data: structuredClone(orimonoData.osawari_data),
    monsen_color_data: structuredClone(orimonoData.monsen_color_data),
    hikikomi_color_data: structuredClone(orimonoData.hikikomi_color_data),
    monsen_char_data: structuredClone(orimonoData.monsen_char_data),
    hikikomi_char_data: structuredClone(orimonoData.hikikomi_char_data),
    monsen_color_min_x: orimonoData.monsen_color_min_x,
    monsen_color_min_y: orimonoData.monsen_color_min_y,
    monsen_color_max_x: orimonoData.monsen_color_max_x,
    monsen_color_max_y: orimonoData.monsen_color_max_y,
    monsen_char_min_x: orimonoData.monsen_char_min_x,
    monsen_char_min_y: orimonoData.monsen_char_min_y,
    monsen_char_max_x: orimonoData.monsen_char_max_x,
    monsen_char_max_y: orimonoData.monsen_char_max_y,
    hikikomi_color_min_x: orimonoData.hikikomi_color_min_x,
    hikikomi_color_min_y: orimonoData.hikikomi_color_min_y,
    hikikomi_color_max_x: orimonoData.hikikomi_color_max_x,
    hikikomi_color_max_y: orimonoData.hikikomi_color_max_y,
    hikikomi_char_min_x: orimonoData.hikikomi_char_min_x,
    hikikomi_char_min_y: orimonoData.hikikomi_char_min_y,
    hikikomi_char_max_x: orimonoData.hikikomi_char_max_x,
    hikikomi_char_max_y: orimonoData.hikikomi_char_max_y,
    osawari_min_x: orimonoData.osawari_min_x,
    osawari_min_y: orimonoData.osawari_min_y,
    osawari_max_x: orimonoData.osawari_max_x,
    osawari_max_y: orimonoData.osawari_max_y,
    kanren_min_x: orimonoData.kanren_min_x,
    kanren_min_y: orimonoData.kanren_min_y,
    kanren_max_x: orimonoData.kanren_max_x,
    kanren_max_y: orimonoData.kanren_max_y,
    soshiki_min_x: orimonoData.soshiki_min_x,
    soshiki_min_y: orimonoData.soshiki_min_y,
    soshiki_max_x: orimonoData.soshiki_max_x,
    soshiki_max_y: orimonoData.soshiki_max_y,
    monsen_min_x: orimonoData.monsen_min_x,
    monsen_min_y: orimonoData.monsen_min_y,
    monsen_max_x: orimonoData.monsen_max_x,
    monsen_max_y: orimonoData.monsen_max_y,
    hikikomi_min_x: orimonoData.hikikomi_min_x,
    hikikomi_min_y: orimonoData.hikikomi_min_y,
    hikikomi_max_x: orimonoData.hikikomi_max_x,
    hikikomi_max_y: orimonoData.hikikomi_max_y,
  };
}

// パレットデータの作成
function createPaletteData(n) {
  return {
    count: n,
    //		data: new Uint8ClampedArray(n * 4)
    data: new Uint8Array(n * 4),
  };
}

// 拡大した画像を返す
function scaling(indexData, scale) {
  let w = (indexData.width * scale) ^ 0,
    h = (indexData.height * scale) ^ 0,
    dst = createOrimonoData(w, h),
    stride = indexData.width,
    d = dst.data,
    s = indexData.data;

  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      d[i * w + j] = s[((i * stride + j) / scale) ^ 0];
    }
  }
  return dst;
}

function copyBuffer(src, dst, length) {
  for (let i = 0; i < length; i++) {
    dst[i] = src[i];
  }
}

// 指定範囲のインデックスデータをコピーする
function copyRangeIndexData(src, dst, range) {
  let i = range ? range.head : 0,
    n = range ? range.tail : src.data.length,
    s = src.data,
    d = dst.data;
  for (; i < n; i++) {
    d[i] = s[i];
  }
}

// インデックスデータをコピーする
function copyIndexData(src, dst, sx, sy, w, h, dx, dy, index) {
  let s = src.data,
    d = dst.data,
    sw = src.width,
    dw = dst.width,
    dh = dst.height;
  dx = dx || 0;
  dy = dy || 0;
  if (dx < 0) {
    w += dx;
    sx -= dx;
    dx = 0;
  }
  if (dy < 0) {
    h += dy;
    sy -= dy;
    dy = 0;
  }
  w = dx + w >= dw ? dw - dx : w;
  h = dy + h >= dh ? dh - dy : h;
  for (let i = 0; i < h; i++) {
    let y = (i + sy) * sw,
      z = (i + dy) * dw;
    for (let j = 0; j < w; j++) {
      let x = j + sx;
      if (index !== s[y + x]) {
        d[z + j + dx] = s[y + x];
      }
    }
  }
}

// インデックスデータを塗りつぶす
function fillIndexData(src, index, x, y, w, h) {
  let data = src.data,
    width = src.width;
  for (let i = y; i < y + h; i++) {
    let n = i * width;
    for (let j = x; j < x + w; j++) {
      data[n + j] = index;
    }
  }
}

// 未使用色の削除
function removeUnusedColor(indexData, paletteData) {
  let data = indexData.data,
    u32palette = new Uint32Array(paletteData.data.buffer),
    used = [];

  for (let i = 0; i < u32palette.length; i++) {
    used.push(0);
  }

  let max = 0;

  for (let i = 0, l = data.length; i < l; i++) {
    let index = data[i];
    used[index]++;
    if (index > max) max = index;
  }

  let k = 0;
  for (let i = 0; i <= max; i++) {
    if (used[i] > 0) {
      u32palette[k] = u32palette[i];
      used[i] = k++;
    }
  }

  for (let i = k; i < u32palette.length; i++) {
    u32palette[i] = 0xff000000;
  }

  for (let i = 0, l = data.length; i < l; i++) {
    let index = data[i];
    data[i] = used[index];
  }
}

// インデックスの値を置換する
function swapColor(indexData, a, b) {
  let data = indexData.data;

  for (let i = 0, l = data.length; i < l; i++) {
    if (data[i] === a) {
      data[i] = b;
    } else if (data[i] == b) {
      data[i] = a;
    }
  }
}

// イメージを結合する
function mergeIndexData(src, dst, mask) {
  let s = src.data,
    d = dst.data;
  for (let i = 0, l = s.length; i < l; i++) {
    if (s[i] !== mask) {
      d[i] = s[i];
    }
  }
}
