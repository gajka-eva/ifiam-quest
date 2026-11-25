(() => {
  "use strict";

  const svg = document.getElementById("game");
  const SVG_NS = "http://www.w3.org/2000/svg";

  // SVG — самостоятельная сцена 900 × 600. Игровая логика и координаты
  // персонажа остаются прежними.
  let sceneLayer = svg.querySelector("#scene");
  let playerLayer = svg.querySelector("#player-layer");

  if (!sceneLayer) {
    sceneLayer = document.createElementNS(SVG_NS, "g");
    sceneLayer.setAttribute("id", "scene");
    svg.appendChild(sceneLayer);
  }

  if (!playerLayer) {
    playerLayer = document.createElementNS(SVG_NS, "g");
    playerLayer.setAttribute("id", "player");
    svg.appendChild(playerLayer);
  }

  const svgEl = (tag, attrs = {}, parent = sceneLayer) => {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value !== undefined && value !== null) {
        node.setAttribute(key, String(value));
      }
    }
    parent.appendChild(node);
    return node;
  };

  const addText = (parent, value, x, y, attrs = {}) => {
    const node = svgEl("text", {
      x, y,
      "text-anchor": "middle",
      "dominant-baseline": "alphabetic",
      ...attrs
    }, parent);
    node.textContent = value;
    return node;
  };

  const addLine = (parent, x1, y1, x2, y2, attrs = {}) =>
    svgEl("line", { x1, y1, x2, y2, ...attrs }, parent);

  function installSvgDefinitions() {
    let defs = svg.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS(SVG_NS, "defs");
      svg.insertBefore(defs, svg.firstChild);
    }
    defs.innerHTML = `
      <linearGradient id="wallGradient" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#f4d9a9"/>
  <stop offset="1" stop-color="#dfa85f"/>
</linearGradient>

<linearGradient id="floorGradient" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#b4a797"/>
  <stop offset="1" stop-color="#8b8175"/>
</linearGradient>

<linearGradient id="windowGradient" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#fff8df"/>
  <stop offset="1" stop-color="#f5dfae"/>
</linearGradient>

<linearGradient id="columnGradient" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#d4a36b"/>
  <stop offset=".5" stop-color="#f5dfbd"/>
  <stop offset="1" stop-color="#d4a36b"/>
</linearGradient>

<linearGradient id="mirrorGradient" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#a4c2c0"/>
  <stop offset=".5" stop-color="#e4f2e9"/>
  <stop offset="1" stop-color="#a4c2c0"/>
</linearGradient>

<linearGradient id="woodGradient" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#805438"/>
  <stop offset=".5" stop-color="#b17b4e"/>
  <stop offset="1" stop-color="#805438"/>
</linearGradient>

<radialGradient id="torchGlow">
  <stop offset="0" stop-color="#ffe7a3" stop-opacity="0.65"/>
  <stop offset="1" stop-color="#ffe7a3" stop-opacity="0"/>
</radialGradient>
    `;
  }

  installSvgDefinitions();

  const $ = id => document.getElementById(id);

const ui = {
  location: $("location"),
  route: $("route"),
  progress: $("progress"),
  hint: $("hint"),
  welcome: $("welcome"),
  questionWindow: $("questionWindow"),
  questionFaculty: $("questionFaculty"),
  questionTitle: $("questionTitle"),
  questionText: $("questionText"),
  answers: $("answers"),
  feedback: $("feedback"),
  finishWindow: $("finishWindow"),
  returnButton: $("returnButton")   // ← было back-to-hall
};

ui.returnButton.addEventListener("click", () => {
  ui.finishWindow.hidden = true;
  state.faculty = null;
  state.challenge = 0;
  state.answered = false;
  state.scene = "hall";
  drawHall();
  updateInterface();
});
  // ========================================
  // 1. ДАННЫЕ ФАКУЛЬТЕТОВ И ИСПЫТАНИЙ
  // ========================================

  const faculties = {
    philology: {
      title: "Факультет теоретической и прикладной филологии",
      short: "Теоретическая и прикладная филология",
      door: "ФИЛОЛОГИЯ",
      color: "#789c91",

      rooms: [
        "Кабинет лексики",
        "Морфологическая мастерская",
        "Лаборатория текста"
      ],

      tasks: [
        {
          type: "wordSearch",
          title: "Тайна буквенного квадрата",
          question: "Найди пять спрятанных слов. Сначала нажми на первую букву слова, затем на последнюю.",
          words: ["ЯЗЫК", "ТЕКСТ", "ФОРМА", "СУФФИКС", "КОРЕНЬ"],
          grid: [
            ["Я", "З", "Т", "Е", "К", "С", "Т", "Е"],
            ["З", "Е", "К", "О", "Т", "А", "Р", "С"],
            ["Ы", "О", "Ф", "М", "А", "Л", "Ь", "У"],
            ["К", "У", "И", "О", "Т", "К", "Й", "Ф"],
            ["К", "О", "Р", "Е", "Р", "Ь", "И", "Ф"],
            ["А", "Б", "В", "Г", "Д", "М", "Ж", "И"],
            ["К", "О", "Р", "Е", "Н", "Ь", "А", "К"],
            ["Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Э", "С"]
          ]
        },
        {
          type: "textInput",
          title: "Восстанови понятие",
          question: "Как называются слова, близкие по значению, но различающиеся звучанием и написанием?",
          answer: ["синонимы"],
          explanation: "Синонимы — слова, близкие или тождественные по значению."
        },
        {
          type: "editText",
          title: "Редакторская проверка",
          question: "В предложении допущена грамматическая ошибка. Исправь выделенное слово и введи правильную форму:\n\n«Студенты изучали интересные языковые явление».\n\nКакую словоформу нужно заменить и на какую?",
          answer: ["явления"],
          explanation: "Существительное должно стоять во множественном числе в форме именительного падежа: «явления»."
        }
      ]
    },

    journalism: {
      title: "Высшая школа журналистики и медиапроизводства",
      short: "Журналистика и медиапроизводство",
      door: "ЖУРНАЛИСТИКА",
      color: "#b28a62",

      rooms: [
        "Редакция новостей",
        "Мастерская заголовков",
        "Медиалаборатория"
      ],

      tasks: [
  {
    type: "choice",
    title: "Девиз журнала",
    question: "У этого российского журнала 18 века был девиз: «Они работают, а вы их труд ядите».",
    options: [
      "Северная пчела",
      "Всякая всячина",
      "Заволжский муравей",
      "Трутень"
    ],
    correct: 3,
    explanation: "Верно! Переходи в другую аудиторию"
  },

  {
  type: "textInput",
  title: "Впиши нужное слово",
  question: "Впиши нужные слова в правильной форме через пробел:\n\n«___ – разновидность разговора, беседы между двумя и более людьми, при которой журналист задает ___ своему собеседнику и получает от него ___.»\n\nВведи три слова по порядку пропусков через пробел.",
  answer: [
    "интервью вопросы ответы",
    "интервью вопрос ответ"
  ],
  explanation: "Правильно! Переходи в последнюю аудиторию."
},

  {
    type: "wordSearch",
    title: "Тайна журналистского квадрата",
    question: "Найди шесть спрятанных слов. Слова могут располагаться по горизонтали, вертикали и диагонали. Сначала нажми на первую букву слова, затем на последнюю.",
    words: ["РЕПОРТАЖ", "РЕЦЕНЗИЯ", "СТАТЬЯ", "ОЧЕРК", "ЭССЕ"],
    grid: [
      ["Р", "С", "Т", "А", "Т", "Ь", "Я", "Ф"],
      ["Р", "Е", "Ц", "Е", "Н", "З", "И", "Я"],
      ["Ц", "И", "П", "Т", "Е", "Р", "И", "Л"],
      ["У", "С", "Л", "О", "М", "Е", "У", "К"],
      ["Н", "О", "Ч", "Е", "Р", "К", "О", "Е"],
      ["З", "И", "О", "П", "Е", "Т", "К", "Т"],
      ["И", "М", "К", "О", "М", "М", "А", "О"],
      ["Я", "Э", "С", "С", "Е", "Н", "А", "Ж"]
    ],
    explanation: "Задание выполнено!"
  }
]
},

    languages: {
      title: "Факультет иностранных языков",
      short: "Иностранные языки",
      door: "ИНОСТРАННЫЕ ЯЗЫКИ",
      color: "#8198bd",

      rooms: [
        "Кабинет языковых открытий",
        "Лингвистическая гостиная",
        "Зал переводчиков"
      ],

      tasks: [
  {
    type: "sentenceOrder",
    title: "Собери французскую пословицу",
    question: "Составь предложение из перепутанных слов.",
    words: ["guerre", "à", "la", "à", "guerre", "comme", "la"],
    answer: ["à", "la", "guerre", "comme", "à", "la", "guerre"],
    explanation: "Правильно! Так говорят, когда нужно принимать условия, которые нельзя изменить. Переходи в следующую аудиторию"
  },
  {
    type: "wordSearch",
    title: "Семья",
    question: "Найди шесть слов по теме «Семья»: два — по горизонтали, четыре — по вертикали. Надстрочные знаки указывать не нужно. Сначала нажми на первую букву слова, затем на последнюю.",
    words: ["FRERE", "SOEUR", "FILS", "MERE", "PERE", "NIECE"],
    grid: [
      ["O", "M", "U", "P", "N", "L", "A", "N"],
      ["N", "E", "T", "E", "I", "T", "O", "M"],
      ["F", "R", "E", "R", "E", "D", "E", "H"],
      ["A", "E", "S", "E", "C", "F", "S", "C"],
      ["L", "F", "I", "L", "E", "I", "D", "U"],
      ["S", "S", "OE", "U", "R", "L", "X", "Z"],
      ["F", "T", "Y", "V", "F", "S", "S", "Q"],
      ["O", "P", "D", "L", "A", "N", "N", "C"]
    ],
    explanation: "Найдены все слова! Переходи в последнюю аудиторию"
  },
  {
    type: "choice",
    title: "Франция и французский язык",
    question: "Выбери правильный ответ из предложенных.",
    options: [
      "Францию называют шестиугольником",
      "Францию называют треугольником",
      "Францию называют кругом"
    ],
    correct: 0,
    explanation: "Францию часто называют шестиугольником (l'Hexagone) из-за формы её территории. Следующий вопрос"
  },
  
]
    }
  };

  // ========================================
  // 2. СОСТОЯНИЕ ИГРЫ
  // ========================================

  const state = {
    started: false,
    scene: "hall",
    faculty: null,
    challenge: 0,
    answered: false,
    questionOpen: false,
    transitioning: false,

    player: {
      x: 450,
      y: 510,
      speed: 210,
      radius: 13
    },

    keys: new Set(),
    nearby: null
  };

const doors = [
  { id: "philology", x: 100, y: 205, width: 165, height: 125 },
  { id: "journalism", x: 367, y: 205, width: 165, height: 125 },
  { id: "languages", x: 634, y: 205, width: 165, height: 125 }
];

// ----------------------------------------
// ЗАВЕРШЕНИЕ ЗАДАНИЯ И ПЕРЕХОД ДАЛЬШЕ
// ----------------------------------------

function completeTask(message) {
  if (state.answered) return;
  state.answered = true;

  ui.feedback.textContent =
    "Верно! " + (message || "Испытание пройдено.");

  const faculty = faculties[state.faculty];
  const isLastTask = state.challenge >= faculty.tasks.length - 1;

  const nextButton = document.createElement("button");
  nextButton.className = "answer-button correct";
  nextButton.textContent = isLastTask ? "Завершить →" : "Продолжить →";

  nextButton.addEventListener("click", () => {
    ui.questionWindow.hidden = true;
    state.questionOpen = false;

    if (isLastTask) {
      finishFaculty();
    } else {
      state.challenge++;
      state.answered = false;
      drawCurrentRoom();   // ← должна быть у тебя в блоке рисования комнат
      updateInterface();   // ← тоже должна быть
    }
  });

  ui.answers.appendChild(nextButton);
}

