# 源码分析

## 工作原理

主要是基于插件和事件通信来完成所有功能的。


通过eventEmitter来完成事件通信类，然后每个插件会拿到player的实例，在各个不同的事件抛出处进行事件通信。

整个播放器由各种不同的插件组成。

ui是基于dom操作/不依赖其他前端框架，来完成的。


插件又分为ui插件和逻辑插件，逻辑插件（packages/xgplayer/src/controls/*.js）负责处理核心逻辑，ui插件（packages/xgplayer/src/skin/controls/*.js）负责特定皮肤（默认皮肤）下的com和样式基本交互。

这里以播放按钮为例，逻辑插件为：

``` js
import Player from '../player'

let play = function () {
  let player = this
  //监听播放按钮点击视觉
  function onPlayBtnClick () {
    if (!player.config.allowPlayAfterEnded && player.ended) {
      return
    }
    if (player.paused) {
      let playPromise = player.play()
      if (playPromise !== undefined && playPromise) {
        playPromise.catch(err => {})
      }
    } else {
      player.pause()
    }
  }
  player.on('playBtnClick', onPlayBtnClick)

  function onDestroy () {
    player.off('playBtnClick', onPlayBtnClick)
    player.off('destroy', onDestroy)
  }
  player.once('destroy', onDestroy)
}

export default {
  name: 'play',
  method: play
}
```

ui插件为：


``` js
import Player from '../../player'
import PlayIcon from '../assets/play.svg'
import PauseIcon from '../assets/pause.svg'
import '../style/controls/play.scss'

let s_play = function () {
  let player = this
  let util = Player.util
  let playBtn = player.config.playBtn ? player.config.playBtn : {}
  let btn
  if (playBtn.type === 'img') {
    btn = util.createImgBtn('play', playBtn.url.play, playBtn.width, playBtn.height)
  } else {
    btn = util.createDom('xg-play', `<xg-icon class="xgplayer-icon">
                                      <div class="xgplayer-icon-play">${PlayIcon}</div>
                                      <div class="xgplayer-icon-pause">${PauseIcon}</div>
                                     </xg-icon>`, {}, 'xgplayer-play')
  }

  let tipsText = {}
  tipsText.play = player.lang.PLAY_TIPS
  tipsText.pause = player.lang.PAUSE_TIPS
  let tips = util.createDom('xg-tips', `<span class="xgplayer-tip-play">${tipsText.play}</span>
                                        <span class="xgplayer-tip-pause">${tipsText.pause}</span>`, {}, 'xgplayer-tips')
  btn.appendChild(tips)
  player.once('ready', () => {
    if(player.controls) {
      player.controls.appendChild(btn)
    }
  });

  ['click', 'touchend'].forEach(item => {
    btn.addEventListener(item, function (e) {
      e.preventDefault()
      e.stopPropagation()
      //基于事件触发
      player.emit('playBtnClick')
    })
  })
}

export default {
  name: 's_play',
  method: s_play
}
```


---

<div align="center">
    <img src="https://raw.githubusercontent.com/bytedance/xgplayer/master/xgplayer.png" width="384" height="96">
</div>
<div align="center">
    <a href="https://www.npmjs.com/package/xgplayer" target="_blank">
        <img src="https://img.shields.io/npm/v/xgplayer.svg" alt="npm">
    </a>
    <a href="https://www.npmjs.com/package/xgplayer" target="_blank">
        <img src="https://img.shields.io/npm/l/xgplayer.svg" alt="license">
    </a>
    <a href="http://commitizen.github.io/cz-cli/">
        <img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="commitizen">
    </a>
</div>
<br>

English | [简体中文](README.zh-CN.md)

### Introduction

xgplayer is a web video and audio player library, designed with separate, detachable UI components.  Since everything is componentized. the UI layer is very flexable.  
xgplayer is bold in its functionality: it gets rid of video loading, buffering, and format support for video dependence.
For mp4 that does not support streaming, you can use staged loading. This means load control, seamless switching without artifacts, and video bandwidth savings. It also integrates on-demand and live support for FLV, HLS, and dash.

For more details, please read the  [Documentation](http://h5player.bytedance.com/en/).

### Start

1. Install

    ```
    $ npm install xgplayer
    ```

2. Usage

    Step 1:

    ```html
    <div id="vs"></div>
    ```
    Step 2:

    ```js
    import Player from 'xgplayer';

    const player = new Player({
        id: 'vs',
        url: 'http://s2.pstatp.com/cdn/expire-1-M/byted-player-videos/1.0.0/xgplayer-demo.mp4'
    })
    ```

    This is the easiest way to configure the video player. For more advanced content, see the plug-in section or documentation. [more config](http://h5player.bytedance.com/en/config/)




### Plugins

xgplayer provides more plugins. Plugins are divided into two categories: one is self-starting, and another inherits the player's core class named xgplayer. In principle, the officially provided plug-ins are self-starting and the packaged third-party libraries are inherited. Some feature plug-ins themselves can provide a downgrade scenario that suggests a self-start approach, or an inheritance approach if not. The player supports custom plugins for more content viewing [plugins](http://h5player.bytedance.com/en/plugins/)

The following is how to use a self-starting plug-in：

```js
import Player from 'xgplayer';
import 'xgplayer-mp4';

const player = new Player({
    id: 'video',
    url: '//abc.com/test.mp4'
})
```

<code>xgplayer-mp4</code>plugin is self-starting, It loads mp4 video itself, parses mp4 format, implements custom loading, buffering, seamless switching, and so on. it will automatically downgrade devices that do not support [MSE](https://www.w3.org/TR/media-source/). [details](http://h5player.bytedance.com/en/plugins/#xgplayer-mp4)



### Dev

For debugging, we provide example video files in github. You can clone the whole git repository, which includes both code and example videos with 'git clone --recurse-submodules -j8'. With 'git clone' you will pull only xgplayer code and its plugins.

```
$ git clone --recurse-submodules -j8 git@github.com:bytedance/xgplayer.git # OR git clone git@github.com:bytedance/xgplayer.git
$ cd xgplayer
$ npm install
$ npm run dev
```

Then visit [http://localhost:9090/examples/index.html](http://localhost:9090/examples/index.html)


### Agreement

Welcome to use xgplayer! Please read the following terms carefully. Using xgplayer means that you accept and agree to the terms.
1. Xgplayer is licensed under the [MIT](http://opensource.org/licenses/MIT) License. You comply with its obligations by default.
2. By default, you authorize us to place your logo in xgplayer website, which using xgplayer.
If you have any problem, please let us know.


### Join Us
We welcome anyone with an interest in web media technology to join! Please contact us at  yinguohui@bytedance.com
