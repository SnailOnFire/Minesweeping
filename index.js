var gameArea = document.getElementById('game-area'),
    gameAreaWidth = gameArea.offsetWidth,
    gameAreaHeight = gameArea.offsetHeight;
var gameAreaTx = gameArea.getContext('2d');

var gamePause = document.getElementsByClassName('pause')[0];
var gameOver = document.getElementsByClassName('game-over')[0];
var gameRestart = document.getElementsByClassName('restart')[0];
var gameSuccess = document.getElementsByClassName('success')[0];
var gameMinesNum = document.getElementsByClassName('mines-num')[0];
var gameFace = document.getElementsByClassName('face')[0];
var gameSmileFace = document.getElementsByClassName('smile-face')[0];
var gameCryFace = document.getElementsByClassName('cry-face')[0];
var gameCross = document.getElementsByClassName('cross')[0];
var gameMinesLeft = document.getElementsByClassName('mines-left')[0];
var gameTime = document.getElementsByClassName('time')[0];

////////////////////每个格子的信息（最好封装成对象）/////////////////////
var numOfMine = [],       //每个格子周围的地雷数
    rectLeft = [],        //每个格子起点的横坐标
    rectTop = [],         //每个格子起点的纵坐标
    rectWidth = 20,       //每个格子的宽
    rectHeight = 20,      //每个格子的高
    rectRadius = 0,       //每个格子的圆角
    rectColor = 'grey',   //每个格子的颜色
    lineWidth = 1;        //绘制每个格子的线宽
gameAreaTx.fillStyle = 'yellow';                                                   //光标经过方格上方格变黄
gameAreaTx.lineWidth = lineWidth;
gameAreaTx.strokeStyle = rectColor || params.rectColor;

///////////////////////////////格子操作////////////////////////////////（最好封装成对象，为了少写点代码我就不封装了）
var mouseLeft,
    mouseTop,
    lastMouseLeft,
    lastMouseTop;

///////////////////////////////地雷操作////////////////////////////////（最好封装成对象）
var minesNum = originMinesNum = 120,    //原始地雷数          
    minesLeft = [],
    minesTop = [],
    tempMineLeft,
    tempMineTop;

///////////////////////////////游戏状态////////////////////////////////（最好封装成对象）
var start,
    pause,
    over,
    success,
    position,               //光标实时位置，尤其重要的参数
    lastPosition,           //光标上一次的位置，尤其重要的参数
    mouseDownStatus,        //鼠标的按下状态，防止用户点击之后拖拽导致误操作
    clicked = [],           //所有方格的点击状态
    rectStatus = [],        //所有方格的内容信息
    markRight,              //正确标记的地雷数，用以判断是否游戏通关
    timer,
    numOfMinesLeft,
    gameTotalTime,
    gameTimer;

///////////////////////取消浏览器默认右键点击事件////////////////////////
document.oncontextmenu = function (e) {
	e.preventDefault();
}

init();  //程序开始

//////////////////////////////初始化程序///////////////////////////////
function init() {
    clearInterval(gameTimer);
    clearTimeout(timer);

    gameSmileFace.style.display = 'inline-block';
    gameCryFace.style.display = 'none';
    gameSuccess.style.display = 'none';
    gameOver.style.display = 'none';
    gameRestart.style.display = 'none';
    gamePause.style.display = 'none';

    minesLeft.length = 0;       //清空之前的所有信息
    minesTop.length = 0;
    clicked.length = 0;
    rectStatus.length = 0;
    numOfMine.length = 0;
    rectLeft.length = 0;
    rectTop.length = 0;
    markRight = 0;
    gameTotalTime = 0;
    
    mouseDownStatus = false;    //当前没有鼠标按键按下
    start = false;
    pause = false;
    over = false; 
    success = false;

    numOfMinesLeft = minesNum;  //剩余地雷数显示
    gameMinesLeft.innerHTML = numOfMinesLeft;

    clearGameBoard();
    drawGameBoard();
    generateMines();
    getMines();
    getRectInfo();

    start = true;               //程序初始化完成，游戏开始

    gameTimer = setInterval(function(){
        if(!pause) {
            gameTime.innerHTML = ++gameTotalTime;
        }       
    },1000)
}