function finishFaculty() {
  const faculty = faculties[state.faculty];

  // Меняем название факультета в готовом тексте
  const intro = ui.finishWindow.querySelector(".finish-intro");
  if (intro) {
    intro.innerHTML = `
      Поздравляем! Ты успешно прошёл(ла) маршрут
      <strong>«${faculty.short}».</strong>
    `;
  }

  // Меняем ссылку и подпись под направление, если нужно
  const site = ui.finishWindow.querySelector(".finish-site");
  if (site) {
    site.setAttribute("href", faculty.admissionUrl || "http://isu.ru/Abitur/pk2026/main/");
    site.innerHTML = `
      Приёмная кампания · ${faculty.short}
      <span>↗</span>
    `;
  }

  ui.finishWindow.hidden = false;
}

  // ========================================
  // 3. РИСОВАНИЕ ИНТЕРЬЕРА
  // ========================================

  // ========================================
  // 3. SVG-ОТРИСОВКА ИНТЕРЬЕРА
  // ========================================

  function drawBackground() {

  // Стены — тёплый светло-жёлтый цвет
  svgEl("rect", {
    x: 0, y: 0, width: 900, height: 470,
    fill: "url(#wallGradient)"
  });

  // Сохраняем прежнюю кладку, но делаем её почти незаметной
  const masonry = svgEl("g", {
    stroke: "rgba(130,85,45,.09)",
    "stroke-width": 2,
    fill: "none"
  });

  for (let y = 30; y < 470; y += 48) {
    addLine(masonry, 0, y, 900, y);

    for (let x = (y % 96 ? 50 : 0); x < 900; x += 110) {
      addLine(masonry, x, y - 48, x, y);
    }
  }

  // Пол — прежний, только более натурального оттенка
  svgEl("rect", {
    x: 0, y: 470, width: 900, height: 130,
    fill: "url(#floorGradient)"
  });

  const floorLines = svgEl("g", {
    stroke: "rgba(75,65,55,.22)",
    "stroke-width": 2,
    fill: "none"
  });

  for (let y = 480; y < 600; y += 30) {
    addLine(floorLines, 0, y, 900, y);
  }

  for (let x = 50; x < 900; x += 110) {
    addLine(floorLines, x, 470, x, 600);
  }

  // Большие окна
  drawWindow(230, -5);
  drawWindow(680, -5);

  // Свет от окон
  drawTorch(35, 135);
  drawTorch(865, 135);
}

  function drawWindow(x, y) {
  const group = svgEl("g", {}, sceneLayer);

  // Рама большого окна
  svgEl("path", {
    d: `M ${x-55} ${y+55}
        A 55 55 0 0 1 ${x+55} ${y+55}
        L ${x+55} ${y+190}
        L ${x-55} ${y+190} Z`,
    fill: "#d6a36b"
  }, group);

  // Светлое стекло
  svgEl("path", {
    d: `M ${x-46} ${y+55}
        A 46 46 0 0 1 ${x+46} ${y+55}
        L ${x+46} ${y+181}
        L ${x-46} ${y+181} Z`,
    fill: "#fff5d9"
  }, group);

  // Рамы
  svgEl("rect", {
    x: x - 50,
    y: y + 55,
    width: 100,
    height: 135,
    fill: "none",
    stroke: "#d6a36b",
    "stroke-width": 7
  }, group);

  // Вертикальная рама
  addLine(group, x, y + 55, x, y + 190, {
    stroke: "#d6a36b",
    "stroke-width": 6
  });

  // Горизонтальная рама
  addLine(group, x - 48, y + 115, x + 48, y + 115, {
    stroke: "#d6a36b",
    "stroke-width": 5
  });

  // Мягкий солнечный блик
  svgEl("path", {
    d: `M ${x-40} ${y+65}
        L ${x-10} ${y+65}
        L ${x-25} ${y+175}
        L ${x-40} ${y+175} Z`,
    fill: "#ffffff",
    opacity: 0.22
  }, group);
}

  function drawTorch(x, y) {
    const group = svgEl("g", {}, sceneLayer);
    svgEl("rect", {
      x: x - 5, y, width: 10, height: 30,
      fill: "#8b6747"
    }, group);
    svgEl("ellipse", {
      cx: x, cy: y - 10, rx: 55, ry: 55,
      fill: "url(#torchGlow)"
    }, group);
    svgEl("ellipse", {
      cx: x, cy: y - 9, rx: 7, ry: 12,
      fill: "#f5ba65"
    }, group);
    svgEl("ellipse", {
      cx: x, cy: y - 11, rx: 3, ry: 7,
      fill: "#fff0b5"
    }, group);
  }

  function drawDoor(x, y, width, height, label, color, doorId = "") {
  const group = svgEl("g", {
    class: "door",
    "data-door-id": doorId
  }, sceneLayer);

  // Рама
  svgEl("rect", {
    x: x - 10,
    y: y - 12,
    width: width + 20,
    height: height + 24,
    fill: "#665342",
    stroke: "#d0b28b",
    "stroke-width": 5
  }, group);

  // Створка
  const panel = svgEl("g", {
    class: "door-panel",
    "data-door-id": doorId
  }, group);

  // Основная поверхность
  svgEl("rect", {
    x, y, width, height,
    fill: "url(#woodGradient)",
    stroke: "#5f4935",
    "stroke-width": 2
  }, panel);

  // Внутренняя рамка
  svgEl("rect", {
    x: x + 10,
    y: y + 10,
    width: width - 20,
    height: height - 20,
    fill: "none",
    stroke: "#c0a071",
    "stroke-width": 2
  }, panel);

  // Логотип
  svgEl("image", {
    href: "logo2.png",
    x: x + width / 2 - 12,
    y: y + 17,
    width: 24,
    height: 32,
    preserveAspectRatio: "xMidYMid meet"
  }, panel);

  // Надпись
  const maxChars = Math.max(7, Math.floor((width - 15) / 7));
  const words = label.split(" ");
  const lines = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;

    if (test.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }

  if (line) lines.push(line);

  lines.forEach((part, index) => {
    addText(panel, part, x + width / 2, y + 70 + index * 15, {
      fill: "#f4e4c5",
      "font-family": "Arial, sans-serif",
      "font-size": 11,
      "font-weight": "bold"
    });
  });

  // Ручка
  svgEl("circle", {
    cx: x + width - 15,
    cy: y + height / 2,
    r: 4,
    fill: "#d6b16e",
    stroke: "#705638",
    "stroke-width": 1.5
  }, panel);

  return panel;
}


  function drawPlant(x, y) {
    const group = svgEl("g", {}, sceneLayer);

    svgEl("path", {
      d: `M ${x-19} ${y-5} L ${x+19} ${y-5}
          L ${x+14} ${y+25} L ${x-14} ${y+25} Z`,
      //fill: "#98694d"
      fill: "#c87543"
    }, group);
    svgEl("rect", {
      x: x - 20, y: y - 8, width: 40, height: 6,
      //fill: "#c18c63"
      fill: "#e5a15e"
    }, group);

    const stems = svgEl("g", {
      stroke: "#315b3c", "stroke-width": 3, fill: "none"
    }, group);
    addLine(stems, x, y - 7, x, y - 65);
    addLine(stems, x, y - 25, x - 18, y - 48);
    addLine(stems, x, y - 38, x + 18, y - 60);

    const leaves = [
      [x - 10, y - 35], [x + 10, y - 45],
      [x - 17, y - 52], [x + 17, y - 63], [x, y - 68]
    ];
    leaves.forEach(([lx, ly], index) => {
      svgEl("ellipse", {
        cx: lx, cy: ly, rx: 10, ry: 5,
        transform: `rotate(-28 ${lx} ${ly})`,
        fill: index % 2 ? "#527e4c" : "#72965b"
      }, group);
    });
  }

  function drawHall() {
  sceneLayer.replaceChildren();
  drawBackground();

  // Центральная эмблема
// Логотип ИГУ
const logoPlate = svgEl("g", {}, sceneLayer);

// Подложка
svgEl("rect", {
  x: 405,
  y: 30,
  width: 90,
  height: 115,
  rx: 12,
  fill: "#8C3B32",
  stroke: "#e7d2ad",
  "stroke-width": 3
}, logoPlate);

// Сам логотип
svgEl("image", {
  href: "logo2.png",
  x: 423,
  y: 38,
  width: 54,
  height: 98,
  preserveAspectRatio: "xMidYMid meet"
}, logoPlate);

  // Колонны и зеркала — прежний дизайн
  // Массивные колонны с зеркалами почти до пола
[125, 350, 550, 775].forEach(x => {

  // Верхняя капитель
  svgEl("rect", {
    x: x - 57,
    y: 95,
    width: 114,
    height: 18,
    rx: 3,
    fill: "#d4a36b"
  });

  // Основание
  svgEl("rect", {
    x: x - 57,
    y: 462,
    width: 114,
    height: 18,
    rx: 3,
    fill: "#d4a36b"
  });

  // Основная колонна — в три раза толще
  svgEl("rect", {
    x: x - 36,
    y: 113,
    width: 72,
    height: 349,
    fill: "url(#columnGradient)"
  });

  // Обрамление зеркала
  svgEl("rect", {
    x: x - 30,
    y: 120,
    width: 60,
    height: 342,
    fill: "#c8a174"
  });

  // Зеркало до самого пола
  svgEl("rect", {
    x: x - 26,
    y: 124,
    width: 52,
    height: 338,
    fill: "url(#mirrorGradient)"
  });

  // Световой блик
  svgEl("rect", {
    x: x - 21,
    y: 130,
    width: 9,
    height: 325,
    fill: "#ffffff",
    opacity: 0.28
  });

  // Тонкая граница зеркала
  svgEl("rect", {
    x: x - 26,
    y: 124,
    width: 52,
    height: 338,
    fill: "none",
    stroke: "#b99a72",
    "stroke-width": 2
  });

});

  // Растения по краям холла
// Растения слева
drawPlant(30, 455);
drawPlant(75, 455);
drawPlant(115, 455);

// Растения справа
drawPlant(785, 455);
drawPlant(825, 455);
drawPlant(870, 455);

  // Двери факультетов — без изменений
doors.forEach(door => {
  const faculty = faculties[door.id];

  drawDoor(
    door.x,
    door.y,
    door.width,
    door.height,
    faculty.door,
    faculty.color,
    `faculty-${door.id}`
  );
});

  // Подпись
  addText(
    sceneLayer,
    "Выбери дверь, за которой начинается твоя история",
    450, 445,
    {
      fill: "#8C3B32",
      "font-family": "Georgia, serif",
      "font-size": 17,
      "font-style": "italic"
    }
  );
}

  // ========================================
  // 4. SVG-ОТРИСОВКА АУДИТОРИИ
  // ========================================

  
function roomRect(x, y, w, h, fill, stroke = "none", sw = 0, rx = 0) {
  return svgEl("rect", {
    x, y, width: w, height: h,
    fill, stroke, "stroke-width": sw, rx
  });
}

function roomText(text, x, y, size = 18, color = "#49372b", extra = {}) {
  return addText(sceneLayer, text, x, y, {
    fill: color,
    "font-family": "Georgia, serif",
    "font-size": size,
    ...extra
  });
}

function drawRoomTitle(title, subtitle, color = "#8c3b32") {
  roomRect(250, 48, 400, 65, "#f3e6cd", color, 4, 8);
  roomText(title, 450, 79, 23, color, { "font-weight": "bold" });
  roomText(subtitle, 450, 101, 12, "#76634c");
}

function drawBookshelf(x, y, w, h, colors = ["#8c3b32", "#426477", "#58744c", "#b48a55"]) {
  roomRect(x, y, w, h, "#65452e", "#3e2c20", 3);
  roomRect(x + 7, y + 7, w - 14, h - 14, "#392b22");

  const shelfCount = 3;
  const shelfH = (h - 14) / shelfCount;

  for (let s = 0; s < shelfCount; s++) {
    const sy = y + 7 + s * shelfH;

    roomRect(x + 5, sy + shelfH - 7, w - 10, 7, "#b28a5e");

    let bx = x + 12;
    const bookW = 10;

    while (bx < x + w - 15) {
      const bh = 15 + Math.random() * (shelfH - 24);

      roomRect(
        bx,
        sy + shelfH - 8 - bh,
        bookW,
        bh,
        colors[Math.floor(Math.random() * colors.length)],
        "#d0b28b",
        0.5,
        1
      );

      bx += bookW + 3;
    }
  }
}

function drawDesk(x, y, w = 190, h = 55, color = "#765037") {
  // Ножки
  roomRect(x + 15, y + h, 12, 42, "#533924");
  roomRect(x + w - 27, y + h, 12, 42, "#533924");

  // Столешница
  roomRect(x, y, w, h, color, "#4d3524", 3, 3);
  roomRect(x + 7, y + 5, w - 14, h - 10, "#b58a5b");
}

function drawTaskDesk() {
  drawDesk(355, 385, 190, 65, "#765037");

  roomText("СТОЛ С ЗАДАНИЕМ", 450, 427, 12, "#f5e5c5", {
    "font-weight": "bold"
  });

  roomRect(375, 368, 45, 17, "#9d5847");
  roomRect(425, 363, 50, 22, "#3f6375");
  roomRect(480, 370, 35, 15, "#c0a16d");

    // Мягкая подсветка интерактивного стола
  svgEl("ellipse", {
    cx: 450,
    cy: 415,
    rx: 120,
    ry: 95,
    fill: "none",
    stroke: "#f1d28e",
    "stroke-width": 5,
    opacity: 0,
    class: "task-hover-glow",
    "pointer-events": "none"
  });
}

function drawExitDoor() {
  drawDoor(
    720, 260, 80, 135,
    state.answered ? "ОТКРЫТО" : "ЗАПЕРТО",
    state.answered ? "#8baf88" : "#77706b",
    "next-room"
  );
}

function drawRoomBackground(wallColor, floorColor, accentColor) {
  drawBackground();

  // Цвет стен, не перекрывающий окна
  svgEl("rect", {
    x: 0, y: 0, width: 900, height: 470,
    fill: wallColor,
    opacity: 0.35
  });

  svgEl("rect", {
    x: 0, y: 0, width: 900, height: 470,
    fill: accentColor,
    opacity: 0.15
  });

  // Пол
  roomRect(0, 470, 900, 130, floorColor);

  for (let y = 490; y < 600; y += 30) {
    addLine(sceneLayer, 0, y, 900, y, {
      stroke: "rgba(40,30,20,.18)",
      "stroke-width": 2
    });
  }

  for (let x = 40; x < 900; x += 110) {
    addLine(sceneLayer, x, 470, x, 600, {
      stroke: "rgba(40,30,20,.15)",
      "stroke-width": 2
    });
  }
}


// ============================================
// ФИЛОЛОГИЯ
// ============================================

function drawLexiconRoom() {
  // Основа интерьера
  drawRoomBackground("#e5d2b0", "#927c62", "#d7bd91");

  // Книжные шкафы по бокам
  drawBookshelf(35, 115, 150, 300);
  drawBookshelf(715, 115, 150, 300);

  // Название аудитории — универсальное
  drawRoomTitle(
    "Аудитория № 1",
    "Теоретическая и прикладная филология",
    "#49634d"
  );

  // Декоративные картины на стенах
  roomRect(220, 125, 110, 90, "#8b6d49");
  roomRect(228, 133, 94, 74, "#ead9b5");

  roomRect(570, 125, 110, 90, "#8b6d49");
  roomRect(578, 133, 94, 74, "#ead9b5");

  // Декоративные изображения в рамках
  roomText("✦", 275, 180, 34, "#49634d");
  roomText("✦", 625, 180, 34, "#49634d");

  // Центральный преподавательский стол
  drawDesk(300, 255, 300, 75, "#68472f");

  // Книги на столе
  roomRect(345, 225, 90, 22, "#8e4639");
  roomRect(345, 218, 90, 8, "#d7bd91");

  roomRect(450, 220, 100, 27, "#38566b");
  roomRect(450, 213, 100, 8, "#d7bd91");

  // Бумаги
  roomRect(405, 255, 75, 40, "#eadfc8", "#b49a76", 1);

  // Чернильница
  roomRect(515, 252, 20, 25, "#38495b");

  // Студенческие столы
  drawDesk(220, 385, 150, 45, "#856044");
  drawDesk(530, 385, 150, 45, "#856044");

  // Книги на студенческих столах
  roomRect(250, 360, 65, 20, "#38566b");
  roomRect(250, 354, 65, 7, "#d7bd91");

  roomRect(580, 360, 65, 20, "#8e4639");
  roomRect(580, 354, 65, 7, "#d7bd91");

  // Настольные лампы
  roomRect(290, 330, 10, 25, "#49634d");
  roomText("✦", 295, 328, 18, "#d7bd91");

  roomRect(610, 330, 10, 25, "#49634d");
  roomText("✦", 615, 328, 18, "#d7bd91");

  // Дополнительный декор — небольшие растения
  roomRect(195, 335, 20, 30, "#8b6d49");
  roomText("✿", 205, 330, 32, "#6d9872");

  roomRect(685, 335, 20, 30, "#8b6d49");
  roomText("✿", 695, 330, 32, "#6d9872");

  // Игровой объект и выход
  drawTaskDesk();
  drawExitDoor();
}

