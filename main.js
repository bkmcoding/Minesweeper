let mapSize = [15, 15];
let mineCount = 40;
let flagCount = 40;
let container = document.getElementById("container");
let closeList;
let mineHit = false;
let gameOver = false;
let playerFields = [];
let offsets = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
];
let map = [];
let mineMap = [];
let fillList = [];
assets = {
  mine: "assets/mine.png",
  redFlag: "assets/redFlag.png",
};
let LCaudio = document.querySelector("#lc");
LCaudio.volume = 0.3;
let RCaudio = document.querySelector("#rc");
RCaudio.volume = 0.3;
let flagHTML = document.getElementById("flagCount");
document.addEventListener("contextmenu", (event) => event.preventDefault());

function loadBoard() {
  gameOver = false;
  mineHit = false;
  container.innerHTML = "";
  flagCount = 40;
  flagHTML.innerHTML = `${flagCount}`;
  map = [];
  mineMap = [];
  fillList = [];
  playerFields = [];
  even = 1;
  for (i = 0; i <= mapSize[1]; i++) {
    map.push([]);
    let row = document.createElement("div");
    row.setAttribute("class", "row");
    for (j = 0; j <= mapSize[0]; j++) {
      let div = document.createElement("div");
      if (even == 1) {
        div.setAttribute("class", `field G1`);
        even--;
      } else {
        div.setAttribute("class", "field G2");
        even++;
      }
      div.setAttribute("id", `${i}-${j}`);

      row.appendChild(div);
      map[i].push(div);
    }
    if (even == 1) even--;
    else even++;
    container.appendChild(row);
  }
}

function loadMines(pos) {
  playerFields.push([Number(pos[0]), Number(pos[1])]);
  offsets.forEach((offset) => {
    field = [
      Number(pos[0]) + Number(offset[0]),
      Number(pos[1]) + Number(offset[1]),
    ];
    playerFields.push(field);
  });
  for (i = 0; i <= mapSize[1]; i++) {
    mineMap.push([]);
    for (j = 0; j <= mapSize[0]; j++) {
      mineMap[i].push(0);
    }
  }
  for (k = 0; k < mineCount; ) {
    rX = Math.floor(Math.random() * (mapSize[1] + 1));
    rY = Math.floor(Math.random() * (mapSize[0] + 1));
    fieldPass = true;
    playerFields.forEach((field) => {
      if (field[0] == rX && field[1] == rY) {
        fieldPass = false;
      }
    });
    if (fieldPass) {
      if (mineMap[rX][rY] == 0) {
        mineMap[rX][rY] = 1;
        k++;
      }
    }
  }
}

function loadGame() {
  loadBoard();
  closeList = document.querySelectorAll(".field");
  closeList.forEach((element) => {
    element.addEventListener("click", () => click(element, "left"), {
      once: true,
    });
    element.addEventListener("contextmenu", () => click(element, "right"));
  });
}

function click(elm, e) {
  id = elm.getAttribute("id");
  pos = id.split("-");
  if (mineMap.length == 0) {
    loadMines(pos);
    floodFill(map[pos[0]][pos[1]], Number(pos[0]), Number(pos[1]));
    autoFill();
    return;
  }

  if (e == "left") {
    if (elm.innerHTML != `<img src="${assets["redFlag"]}">`) {
      if (elm.classList.contains("G1")) {
        elm.classList.remove("G1");
        elm.classList.add("B2");
      }
      if (elm.classList.contains("G2")) {
        elm.classList.remove("G2");
        elm.classList.add("B1");
      }
      checkField(elm, pos);
    }
  }
  if (e == "right") {
    if (!gameOver) {
      if (elm.innerHTML == `<img src="${assets["redFlag"]}">`) {
        elm.innerHTML = "";
        flagCount++;
      } else {
        elm.innerHTML = `<img src="${assets["redFlag"]}">`;
        flagCount--;
      }
      flagHTML.innerHTML = `${flagCount}`;
      RCaudio.load();
      RCaudio.play();
    }
  }
}

function checkField(elm, pos) {
  if (mineMap[pos[0]][pos[1]] == 1) {
    elm.innerHTML = `<img src="${assets["mine"]}">`;
    if (mineHit == false) {
      mineHit = true;
      finishBoard();
    }
  } else {
    setFieldNum(elm, getFieldNum(pos));
    LCaudio.play();
  }
}

function getFieldNum(pos) {
  mCount = 0;
  for (i = 0; i < offsets.length; i++) {
    posOffset = [
      Number(pos[0]) + Number(offsets[i][0]),
      Number(pos[1]) + Number(offsets[i][1]),
    ];
    if (
      (posOffset[0] >= 0) &
      (posOffset[0] <= mapSize[0]) &
      (posOffset[1] >= 0) &
      (posOffset[1] <= mapSize[1])
    ) {
      if (mineMap[posOffset[0]][posOffset[1]] == 1) {
        mCount++;
      }
    }
  }
  return mCount;
}

function setFieldNum(elm, count) {
  if (count == 0) {
    elm.innerHTML = "";
  } else {
    elm.innerHTML = count;
  }
}

function finishBoard() {
  gameOver = true;
  closeList = document.querySelectorAll(".field");
  closeList.forEach((element) => {
    click(element, "left");
  });
}

function floodFill(elm, x, y) {
  if (x >= 0 && x <= mapSize[0] && y >= 0 && y <= mapSize[1]) {
    elm = map[x][y];
    fieldNum = getFieldNum([x, y]);
    if (
      mineMap[x][y] == 0 &&
      fieldNum == 0 &&
      (elm.classList.contains("G1") || elm.classList.contains("G2"))
    ) {
      fillList.push([x, y]);
      click(elm, "left");
      floodFill(elm, x + 1, y);
      floodFill(elm, x + 1, y + 1);
      floodFill(elm, x - 1, y);
      floodFill(elm, x - 1, y - 1);
      floodFill(elm, x, y - 1);
      floodFill(elm, x + 1, y - 1);
      floodFill(elm, x, y + 1);
      floodFill(elm, x - 1, y + 1);
    } else {
      return;
    }
  } else {
    return;
  }
}

function autoFill() {
  // elm.classList.contains("G1") || elm.classList.contains("G2");
  newFill = [];
  fillList.forEach((pos) => {
    offsets.forEach((offset) => {
      newPos = [
        Number(pos[0]) + Number(offset[0]),
        Number(pos[1]) + Number(offset[1]),
      ];
      if (!newFill.includes(newPos)) newFill.push(newPos);
      // newFill.push([
      //   Number(pos[0]) + Number(offset[0]),
      //   Number(pos[1]) + Number(offset[1]),
      // ]);
    });
  });
  newFill.forEach((pos) => {
    if (
      pos[0] >= 0 &&
      pos[0] <= mapSize[0] &&
      pos[1] >= 0 &&
      pos[1] <= mapSize[1]
    ) {
      elm = map[[pos[0]]][pos[1]];
      click(elm, "left");
    }
  });
}

function checkWin() {}
