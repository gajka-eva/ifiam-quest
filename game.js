(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  // Эмблема факультета филологии
  const philologyEmblem = new Image();
  philologyEmblem.src = "philology-emblem.png";

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
    finishText: $("finishText"),
    backButton: document.getElementById("back-to-hall")
  };

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
          title: "Факт или мнение?",
          question: "Какое из утверждений можно проверить как факт?",
          options: [
            "Библиотека открылась в 10:00",
            "Это самая красивая библиотека города",
            "Открытие библиотеки стало великолепным событием"
          ],
          correct: 0,
          explanation: "Время открытия можно проверить по расписанию или официальному сообщению."
        },
        {
          type: "textInput",
          title: "Мастерская заголовков",
          question: "Придумай нейтральный заголовок к новости: «В городе открыли новый музей истории». Введи краткий заголовок, содержащий слова «открылся» и «музей».",
          answer: ["открылся новый музей", "в городе открылся новый музей"],
          explanation: "Нейтральный заголовок сообщает о событии без эмоциональных оценок и преувеличений."
        },
        {
          type: "editText",
          title: "Работа корректора",
          question: "В короткой новости допущена грамматическая ошибка. Исправь одно слово:\n\n«Вчера в университете прошло интересная встреча».\n\nКакое слово нужно заменить и на какое?",
          answer: [
            "прошла",
            "встреча прошла",
            "прошла интересная встреча"
          ],
          explanation: "Подлежащее «встреча» женского рода, поэтому правильно: «прошла интересная встреча»."
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
          type: "wordBuilder",
          title: "Сила английских букв",
          question: "Из букв слова TRIANGLE составь пять английских слов. Вводи по одному слову. Каждую букву можно использовать только столько раз, сколько она встречается в исходном слове.",
          sourceWord: "TRIANGLE",
          answers: ["TRAIN", "GIANT", "GREAT", "ANGLE", "ALERT"],
          explanation: "Отличная работа! Ты умеешь находить новые слова из имеющегося буквенного набора."
        },
        {
          type: "sentenceOrder",
          title: "Собери предложение",
          question: "Составь правильное английское предложение из перепутанных слов.",
          words: ["yesterday", "library", "I", "the", "visited"],
          answer: ["I", "visited", "the", "library", "yesterday"],
          explanation: "Правильный порядок слов: I visited the library yesterday."
        },
        {
          type: "textInput",
          title: "Переводческая практика",
          question: "Вставь пропущенную форму глагола:\n\nShe ___ a student.\n\nКакое английское слово пропущено?",
          answer: ["is"],
          explanation: "С местоимением she используется форма глагола to be — is."
        }
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

  // ========================================
  // 3. РИСОВАНИЕ ИНТЕРЬЕРА
  // ========================================

  function drawBackground() {
  // Светло-коричневые стены
  const wall = ctx.createLinearGradient(0, 0, 0, 470);
  wall.addColorStop(0, "#c8ad8d");
  wall.addColorStop(1, "#a98d70");

  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, 900, 470);

  // Каменная кладка
  ctx.strokeStyle = "rgba(85, 63, 43, 0.13)";
  ctx.lineWidth = 2;

  for (let y = 30; y < 470; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(900, y);
    ctx.stroke();

    for (let x = (y % 96 ? 50 : 0); x < 900; x += 110) {
      ctx.beginPath();
      ctx.moveTo(x, y - 48);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }

  // Серый каменный пол — уменьшенная высота
  const floor = ctx.createLinearGradient(0, 470, 0, 600);
  floor.addColorStop(0, "#858584");
  floor.addColorStop(1, "#55585a");

  ctx.fillStyle = floor;
  ctx.fillRect(0, 470, 900, 130);

  // Плиточные швы
  ctx.strokeStyle = "rgba(35, 37, 39, 0.35)";
  ctx.lineWidth = 2;

  for (let y = 480; y < 600; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(900, y);
    ctx.stroke();
  }

  for (let x = 50; x < 900; x += 110) {
    ctx.beginPath();
    ctx.moveTo(x, 470);
    ctx.lineTo(x, 600);
    ctx.stroke();
  }

  // Ряд окон
  drawWindow(260, 25);
  drawWindow(450, 25);
  drawWindow(640, 25);

  // Факелы
  drawTorch(35, 135);
  drawTorch(865, 135);
}

  function drawWindow(x, y) {
  // Тёмный проём
  ctx.fillStyle = "#423d3b";

  ctx.beginPath();
  ctx.moveTo(x - 43, y + 45);
  ctx.arc(x, y + 45, 43, Math.PI, 0);
  ctx.lineTo(x + 43, y + 145);
  ctx.lineTo(x - 43, y + 145);
  ctx.closePath();
  ctx.fill();

  // Стекло
  const glass = ctx.createLinearGradient(x - 40, y, x + 40, y + 145);
  glass.addColorStop(0, "#a9c6ce");
  glass.addColorStop(1, "#557c8c");

  ctx.fillStyle = glass;
  ctx.fillRect(x - 35, y + 45, 70, 100);

  // Рама
  ctx.strokeStyle = "#765c43";
  ctx.lineWidth = 5;
  ctx.strokeRect(x - 35, y + 45, 70, 100);

  // Переплёт
  ctx.beginPath();
  ctx.moveTo(x, y + 45);
  ctx.lineTo(x, y + 145);
  ctx.moveTo(x - 35, y + 95);
  ctx.lineTo(x + 35, y + 95);
  ctx.stroke();
};

  function drawTorch(x, y) {
    ctx.fillStyle = "#8b6747";
    ctx.fillRect(x - 5, y, 10, 30);

    const glow = ctx.createRadialGradient(x, y - 10, 2, x, y - 10, 55);

    glow.addColorStop(0, "rgba(255, 186, 91, 0.35)");
    glow.addColorStop(1, "rgba(255, 186, 91, 0)");

    ctx.fillStyle = glow;
    ctx.fillRect(x - 55, y - 65, 110, 110);

    ctx.fillStyle = "#f5ba65";

    ctx.beginPath();
    ctx.ellipse(x, y - 9, 7, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff0b5";

    ctx.beginPath();
    ctx.ellipse(x, y - 11, 3, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  function drawDoor(x, y, width, height, label, color) {
  // Каменная рама
  ctx.fillStyle = "#665342";
  ctx.fillRect(x - 10, y - 12, width + 20, height + 24);

  ctx.strokeStyle = "#d0b28b";
  ctx.lineWidth = 5;
  ctx.strokeRect(x - 10, y - 12, width + 20, height + 24);

  // Деревянное полотно
  const wood = ctx.createLinearGradient(x, y, x + width, y);

  wood.addColorStop(0, "#493326");
  wood.addColorStop(0.5, "#805b3e");
  wood.addColorStop(1, "#493326");

  ctx.fillStyle = wood;
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = "#c0a071";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 10, y + 10, width - 20, height - 20);

  // Декоративный символ без номера
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + width / 2, y + 32, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff1d2";
  ctx.font = "bold 15px Georgia";
  ctx.textAlign = "center";
  ctx.fillText("✦", x + width / 2, y + 37);

  // Название
  ctx.fillStyle = "#f4e4c5";
  ctx.font = "bold 11px Arial";

  const words = label.split(" ");
  let line = "";
  const lines = [];

  for (const word of words) {
    const test = line ? line + " " + word : word;

    if (ctx.measureText(test).width > width - 15 && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }

  if (line) lines.push(line);

  lines.forEach((part, index) => {
    ctx.fillText(part, x + width / 2, y + 70 + index * 15);
  });

  // Ручка
  ctx.fillStyle = "#e0bd76";
  ctx.beginPath();
  ctx.arc(x + width - 20, y + height / 2, 4, 0, Math.PI * 2);
  ctx.fill();
};

function drawPlant(x, y) {
  // Горшок
  ctx.fillStyle = "#98694d";
  ctx.beginPath();
  ctx.moveTo(x - 19, y - 5);
  ctx.lineTo(x + 19, y - 5);
  ctx.lineTo(x + 14, y + 25);
  ctx.lineTo(x - 14, y + 25);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#c18c63";
  ctx.fillRect(x - 20, y - 8, 40, 6);

  // Стебли и листья
  ctx.strokeStyle = "#315b3c";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(x, y - 7);
  ctx.lineTo(x, y - 65);
  ctx.moveTo(x, y - 25);
  ctx.lineTo(x - 18, y - 48);
  ctx.moveTo(x, y - 38);
  ctx.lineTo(x + 18, y - 60);
  ctx.stroke();

  const leaves = [
    [x - 10, y - 35],
    [x + 10, y - 45],
    [x - 17, y - 52],
    [x + 17, y - 63],
    [x, y - 68]
  ];

  leaves.forEach(([lx, ly], index) => {
    ctx.fillStyle = index % 2 ? "#527e4c" : "#72965b";
    ctx.beginPath();
    ctx.ellipse(lx, ly, 10, 5, -0.5, 0, Math.PI * 2);
    ctx.fill();
  });
};

  function drawHall() {
    drawBackground();

    // Эмблема университета
    ctx.fillStyle = "#d7b775";
    ctx.font = "55px Georgia";
    ctx.textAlign = "center";
    ctx.fillText("✦", 450, 105);

    ctx.strokeStyle = "#b89b69";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(450, 85, 55, 0, Math.PI * 2);
    ctx.stroke();

// Колонны с зеркалами
[125, 350, 550, 775].forEach(x => {
  // Основание колонны
  ctx.fillStyle = "#8b765f";
  ctx.fillRect(x - 19, 95, 38, 12);
  ctx.fillRect(x - 19, 470, 38, 12);

  // Ствол колонны
  const column = ctx.createLinearGradient(x - 12, 0, x + 12, 0);
  column.addColorStop(0, "#806b58");
  column.addColorStop(0.5, "#d2bda1");
  column.addColorStop(1, "#806b58");

  ctx.fillStyle = column;
  ctx.fillRect(x - 12, 107, 24, 363);

  // Зеркало
  ctx.fillStyle = "#765b45";
  ctx.fillRect(x - 10, 155, 20, 125);

  const mirror = ctx.createLinearGradient(x - 8, 0, x + 8, 0);
  mirror.addColorStop(0, "#708c91");
  mirror.addColorStop(0.5, "#d5e5df");
  mirror.addColorStop(1, "#718e94");

  ctx.fillStyle = mirror;
  ctx.fillRect(x - 7, 158, 14, 119);

  // Блик на зеркале
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 4, 170);
  ctx.lineTo(x - 4, 205);
  ctx.stroke();
});

  // Факультетские двери
doors.forEach(door => {
  const faculty = faculties[door.id];

  drawDoor(
    door.x,
    door.y,
    door.width,
    door.height,
    faculty.door,
    faculty.color
  )
});

    ctx.fillStyle = "#ffffff";
    ctx.font = "italic 17px Georgia";
    ctx.fillText(
      "Выбери дверь, за которой начинается твоя история",
      450,
      445
    );

    drawPlayer();
  }

  // ========================================
  // 4. РИСОВАНИЕ АУДИТОРИИ
  // ========================================

  function drawClassroom() {
    drawBackground();

    const faculty = faculties[state.faculty];
    const roomName = faculty.rooms[state.challenge];

    // Доска
    ctx.fillStyle = "#171c1b";
    ctx.fillRect(240, 65, 420, 180);

    ctx.strokeStyle = "#b69a6d";
    ctx.lineWidth = 6;
    ctx.strokeRect(240, 65, 420, 180);

    ctx.fillStyle = "#e8d9b9";
    ctx.font = "italic 25px Georgia";
    ctx.textAlign = "center";
    ctx.fillText(roomName, 450, 125);

    ctx.fillStyle = "#b8c9b0";
    ctx.font = "14px Arial";
    ctx.fillText(
      "Знание открывает следующую дверь",
      450,
      165
    );

    ctx.fillStyle = faculty.color;
    ctx.font = "35px Georgia";
    ctx.fillText("✦", 450, 215);

    // Столы
    [175, 725].forEach(x => {
      ctx.fillStyle = "#5d4030";
      ctx.fillRect(x - 55, 310, 110, 50);

      ctx.fillStyle = "#a15e4a";
      ctx.fillRect(x - 35, 298, 35, 12);

      ctx.fillStyle = "#4b6680";
      ctx.fillRect(x + 5, 294, 32, 16);
    });

    // Стол с заданием
    ctx.fillStyle = "#674a35";
    ctx.fillRect(355, 385, 190, 65);

    ctx.strokeStyle = "#c2a06e";
    ctx.lineWidth = 3;
    ctx.strokeRect(355, 385, 190, 65);

    ctx.fillStyle = "#e9d7b6";
    ctx.font = "12px Arial";
    ctx.fillText("СТОЛ С ЗАДАНИЕМ", 450, 427);

    // Книги
    ctx.fillStyle = "#9d5847";
    ctx.fillRect(375, 367, 45, 18);

    ctx.fillStyle = "#3f6375";
    ctx.fillRect(425, 363, 50, 22);

    ctx.fillStyle = "#c0a16d";
    ctx.fillRect(480, 370, 35, 15);

    // Дверь в следующую комнату
    drawDoor(
      720,
      260,
      80,
      135,
      state.answered ? "ОТКРЫТО" : "ЗАПЕРТО",
      state.answered ? "#8baf88" : "#77706b"
    );

    drawPlayer();
  }


  // ========================================
  // 5. ПЕРСОНАЖ
  // ========================================

  function drawPlayer() {
  const p = state.player;

  // Тень под ногами
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 10, 17, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Рюкзак
  ctx.fillStyle = "#806044";
  ctx.beginPath();
  ctx.roundRect(p.x - 15, p.y - 2, 9, 20, 4);
  ctx.fill();

  // Ноги — обычные брюки
  ctx.fillStyle = "#344354";
  ctx.fillRect(p.x - 9, p.y + 3, 7, 12);
  ctx.fillRect(p.x + 2, p.y + 3, 7, 12);

  // Обувь
  ctx.fillStyle = "#382b27";
  ctx.beginPath();
  ctx.ellipse(p.x - 6, p.y + 15, 6, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(p.x + 6, p.y + 15, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Свитер
  ctx.fillStyle = "#78918b";
  ctx.beginPath();
  ctx.roundRect(p.x - 12, p.y - 7, 24, 17, 5);
  ctx.fill();

  // Рукава
  ctx.fillStyle = "#78918b";
  ctx.fillRect(p.x - 15, p.y - 4, 5, 12);
  ctx.fillRect(p.x + 10, p.y - 4, 5, 12);

  // Руки
  ctx.fillStyle = "#d9b18c";
  ctx.beginPath();
  ctx.arc(p.x - 13, p.y + 8, 3, 0, Math.PI * 2);
  ctx.arc(p.x + 13, p.y + 8, 3, 0, Math.PI * 2);
  ctx.fill();

  // Шея
  ctx.fillStyle = "#d9b18c";
  ctx.fillRect(p.x - 4, p.y - 12, 8, 7);

  // Голова
  ctx.fillStyle = "#e0bb98";
  ctx.beginPath();
  ctx.arc(p.x, p.y - 17, 10, 0, Math.PI * 2);
  ctx.fill();

  // Волосы
  ctx.fillStyle = "#594238";
  ctx.beginPath();
  ctx.arc(p.x, p.y - 20, 10, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(p.x - 8, p.y - 17, 3, 6, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Лицо
  ctx.fillStyle = "#45352f";
  ctx.beginPath();
  ctx.arc(p.x - 4, p.y - 16, 1, 0, Math.PI * 2);
  ctx.arc(p.x + 4, p.y - 16, 1, 0, Math.PI * 2);
  ctx.fill();
}

  // ========================================
  // 6. ПОИСК БЛИЖАЙШЕГО ОБЪЕКТА
  // ========================================

  function nearObject() {
    const p = state.player;

if (state.scene === "hall") {
  for (const door of doors) {
    const x = door.x + door.width / 2;
    const y = door.y + door.height / 2;

    if (Math.hypot(p.x - x, p.y - y) < 105) {
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
        Math.hypot(p.x - 760, p.y - 325) < 105
      ) {
        return { type: "nextDoor" };
      }
    }

    return null;
  }

  // ========================================
  // 7. ВЗАИМОДЕЙСТВИЕ
  // ========================================

  function interact() {
    if (
      !state.started ||
      state.questionOpen ||
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

  function enterFaculty(id) {
    state.faculty = id;
    state.challenge = 0;
    state.answered = false;
    state.scene = "classroom";

    state.player.x = 450;
    state.player.y = 510;

    updateInterface();
  }

  function goNextRoom() {
    if (!state.answered) return;

    if (state.challenge < faculties[state.faculty].tasks.length - 1) {
      state.challenge++;
      state.answered = false;

      state.player.x = 450;
      state.player.y = 510;

      updateInterface();
    } else {
      finishGame();
    }
  }

  // ========================================
  // 8. ЗАДАНИЯ
  // ========================================

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
      button.textContent = `${["А", "Б", "В"][index]}. ${answer}`;

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

  finishIntro.innerHTML =
    `Поздравляем! Ты успешно прошёл(ла) маршрут
    <strong>«${faculty.short}».</strong>`;

  ui.finishWindow.hidden = false;
  state.started = false;
}

  function returnToHall() {
    ui.finishWindow.hidden = true;

    state.started = true;
    state.scene = "hall";
    state.faculty = null;
    state.challenge = 0;
    state.answered = false;

    state.player.x = 450;
    state.player.y = 510;

    updateInterface();
  }

  // ========================================
  // 10. ИНТЕРФЕЙС
  // ========================================

  function updateInterface() {
    if (state.scene === "hall") {
      ui.location.textContent = "Главный холл";
      ui.route.textContent = "Пока не выбран";
      ui.progress.textContent = "0 / 3";
    } else {
      const faculty = faculties[state.faculty];

      ui.location.textContent =
        faculty.rooms[state.challenge];

      ui.route.textContent = faculty.short;

      ui.progress.textContent =
        `${state.challenge + (state.answered ? 1 : 0)} / 3`;
    }
  }

  // ========================================
  // 11. ДВИЖЕНИЕ
  // ========================================

  function update(dt) {
    if (!state.started || state.questionOpen) {
      ui.hint.hidden = true;
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
          "Нажми E, чтобы войти на факультет";

      } else if (state.nearby.type === "desk") {
        ui.hint.textContent =
          "Нажми E, чтобы получить задание";

      } else {
        ui.hint.textContent =
          "Нажми E, чтобы пройти в следующую комнату";
      }
    }

    if (ui.backButton) {
        ui.backButton.hidden = state.scene === "hall";
    }
  }

  // ========================================
  // 12. ИГРОВОЙ ЦИКЛ
  // ========================================

  function render() {
    if (state.scene === "hall") {
      drawHall();
    } else {
      drawClassroom();
    }
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
// МОБИЛЬНОЕ УПРАВЛЕНИЕ
// ========================================

const activePointers = new Map();

document.querySelectorAll(".control-button").forEach(button => {
  const key = button.dataset.key;

  button.addEventListener("pointerdown", event => {
    event.preventDefault();

    state.keys.add(key);
    activePointers.set(event.pointerId, key);
  });
});

function releasePointer(event) {
  const key = activePointers.get(event.pointerId);

  if (key) {
    state.keys.delete(key);
    activePointers.delete(event.pointerId);
  }
}

window.addEventListener("pointerup", releasePointer);
window.addEventListener("pointercancel", releasePointer);

const mobileInteract = $("mobileInteract");

if (mobileInteract) {
  mobileInteract.addEventListener("pointerdown", event => {
    event.preventDefault();
    interact();
  });
}
  // ========================================
  // 14. КНОПКИ И ЗАПУСК
  // ========================================

  $("startButton").addEventListener("click", () => {
    state.started = true;
    ui.welcome.hidden = true;
  });

  $("closeQuestion").addEventListener("click", closeQuestion);

$("returnButton").addEventListener("click", returnToHall);

if (ui.backButton) {
  ui.backButton.addEventListener("click", returnToHall);
}

updateInterface();
requestAnimationFrame(gameLoop);

})();