function drawMorphologyRoom() {
  // Светлая университетская аудитория
  drawRoomBackground("#d5d8c6", "#827c6a", "#bfc7ad");

  drawRoomTitle(
    "Аудитория № 2",
    "Теоретическая и прикладная филология",
    "#49634d"
  );

  // Декоративные панели на стенах
  roomRect(100, 120, 155, 115, "#9c8157", "#72583c", 3);
  roomRect(108, 128, 139, 99, "#e8dfc8", "#c0a780", 2);

  roomRect(645, 120, 155, 115, "#9c8157", "#72583c", 3);
  roomRect(653, 128, 139, 99, "#e8dfc8", "#c0a780", 2);

  // Декор панелей
  roomText("✦", 178, 185, 42, "#49634d");
  roomText("✦", 723, 185, 42, "#49634d");

  // Центральный большой стол для семинаров
  drawDesk(300, 255, 300, 75, "#68472f");

  // Столешница — материалы и книги
  roomRect(335, 225, 85, 24, "#38566b");
  roomRect(335, 219, 85, 7, "#d7bd91");

  roomRect(455, 225, 90, 24, "#8e4639");
  roomRect(455, 219, 90, 7, "#d7bd91");

  // Листы бумаги
  roomRect(410, 260, 65, 38, "#eadfc8", "#b49a76", 1);

  // Стулья вокруг стола
  roomRect(335, 345, 55, 35, "#49634d", "#344b39", 2, 5);
  roomRect(510, 345, 55, 35, "#49634d", "#344b39", 2, 5);

  roomRect(260, 275, 35, 55, "#49634d", "#344b39", 2, 5);
  roomRect(605, 275, 35, 55, "#49634d", "#344b39", 2, 5);

  // Шкаф с учебными материалами слева
  roomRect(45, 260, 135, 155, "#68472f", "#4e3526", 3);
  roomRect(55, 270, 115, 42, "#bda17a", "#68472f", 2);
  roomRect(55, 318, 115, 42, "#bda17a", "#68472f", 2);
  roomRect(55, 366, 115, 39, "#bda17a", "#68472f", 2);

  // Книги на полках
  roomRect(65, 278, 15, 29, "#8e4639");
  roomRect(83, 280, 12, 27, "#38566b");
  roomRect(99, 275, 17, 32, "#49634d");
  roomRect(120, 282, 13, 25, "#b68d52");
  roomRect(138, 278, 20, 29, "#73527b");

  roomRect(65, 326, 17, 29, "#38566b");
  roomRect(86, 323, 12, 32, "#8e4639");
  roomRect(102, 329, 18, 26, "#b68d52");
  roomRect(125, 324, 14, 31, "#49634d");
  roomRect(145, 330, 15, 25, "#73527b");

  roomRect(65, 373, 18, 28, "#49634d");
  roomRect(87, 370, 14, 31, "#b68d52");
  roomRect(106, 375, 19, 26, "#38566b");
  roomRect(130, 372, 13, 29, "#8e4639");
  roomRect(147, 377, 12, 24, "#73527b");

  // Шкаф с папками справа
  roomRect(720, 260, 135, 155, "#68472f", "#4e3526", 3);
  roomRect(730, 270, 115, 42, "#bda17a", "#68472f", 2);
  roomRect(730, 318, 115, 42, "#bda17a", "#68472f", 2);
  roomRect(730, 366, 115, 39, "#bda17a", "#68472f", 2);

  // Папки и материалы
  roomRect(740, 277, 20, 29, "#8e4639");
  roomRect(763, 280, 17, 26, "#38566b");
  roomRect(784, 275, 22, 31, "#49634d");
  roomRect(810, 282, 17, 24, "#b68d52");

  roomRect(740, 325, 17, 29, "#49634d");
  roomRect(761, 322, 23, 32, "#b68d52");
  roomRect(789, 329, 16, 25, "#38566b");
  roomRect(810, 324, 18, 30, "#8e4639");

  roomRect(740, 373, 21, 28, "#38566b");
  roomRect(766, 370, 17, 31, "#8e4639");
  roomRect(787, 375, 20, 26, "#b68d52");
  roomRect(812, 372, 15, 29, "#49634d");

  // Растения у шкафов
  roomRect(185, 390, 35, 35, "#8b6d49");
  roomText("✿", 202, 385, 34, "#6d9872");

  roomRect(680, 390, 35, 35, "#8b6d49");
  roomText("✿", 697, 385, 34, "#6d9872");

  // Игровой объект и выход
  drawTaskDesk();
  drawExitDoor();
}

function drawTextLabRoom() {
  // Светлая современная аудитория
  drawRoomBackground("#c9d8d5", "#837b70", "#a9c6bf");

  drawRoomTitle(
    "Аудитория № 3",
    "Теоретическая и прикладная филология",
    "#426477"
  );

  // Большое окно на задней стене
  roomRect(300, 105, 300, 150, "#607c79", "#8c7651", 5);
  roomRect(310, 115, 280, 130, "#dcebe8", "#edf0e5", 3);

  // Рамы окна
  roomRect(440, 115, 10, 130, "#8c7651");
  roomRect(310, 175, 280, 8, "#8c7651");

  // Подоконник
  roomRect(285, 250, 330, 18, "#8c7651", "#72583c", 2);

  // Растения на подоконнике
  roomRect(325, 225, 25, 30, "#8b6d49");
  roomText("✿", 337, 225, 30, "#6d9872");

  roomRect(550, 225, 25, 30, "#8b6d49");
  roomText("✿", 562, 225, 30, "#6d9872");

  // Декоративные панели на стенах
  roomRect(70, 125, 150, 105, "#8c7651", "#72583c", 3);
  roomRect(80, 135, 130, 85, "#e8dfc8", "#c0a780", 2);

  roomText("✦", 145, 185, 38, "#426477");

  roomRect(680, 125, 150, 105, "#8c7651", "#72583c", 3);
  roomRect(690, 135, 130, 85, "#e8dfc8", "#c0a780", 2);

  roomText("✦", 755, 185, 38, "#426477");

  // Кафедра преподавателя
  drawDesk(350, 285, 200, 60, "#68472f");

  // Книги на кафедре
  roomRect(380, 255, 65, 22, "#38566b");
  roomRect(380, 249, 65, 7, "#d7bd91");

  roomRect(455, 255, 65, 22, "#8e4639");
  roomRect(455, 249, 65, 7, "#d7bd91");

  // Ряды студенческих парт
  drawDesk(150, 390, 155, 48, "#856044");
  drawDesk(375, 390, 155, 48, "#856044");
  drawDesk(600, 390, 155, 48, "#856044");

  drawDesk(150, 475, 155, 48, "#856044");
  drawDesk(375, 475, 155, 48, "#856044");
  drawDesk(600, 475, 155, 48, "#856044");

  // Стулья
  roomRect(190, 440, 55, 30, "#426477", "#344b55", 2, 5);
  roomRect(415, 440, 55, 30, "#426477", "#344b55", 2, 5);
  roomRect(640, 440, 55, 30, "#426477", "#344b55", 2, 5);

  roomRect(190, 525, 55, 30, "#426477", "#344b55", 2, 5);
  roomRect(415, 525, 55, 30, "#426477", "#344b55", 2, 5);
  roomRect(640, 525, 55, 30, "#426477", "#344b55", 2, 5);

  // Учебные материалы на партах
  roomRect(185, 365, 55, 17, "#e8dfc8", "#c0a780", 1);
  roomRect(410, 365, 55, 17, "#e8dfc8", "#c0a780", 1);
  roomRect(635, 365, 55, 17, "#e8dfc8", "#c0a780", 1);

  roomRect(185, 450, 55, 17, "#e8dfc8", "#c0a780", 1);
  roomRect(410, 450, 55, 17, "#e8dfc8", "#c0a780", 1);
  roomRect(635, 450, 55, 17, "#e8dfc8", "#c0a780", 1);

  // Небольшие шкафы по бокам
  roomRect(45, 290, 90, 115, "#68472f", "#4e3526", 3);

  roomRect(55, 300, 70, 30, "#bda17a", "#68472f", 2);
  roomRect(55, 335, 70, 30, "#bda17a", "#68472f", 2);
  roomRect(55, 370, 70, 25, "#bda17a", "#68472f", 2);

  roomRect(65, 305, 12, 23, "#38566b");
  roomRect(80, 302, 15, 26, "#8e4639");
  roomRect(98, 306, 12, 22, "#49634d");

  roomRect(65, 340, 15, 23, "#b68d52");
  roomRect(83, 337, 12, 26, "#38566b");
  roomRect(100, 341, 14, 22, "#8e4639");

  roomRect(765, 290, 90, 115, "#68472f", "#4e3526", 3);

  roomRect(775, 300, 70, 30, "#bda17a", "#68472f", 2);
  roomRect(775, 335, 70, 30, "#bda17a", "#68472f", 2);
  roomRect(775, 370, 70, 25, "#bda17a", "#68472f", 2);

  roomRect(785, 305, 12, 23, "#8e4639");
  roomRect(800, 302, 15, 26, "#49634d");
  roomRect(818, 306, 12, 22, "#38566b");

  roomRect(785, 340, 15, 23, "#38566b");
  roomRect(803, 337, 12, 26, "#b68d52");
  roomRect(820, 341, 14, 22, "#8e4639");

  // Растения в углах
  roomRect(145, 525, 35, 35, "#8b6d49");
  roomText("✿", 162, 520, 34, "#6d9872");

  roomRect(725, 525, 35, 35, "#8b6d49");
  roomText("✿", 742, 520, 34, "#6d9872");

  // Игровой объект и выход
  drawTaskDesk();
  drawExitDoor();
}

// ============================================
// ЖУРНАЛИСТИКА
// ============================================

function drawNewsroom() {
  // Современная редакция
  drawRoomBackground("#e5d2c0", "#8d7865", "#d8bba2");

  drawRoomTitle(
    "Аудитория № 1",
    "Журналистика и медиапроизводство",
    "#8c3b32"
  );

  // Декоративные панели на стене
  roomRect(65, 120, 145, 100, "#8b6747", "#60452f", 3);
  roomRect(75, 130, 125, 80, "#f0dfbd", "#c3a77f", 2);

  roomText("✦", 137, 180, 38, "#8c3b32");

  roomRect(690, 120, 145, 100, "#8b6747", "#60452f", 3);
  roomRect(700, 130, 125, 80, "#f0dfbd", "#c3a77f", 2);

  roomText("✦", 762, 180, 38, "#8c3b32");

  // Центральный редакционный стол
  drawDesk(280, 260, 340, 70, "#68472f");

  // Компьютер
  roomRect(365, 205, 115, 75, "#39434a", "#252c31", 3, 5);
  roomRect(374, 214, 97, 56, "#b7d0d2", "#697d80", 2, 3);

  // Экран — графические элементы интерфейса
  roomRect(384, 224, 75, 5, "#8c3b32", "none", 0, 2);
  roomRect(384, 235, 65, 4, "#607c79", "none", 0, 2);
  roomRect(384, 245, 78, 4, "#607c79", "none", 0, 2);
  roomRect(384, 255, 48, 4, "#607c79", "none", 0, 2);

  // Подставка монитора
  roomRect(410, 280, 25, 12, "#39434a");
  roomRect(395, 290, 55, 6, "#39434a");

  // Клавиатура
  roomRect(380, 305, 90, 12, "#39434a", "#252c31", 1, 3);

  // Блокнот
  roomRect(300, 290, 65, 40, "#f0dfbd", "#8b6747", 2);
  roomRect(310, 300, 45, 4, "#9b8b74");
  roomRect(310, 309, 45, 4, "#9b8b74");
  roomRect(310, 318, 35, 4, "#9b8b74");

  // Кружка
  roomRect(510, 295, 24, 27, "#8c3b32", "#60452f", 2, 4);
  roomRect(532, 301, 10, 14, "none", "#8c3b32", 3, 5);

  // Редакционные рабочие места слева
  drawDesk(100, 365, 190, 55, "#856044");

  // Монитор
  roomRect(145, 320, 85, 60, "#39434a", "#252c31", 3, 4);
  roomRect(153, 328, 69, 43, "#b7d0d2", "#697d80", 2, 3);
  roomRect(165, 337, 45, 4, "#8c3b32", "none", 0, 2);
  roomRect(165, 346, 50, 4, "#607c79", "none", 0, 2);
  roomRect(165, 355, 40, 4, "#607c79", "none", 0, 2);

  roomRect(178, 380, 20, 10, "#39434a");
  roomRect(165, 390, 45, 5, "#39434a");

  // Газеты и бумаги
  roomRect(110, 345, 65, 35, "#f5e8d0", "#8b6747", 1);
  roomRect(118, 352, 48, 4, "#9b8b74");
  roomRect(118, 361, 48, 4, "#9b8b74");
  roomRect(118, 370, 35, 4, "#9b8b74");

  // Рабочее место справа
  drawDesk(610, 365, 190, 55, "#856044");

  // Фотоаппарат на столе
  roomRect(665, 340, 55, 35, "#39434a", "#252c31", 3, 5);
  roomRect(678, 330, 25, 12, "#39434a", "#252c31", 2, 3);
  roomRect(682, 348, 20, 20, "#b7d0d2", "#252c31", 3, 10);

  // Бумаги
  roomRect(730, 345, 55, 40, "#f0dfbd", "#8b6747", 1);
  roomRect(737, 353, 40, 4, "#9b8b74");
  roomRect(737, 362, 40, 4, "#9b8b74");
  roomRect(737, 371, 30, 4, "#9b8b74");

  // Стулья
  roomRect(145, 430, 75, 40, "#8c3b32", "#60452f", 3, 6);
  roomRect(655, 430, 75, 40, "#8c3b32", "#60452f", 3, 6);

  // Стеллаж с газетами и журналами
  roomRect(45, 250, 75, 160, "#68472f", "#4e3526", 3);

  roomRect(53, 260, 59, 40, "#bda17a", "#68472f", 2);
  roomRect(53, 305, 59, 40, "#bda17a", "#68472f", 2);
  roomRect(53, 350, 59, 50, "#bda17a", "#68472f", 2);

  // Газеты
  roomRect(58, 266, 12, 30, "#f0dfbd");
  roomRect(73, 264, 14, 32, "#8c3b32");
  roomRect(90, 269, 15, 27, "#f0dfbd");

  roomRect(58, 311, 15, 30, "#38566b");
  roomRect(77, 308, 12, 33, "#f0dfbd");
  roomRect(93, 313, 12, 28, "#8c3b32");

  roomRect(58, 357, 14, 38, "#8c3b32");
  roomRect(76, 355, 14, 40, "#f0dfbd");
  roomRect(94, 360, 12, 35, "#38566b");

  // Растения
  roomRect(245, 410, 35, 35, "#8b6d49");
  roomText("✿", 262, 405, 34, "#6d9872");

  roomRect(820, 410, 35, 35, "#8b6d49");
  roomText("✿", 837, 405, 34, "#6d9872");

  // Игровой объект и выход
  drawTaskDesk();
  drawExitDoor();
}