//////////////////////////一行一行画扫雷格子////////////////////////////
function drawGameBoard() {
    var i = 0;
    for(var tempRectTop = 0; tempRectTop < gameAreaHeight; tempRectTop += rectHeight) {   
        for(var tempRectLeft = 0; tempRectLeft < gameAreaWidth; tempRectLeft += rectWidth) {
            gameAreaTx.strokeRect(tempRectLeft, tempRectTop, rectWidth, rectHeight);
            rectLeft[i] = tempRectLeft;
            rectTop[i] = tempRectTop;
            numOfMine[i] = 0;
            clicked[i] = 'false';
            rectStatus[i] = 'none'; 
            i ++;
        }
    }
}

////////////////////////////清空扫雷格子//////////////////////////////
function clearGameBoard() {
    for(var tempRectTop = 0; tempRectTop < gameAreaHeight; tempRectTop += rectHeight) {   
        for(var tempRectLeft = 0; tempRectLeft < gameAreaWidth; tempRectLeft += rectWidth) {
            gameAreaTx.clearRect(tempRectLeft, tempRectTop, rectWidth, rectHeight);
        }
    }
}

///////////////////////////////地雷生成////////////////////////////////
function generateMines() {
    var generated,
        i,
        j;
    for(i = 0; i < minesNum; i ++) {   //生成minesnum数量的地雷
        generated = false;
        while(!generated) {
            tempMineLeft = Math.floor((Math.random() * gameAreaWidth) / rectWidth) * rectWidth;
            tempMineTop = Math.floor((Math.random() * gameAreaHeight) / rectHeight) * rectHeight;
            for(j = 0; j < i; j ++) {
                if(tempMineLeft == minesLeft[j]) {
                    if(tempMineTop == minesTop[j]) {
                        break;
                    }
                    else{
                        continue;
                    }
                }
            }
            if(j == i) {
                generated = true;
            }
        }
        minesLeft[i] = tempMineLeft;
        minesTop[i] = tempMineTop;
    }
}

/////////////////////////////显示所有地雷//////////////////////////////
function drawAllMines() {
    var imgObj = new Image();
    // imgObj.src = "image\\mine.bmp";
    // imgObj.onload = function () {   //若把数组放在这里赋值数组会变为类数组，非常奇怪
    //     for(i = 0; i < minesNum; i ++) {
    //         gameAreaTx.clearRect(minesLeft[i], minesTop[i], rectWidth, rectHeight);              //删除该方格
    //         gameAreaTx.drawImage(this, minesLeft[i], minesTop[i], rectWidth, rectHeight);        //插入地雷图片
    //     }
    // }
    for(i = 0, len = clicked.length; i < len; i ++) {
        if('mine' == rectStatus[i]) {
            if('false' == clicked[i]) {
                imgObj.src = "image\\mine.bmp";
                gameAreaTx.clearRect(rectLeft[i], rectTop[i], rectWidth, rectHeight);
                gameAreaTx.drawImage(imgObj, rectLeft[i], rectTop[i], rectWidth, rectHeight);
            }
            else if('false1' == clicked[i]) {
                imgObj.src = "image\\markRight.bmp";
                gameAreaTx.clearRect(rectLeft[i], rectTop[i], rectWidth, rectHeight);
                gameAreaTx.drawImage(imgObj, rectLeft[i], rectTop[i], rectWidth, rectHeight);
            }
        }
        else {
            if('false1' == clicked[i]) {   //错误标记
                imgObj.src = "image\\error.bmp";
                gameAreaTx.clearRect(rectLeft[i], rectTop[i], rectWidth, rectHeight);
                gameAreaTx.drawImage(imgObj, rectLeft[i], rectTop[i], rectWidth, rectHeight);
            }
        }
    }
}

/////////////////////////////显示所有方格//////////////////////////////
function drawAllRect() {
    drawAllNum();
    drawAllMines();
    for(i = 0, len = rectStatus.length; i < len; i ++) {
        if('none' == rectStatus[i]) {
            drawSafe(i);
        }
    }
}

///////////////////////地雷四周方格地雷数字处理//////////////////////////
function getMines() {
    var minesLen = minesLeft.length,
        rectLen = rectLeft.length,
        temp = [];
    for(var i = 0; i < minesLen; i ++) {
        for(var j = 0; j < rectLen; j ++){
            if(minesLeft[i] == rectLeft[j]) {
                if(minesTop[i] == rectTop[j]) {  //找到该地雷位置
                    temp = getAroundRect(j);
                    for(var k = 0, l = temp.length; k < l; k ++) {                        
                        numOfMine[temp[k]] ++;                  //获取了每颗雷周围的情况后，其周边的每个格子的地雷数都+1
                    }
                    break;
                }
            }
        }
    }
    for(var i = 0; i < minesLen; i ++) {
        for(var j = 0; j < rectLen; j ++){
            if(minesLeft[i] == rectLeft[j]) {
                if(minesTop[i] == rectTop[j]) {  //找到该地雷位置   
                    rectStatus[j] = 'mine';                  
                    numOfMine[j] = 0;    //将地雷所在位置的计数清零
                }
            }
        }
    }
}

