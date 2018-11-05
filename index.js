/*
 * @Author: lixiang 
 * @Date: 2018-10-24 21:19:47 
 * @Last Modified by: lixiang
 * @Last Modified time: 2018-10-25 00:44:57
 * @Description: 1、使用两个canvas 2、扫描文字canvas的像素，放置粒子至内容处
 */

(function () {
  var stage, textStage, form, input;
  var circles, textPixels, textFormed;// 粒子数组，字符像素点数组
  var offsetX, offsetY, text, disText;// 字符在画布中的位置，用于描点的字符,用于显示的字符
  var colors = ['#B2949D', '#FFF578', '#FF5F8D', '#37A9CC', '#188EB2'];
  var textArr = []; // 字符数组
  var timeId = null;  // 定时器引用

  function init() {
    initStages();
    initForm();
    initTextArr();
    initText();
    initCircles();
    animate();
    addListeners();
  }

  /**
   * 初始化canvas
   */
  function initStages() {
    textStage = new createjs.Stage("text");
    textStage.canvas.width = 600;
    textStage.canvas.height = 200;

    stage = new createjs.Stage('stage');
    stage.canvas.width = window.innerWidth;
    stage.canvas.height = window.innerHeight;

    offsetX = (window.innerWidth - 600) / 2;
    offsetY = (window.innerHeight - 300) / 2;
  }

  /**
   * 初始化form按钮
   */
  function initForm() {
    form = document.getElementById('form');
    form.style.top = offsetY + 200 + 'px';
    form.style.left = offsetX + 'px';
    input = document.getElementById('inputText');
  }

  /**
   * 初始化文字对象
   */
  function initText() {
    var fontSize = 160;

    text = new createjs.Text("t", "80px 'Source Sans Pro'", "#eee");
    text.font = "900 " + fontSize + "px 'Source Sans Pro'";
    text.textAlign = 'center';
    text.x = 300;
    text.y = (172 - fontSize) / 2;

    disText = new createjs.Text("", "80px 'Source Sans Pro'", "#777");
    disText.textAlign = 'center';
    disText.font = "900 " + fontSize + "px 'Source Sans Pro'";
    disText.x = offsetX + 300;
    disText.y = offsetY + (172 - fontSize) / 2;

    textStage.addChild(text);
    stage.addChild(disText);
  }

  /**
   * 初始化字符数组
   */
  function initTextArr() {
    for (var i = 0; i < 25; i++) {
      textArr.push(String.fromCharCode(65 + i));
    }
  }


  /**
   * 初始化粒子
   */
  function initCircles() {
    circles = [];
    var circle;
    var r, x, y, color, alpha;
    for (var i = 0; i < 600; i++) {
      r = 7;
      x = window.innerWidth * getRandom();
      y = window.innerHeight * getRandom();
      color = colors[Math.floor(i % colors.length)];
      alpha = 0.2 + Math.random() * 0.5;

      circle = new createjs.Shape();
      circle.alpha = alpha;
      circle.radius = r;
      circle.graphics.beginFill(color).drawCircle(0, 0, r);
      circle.x = x;
      circle.y = y;
      circle.movement = "float";

      circles.push(circle);
      stage.addChild(circle);

      tweenCircle(circle);
    }
  }

  /**
   * 屏幕刷新
   */
  function animate() {
    stage.update();
    requestAnimationFrame(animate);
  }

  /**
   * 移动粒子
   * @param {obj} c 元素点对象
   * @param {string} dir in:向字聚集，out：打散
   */
  function tweenCircle(c, dir) {
    if (c.tween) c.tween.kill();
    if (dir == 'in') {
      c.tween = TweenLite.to(c, 0, {
        x: c.originX, y: c.originY, ease: Quad.easeInOut, alpha: 1, radius: 5, scaleX: 0.4, scaleY: 0.4, onComplete: function () {
          c.movement = 'jiggle';
          tweenCircle(c);
        }
      });
    } else if (dir == 'out') {
      c.tween = TweenLite.to(c, 1.2, {
        x: window.innerWidth * getRandom(), y: window.innerHeight * getRandom(), ease: Quad.easeInOut, alpha: 0.2 + Math.random() * 0.5, scaleX: 1, scaleY: 1, onComplete: function () {
          c.movement = 'float';
          tweenCircle(c);
        }
      });
    }
  }


  /**
   * 创建文字并扫描，并将粒子组成字符
   * @param {string} t 文字 
   */
  function createText(t) {
    // 绘制文字
    text.text = t;
    textStage.update();

    // 扫描像素点
    var ctx = document.getElementById('text').getContext('2d');
    var pix = ctx.getImageData(0, 0, 600, 200).data;
    textPixels = [];
    for (var i = pix.length; i >= 0; i -= 4) {
      if (pix[i] != 0) {
        var x = (i / 4) % 600;
        var y = Math.floor(Math.floor(i / 600) / 4);

        if ((x && x % 8 == 0) && (y && y % 8 == 0)) textPixels.push({ x: x, y: y });
      }
    }

    // 粒子组成字符
    for (var i = 0, l = textPixels.length; i < l; i++) {
      circles[i].originX = offsetX + textPixels[i].x;
      circles[i].originY = offsetY + textPixels[i].y;
      tweenCircle(circles[i], 'in');
    }
  }


  /**
   * 粒子炸开
   */
  function explode() {
    for (var i = 0, l = textPixels.length; i < l; i++) {
      tweenCircle(circles[i], 'out');
    }
  }


  /**
   * 事件监听
   */
  function addListeners() {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      play();
    });
  }

  /**
  * 开始播放
  */
  function play() {
    var i = 0;
    timerId = setInterval(function () {
      var code = textArr[i];
      disText.text = code;
      disText.alpha = 1;
      setTimeout(function () {
        disText.alpha = 0;
        createText(code);
        explode();
      }, 1000);

      i += 1;
      if (i === textArr.length - 1) i = 0;

    }, 3000)
  }

  /**
   * 暂停
   */
  function pause() {
    clearInterval(timerId);
  }


  /**
   * 产生随机
   */
  function getRandom() {
    var num = Math.random();
    if (num < 0.5) {
      return Math.random() - 1;
    } else {
      return Math.random() + 1;
    }
  }


  window.onload = function () {
    init();
  }


})()