function drawHeadlineRoom() {
  // Фотостудия факультета журналистики
  drawRoomBackground("#d6d8d4", "#817b75", "#c0c9ca");

  drawRoomTitle(
    "Аудитория № 2",
    "Журналистика и медиапроизводство",
    "#426477"
  );

  // Фон для фотосъёмки
  roomRect(230, 115, 440, 245, "#526b78", "#8b6747", 5);

  // Центральный фотополотн
  roomRect(250, 130, 400, 210, "#dce3e5", "#b0bec4", 2);

  // Декоративные складки фона
  roomRect(260, 130, 12, 210, "#c5d0d4", "none", 0);
  roomRect(628, 130, 12, 210, "#c5d0d4", "none", 0);

  // Стойки фотозоны
  roomRect(215, 110, 15, 260, "#39434a", "#252c31", 2);
  roomRect(670, 110, 15, 260, "#39434a", "#252c31", 2);

  roomRect(200, 360, 45, 12, "#39434a", "#252c31", 2);
  roomRect(655, 360, 45, 12, "#39434a", "#252c31", 2);

  // Профессиональная камера на штативе
  roomRect(420, 205, 75, 50, "#39434a", "#252c31", 3, 5);
  roomRect(435, 190, 35, 18, "#39434a", "#252c31", 2, 4);

  // Объектив
  roomRect(490, 215, 35, 30, "#252c31", "#39434a", 3, 12);
  roomRect(497, 221, 20, 18, "#b7d0d2", "#252c31", 2, 10);

  // Видоискатель
  roomRect(450, 180, 20, 12, "#252c31", "#39434a", 2, 3);

  // Штатив
  roomRect(450, 255, 15, 75, "#39434a");
  roomRect(455, 320, 8, 55, "#39434a");

  roomRect(455, 365, 8, 65, "#39434a");
  roomRect(455, 365, 8, 65, "#39434a");

  // Ножки штатива
  addLine(sceneLayer, 459, 375, 420, 435, {
    stroke: "#39434a",
    "stroke-width": 7,
    "stroke-linecap": "round"
  });

  addLine(sceneLayer, 459, 375, 500, 435, {
    stroke: "#39434a",
    "stroke-width": 7,
    "stroke-linecap": "round"
  });

  addLine(sceneLayer, 459, 375, 459, 440, {
    stroke: "#39434a",
    "stroke-width": 7,
    "stroke-linecap": "round"
  });

  // Студийный свет слева
  roomRect(105, 175, 65, 85, "#39434a", "#252c31", 3, 8);
  roomRect(115, 185, 45, 65, "#f2e7c9", "#b6a27e", 2, 6);

  roomRect(130, 260, 15, 80, "#39434a");
  roomRect(135, 330, 8, 50, "#39434a");

  // Ножки световой стойки
  addLine(sceneLayer, 139, 365, 110, 410, {
    stroke: "#39434a",
    "stroke-width": 5,
    "stroke-linecap": "round"
  });

  addLine(sceneLayer, 139, 365, 168, 410, {
    stroke: "#39434a",
    "stroke-width": 5,
    "stroke-linecap": "round"
  });

  // Студийный свет справа
  roomRect(730, 175, 65, 85, "#39434a", "#252c31", 3, 8);
  roomRect(740, 185, 45, 65, "#f2e7c9", "#b6a27e", 2, 6);

  roomRect(755, 260, 15, 80, "#39434a");
  roomRect(760, 330, 8, 50, "#39434a");

  addLine(sceneLayer, 764, 365, 735, 410, {
    stroke: "#39434a",
    "stroke-width": 5,
    "stroke-linecap": "round"
  });

  addLine(sceneLayer, 764, 365, 793, 410, {
    stroke: "#39434a",
    "stroke-width": 5,
    "stroke-linecap": "round"
  });

  // Стол с техникой
  drawDesk(285, 390, 330, 60, "#68472f");

  // Ноутбук
  roomRect(380, 345, 100, 60, "#39434a", "#252c31", 3, 4);
  roomRect(388, 353, 84, 44, "#b7d0d2", "#697d80", 2, 3);

  // Графика на экране
  roomRect(397, 362, 66, 4, "#8c3b32", "none", 0, 2);
  roomRect(397, 371, 55, 4, "#607c79", "none", 0, 2);
  roomRect(397, 380, 62, 4, "#607c79", "none", 0, 2);

  // Карты памяти и мелкая техника
  roomRect(500, 370, 28, 20, "#39434a", "#252c31", 2, 3);
  roomRect(535, 370, 28, 20, "#8c3b32", "#60452f", 2, 3);

  // Стул фотографа
  roomRect(380, 460, 150, 35, "#426477", "#344b55", 3, 7);
  roomRect(395, 495, 12, 45, "#39434a");
  roomRect(505, 495, 12, 45, "#39434a");

  // Полка с фототехникой
  roomRect(45, 300, 100, 120, "#68472f", "#4e3526", 3);
  roomRect(55, 310, 80, 30, "#bda17a", "#68472f", 2);
  roomRect(55, 345, 80, 30, "#bda17a", "#68472f", 2);
  roomRect(55, 380, 80, 30, "#bda17a", "#68472f", 2);

  // Объективы и оборудование на полке
  roomRect(65, 315, 25, 20, "#39434a", "#252c31", 2, 5);
  roomRect(100, 315, 25, 20, "#8c3b32", "#60452f", 2, 5);

  roomRect(65, 350, 25, 20, "#38566b", "#252c31", 2, 5);
  roomRect(100, 350, 25, 20, "#39434a", "#252c31", 2, 5);

  roomRect(65, 385, 25, 20, "#8c3b32", "#60452f", 2, 5);
  roomRect(100, 385, 25, 20, "#38566b", "#252c31", 2, 5);

  // Растения
  roomRect(175, 440, 35, 35, "#8b6d49");
  roomText("✿", 192, 435, 34, "#6d9872");

  roomRect(690, 440, 35, 35, "#8b6d49");
  roomText("✿", 707, 435, 34, "#6d9872");

  // Игровой объект и выход
  drawTaskDesk();
  drawExitDoor();
}

function drawMediaStudio() {
  // Радиостудия / студия подкастов
  drawRoomBackground("#bfcbd4", "#777b80", "#a7bac9");

  drawRoomTitle(
    "Аудитория № 3",
    "Журналистика и медиапроизводство",
    "#426477"
  );

  // Акустические панели на стенах
  roomRect(65, 120, 150, 115, "#465968", "#303f4b", 3, 5);

  // Рельеф панелей
  for (let i = 0; i < 5; i++) {
    roomRect(78 + i * 25, 132, 12, 90, "#627887", "none", 0, 3);
  }

  roomRect(685, 120, 150, 115, "#465968", "#303f4b", 3, 5);

  for (let i = 0; i < 5; i++) {
    roomRect(698 + i * 25, 132, 12, 90, "#627887", "none", 0, 3);
  }

  // Дополнительные акустические панели
  roomRect(270, 115, 115, 75, "#526b78", "#303f4b", 3, 5);

  for (let i = 0; i < 4; i++) {
    roomRect(282 + i * 24, 125, 10, 55, "#718b9a", "none", 0, 3);
  }

  roomRect(515, 115, 115, 75, "#526b78", "#303f4b", 3, 5);

  for (let i = 0; i < 4; i++) {
    roomRect(527 + i * 24, 125, 10, 55, "#718b9a", "none", 0, 3);
  }

  // Студийный стол
  drawDesk(270, 285, 360, 75, "#68472f");

  // Звуковой микшер
  roomRect(340, 230, 220, 65, "#303b44", "#20262b", 3, 6);

  // Панель микшера
  roomRect(350, 240, 200, 45, "#52616c", "#20262b", 2, 4);

  // Каналы микшера
  for (let i = 0; i < 8; i++) {
    const x = 360 + i * 23;

    // Регуляторы
    roomRect(x, 247, 8, 8, "#c0c9ca", "#303b44", 1, 4);
    roomRect(x, 260, 8, 8, "#b68d52", "#303b44", 1, 4);

    // Фейдеры
    roomRect(x + 1, 273, 6, 8, "#d6d8d4", "#303b44", 1, 2);
  }

  // Индикаторы уровня звука
  roomRect(535, 245, 8, 32, "#8c3b32", "none", 0, 2);
  roomRect(525, 245, 8, 32, "#b68d52", "none", 0, 2);
  roomRect(515, 245, 8, 32, "#6d9872", "none", 0, 2);

  // Мониторинг звука — колонки
  roomRect(210, 230, 50, 75, "#303b44", "#20262b", 3, 5);
  roomRect(220, 240, 30, 25, "#627887", "#20262b", 2, 15);
  roomRect(222, 275, 26, 20, "#252a2e", "#20262b", 2, 12);

  roomRect(640, 230, 50, 75, "#303b44", "#20262b", 3, 5);
  roomRect(650, 240, 30, 25, "#627887", "#20262b", 2, 15);
  roomRect(652, 275, 26, 20, "#252a2e", "#20262b", 2, 12);

  // Микрофон ведущего слева
  roomRect(300, 200, 18, 55, "#303b44", "#20262b", 2, 5);
  roomRect(285, 185, 48, 30, "#52616c", "#20262b", 3, 12);

  // Сетка микрофона
  for (let i = 0; i < 4; i++) {
    addLine(sceneLayer, 291 + i * 9, 190, 291 + i * 9, 210, {
      stroke: "#8295a1",
      "stroke-width": 1
    });
  }

  // Стойка микрофона
  addLine(sceneLayer, 309, 255, 309, 315, {
    stroke: "#303b44",
    "stroke-width": 5
  });

  addLine(sceneLayer, 309, 315, 280, 330, {
    stroke: "#303b44",
    "stroke-width": 5
  });

  addLine(sceneLayer, 309, 315, 338, 330, {
    stroke: "#303b44",
    "stroke-width": 5
  });

  // Микрофон ведущего справа
  roomRect(585, 200, 18, 55, "#303b44", "#20262b", 2, 5);
  roomRect(570, 185, 48, 30, "#52616c", "#20262b", 3, 12);

  for (let i = 0; i < 4; i++) {
    addLine(sceneLayer, 576 + i * 9, 190, 576 + i * 9, 210, {
      stroke: "#8295a1",
      "stroke-width": 1
    });
  }

  // Стойка второго микрофона
  addLine(sceneLayer, 594, 255, 594, 315, {
    stroke: "#303b44",
    "stroke-width": 5
  });

  addLine(sceneLayer, 594, 315, 565, 330, {
    stroke: "#303b44",
    "stroke-width": 5
  });

  addLine(sceneLayer, 594, 315, 623, 330, {
    stroke: "#303b44",
    "stroke-width": 5
  });

  // Наушники слева на столе
  roomRect(370, 300, 55, 12, "#303b44", "#20262b", 2, 5);
  roomRect(370, 300, 10, 22, "#303b44", "#20262b", 2, 4);
  roomRect(415, 300, 10, 22, "#303b44", "#20262b", 2, 4);

  // Блокнот ведущего
  roomRect(450, 300, 70, 40, "#e8dfc8", "#8b6747", 2);
  roomRect(460, 310, 45, 4, "#9b8b74");
  roomRect(460, 320, 45, 4, "#9b8b74");
  roomRect(460, 330, 35, 4, "#9b8b74");

  // Кружка
  roomRect(530, 305, 25, 30, "#8c3b32", "#60452f", 2, 5);
  roomRect(550, 312, 12, 15, "none", "#8c3b32", 3, 5);

  // Студийные кресла
  roomRect(330, 380, 90, 45, "#426477", "#344b55", 3, 8);
  roomRect(480, 380, 90, 45, "#426477", "#344b55", 3, 8);

  // Ножки кресел
  roomRect(345, 425, 8, 35, "#303b44");
  roomRect(397, 425, 8, 35, "#303b44");

  roomRect(495, 425, 8, 35, "#303b44");
  roomRect(547, 425, 8, 35, "#303b44");

  // Стеллаж с оборудованием слева
  roomRect(45, 285, 100, 145, "#68472f", "#4e3526", 3);

  roomRect(55, 295, 80, 38, "#bda17a", "#68472f", 2);
  roomRect(55, 340, 80, 38, "#bda17a", "#68472f", 2);
  roomRect(55, 385, 80, 35, "#bda17a", "#68472f", 2);

  // Аудиооборудование на полках
  roomRect(65, 303, 25, 23, "#303b44", "#20262b", 2, 4);
  roomRect(100, 303, 25, 23, "#52616c", "#20262b", 2, 4);

  roomRect(65, 348, 25, 23, "#8c3b32", "#60452f", 2, 4);
  roomRect(100, 348, 25, 23, "#303b44", "#20262b", 2, 4);

  roomRect(65, 393, 25, 20, "#52616c", "#20262b", 2, 4);
  roomRect(100, 393, 25, 20, "#8c3b32", "#60452f", 2, 4);

  // Стеллаж справа — книги и материалы
  roomRect(755, 285, 100, 145, "#68472f", "#4e3526", 3);

  roomRect(765, 295, 80, 38, "#bda17a", "#68472f", 2);
  roomRect(765, 340, 80, 38, "#bda17a", "#68472f", 2);
  roomRect(765, 385, 80, 35, "#bda17a", "#68472f", 2);

  // Книги и папки
  roomRect(775, 302, 12, 27, "#8c3b32");
  roomRect(792, 300, 15, 29, "#38566b");
  roomRect(811, 304, 12, 25, "#49634d");
  roomRect(828, 300, 12, 29, "#b68d52");

  roomRect(775, 347, 15, 27, "#38566b");
  roomRect(794, 345, 12, 29, "#8c3b32");
  roomRect(810, 348, 16, 26, "#b68d52");
  roomRect(830, 345, 10, 29, "#49634d");

  // Растения в студии
  roomRect(170, 430, 35, 35, "#8b6d49");
  roomText("✿", 187, 425, 34, "#6d9872");

  roomRect(695, 430, 35, 35, "#8b6d49");
  roomText("✿", 712, 425, 34, "#6d9872");

  // Игровой объект и выход
  drawTaskDesk();
  drawExitDoor();
}

// ============================================
// ИНОСТРАННЫЕ ЯЗЫКИ
// ============================================