//////////////////////获取指定位置的周边格子位置////////////////////////
function getAroundRect(i) {
    var numX = gameAreaWidth / rectWidth,
        numY = gameAreaHeight / rectHeight,
        temp = [],
        result = [];
    temp[0] = i - numX - 1;
    temp[1] = i - numX;
    temp[2] = i - numX + 1;
    temp[3] = i - 1;
    temp[4] = i + 1;
    temp[5] = i + numX - 1;
    temp[6] = i + numX;
    temp[7] = i + numX + 1;
    if(0 == i % numX) {                             //最左边一列处理
        temp[0] = -1;
        temp[3] = -1;
        temp[5] = -1;
    }
    if(Math.floor((i / numX)) == (numY -1))  {      //最下边一行处理
        temp[5] = -1;
        temp[6] = -1;
        temp[7] = -1;
    }
    if((numX - 1) == (i % numX))  {                 //最右边一列处理
        temp[2] = -1;
        temp[4] = -1;
        temp[7] = -1;
    }
    for(var k = 0, l = 0; k < 8; k ++) {                        
        if(temp[k] >= 0) {                          //最上边一行处理（默认为负）
            result[l] = temp[k];
            l ++;
        }
    }
    return result;
}
///////////////////////获取每个格子的地雷数信息/////////////////////////
function getRectInfo() {
    for(var i = 0, len = numOfMine.length; i < len; i ++) {
        if(numOfMine[i]) {
            rectStatus[i] = 'num';
        }
    }
}

/////////////////////////显示单个格子的地雷数///////////////////////////
function drawNum(which) {
    var imgObj = new Image();
    imgObj.src = 'image\\' + numOfMine[which] + '.bmp';
        switch(numOfMine[which]) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
                gameAreaTx.clearRect(rectLeft[which], rectTop[which], rectWidth, rectHeight);           //删除该方格
                gameAreaTx.drawImage(imgObj, rectLeft[which], rectTop[which], rectWidth, rectHeight);   //插入数字图片
                break;
            default:
                break;
        }
}

/////////////////////////显示所有格子的地雷数///////////////////////////
function drawAllNum() {
    var imgObj = new Image();
    for(var i = 0, len = numOfMine.length; i < len; i ++) {
        drawNum(i);
    }
}

/////////////////////////鼠标光标所在方格处理///////////////////////////
gameArea.onmousemove = function(e) {
    if(start && !over && !pause) {
        // e.stopPropagation();                                                    //取消冒泡事件
        if(!mouseDownStatus) {                                                          //在用户未点击的情况下进行操作
            lastMouseLeft = mouseLeft;
            lastMouseTop = mouseTop;
            lastPosition = position;
            mouseLeft = Math.floor(Math.abs((e.offsetX / rectWidth))) * rectWidth;      //得到光标所在方格的左上顶点的left信息
            mouseTop = Math.floor(Math.abs((e.offsetY / rectHeight))) * rectHeight;     //得到光标所在方格的左上顶点的top信息
            position = (mouseLeft / rectWidth) + (mouseTop / rectHeight) * (Math.floor(gameAreaWidth / rectWidth));  //当前光标在第几格（按行数）
            if('false' == clicked[position]) {       //没有被点击过
                gameAreaTx.fillStyle = 'yellow'; 
                gameAreaTx.clearRect(mouseLeft, mouseTop, rectWidth, rectHeight);               //删除该方格
                gameAreaTx.fillRect(mouseLeft, mouseTop, rectWidth, rectHeight);                //该方格变黄
            }
            if('false' == clicked[lastPosition]) {   //光标离开之后没有被点击过则恢复初始状态
                if(mouseLeft != lastMouseLeft || mouseTop != lastMouseTop) {
                    gameAreaTx.clearRect(lastMouseLeft, lastMouseTop, rectWidth, rectHeight);   //删除该方格
                    gameAreaTx.strokeRect(lastMouseLeft, lastMouseTop, rectWidth, rectHeight);  //该方格变蓝
                }
            }
        }
    }
}

