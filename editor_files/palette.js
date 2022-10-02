(function (global, $, Color) {
  'use strict';

  const document = $.d;

  // パレット
  const Palette = (function (d) {
    let selected = null,
      color = '',
      colorIndex = 0,
      transparentIndex = 0,
      palettes = [
        Color.rgb(255, 255, 255),
        Color.rgb(0, 0, 0),
        Color.rgb(255, 0, 0),
        Color.rgb(0, 255, 0),
        Color.rgb(0, 0, 255),
        Color.rgb(255, 255, 0),
        Color.rgb(255, 0, 255),
        Color.rgb(0, 255, 255),
        Color.rgb(128, 128, 128),
        Color.rgb(255, 128, 128),
        Color.rgb(128, 255, 128),
        Color.rgb(128, 128, 255),
        Color.rgb(255, 255, 128),
        Color.rgb(128, 255, 255),
        Color.rgb(255, 128, 255),
      ],
      nums = [];

    // パレットの色を選択する
    function selectColor(index) {
      color = palettes[index];
      colorIndex = index;
    }

    function createPalette() {
      console.log('palette-color click');
      $('palette-table').addEventListener(
        'click',
        (e) => {
          if (e.target.classList.contains('palette-color')) {
            let parent = e.target.parentNode;
            let colors = parent.querySelectorAll('.palette-color');
            let color_index = Array.prototype.indexOf.call(colors, e.target);
            console.log(selected);
            if (selected !== null) {
              selected.className = 'palette-color';
            }
            selected = e.target;
            selected.className = 'palette-color selected';

            selectColor(color_index);
          }
        },
        false
      );
    }

    // 基数を設定する
    function setRadix(r) {
      nums.forEach((e) => {
        let elm = e,
          radix = elm.getAttribute('radix') ^ 0,
          val = parseInt(elm.value, radix);
        elm.setAttribute('radix', r);
        elm.value = val.toString(r);
      });
    }

    return {
      create: (elm) => {
        createPalette();
      },
      clear: () => {},

      getColor: () => {
        return color;
      },
      getColorByIndex: (index) => {
        return palettes[index];
      },
      getColorIndex: () => {
        return colorIndex;
      },
      getTransparentIndex: () => {
        return transparentIndex;
      },
      setTransparentIndex: (index) => {
        transparentIndex = index;
      },
			setColor: (index) => {
				console.log('setColor');
        console.log(index);
        colorIndex = index;
        selectColor(index);
      },
      change: (f) => {
        console.log('change');
        onchange = f;
      },
    };
  })(document);

  global.Palette = Palette;
})(this, Selector, Color);