function drawLanguageClassroom() {
  drawRoomBackground("#d6e0d8", "#8a8275", "#b9d2c4");

  drawRoomTitle("Аудитория № 1", "Иностранные языки", "#507b73");

  // ─── Большие окна слева ───
  roomRect(35, 115, 125, 245, "#dcecf0", "#7e9999", 5, 4);
  roomRect(48, 128, 48, 105, "#b9d9e5", "#91a9aa", 2, 2);
  roomRect(103, 128, 44, 105, "#b9d9e5", "#91a9aa", 2, 2);
  roomRect(48, 244, 48, 102, "#c6e0e5", "#91a9aa", 2, 2);
  roomRect(103, 244, 44, 102, "#c6e0e5", "#91a9aa", 2, 2);

  // Перекладины окон
  roomRect(94, 120, 8, 235, "#8a8275", "#8a8275", 1);
  roomRect(40, 235, 115, 8, "#8a8275", "#8a8275", 1);

  // Подоконник
  roomRect(30, 355, 135, 15, "#b5a38a", "#786b5d", 2, 3);

  // Цветок на подоконнике
  roomRect(65, 327, 35, 27, "#b78365", "#765d4b", 2, 3);
  svgEl("ellipse", { cx: 82, cy: 319, rx: 15, ry: 18, fill: "#77a57c" });
  svgEl("ellipse", { cx: 67, cy: 313, rx: 11, ry: 15, fill: "#91bc91" });
  svgEl("ellipse", { cx: 96, cy: 311, rx: 11, ry: 15, fill: "#91bc91" });

  // ─── Карта мира ───
  roomRect(220, 120, 455, 190, "#e9e5d1", "#9a8965", 5, 8);

  // Рамка карты
  roomRect(230, 130, 435, 170, "#f2ecd9", "#c1ad89", 2, 4);

  // Заголовок карты
  roomText("WORLD MAP", 445, 155, 17, "#648275");

  // Условные континенты
  svgEl("ellipse", {
    cx: 320, cy: 198, rx: 60, ry: 32,
    fill: "#91b59a"
  });

  svgEl("ellipse", {
    cx: 350, cy: 232, rx: 30, ry: 52,
    fill: "#91b59a"
  });

  svgEl("ellipse", {
    cx: 435, cy: 195, rx: 38, ry: 23,
    fill: "#91b59a"
  });

  svgEl("ellipse", {
    cx: 470, cy: 218, rx: 30, ry: 52,
    fill: "#91b59a"
  });

  svgEl("ellipse", {
    cx: 540, cy: 200, rx: 83, ry: 37,
    fill: "#91b59a"
  });

  svgEl("ellipse", {
    cx: 600, cy: 250, rx: 36, ry: 20,
    fill: "#91b59a"
  });

  // ─── Флаги ───
  // Великобритания
  roomRect(245, 330, 65, 42, "#ffffff", "#8c9692", 2);
  roomRect(270, 330, 15, 42, "#315b96", "#315b96", 1);
  roomRect(245, 343, 65, 15, "#315b96", "#315b96", 1);
  roomRect(272, 330, 10, 42, "#ffffff", "#ffffff", 1);
  roomRect(245, 345, 65, 10, "#ffffff", "#ffffff", 1);
  roomRect(274, 330, 6, 42, "#c84d52", "#c84d52", 1);
  roomRect(245, 347, 65, 6, "#c84d52", "#c84d52", 1);

  // Франция
  roomRect(330, 330, 65, 42, "#ffffff", "#8c9692", 2);
  roomRect(330, 330, 22, 42, "#5077a9", "#5077a9", 1);
  roomRect(373, 330, 22, 42, "#d86d69", "#d86d69", 1);

  // Германия
  roomRect(415, 330, 65, 42, "#ffffff", "#8c9692", 2);
  roomRect(417, 332, 61, 12, "#414141", "#414141", 1);
  roomRect(417, 344, 61, 12, "#bd5651", "#bd5651", 1);
  roomRect(417, 356, 61, 14, "#e4c66b", "#e4c66b", 1);

  // Испания
  roomRect(500, 330, 65, 42, "#ffffff", "#8c9692", 2);
  roomRect(502, 332, 61, 9, "#bd5651", "#bd5651", 1);
  roomRect(502, 341, 61, 22, "#e6c76c", "#e6c76c", 1);
  roomRect(502, 363, 61, 7, "#bd5651", "#bd5651", 1);

  // ─── Книжные шкафы ───
  // Левый шкаф
  roomRect(175, 125, 40, 255, "#ad8666", "#755a45", 4, 4);
  roomRect(182, 138, 26, 55, "#d3b99b", "#755a45", 2);
  roomRect(182, 200, 26, 55, "#d3b99b", "#755a45", 2);
  roomRect(182, 262, 26, 55, "#d3b99b", "#755a45", 2);

  // Книги
  roomRect(185, 148, 5, 36, "#597b87", "#597b87", 1);
  roomRect(191, 143, 6, 41, "#bd7a67", "#bd7a67", 1);
  roomRect(198, 151, 7, 33, "#d8bd77", "#d8bd77", 1);

  roomRect(185, 212, 6, 35, "#788c68", "#788c68", 1);
  roomRect(192, 205, 7, 42, "#a36d87", "#a36d87", 1);
  roomRect(200, 216, 5, 31, "#597b87", "#597b87", 1);

  roomRect(185, 274, 7, 36, "#bd7a67", "#bd7a67", 1);
  roomRect(193, 268, 6, 42, "#d8bd77", "#d8bd77", 1);
  roomRect(200, 280, 5, 30, "#788c68", "#788c68", 1);

  // ─── Правый шкаф ───
  roomRect(700, 125, 40, 255, "#ad8666", "#755a45", 4, 4);
  roomRect(707, 138, 26, 55, "#d3b99b", "#755a45", 2);
  roomRect(707, 200, 26, 55, "#d3b99b", "#755a45", 2);
  roomRect(707, 262, 26, 55, "#d3b99b", "#755a45", 2);

  roomRect(710, 147, 5, 37, "#bd7a67", "#bd7a67", 1);
  roomRect(716, 141, 6, 43, "#597b87", "#597b87", 1);
  roomRect(723, 152, 7, 32, "#d8bd77", "#d8bd77", 1);

  roomRect(710, 211, 6, 36, "#d8bd77", "#d8bd77", 1);
  roomRect(717, 204, 7, 43, "#788c68", "#788c68", 1);
  roomRect(725, 216, 5, 31, "#a36d87", "#a36d87", 1);

  roomRect(710, 274, 7, 36, "#597b87", "#597b87", 1);
  roomRect(718, 268, 6, 42, "#bd7a67", "#bd7a67", 1);
  roomRect(725, 280, 5, 30, "#d8bd77", "#d8bd77", 1);

  // ─── Глобус ───
  svgEl("circle", {
    cx: 785, cy: 210, r: 42,
    fill: "#9bc5d4",
    stroke: "#718c87",
    strokeWidth: 4
  });

  svgEl("ellipse", {
    cx: 785, cy: 210, rx: 18, ry: 42,
    fill: "none",
    stroke: "#718c87",
    strokeWidth: 2
  });

  svgEl("ellipse", {
    cx: 785, cy: 210, rx: 42, ry: 16,
    fill: "none",
    stroke: "#718c87",
    strokeWidth: 2
  });

  svgEl("path", {
    d: "M 770 180 Q 760 195 772 205 Q 760 220 778 235",
    fill: "#83a98a",
    stroke: "#83a98a",
    strokeWidth: 3
  });

  svgEl("path", {
    d: "M 795 185 Q 810 190 802 205 Q 815 220 798 230",
    fill: "#83a98a",
    stroke: "#83a98a",
    strokeWidth: 3
  });

  // Подставка глобуса
  addLine(sceneLayer, 785, 250, 785, 270, "#7b6652", 5);
  roomRect(765, 267, 40, 8, "#9c8063", "#725c47", 2, 3);

  // ─── Стол преподавателя ───
  roomRect(300, 405, 330, 72, "#b58b69", "#765b45", 4, 5);

  // Столешница
  roomRect(290, 395, 350, 18, "#d0ad87", "#765b45", 3, 4);

  // Ножки
  roomRect(315, 413, 14, 63, "#8d6b50", "#765b45", 2);
  roomRect(600, 413, 14, 63, "#8d6b50", "#765b45", 2);

  // Книги
  roomRect(335, 375, 65, 10, "#607c8b", "#607c8b", 1);
  roomRect(340, 365, 60, 10, "#c58b72", "#c58b72", 1);
  roomRect(345, 355, 55, 10, "#d8bd77", "#d8bd77", 1);

  // Ноутбук
  roomRect(480, 360, 70, 42, "#6f7f86", "#46545b", 3, 4);
  roomRect(487, 366, 56, 30, "#b7d0d8", "#46545b", 2, 2);
  roomRect(470, 402, 90, 7, "#8b999d", "#46545b", 2, 3);

  // Чашка
  roomRect(575, 377, 25, 24, "#eee5d3", "#9b8975", 2, 4);
  svgEl("circle", {
    cx: 603, cy: 388, r: 8,
    fill: "none",
    stroke: "#9b8975",
    strokeWidth: 3
  });

  // ─── Стул преподавателя ───
  roomRect(425, 420, 65, 50, "#6d8587", "#52696c", 3, 7);
  roomRect(435, 460, 12, 28, "#7c6957", "#7c6957", 1);
  roomRect(470, 460, 12, 28, "#7c6957", "#7c6957", 1);

  // ─── Декор ───
  // Постер справа
  roomRect(755, 300, 100, 100, "#f0e8d5", "#9a8965", 3, 6);
  roomText("HELLO!", 805, 330, 17, "#507b73");
  roomText("BONJOUR", 805, 352, 13, "#bb7767");
  roomText("GUTEN TAG", 805, 373, 11, "#6f8294");
  roomText("HOLA", 805, 390, 13, "#b69b59");

  // Растение справа
  roomRect(820, 420, 42, 35, "#b78365", "#765d4b", 2, 5);
  svgEl("ellipse", { cx: 840, cy: 397, rx: 20, ry: 32, fill: "#7ca782" });
  svgEl("ellipse", { cx: 819, cy: 400, rx: 15, ry: 27, fill: "#95bd91" });
  svgEl("ellipse", { cx: 858, cy: 400, rx: 15, ry: 27, fill: "#95bd91" });
  svgEl("ellipse", { cx: 830, cy: 378, rx: 14, ry: 24, fill: "#6d9978" });

  // ─── Студенческие парты ───
  // Левая парта
  roomRect(70, 435, 115, 50, "#c7a47c", "#84674e", 3, 5);
  roomRect(80, 485, 10, 25, "#8d6b50", "#765b45", 1);
  roomRect(165, 485, 10, 25, "#8d6b50", "#765b45", 1);

  // Книги на парте
  roomRect(90, 418, 45, 10, "#607c8b", "#607c8b", 1);
  roomRect(95, 408, 40, 10, "#d8bd77", "#d8bd77", 1);

  // Правая парта
  roomRect(690, 440, 110, 45, "#c7a47c", "#84674e", 3, 5);
  roomRect(700, 485, 10, 25, "#8d6b50", "#765b45", 1);
  roomRect(780, 485, 10, 25, "#8d6b50", "#765b45", 1);

  // ─── Ковёр ───
  roomRect(270, 500, 380, 45, "#8ba9a0", "#718c87", 3, 8);
  roomRect(282, 510, 356, 25, "#c9d9ce", "#8ba9a0", 2, 5);

  // ─── Игровой объект ───
  drawTaskDesk();

  // ─── Выход ───
  drawExitDoor();
}

function drawTranslationRoom() {
  drawRoomBackground("#d8d2c3", "#81796e", "#c9bda4");

  drawRoomTitle("Аудитория № 2", "Иностранные языки", "#806344");

  // ─── Большое окно ───
  roomRect(350, 115, 200, 130, "#c9e0e3", "#8a9388", 4, 5);

  // Рама
  roomRect(443, 120, 8, 120, "#9a8975", "#9a8975", 1);
  roomRect(355, 175, 190, 7, "#9a8975", "#9a8975", 1);

  // Подоконник
  roomRect(335, 245, 230, 12, "#b29a7d", "#796550", 2, 3);

  // ─── Книжные шкафы ───
  drawBookshelf(
    55, 130, 130, 280,
    ["#405c78", "#7b5447", "#657a56", "#b28c5a"]
  );

  drawBookshelf(
    715, 130, 130, 280,
    ["#405c78", "#7b5447", "#657a56", "#b28c5a"]
  );

  // ─── Дополнительные книги на шкафах ───
  // Левый шкаф
  roomRect(75, 145, 18, 45, "#b28c5a", "#b28c5a", 1);
  roomRect(96, 150, 14, 40, "#405c78", "#405c78", 1);
  roomRect(113, 140, 22, 50, "#7b5447", "#7b5447", 1);
  roomRect(140, 155, 18, 35, "#657a56", "#657a56", 1);

  // Правый шкаф
  roomRect(735, 145, 18, 45, "#657a56", "#657a56", 1);
  roomRect(758, 150, 22, 40, "#7b5447", "#7b5447", 1);
  roomRect(785, 140, 16, 50, "#b28c5a", "#b28c5a", 1);
  roomRect(807, 155, 18, 35, "#405c78", "#405c78", 1);

  // ─── Картина на стене ───
  roomRect(245, 125, 75, 85, "#e6dfcc", "#9a8975", 3, 5);

  // Абстрактная картина
  svgEl("ellipse", {
    cx: 282, cy: 168, rx: 24, ry: 29,
    fill: "#b8a17a"
  });

  svgEl("ellipse", {
    cx: 268, cy: 160, rx: 13, ry: 19,
    fill: "#7b9b88"
  });

  svgEl("ellipse", {
    cx: 293, cy: 178, rx: 13, ry: 17,
    fill: "#b77f70"
  });

  // ─── Настольная переводческая мастерская ───
  // Основной стол
  roomRect(235, 270, 430, 65, "#987451", "#6d4a32", 4, 6);

  // Столешница
  roomRect(220, 260, 460, 18, "#c0a17b", "#6d4a32", 3, 5);

  // Ножки стола
  roomRect(255, 325, 18, 65, "#76563d", "#6d4a32", 2);
  roomRect(625, 325, 18, 65, "#76563d", "#6d4a32", 2);

  // ─── Компьютер ───
  roomRect(390, 210, 100, 60, "#66767b", "#45555a", 3, 5);
  roomRect(398, 218, 84, 45, "#c6d9dc", "#45555a", 2, 3);

  // Подставка монитора
  roomRect(432, 270, 16, 10, "#66767b", "#45555a", 2);
  roomRect(415, 278, 50, 5, "#66767b", "#45555a", 2, 3);

  // Клавиатура
  roomRect(395, 290, 90, 12, "#d0c9b8", "#77736a", 2, 3);

  // ─── Настольная лампа слева ───
  roomRect(290, 220, 35, 7, "#8d795e", "#6d4a32", 2, 3);

  addLine(sceneLayer, 307, 220, 307, 188, {
  stroke: "#6d4a32",
  "stroke-width": 5
  });
  addLine(sceneLayer, 307, 188, 290, 177, {
  stroke: "#6d4a32",
  "stroke-width": 5
  });

  roomRect(275, 165, 32, 17, "#d9b779", "#8a704b", 2, 4);

  // ─── Настольная лампа справа ───
  roomRect(570, 220, 35, 7, "#8d795e", "#6d4a32", 2, 3);

  addLine(sceneLayer, 587, 220, 587, 190, {
  stroke: "#6d4a32",
  "stroke-width": 5
  });
  addLine(sceneLayer, 587, 190, 604, 178, {
  stroke: "#6d4a32",
  "stroke-width": 5
  });

  roomRect(592, 166, 32, 17, "#d9b779", "#8a704b", 2, 4);

  // ─── Словари и книги ───
  roomRect(280, 240, 80, 12, "#355c79", "#355c79", 1, 2);
  roomRect(285, 228, 70, 12, "#8c3b32", "#8c3b32", 1, 2);
  roomRect(290, 216, 65, 12, "#718258", "#718258", 1, 2);

  roomRect(530, 240, 80, 12, "#718258", "#718258", 1, 2);
  roomRect(535, 228, 70, 12, "#355c79", "#355c79", 1, 2);
  roomRect(540, 216, 65, 12, "#b28c5a", "#b28c5a", 1, 2);

  // ─── Бумаги и рукописи ───
  roomRect(350, 290, 35, 28, "#eee5d3", "#a38b65", 1, 3);
  roomRect(355, 295, 25, 2, "#b8aa91", "#b8aa91", 1);
  roomRect(355, 301, 25, 2, "#b8aa91", "#b8aa91", 1);
  roomRect(355, 307, 20, 2, "#b8aa91", "#b8aa91", 1);

  roomRect(500, 290, 35, 28, "#eee5d3", "#a38b65", 1, 3);
  roomRect(505, 295, 25, 2, "#b8aa91", "#b8aa91", 1);
  roomRect(505, 301, 25, 2, "#b8aa91", "#b8aa91", 1);
  roomRect(505, 307, 20, 2, "#b8aa91", "#b8aa91", 1);

  // ─── Кресла у стола ───
  roomRect(280, 345, 55, 35, "#74878b", "#53676b", 3, 6);
  roomRect(290, 380, 10, 30, "#77614c", "#77614c", 1);
  roomRect(320, 380, 10, 30, "#77614c", "#77614c", 1);

  roomRect(565, 345, 55, 35, "#74878b", "#53676b", 3, 6);
  roomRect(575, 380, 10, 30, "#77614c", "#77614c", 1);
  roomRect(605, 380, 10, 30, "#77614c", "#77614c", 1);

  // ─── Часы ───
  svgEl("circle", {
    cx: 670, cy: 165, r: 25,
    fill: "#eee5d3",
    stroke: "#9a8975",
    strokeWidth: 3
  });

  addLine(sceneLayer, 670, 165, 670, 150, {
  stroke: "#806344",
  "stroke-width": 3});
  addLine(sceneLayer, 670, 165, 682, 169, {
  stroke: "#806344",
  "stroke-width": 3});

  // ─── Декоративная табличка ───
  roomRect(370, 130, 160, 35, "#e8dfc9", "#a38b65", 2, 5);
  roomText("LANGUAGE", 450, 153, 16, "#806344");

  // ─── Растение ───
  roomRect(190, 400, 40, 40, "#b78365", "#765d4b", 2, 5);

  svgEl("ellipse", {
    cx: 210, cy: 385, rx: 20, ry: 28,
    fill: "#7ca782"
  });

  svgEl("ellipse", {
    cx: 192, cy: 378, rx: 15, ry: 24,
    fill: "#95bd91"
  });

  svgEl("ellipse", {
    cx: 228, cy: 378, rx: 15, ry: 24,
    fill: "#95bd91"
  });

  svgEl("ellipse", {
    cx: 208, cy: 365, rx: 13, ry: 23,
    fill: "#6d9978"
  });

  // ─── Дополнительный декор ───
  roomRect(665, 420, 45, 35, "#b78365", "#765d4b", 2, 5);

  svgEl("ellipse", {
    cx: 687, cy: 405, rx: 18, ry: 27,
    fill: "#7ca782"
  });

  svgEl("ellipse", {
    cx: 672, cy: 398, rx: 12, ry: 20,
    fill: "#95bd91"
  });

  svgEl("ellipse", {
    cx: 702, cy: 398, rx: 12, ry: 20,
    fill: "#95bd91"
  });

  // ─── Игровой объект ───
  drawTaskDesk();

  // ─── Выход ───
  drawExitDoor();
}