/////////////////////////////边缘方格处理///////////////////////////////
document.onmouseover = function() {
    if(start && !over && !pause) {
        if('false' == clicked[position]) {
            gameAreaTx.clearRect(mouseLeft, mouseTop, rectWidth, rectHeight);
            gameAreaTx.strokeRect(mouseLeft, mouseTop, rectWidth, rectHeight);
        }
        gameFace.style.borderWidth = '5px';
        gameFace.style.borderColor = 'white grey grey white';
    }
}

///////////////////////////////游戏操作////////////////////////////////
gameArea.onmousedown = function(e) {  //鼠标左键e.which=1，右键e.which=3
    if(start && !over && !pause) {
        mouseDownStatus = true;
        lastPosition = position;        //记录鼠标按下去时的位置信息
        if('false' == clicked[position]) {
            gameAreaTx.clearRect(mouseLeft, mouseTop, rectWidth, rectHeight);               //删除该方格
            gameAreaTx.strokeRect(mouseLeft, mouseTop, rectWidth, rectHeight);
        }
    }
}

///////////////////////////////游戏操作////////////////////////////////
gameArea.onmouseup = function(e) {
    if(start && !over && !pause) {
        mouseLeft = Math.floor(Math.abs((e.offsetX / rectWidth))) * rectWidth;      //得到光标所在方格的左上顶点的left信息
        mouseTop = Math.floor(Math.abs((e.offsetY / rectHeight))) * rectHeight;     //得到光标所在方格的左上顶点的top信息
        position = (mouseLeft / rectWidth) + (mouseTop / rectHeight) * (Math.floor(gameAreaWidth / rectWidth));  //当前光标在第几格（按行数）
        if(position == lastPosition) {                     //鼠标按下去之后没有挪动位置，如果挪动则取消操作
            if(1 == e.which && 'false' == clicked[position]) {            //按下鼠标左键显示此位置的地雷数
                if('mine' == rectStatus[position])  {      //踩到地雷
                    var imgObj = new Image();
                    imgObj.src = 'image\\blood.bmp';       //错误
                    gameAreaTx.clearRect(rectLeft[position], rectTop[position], rectWidth, rectHeight);
                    gameAreaTx.drawImage(imgObj, rectLeft[position], rectTop[position], rectWidth, rectHeight);
                    clicked[position] = 'wrong';
                    over = true;
                }
                else {
                        if(!numOfMine[position]) {
                            drawSafeAround(position);
                        }
                        else {
                            clicked[position] = 'true';
                            drawNum(position);
                        }
                }
            }
            else if(3 == e.which) {                         //按下鼠标右键，第一次进行标记，第二次变成不确定，第三次取消标记
                if('true' != clicked[position]) {
                    clicked[position] = clicked[position] + '1';
                    var imgObj = new Image();
                    switch(clicked[position]) {
                        case 'false1':
                            imgObj.src = 'image\\flag.bmp';        //旗子
                            if('mine' == rectStatus[position]) {   //正确标记地雷，正确标记数加一
                                markRight++;
                            }
                            else {                                 //错误标记地雷，正确标记数减一
                                markRight--;
                            }
                            numOfMinesLeft --;
                            gameAreaTx.clearRect(rectLeft[position], rectTop[position], rectWidth, rectHeight);
                            gameAreaTx.drawImage(imgObj, rectLeft[position], rectTop[position], rectWidth, rectHeight);
                            break;
                        case 'false11':
                            numOfMinesLeft ++;
                            imgObj.src = 'image\\ask.bmp';         //疑问
                            if('mine' == rectStatus[position]) {   //之前正确标记地雷，现在取消标记，正确标记数减一
                                markRight--;
                            }
                            else{
                                markRight++;
                            }
                            gameAreaTx.clearRect(rectLeft[position], rectTop[position], rectWidth, rectHeight);
                            gameAreaTx.drawImage(imgObj, rectLeft[position], rectTop[position], rectWidth, rectHeight);
                            break;
                        case 'false111':
                            clicked[position] = 'false';           //取消标记
                            gameAreaTx.clearRect(rectLeft[position], rectTop[position], rectWidth, rectHeight);
                            gameAreaTx.strokeRect(rectLeft[position], rectTop[position], rectWidth, rectHeight);
                            break;
                        default:
                            break;
                    }
                    if(markRight == minesNum) {                    //地雷全部正确标记，游戏通关（两种通关方式其二）
                        success = true;
                        over = true;
                    }
                    gameMinesLeft.innerHTML = numOfMinesLeft;
                }
            }
        }
        mouseDownStatus = false;
        for(var i = 0, showNum = 0, len = clicked.length; i < len; i ++) {
            if('true' == clicked[i]) {
                showNum ++;
            }
            if(showNum == (len - minesNum)) {   //非地雷区全部显示，游戏通关（两种通关方式其一）
                success = true;
                over = true;
                break;
            }
        }
        if(over) {
            drawAllMines();
            //drawAllRect();
            clearInterval(gameTimer);
            if(success) {
                gameSuccess.style.display = 'inline-block';
            }
            else {
                gameSmileFace.style.display = 'none';
                gameCryFace.style.display = 'inline-block';
                gameOver.style.display = 'inline-block';
            }
            timer = setTimeout(function () {
                if(over) {
                    gameSuccess.style.display = 'none';
                    gameOver.style.display = 'none';
                    gameRestart.style.display = 'inline-block';
                }
            },1500);
        }
    }
}

