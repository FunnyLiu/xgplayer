import Player from './player'
import * as Controls from './controls/*.js'
import './skin/index.js';
//安装所有的内置插件
Player.installAll(Controls.controls)

export default Player