function drawCultureRoom() {
  drawRoomBackground("#d4d8cf", "#8b8273", "#b9c7b5");

  drawRoomTitle("Аудитория № 3", "Иностранные языки", "#507b73");

  // ─── Окно ───
  roomRect(55, 120, 150, 170, "#c9e0e3", "#87958b", 4, 5);

  // Рама окна
  roomRect(125, 125, 8, 155, "#938474", "#938474", 1);
  roomRect(60, 200, 140, 7, "#938474", "#938474", 1);

  // Подоконник
  roomRect(45, 290, 170, 12, "#b49a7b", "#796550", 2, 3);

  // Цветок на подоконнике
  roomRect(90, 265, 40, 25, "#b78365", "#765d4b", 2, 4);
  svgEl("ellipse", { cx: 110, cy: 255, rx: 17, ry: 22, fill: "#7ca782" });
  svgEl("ellipse", { cx: 94, cy: 248, rx: 13, ry: 19, fill: "#95bd91" });
  svgEl("ellipse", { cx: 125, cy: 248, rx: 13, ry: 19, fill: "#95bd91" });

  // ─── Постеры на стене ───
  roomRect(235, 120, 105, 110, "#eee5d3", "#9a8975", 3, 5);

  // Постер с архитектурой
  roomRect(245, 132, 85, 85, "#c7d8d0", "#b4a58d", 1, 3);

  // Условный силуэт города
  roomRect(250, 175, 18, 42, "#9a8975", "#9a8975", 1);
  roomRect(270, 160, 22, 57, "#b78365", "#b78365", 1);
  roomRect(295, 170, 15, 47, "#7b9b88", "#7b9b88", 1);
  roomRect(315, 150, 12, 67, "#9a8975", "#9a8975", 1);

  // ─── Второй постер ───
  roomRect(650, 125, 110, 100, "#eee5d3", "#9a8975", 3, 5);
  roomText("EXPLORE", 705, 153, 16, "#507b73");
  roomText("THE WORLD", 705, 175, 13, "#806344");

  // Декоративные линии
  addLine(sceneLayer, 675, 190, 735, 190, "#b49a7b", 2);
  addLine(sceneLayer, 685, 200, 725, 200, "#b49a7b", 2);

  // ─── Полки с сувенирами ───
  roomRect(270, 255, 370, 12, "#a78a68", "#745c45", 2, 3);
  roomRect(270, 315, 370, 12, "#a78a68", "#745c45", 2, 3);

  // Книги на верхней полке
  roomRect(290, 220, 18, 35, "#405c78", "#405c78", 1);
  roomRect(311, 225, 15, 30, "#7b5447", "#7b5447", 1);
  roomRect(329, 215, 20, 40, "#657a56", "#657a56", 1);
  roomRect(352, 225, 16, 30, "#b28c5a", "#b28c5a", 1);

  // Миниатюрная ваза
  roomRect(395, 230, 32, 25, "#b78365", "#765d4b", 2, 5);
  svgEl("ellipse", { cx: 411, cy: 230, rx: 12, ry: 4, fill: "#d3a284" });

  // Сувенир — маленький домик
  roomRect(460, 225, 40, 30, "#c7a47c", "#84674e", 2, 3);
  svgEl("path", {
    d: "M 455 225 L 480 205 L 505 225 Z",
    fill: "#b78365",
    stroke: "#84674e",
    strokeWidth: 2
  });

  // Книги
  roomRect(530, 220, 15, 35, "#7b5447", "#7b5447", 1);
  roomRect(548, 215, 18, 40, "#405c78", "#405c78", 1);
  roomRect(568, 225, 15, 30, "#657a56", "#657a56", 1);
  roomRect(585, 218, 20, 37, "#b28c5a", "#b28c5a", 1);

  // ─── Большой глобус ───
  svgEl("circle", {
    cx: 450, cy: 205, r: 75,
    fill: "#8db4c5",
    stroke: "#8c754e",
    strokeWidth: 6
  });

  // Линии глобуса
  svgEl("ellipse", {
    cx: 450, cy: 205, rx: 30, ry: 75,
    fill: "none",
    stroke: "#e8dfc5",
    strokeWidth: 3
  });

  svgEl("ellipse", {
    cx: 450, cy: 205, rx: 75, ry: 27,
    fill: "none",
    stroke: "#e8dfc5",
    strokeWidth: 3
  });

  // Континенты
  svgEl("path", {
    d: "M 400 155 Q 430 175 420 200 Q 390 215 405 240 Q 430 260 450 270 Q 485 240 475 215 Q 510 185 490 170 Z",
    fill: "#6d9872"
  });

  // Подставка глобуса
  roomRect(435, 280, 30, 55, "#8c6747", "#60452f", 3, 3);
  roomRect(410, 330, 80, 12, "#8c6747", "#60452f", 3, 4);

  // ─── Диван ───
  roomRect(270, 390, 360, 80, "#8b9c91", "#5e766a", 4, 12);

  // Спинка
  roomRect(280, 365, 340, 50, "#9eafa2", "#5e766a", 3, 10);

  // Подушки
  roomRect(295, 380, 70, 55, "#c5a47d", "#947653", 3, 9);
  roomRect(380, 380, 70, 55, "#b8c9bc", "#718c80", 3, 9);
  roomRect(465, 380, 70, 55, "#b78365", "#8c6048", 3, 9);
  roomRect(550, 380, 55, 55, "#c5a47d", "#947653", 3, 9);

  // Ножки дивана
  roomRect(295, 465, 15, 22, "#76563d", "#6d4a32", 1, 3);
  roomRect(590, 465, 15, 22, "#76563d", "#6d4a32", 1, 3);

  // ─── Кресло слева ───
  roomRect(100, 370, 115, 75, "#b78365", "#8c6048", 4, 12);
  roomRect(110, 345, 95, 55, "#c18f71", "#8c6048", 3, 10);

  // Подушка
  roomRect(125, 365, 65, 45, "#d8bd91", "#a38b65", 2, 8);

  // Ножки кресла
  roomRect(115, 440, 12, 25, "#76563d", "#6d4a32", 1, 3);
  roomRect(190, 440, 12, 25, "#76563d", "#6d4a32", 1, 3);

  // ─── Кресло справа ───
  roomRect(685, 370, 115, 75, "#718b9a", "#506878", 4, 12);
  roomRect(695, 345, 95, 55, "#829dac", "#506878", 3, 10);

  // Подушка
  roomRect(710, 365, 65, 45, "#d3b78e", "#a38b65", 2, 8);

  // Ножки кресла
  roomRect(700, 440, 12, 25, "#76563d", "#6d4a32", 1, 3);
  roomRect(775, 440, 12, 25, "#76563d", "#6d4a32", 1, 3);

  // ─── Круглый журнальный столик ───
  svgEl("ellipse", {
    cx: 450, cy: 475, rx: 95, ry: 28,
    fill: "#b49a7b",
    stroke: "#796550",
    strokeWidth: 4
  });

  // Ножка
  roomRect(440, 480, 20, 45, "#8c6747", "#60452f", 2, 3);

  // Основание
  roomRect(410, 520, 80, 10, "#8c6747", "#60452f", 2, 4);

  // Книги на столе
  roomRect(395, 450, 55, 10, "#405c78", "#405c78", 1, 3);
  roomRect(400, 440, 50, 10, "#b28c5a", "#b28c5a", 1, 3);
  roomRect(405, 430, 45, 10, "#7b5447", "#7b5447", 1, 3);

  // Чашка
  roomRect(475, 440, 25, 22, "#eee5d3", "#9a8975", 2, 4);
  svgEl("circle", {
    cx: 502, cy: 450, r: 7,
    fill: "none",
    stroke: "#9a8975",
    strokeWidth: 3
  });

  // ─── Чемодан у кресла ───
  roomRect(75, 475, 70, 50, "#9b6045", "#60452f", 3, 7);
  roomRect(90, 463, 40, 12, "#9b6045", "#60452f", 2, 3);
  roomRect(105, 475, 10, 50, "#c18f71", "#60452f", 1);

  // ─── Растение справа ───
  roomRect(805, 450, 45, 45, "#b78365", "#765d4b", 2, 5);

  svgEl("ellipse", {
    cx: 828, cy: 420, rx: 20, ry: 35,
    fill: "#7ca782"
  });

  svgEl("ellipse", {
    cx: 810, cy: 410, rx: 15, ry: 25,
    fill: "#95bd91"
  });

  svgEl("ellipse", {
    cx: 845, cy: 410, rx: 15, ry: 25,
    fill: "#95bd91"
  });

  svgEl("ellipse", {
    cx: 825, cy: 395, rx: 13, ry: 24,
    fill: "#6d9978"
  });

  // ─── Ковёр ───
  roomRect(250, 500, 400, 50, "#b5bda8", "#8b9c91", 3, 8);
  roomRect(265, 510, 370, 30, "#d4d8cf", "#b5bda8", 2, 5);

  // ─── Игровой объект ───
  drawTaskDesk();

  // ─── Выход ───
  drawExitDoor();
}

// ============================================
// ВЫБОР КОМНАТЫ ПО ФАКУЛЬТЕТУ И ЭТАПУ
// ============================================

function drawClassroom() {
  sceneLayer.replaceChildren();

  const faculty = faculties[state.faculty];

  if (!faculty || !faculty.rooms[state.challenge]) {
    console.error("Не удалось определить комнату:", {
      faculty: state.faculty,
      challenge: state.challenge
    });
    return;
  }

  switch (state.faculty) {
    case "philology":
      [
        drawLexiconRoom,
        drawMorphologyRoom,
        drawTextLabRoom
      ][state.challenge]();
      break;

    case "journalism":
      [
        drawNewsroom,
        drawHeadlineRoom,
        drawMediaStudio
      ][state.challenge]();
      break;

    case "languages":
      [
        drawLanguageClassroom,
        drawTranslationRoom,
        drawCultureRoom
      ][state.challenge]();
      break;

    default:
      console.error("Неизвестный факультет:", state.faculty);
      return;
  }
}

  // ========================================
  // 5. SVG-ПЕРСОНАЖ
  // ========================================

  function drawPlayer() {
    playerLayer.replaceChildren();

    const character = svgEl("g", {
      transform: `translate(${state.player.x} ${state.player.y})`
    }, playerLayer);

    // Тень
    svgEl("ellipse", {
      cx: 0, cy: 10, rx: 17, ry: 6,
      fill: "rgba(0,0,0,.3)"
    }, character);

    // Рюкзак
    svgEl("rect", {
      x: -15, y: -2, width: 9, height: 20, rx: 4,
      fill: "#806044"
    }, character);

    // Ноги и обувь
    svgEl("rect", { x: -9, y: 3, width: 7, height: 12, fill: "#344354" }, character);
    svgEl("rect", { x: 2, y: 3, width: 7, height: 12, fill: "#344354" }, character);
    svgEl("ellipse", { cx: -6, cy: 15, rx: 6, ry: 3, fill: "#382b27" }, character);
    svgEl("ellipse", { cx: 6, cy: 15, rx: 6, ry: 3, fill: "#382b27" }, character);

    // Свитер и рукава
    svgEl("rect", {
      x: -12, y: -7, width: 24, height: 17, rx: 5,
      fill: "#78918b"
    }, character);
    svgEl("rect", { x: -15, y: -4, width: 5, height: 12, fill: "#78918b" }, character);
    svgEl("rect", { x: 10, y: -4, width: 5, height: 12, fill: "#78918b" }, character);

    // Руки
    svgEl("circle", { cx: -13, cy: 8, r: 3, fill: "#d9b18c" }, character);
    svgEl("circle", { cx: 13, cy: 8, r: 3, fill: "#d9b18c" }, character);

    // Шея и голова
    svgEl("rect", { x: -4, y: -12, width: 8, height: 7, fill: "#d9b18c" }, character);
    svgEl("circle", { cx: 0, cy: -17, r: 10, fill: "#e0bb98" }, character);

    // Волосы
    svgEl("path", {
      d: "M -10 -20 A 10 10 0 0 1 10 -20",
      fill: "none", stroke: "#594238", "stroke-width": 5,
      "stroke-linecap": "round"
    }, character);
    svgEl("ellipse", {
      cx: -8, cy: -17, rx: 3, ry: 6,
      transform: "rotate(-17 -8 -17)",
      fill: "#594238"
    }, character);

    // Глаза
    svgEl("circle", { cx: -4, cy: -16, r: 1, fill: "#45352f" }, character);
    svgEl("circle", { cx: 4, cy: -16, r: 1, fill: "#45352f" }, character);
  }

  function nearObject() {
    const p = state.player;

if (state.scene === "hall") {
  for (const door of doors) {
    const x = door.x + door.width / 2;
    const y = door.y + door.height / 2;

    if (Math.hypot(p.x - x, p.y - y) < 85) {
      return { type: "facultyDoor", id: door.id };
    }
  }
}

    if (state.scene === "classroom") {
      if (
        !state.answered &&
        Math.hypot(p.x - 450, p.y - 400) < 110
      ) {
        return { type: "desk" };
      }

      if (
        state.answered &&
        Math.hypot(p.x - 760, p.y - 325) < 85
      ) {
        return { type: "nextDoor" };
      }
    }

    return null;
  }