//////////点击到没有地雷的方格就显示和它连在一起的没有地雷的方格///////////
function drawSafeAround(tempPosition) {
    if(start && !over && !pause) {
        var temp = [];
        drawSafe(tempPosition);
        temp = getAroundRect(tempPosition);
        for(var i = 0, len = temp.length; i < len; i ++) {
            if('false' == clicked[temp[i]]) { 
                if('num' == rectStatus[temp[i]]) {
                    clicked[temp[i]] = 'true';
                    drawNum(temp[i]);
                }
                else{
                    drawSafeAround(temp[i]);
                }
                
            }
        }
    }
}

////////////////////////显示点击的没有地雷的格子//////////////////////////
function drawSafe(i) {
    clicked[i] = 'true';
    gameAreaTx.fillStyle = 'Silver';                                        //银白色 #C0C0C0
    gameAreaTx.clearRect(rectLeft[i], rectTop[i], rectWidth, rectHeight);   //删除该方格
    gameAreaTx.fillRect(rectLeft[i], rectTop[i], rectWidth, rectHeight);    //该方格变色
    gameAreaTx.strokeRect(rectLeft[i], rectTop[i], rectWidth, rectHeight); 
}

///////////////////////////////空格控制/////////////////////////////////
document.onkeydown = function(e) {
    if(start && !over) {
        if(32 == e.which) {  //space键检测
            pause = ~ pause;
            if(pause) {
                if('false' == clicked[position]) {
                    gameAreaTx.clearRect(mouseLeft, mouseTop, rectWidth, rectHeight);
                    gameAreaTx.strokeRect(mouseLeft, mouseTop, rectWidth, rectHeight);
                }
                gamePause.style.display = 'inline-block';
            }
            else {
                gamePause.style.display = 'none';
            }
        }
    }
}

gameMinesNum.onkeydown = function(e) {
    e.stopPropagation();
}

gameMinesNum.onfocus = function() {
    if(start) {
        if('请输入地雷数' == gameMinesNum.value) {
            gameMinesNum.value = '';
        }
    }
}

gameMinesNum.onblur = function() {
    if(start) {
        if('' == gameMinesNum.value) {
            gameMinesNum.value = '请输入地雷数';
        }
        else {
            gameMinesNum.value = gameMinesNum.value.replace(/[^0-9]/ig,'');
             if(gameMinesNum.value > 959) {
                gameMinesNum.value = 959;
            }
        }
    }
}

gameFace.onmousedown = function() {
    gameFace.style.borderWidth = '5px 2px 2px 5px';
    gameFace.style.borderColor = 'grey';
    if('请输入地雷数' == gameMinesNum.value) {
        minesNum = originMinesNum;
    }
    else{
        gameMinesNum.value = gameMinesNum.value.replace(/[^0-9]/ig,'');
        if(gameMinesNum.value > 959) {
            gameMinesNum.value = 959;
        }
        if('' == gameMinesNum.value) {
            minesNum = 0;
        }
        else {
            minesNum = gameMinesNum.value;
        }
    }
    gameTime.innerHTML = 0;
    init();
}

gameFace.onmouseup = function() {
    gameFace.style.borderWidth = '5px';
    gameFace.style.borderColor = 'white grey grey white';
}

gameFace.onmouseover = function() {
    gameFace.style.cursor = 'pointer';
}

gameCross.onclick = function(e) {
    e.stopPropagation = true;
    gameRestart.style.display = 'none';
}