// ========================================
// АНИМАЦИЯ ПЕРЕХОДОВ
// ========================================

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getTransitionOverlay() {
  let overlay = document.getElementById("game-transition");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "game-transition";
    document.body.appendChild(overlay);
  }

  return overlay;
}

async function transitionScene({
  doorId = null,
  action
}) {
  if (state.transitioning) return;

  state.transitioning = true;
  state.keys.clear();

  const overlay = getTransitionOverlay();

  try {
    // Открываем конкретную дверь
    if (doorId) {
      const door = sceneLayer.querySelector(
        `.door-panel[data-door-id="${doorId}"]`
      );

      if (door) {
        door.classList.add("open");
        await wait(400);
      }
    }

  // Подготавливаем затемнение
overlay.style.opacity = "0";

await new Promise(resolve =>
  requestAnimationFrame(resolve)
);

// Затемняем экран
overlay.style.opacity = "1";
await wait(350);

    // Меняем сцену
    action();

    // Ждём обновления игрового кадра
    await new Promise(resolve => requestAnimationFrame(resolve));

    // Проявляем новую сцену
    overlay.style.opacity = "0";
    await wait(400);

  } finally {
    state.transitioning = false;
    state.keys.clear();
  }
}

 // ========================================
// 7. ВЗАИМОДЕЙСТВИЕ
// ========================================

function interact() {
  if (
    !state.started ||
    state.questionOpen ||
    state.transitioning ||
    !ui.finishWindow.hidden
  ) {
    return;
  }

  const target = nearObject();

  if (!target) return;

  if (target.type === "facultyDoor") {
    enterFaculty(target.id);
  }

  if (target.type === "desk") {
    openQuestion();
  }

  if (target.type === "nextDoor") {
    goNextRoom();
  }
}


// ========================================
// ВХОД НА ФАКУЛЬТЕТ
// ========================================

function enterFaculty(id) {
  transitionScene({
    doorId: `faculty-${id}`,

    action: () => {
      state.faculty = id;
      state.challenge = 0;
      state.answered = false;
      state.scene = "classroom";

      state.player.x = 450;
      state.player.y = 510;

      updateInterface();
    }
  });
}


// ========================================
// СЛЕДУЮЩАЯ КОМНАТА
// ========================================

function goNextRoom() {
  if (!state.answered || state.transitioning) return;

  transitionScene({
    doorId: "next-room",

    action: () => {
      if (
        state.challenge <
        faculties[state.faculty].tasks.length - 1
      ) {
        state.challenge++;
        state.answered = false;

        state.player.x = 450;
        state.player.y = 510;

        updateInterface();
      } else {
        finishGame();
      }
    }
  });
}

// ========================================
// ВОЗВРАТ В ХОЛЛ
// ========================================

async function returnToHall() {
  if (state.transitioning) return;

  await transitionScene({
    action: () => {
      ui.finishWindow.hidden = true;

      state.started = true;
      state.scene = "hall";
      state.faculty = null;
      state.challenge = 0;
      state.answered = false;
      state.questionOpen = false;

      state.player.x = 450;
      state.player.y = 510;

      updateInterface();
    }
  });
}

  // ========================================
// 8. СИСТЕМА РАЗНЫХ ТИПОВ ЗАДАНИЙ
// ========================================

let taskData = null;
let foundWords = [];
let firstCell = null;
let builtWords = [];
let selectedSentenceWords = [];

function openQuestion() {
  const faculty = faculties[state.faculty];
  taskData = faculty.tasks[state.challenge];

  state.questionOpen = true;

  ui.questionFaculty.textContent = faculty.short.toUpperCase();
  ui.questionTitle.textContent =
    `Испытание ${state.challenge + 1}: ${taskData.title}`;

  ui.questionText.textContent = taskData.question;
  ui.feedback.textContent = "";
  ui.answers.innerHTML = "";

  foundWords = [];
  firstCell = null;
  builtWords = [];
  selectedSentenceWords = [];

  renderTask();

  ui.questionWindow.hidden = false;
}

// Выбираем интерфейс в зависимости от типа задания
function renderTask() {
  switch (taskData.type) {
    case "wordSearch":
      renderWordSearch();
      break;

    case "textInput":
    case "editText":
      renderTextInput();
      break;

    case "wordBuilder":
      renderWordBuilder();
      break;

    case "sentenceOrder":
      renderSentenceOrder();
      break;

    case "choice":
      renderChoice();
      break;

    case "match":
      renderMatch();
      break;
  }
}

// ----------------------------------------
// ТИП 1. ПОИСК СЛОВ В БУКВЕННОМ КВАДРАТЕ
// ----------------------------------------

function renderWordSearch() {
  const wrapper = document.createElement("div");
  wrapper.className = "word-search";

  const list = document.createElement("div");
  list.className = "word-list";

  list.innerHTML = "<strong>Найди слова:</strong>";

  taskData.words.forEach(word => {
    const item = document.createElement("span");
    item.className = "word-target";
    item.textContent = word;
    item.dataset.word = word;
    list.appendChild(item);
  });

  const grid = document.createElement("div");
  grid.className = "letter-grid";

  taskData.grid.forEach((row, rowIndex) => {
    row.forEach((letter, colIndex) => {
      const cell = document.createElement("button");

      cell.type = "button";
      cell.className = "letter-cell";
      cell.textContent = letter;
      cell.dataset.row = rowIndex;
      cell.dataset.col = colIndex;

      cell.addEventListener("click", () => {
        selectWordCell(rowIndex, colIndex);
      });

      grid.appendChild(cell);
    });
  });

  wrapper.appendChild(list);
  wrapper.appendChild(grid);

  const counter = document.createElement("p");
  counter.className = "task-counter";
  counter.id = "wordCounter";
  counter.textContent = `Найдено: 0 / ${taskData.words.length}`;

  wrapper.appendChild(counter);
  ui.answers.appendChild(wrapper);
}

function selectWordCell(row, col) {
  if (state.answered) return;

  if (!firstCell) {
    firstCell = { row, col };

    document
      .querySelectorAll(".letter-cell")
      .forEach(cell => {
        cell.classList.remove("selected");
      });

    getCell(row, col).classList.add("selected");
    return;
  }

  const secondCell = { row, col };

  const word = getWordBetween(firstCell, secondCell);

  if (word) {
    const reversed = word.split("").reverse().join("");

    const found = taskData.words.find(target =>
      target === word || target === reversed
    );

    if (found && !foundWords.includes(found)) {
      foundWords.push(found);

      markFoundWord(firstCell, secondCell);

      const target = document.querySelector(
        `.word-target[data-word="${found}"]`
      );

      if (target) target.classList.add("found");

      ui.feedback.textContent = `Отлично! Найдено слово: ${found}`;
    } else {
      ui.feedback.textContent = found
        ? "Это слово уже найдено."
        : "Здесь нет нужного слова. Попробуй ещё раз.";
    }
  } else {
    ui.feedback.textContent =
      "Выбери прямую линию: горизонтально, вертикально или по диагонали.";
  }

  firstCell = null;

  document
    .querySelectorAll(".letter-cell")
    .forEach(cell => {
      cell.classList.remove("selected");
    });

  const counter = document.getElementById("wordCounter");

  if (counter) {
    counter.textContent =
      `Найдено: ${foundWords.length} / ${taskData.words.length}`;
  }

  if (foundWords.length === taskData.words.length) {
    completeTask(taskData.explanation ||
      "Ты нашёл все спрятанные слова!");
  }
}

function getCell(row, col) {
  return document.querySelector(
    `.letter-cell[data-row="${row}"][data-col="${col}"]`
  );
}

function getWordBetween(start, end) {
  const rowDiff = end.row - start.row;
  const colDiff = end.col - start.col;

  const rowStep = Math.sign(rowDiff);
  const colStep = Math.sign(colDiff);

  if (
    rowDiff !== 0 &&
    colDiff !== 0 &&
    Math.abs(rowDiff) !== Math.abs(colDiff)
  ) {
    return "";
  }

  let word = "";
  let row = start.row;
  let col = start.col;

  while (true) {
    word += taskData.grid[row][col];

    if (row === end.row && col === end.col) break;

    row += rowStep;
    col += colStep;
  }

  return word;
}

function markFoundWord(start, end) {
  const rowStep = Math.sign(end.row - start.row);
  const colStep = Math.sign(end.col - start.col);

  let row = start.row;
  let col = start.col;

  while (true) {
    const cell = getCell(row, col);

    if (cell) {
      cell.classList.add("found-cell");
      cell.disabled = true;
    }

    if (row === end.row && col === end.col) break;

    row += rowStep;
    col += colStep;
  }
}

// ----------------------------------------
// ТИП 2. САМОСТОЯТЕЛЬНЫЙ ВВОД ОТВЕТА
// ----------------------------------------

function renderTextInput() {
  const wrapper = document.createElement("div");
  wrapper.className = "text-task";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "task-input";
  input.placeholder = "Введи свой ответ...";

  const button = document.createElement("button");
  button.className = "task-submit";
  button.textContent = "Проверить ответ";

  button.addEventListener("click", () => {
    checkTextAnswer(input.value);
  });

  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      checkTextAnswer(input.value);
    }
  });

  wrapper.appendChild(input);
  wrapper.appendChild(button);

  ui.answers.appendChild(wrapper);

  input.focus();
}

function normalizeAnswer(value) {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[.,!?;:«»"]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function checkTextAnswer(value) {
  const normalized = normalizeAnswer(value);

  if (!normalized) {
    ui.feedback.textContent = "Сначала введи ответ.";
    return;
  }

  const accepted = taskData.answer.map(normalizeAnswer);

  if (accepted.includes(normalized)) {
    completeTask(taskData.explanation);
  } else {
    ui.feedback.textContent =
      "Пока неверно. Попробуй ещё раз!";
  }
}

// ----------------------------------------
// ТИП 3. СОСТАВЛЕНИЕ СЛОВ ИЗ БУКВ
// ----------------------------------------

function renderWordBuilder() {
  const wrapper = document.createElement("div");
  wrapper.className = "text-task";

  const source = document.createElement("div");
  source.className = "source-word";
  source.textContent = taskData.sourceWord;

  const counter = document.createElement("p");
  counter.className = "task-counter";
  counter.id = "builtCounter";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "task-input";
  input.placeholder = "Введи английское слово...";

  const button = document.createElement("button");
  button.className = "task-submit";
  button.textContent = "Добавить слово";

  const list = document.createElement("div");
  list.className = "built-word-list";
  list.id = "builtWordList";

  button.addEventListener("click", () => {
    addBuiltWord(input.value);
  });

  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      addBuiltWord(input.value);
    }
  });

  wrapper.appendChild(source);
  wrapper.appendChild(counter);
  wrapper.appendChild(input);
  wrapper.appendChild(button);
  wrapper.appendChild(list);

  ui.answers.appendChild(wrapper);

  updateBuiltWords();
  input.focus();
}

function canBuildWord(word) {
  const sourceLetters = taskData.sourceWord
    .toUpperCase()
    .split("");

  const usedLetters = word.split("");

  for (const letter of usedLetters) {
    const index = sourceLetters.indexOf(letter);

    if (index === -1) return false;

    sourceLetters.splice(index, 1);
  }

  return true;
}

function addBuiltWord(value) {
  const word = value.trim().toUpperCase();

  if (!word) {
    ui.feedback.textContent = "Введи слово.";
    return;
  }

  if (builtWords.includes(word)) {
    ui.feedback.textContent = "Ты уже добавил это слово.";
    return;
  }

  if (!canBuildWord(word)) {
    ui.feedback.textContent =
      "В этом слове используются буквы, которых нет в исходном слове, или одна из букв повторяется слишком часто.";
    return;
  }

  if (!taskData.answers.includes(word)) {
    ui.feedback.textContent =
      "Такое слово не входит в список принимаемых ответов. Попробуй другое.";
    return;
  }

  builtWords.push(word);

  const input = ui.answers.querySelector(".task-input");
  if (input) input.value = "";

  ui.feedback.textContent = `Принято: ${word}`;

  updateBuiltWords();

  if (builtWords.length === taskData.answers.length) {
    completeTask(taskData.explanation);
  }
}

function updateBuiltWords() {
  const counter = document.getElementById("builtCounter");
  const list = document.getElementById("builtWordList");

  if (counter) {
    counter.textContent =
      `Составлено: ${builtWords.length} / ${taskData.answers.length}`;
  }

  if (list) {
    list.innerHTML = "";

    builtWords.forEach(word => {
      const item = document.createElement("span");
      item.className = "built-word";
      item.textContent = word;
      list.appendChild(item);
    });
  }
}

// ----------------------------------------
// ТИП 4. СБОРКА ПРЕДЛОЖЕНИЯ
// ----------------------------------------

function renderSentenceOrder() {
  const wrapper = document.createElement("div");
  wrapper.className = "text-task";

  const selected = document.createElement("div");
  selected.className = "sentence-selected";
  selected.id = "sentenceSelected";
  selected.textContent = "Нажимай на слова в правильном порядке";

  const pool = document.createElement("div");
  pool.className = "sentence-pool";

  // Перемешиваем слова
  const shuffled = [...taskData.words].sort(
    () => Math.random() - 0.5
  );

  shuffled.forEach((word, index) => {
    const button = document.createElement("button");

    button.className = "word-tile";
    button.textContent = word;
    button.dataset.index = index;

    button.addEventListener("click", () => {
      if (button.disabled || state.answered) return;

      selectedSentenceWords.push({
        word,
        button
      });

      button.disabled = true;
      button.classList.add("used");

      updateSentenceDisplay();
    });

    pool.appendChild(button);
  });

  const reset = document.createElement("button");
  reset.className = "task-submit secondary";
  reset.textContent = "Начать заново";

  reset.addEventListener("click", () => {
    selectedSentenceWords = [];

    pool.querySelectorAll("button").forEach(button => {
      button.disabled = false;
      button.classList.remove("used");
    });

    updateSentenceDisplay();
    ui.feedback.textContent = "";
  });

  const check = document.createElement("button");
  check.className = "task-submit";
  check.textContent = "Проверить предложение";

  check.addEventListener("click", checkSentence);

  wrapper.appendChild(selected);
  wrapper.appendChild(pool);
  wrapper.appendChild(reset);
  wrapper.appendChild(check);

  ui.answers.appendChild(wrapper);
}

function updateSentenceDisplay() {
  const display = document.getElementById("sentenceSelected");

  if (!display) return;

  display.textContent = selectedSentenceWords.length
    ? selectedSentenceWords.map(item => item.word).join(" ")
    : "Нажимай на слова в правильном порядке";
}

function checkSentence() {
  const actual = selectedSentenceWords.map(item => item.word);
  const expected = taskData.answer;

  if (
    actual.length === expected.length &&
    actual.every((word, index) => word === expected[index])
  ) {
    completeTask(taskData.explanation);
  } else {
    ui.feedback.textContent =
      "Порядок слов пока неправильный. Попробуй ещё раз.";
  }
}

// ----------------------------------------
// ТИП 5. ВЫБОР ОТВЕТА
// ----------------------------------------

function renderChoice() {
  taskData.options.forEach((answer, index) => {
    const button = document.createElement("button");

    button.className = "answer-button";
    button.textContent = `${["А", "Б", "В", "Г"][index]}. ${answer}`;

    button.addEventListener("click", () => {
      if (index === taskData.correct) {
        completeTask(taskData.explanation);
      } else {
        button.classList.add("wrong");
        button.disabled = true;

        ui.feedback.textContent =
          "Не совсем! Подумай ещё и попробуй другой вариант.";
      }
    });

    ui.answers.appendChild(button);
  });
}

// ----------------------------------------
// ТИП 6. СООТНЕСЕНИЕ ТЕРМИН — ОПРЕДЕЛЕНИЕ
// ----------------------------------------

function renderMatch() {
  const wrapper = document.createElement("div");
  wrapper.className = "match-task";

  const termsCol = document.createElement("div");
  termsCol.className = "match-column";

  const defsCol = document.createElement("div");
  defsCol.className = "match-column";

  const pairs = taskData.pairs;

  // Перемешиваем определения
  const shuffledDefs = pairs
    .map((pair, index) => ({ pair, index }))
    .sort(() => Math.random() - 0.5);

  let selectedTerm = null;
  let matchedCount = 0;

  pairs.forEach((pair, index) => {
    const termButton = document.createElement("button");
    termButton.type = "button";
    termButton.className = "match-item match-term";
    termButton.textContent = pair.term;
    termButton.dataset.index = index;

    termButton.addEventListener("click", () => {
      if (state.answered) return;
      if (termButton.classList.contains("matched")) return;

      // Снимаем выделение с других терминов
      termsCol.querySelectorAll(".match-term").forEach(btn => {
        btn.classList.remove("selected");
      });

      selectedTerm = { index, button: termButton };
      termButton.classList.add("selected");
      ui.feedback.textContent =
        `Выбран термин: ${pair.term}. Теперь выбери определение.`;
    });

    termsCol.appendChild(termButton);
  });

  shuffledDefs.forEach(({ pair, index }) => {
    const defButton = document.createElement("button");
    defButton.type = "button";
    defButton.className = "match-item match-def";
    defButton.textContent = pair.definition;
    defButton.dataset.index = index;

    defButton.addEventListener("click", () => {
      if (state.answered) return;
      if (defButton.classList.contains("matched")) return;

      if (!selectedTerm) {
        ui.feedback.textContent = "Сначала выбери термин слева.";
        return;
      }

      if (selectedTerm.index === index) {
        // Верно
        selectedTerm.button.classList.remove("selected");
        selectedTerm.button.classList.add("matched");
        selectedTerm.button.disabled = true;

        defButton.classList.add("matched");
        defButton.disabled = true;

        matchedCount++;
        ui.feedback.textContent = `Верно: ${pair.term}.`;

        selectedTerm = null;

        if (matchedCount === pairs.length) {
          completeTask(taskData.explanation);
        }
      } else {
        // Неверно
        defButton.classList.add("wrong");
        setTimeout(() => defButton.classList.remove("wrong"), 800);

        ui.feedback.textContent =
          "Не совпадает. Попробуй другое определение.";

        selectedTerm.button.classList.remove("selected");
        selectedTerm = null;
      }
    });

    defsCol.appendChild(defButton);
  });

  wrapper.appendChild(termsCol);
  wrapper.appendChild(defsCol);
  ui.answers.appendChild(wrapper);
}

// ----------------------------------------
// ОБЩЕЕ ЗАВЕРШЕНИЕ ЗАДАНИЯ
// ----------------------------------------

function completeTask(message) {
  if (state.answered) return;

  state.answered = true;

  ui.feedback.textContent =
    "Верно! " + (message || "Испытание пройдено.");

  updateInterface();

  const nextButton = document.createElement("button");

  nextButton.className = "answer-button correct";
  nextButton.textContent = "Продолжить →";

  nextButton.addEventListener("click", () => {
    ui.questionWindow.hidden = true;
    state.questionOpen = false;
  });

  ui.answers.appendChild(nextButton);
}

function closeQuestion() {
  ui.questionWindow.hidden = true;
  state.questionOpen = false;
}

  // ========================================
  // 9. ЗАВЕРШЕНИЕ МАРШРУТА
  // ========================================

function finishGame() {
  const faculty = faculties[state.faculty];

  const finishIntro = ui.finishWindow.querySelector(".finish-intro");
  const finishSite = ui.finishWindow.querySelector(".finish-site");

  if (finishIntro) {
    finishIntro.innerHTML = `
      Поздравляем! Ты успешно прошёл(ла) маршрут
      <strong>«${faculty.short}».</strong>
    `;
  }

  if (finishSite) {
    finishSite.href =
      faculty.admissionUrl || "http://isu.ru/Abitur/pk2026/main/";

    finishSite.innerHTML = `
      Приёмная кампания · ${faculty.short}
      <span>↗</span>
    `;
  }

  ui.finishWindow.hidden = false;
  state.started = false;
}

  // ========================================
  // 10. ИНТЕРФЕЙС
  // ========================================

function updateInterface() {
  document.body.classList.toggle("in-hall", state.scene === "hall");
  if (state.scene === "hall") {
    ui.location.style.display = "";
    ui.location.textContent = "Главный холл";

    ui.route.textContent = "Пока не выбран";
    ui.progress.textContent = "0 / 3";

  } else {
    const faculty = faculties[state.faculty];

    // Скрываем название аудитории в шапке сайта
    ui.location.style.display = "none";

    ui.route.textContent = faculty.short;

    ui.progress.textContent =
      `${state.challenge + (state.answered ? 1 : 0)} / 3`;
  }
}

  // ========================================
  // 11. ДВИЖЕНИЕ
  // ========================================

  function update(dt) {
if (
  !state.started ||
  state.questionOpen ||
  state.transitioning
) {
  state.nearby = null;
  ui.hint.textContent = "";
  return;
}
    const p = state.player;
    const keys = state.keys;

    let dx = 0;
    let dy = 0;

    if (
      keys.has("ArrowLeft") ||
      keys.has("a")
    ) dx--;

    if (
      keys.has("ArrowRight") ||
      keys.has("d")
    ) dx++;

    if (
      keys.has("ArrowUp") ||
      keys.has("w")
    ) dy--;

    if (
      keys.has("ArrowDown") ||
      keys.has("s")
    ) dy++;

    // Диагональное движение не должно быть быстрее
    if (dx && dy) {
      dx *= Math.SQRT1_2;
      dy *= Math.SQRT1_2;
    }

    p.x += dx * p.speed * dt;
    p.y += dy * p.speed * dt;

    // Границы помещения
    p.x = Math.max(30, Math.min(870, p.x));
    p.y = Math.max(90, Math.min(565, p.y));

    state.nearby = nearObject();

    ui.hint.hidden = !state.nearby;

    if (state.nearby) {
      if (state.nearby.type === "facultyDoor") {
        ui.hint.textContent =
          "Нажми пробел, чтобы войти на факультет";

      } else if (state.nearby.type === "desk") {
        ui.hint.textContent =
          "Нажми пробел, чтобы получить задание";

      } else {
        ui.hint.textContent =
          "Нажми пробел, чтобы пройти в следующую комнату";
      }
    }

    if (ui.backButton) {
        ui.backButton.hidden = state.scene === "hall";
    }
  }

  // ========================================
  // 12. ИГРОВОЙ ЦИКЛ
  // ========================================

  let renderedSceneKey = "";

  function render() {
    const sceneKey = [
      state.scene,
      state.faculty,
      state.challenge,
      state.answered
    ].join("|");

    // Статический интерьер перестраивается только при смене комнаты
    // или состояния двери; персонаж обновляется отдельно каждый кадр.
    if (sceneKey !== renderedSceneKey) {
      if (state.scene === "hall") {
        drawHall();
      } else {
        drawClassroom();
      }
      renderedSceneKey = sceneKey;
    }

    drawPlayer();
  }

  let lastTime = 0;

  function gameLoop(timestamp) {
    const dt = Math.min(
      (timestamp - lastTime) / 1000 || 0,
      0.04
    );

    lastTime = timestamp;

    update(dt);
    render();

    requestAnimationFrame(gameLoop);
  }



  // ========================================
  // 13. УПРАВЛЕНИЕ КЛАВИАТУРОЙ
  // ========================================

  window.addEventListener("keydown", event => {
    const key = event.key.length === 1
      ? event.key.toLowerCase()
      : event.key;

    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "]
        .includes(key)
    ) {
      event.preventDefault();
    }

    if (key === "e" || key === " ") {
      interact();
      return;
    }

    state.keys.add(key);
  });

  window.addEventListener("keyup", event => {
    const key = event.key.length === 1
      ? event.key.toLowerCase()
      : event.key;

    state.keys.delete(key);
  });

  window.addEventListener("blur", () => {
    state.keys.clear();
  });

// ========================================
// УПРАВЛЕНИЕ КЛИКАМИ: МЫШЬ И СЕНСОР
// ========================================

function getSvgCoordinates(event) {
  const point = svg.createSVGPoint();

  point.x = event.clientX;
  point.y = event.clientY;

  const svgPoint = point.matrixTransform(
    svg.getScreenCTM().inverse()
  );

  return {
    x: svgPoint.x,
    y: svgPoint.y
  };
}


function handleScenePointer(event) {

  if (
    !state.started ||
    state.questionOpen ||
    state.transitioning ||
    !ui.finishWindow.hidden
  ) {
    return;
  }

  const { x, y } = getSvgCoordinates(event);

  // ========================================
  // ХОЛЛ — КЛИК ПО ДВЕРИ ФАКУЛЬТЕТА
  // ========================================

  if (state.scene === "hall") {

    const door = doors.find(d =>
      x >= d.x &&
      x <= d.x + d.width &&
      y >= d.y &&
      y <= d.y + d.height
    );

    if (door) {
      enterFaculty(door.id);
    }

    return;
  }


  // ========================================
  // АУДИТОРИИ
  // ========================================

  if (state.scene === "classroom") {

    // Клик по столу с заданием
    if (
      !state.answered &&
      Math.hypot(x - 450, y - 400) < 110
    ) {
      openQuestion();
      return;
    }

    // Клик по двери в следующую комнату
    if (
      state.answered &&
      x >= 720 &&
      x <= 800 &&
      y >= 260 &&
      y <= 395
    ) {
      goNextRoom();
      return;
    }
  }
}


// ========================================
// КУРСОР ПРИ НАВЕДЕНИИ
// ========================================

function handleSceneHover(event) {

  // Убираем предыдущую подсветку
  sceneLayer.querySelectorAll(".door.hovered")
    .forEach(door => door.classList.remove("hovered"));

  sceneLayer.querySelectorAll(".task-hover-glow.active")
    .forEach(glow => glow.classList.remove("active"));

  if (
    event.pointerType !== "mouse" ||
    !state.started ||
    state.questionOpen ||
    state.transitioning ||
    !ui.finishWindow.hidden
  ) {
    svg.style.cursor = "default";
    return;
  }

  const { x, y } = getSvgCoordinates(event);

  let interactive = false;

  // ========================================
  // ХОЛЛ — ДВЕРИ
  // ========================================

  if (state.scene === "hall") {

    const door = doors.find(d =>
      x >= d.x &&
      x <= d.x + d.width &&
      y >= d.y &&
      y <= d.y + d.height
    );

    if (door) {
      interactive = true;

      const doorElement = sceneLayer.querySelector(
        `.door[data-door-id="faculty-${door.id}"]`
      );

      if (doorElement) {
        doorElement.classList.add("hovered");
      }
    }
  }

  // ========================================
  // АУДИТОРИЯ
  // ========================================

  if (state.scene === "classroom") {

    // Стол с заданием
    if (
      !state.answered &&
      Math.hypot(x - 450, y - 400) < 110
    ) {
      interactive = true;

      const glow = sceneLayer.querySelector(".task-hover-glow");

      if (glow) {
        glow.classList.add("active");
      }
    }

    // Дверь в следующую комнату
    if (
      state.answered &&
      x >= 720 &&
      x <= 800 &&
      y >= 260 &&
      y <= 395
    ) {
      interactive = true;

      const exitDoor = sceneLayer.querySelector(
        '.door[data-door-id="next-room"]'
      );

      if (exitDoor) {
        exitDoor.classList.add("hovered");
      }
    }
  }

  svg.style.cursor = interactive
    ? "pointer"
    : "default";
}


// Обработчики мыши и сенсорного экрана
svg.addEventListener("pointerup", handleScenePointer);
svg.addEventListener("pointermove", handleSceneHover);
svg.addEventListener("pointerleave", () => {
  svg.style.cursor = "default";
});

 // ========================================
// 14. КНОПКИ И ЗАПУСК
// ========================================

const startButton = $("startButton");

startButton.addEventListener("touchstart", () => {
  startButton.textContent = "Касание зарегистрировано";
}, { passive: true });

startButton.addEventListener("touchend", (event) => {
  event.preventDefault();

  startButton.textContent = "Запускаю игру…";
  state.started = true;
  ui.welcome.hidden = true;
}, { passive: false });

startButton.addEventListener("click", () => {
  if (state.started) return;

  state.started = true;
  ui.welcome.hidden = true;
});

updateInterface();

document.addEventListener("touchstart", (event) => {
  const touch = event.touches[0];

  const element = document.elementFromPoint(
    touch.clientX,
    touch.clientY
  );

  alert(
    "Касание попало в элемент: " +
    element.tagName +
    " | ID: " +
    element.id +
    " | CLASS: " +
    element.className
  );
}, { once: true, capture: true });

requestAnimationFrame(gameLoop);


})();