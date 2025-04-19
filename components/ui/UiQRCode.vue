<template>
  <canvas ref="canvasRef"></canvas>
</template>

<script setup>
import { ref, onMounted, watch, defineProps } from "vue";

const props = defineProps({
  text: { type: String, required: true },
  size: { type: Number, default: 250 },
});

const canvasRef = ref(null);

watch(() => props.text, draw);
onMounted(draw);

const qrVersions = Array.from({ length: 40 }, (_, i) => {
  const version = i + 1;
  const size = 21 + (version - 1) * 4;

  const dataCapacities = [
    19, 34, 55, 80, 108, 136, 156, 194, 232, 274, 324, 370, 428, 461, 523, 589,
    647, 721, 795, 861, 932, 1006, 1094, 1174, 1276, 1370, 1468, 1531, 1631,
    1735, 1843, 1955, 2071, 2191, 2306, 2434, 2566, 2702, 2812, 2953,
  ];
  return {
    version,
    size,
    dataCodewords: dataCapacities[i],
    ecCodewords: Math.floor(dataCapacities[i] * 0.3),
  };
});

function draw() {
  console.log("----- draw() START -----");
  const { matrix, size: matrixSize } = generateMatrix(props.text);

  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d");

  const scale = Math.floor(props.size / matrixSize);
  const margin = 4;

  canvas.width = (matrixSize + margin * 2) * scale;
  canvas.height = (matrixSize + margin * 2) * scale;
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#000";
  for (let y = 0; y < matrixSize; y++) {
    for (let x = 0; x < matrixSize; x++) {
      if (matrix[y][x]) {
        ctx.fillRect((x + margin) * scale, (y + margin) * scale, scale, scale);
      }
    }
  }

  console.log(`draw() DONE => Canvas Size: ${canvas.width}x${canvas.height}`);
  console.log("-------------------------");
}

function generateMatrix(text) {
  console.log("generateMatrix() => text =", text);

  const bytes = Array.from(new TextEncoder().encode(text));
  console.log("TextEncoder => bytes length:", bytes.length, bytes);

  const mode = 0b0100;

  const requiredBits = 4 + 8 + bytes.length * 8 + 4;
  const requiredBytes = Math.ceil(requiredBits / 8);

  const versionInfo = qrVersions.find((v) => v.dataCodewords >= requiredBytes);
  if (!versionInfo) {
    const err = "Слишком длинный текст, не влезает даже в версию 40 (L)";
    console.error(err);
    throw new Error(err);
  }

  const { size, version, dataCodewords, ecCodewords } = versionInfo;

  console.log(
    `Chosen version = ${version}, matrixSize = ${size}`,
    `\ndataCodewords = ${dataCodewords}, ecCodewords = ${ecCodewords}`
  );

  const matrix = Array.from({ length: size }, () => Array(size).fill(null));

  const set = (x, y, val) => {
    if (x >= 0 && y >= 0 && x < size && y < size) {
      matrix[y][x] = val;
    }
  };

  drawFinderPattern(matrix, set, size);
  drawTimingPattern(matrix, set, size);

  const alignmentCoords = getAlignmentPatternPositions(version);
  alignmentCoords.forEach((rowCoord) => {
    alignmentCoords.forEach((colCoord) => {
      if (!inFinderArea(colCoord, rowCoord, size)) {
        drawAlignment(matrix, set, colCoord, rowCoord);
      }
    });
  });

  set(8, size - 8, 1);

  const data = encodeText(bytes, mode, version, dataCodewords);
  console.log(
    `encodeText => data length: ${data.length}/${dataCodewords}`,
    data
  );

  const ecc = generateECC(data, ecCodewords);
  console.log(`generateECC => ecc length: ${ecc.length}/${ecCodewords}`, ecc);

  const codewords = interleaveBlocks([data], [ecc]);
  console.log(
    `interleaveBlocks => total codewords: ${codewords.length}`,
    codewords
  );

  const bits = codewords.flatMap((b) => toBits(b, 8));
  console.log(`Total bits: ${bits.length}`);

  let dirUp = true;
  let xPos = size - 1;
  let bitIndex = 0;

  while (xPos > 0) {
    if (xPos === 6) xPos--; // пропускаем вертикальную timing-линию
    for (let y = 0; y < size; y++) {
      const row = dirUp ? size - 1 - y : y;
      for (let colShift = 0; colShift < 2; colShift++) {
        const col = xPos - colShift;
        if (matrix[row][col] === null) {
          const bit = bits[bitIndex++] || 0;
          // Маска #0 => (row+col) % 2 ? 1 : 0
          const mask = (row + col) % 2 === 0 ? 1 : 0;
          matrix[row][col] = bit ^ mask;
        }
      }
    }
    xPos -= 2;
    dirUp = !dirUp;
  }
  console.log("Data bits placed into matrix, bitIndex =", bitIndex);

  // Прописываем биты «Format Info» (EC-L, маска=0)
  applyFormatInfo(matrix, 0, "L");

  // Прописываем биты «Version Info» (только если version >= 7)
  if (version >= 7) {
    applyVersionInfo(matrix, version);
    console.log("Version info applied.");
  }

  // Все оставшиеся null = 0 (белые)
  let unfilled = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (matrix[y][x] === null) {
        matrix[y][x] = 0;
        unfilled++;
      }
    }
  }
  if (unfilled > 0) {
    console.log(`Unfilled cells turned white: ${unfilled}`);
  }

  console.log("generateMatrix => done. Returning matrix.");
  return { matrix, size };
}

// --------------------------------------------------
// Функции для отрисовки служебных паттернов
// --------------------------------------------------

function drawFinderPattern(matrix, set, size) {
  const drawFinder = (topX, topY) => {
    for (let dy = 0; dy < 7; dy++) {
      for (let dx = 0; dx < 7; dx++) {
        const xx = topX + dx;
        const yy = topY + dy;
        const outer = dx === 0 || dx === 6 || dy === 0 || dy === 6;
        const inner = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
        set(xx, yy, outer || inner ? 1 : 0);
      }
    }
    // Белая обводка вокруг
    for (let i = -1; i <= 7; i++) {
      set(topX + i, topY - 1, 0);
      set(topX + i, topY + 7, 0);
      set(topX - 1, topY + i, 0);
      set(topX + 7, topY + i, 0);
    }
  };

  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);
  console.log("Finder patterns drawn.");
}

function drawTimingPattern(matrix, set, size) {
  for (let i = 8; i < size - 8; i++) {
    set(i, 6, i % 2 === 0 ? 1 : 0);
    set(6, i, i % 2 === 0 ? 1 : 0);
  }
  console.log("Timing patterns drawn.");
}

function drawAlignment(matrix, set, cx, cy) {
  const pattern = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ];
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      set(cx - 2 + x, cy - 2 + y, pattern[y][x]);
    }
  }
}

// --------------------------------------------------
// Таблица координат alignment-паттернов
// --------------------------------------------------
function getAlignmentPatternPositions(version) {
  const alignmentMap = {
    1: [],
    2: [6, 18],
    3: [6, 22],
    4: [6, 26],
    5: [6, 30],
    6: [6, 34],
    7: [6, 22, 38],
    8: [6, 24, 42],
    9: [6, 26, 46],
    10: [6, 28, 50],
    11: [6, 30, 54],
    12: [6, 32, 58],
    13: [6, 34, 62],
    14: [6, 26, 46, 66],
    15: [6, 26, 48, 70],
    16: [6, 26, 50, 74],
    17: [6, 30, 54, 78],
    18: [6, 30, 56, 82],
    19: [6, 30, 58, 86],
    20: [6, 34, 62, 90],
    21: [6, 28, 50, 72, 94],
    22: [6, 26, 50, 74, 98],
    23: [6, 30, 54, 78, 102],
    24: [6, 28, 54, 80, 106],
    25: [6, 32, 58, 84, 110],
    26: [6, 30, 58, 86, 114],
    27: [6, 34, 62, 90, 118],
    28: [6, 26, 50, 74, 98, 122],
    29: [6, 30, 54, 78, 102, 126],
    30: [6, 26, 52, 78, 104, 130],
    31: [6, 30, 56, 82, 108, 134],
    32: [6, 34, 60, 86, 112, 138],
    33: [6, 30, 58, 86, 114, 142],
    34: [6, 34, 62, 90, 118, 146],
    35: [6, 30, 54, 78, 102, 126, 150],
    36: [6, 24, 50, 76, 102, 128, 154],
    37: [6, 28, 54, 80, 106, 132, 158],
    38: [6, 32, 58, 84, 110, 136, 162],
    39: [6, 26, 54, 82, 110, 138, 166],
    40: [6, 30, 58, 86, 114, 142, 170],
  };
  return alignmentMap[version] || [];
}

// Проверяем, не входим ли мы в зону finder (7×7 в углу)
function inFinderArea(x, y, size) {
  if (x < 7 && y < 7) return true; // Левая верхняя
  if (x >= size - 7 && y < 7) return true; // Правая верхняя
  if (x < 7 && y >= size - 7) return true; // Левая нижняя
  return false;
}

// --------------------------------------------------
// Простейший вывод числа num в массив бит (старший бит первым)
// --------------------------------------------------
function toBits(num, size) {
  const bits = [];
  for (let i = 0; i < size; i++) {
    bits.unshift(num & 1);
    num >>>= 1;
  }
  return bits;
}

// --------------------------------------------------
// Кодирование текста в байты + добавка «pad»-байтов (0xEC / 0x11)
// --------------------------------------------------
function encodeText(bytes, mode, version, maxLen) {
  console.log("encodeText() => version =", version);
  const bits = [];

  // 4 бита: режим (Byte mode)
  bits.push(...toBits(mode, 4));

  // Для Byte Mode: если версия < 10 => 8 бит длины, иначе 16
  const lengthBits = version < 10 ? 8 : 16;
  console.log(
    `Using ${lengthBits}-bit length field. text length =`,
    bytes.length
  );

  bits.push(...toBits(bytes.length, lengthBits));

  // Сами байты (каждый по 8 бит)
  for (const b of bytes) {
    bits.push(...toBits(b, 8));
  }

  // Терминатор (4 бита)
  bits.push(0, 0, 0, 0);

  // Дополняем до кратности 8
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  // Превращаем массив бит в массив байт
  let result = [];
  for (let i = 0; i < bits.length; i += 8) {
    const byte = parseInt(bits.slice(i, i + 8).join(""), 2);
    result.push(byte);
  }

  // Заполняем оставшиеся codewords пад-байтами 0xEC, 0x11 по очереди
  const pad = [0xec, 0x11];
  let padIndex = 0;
  while (result.length < maxLen) {
    result.push(pad[padIndex % 2]);
    padIndex++;
  }

  console.log(`encodeText => final codewords: ${result.length}/${maxLen}`);
  return result;
}

// --------------------------------------------------
// Исправленная функция generateECC (Reed-Solomon)
// --------------------------------------------------
function generateECC(data, ecLength) {
  console.log(`generateECC() => ecLength = ${ecLength}`);
  const gf = { exp: [], log: [] };

  // Инициализация поля GF(2^8)
  let x = 1;
  for (let i = 0; i < 256; i++) {
    gf.exp[i] = x;
    gf.log[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 256; i < 512; i++) {
    gf.exp[i] = gf.exp[i - 256];
  }

  // Генераторный полином степени ecLength
  let generator = [1];
  for (let i = 0; i < ecLength; i++) {
    const next = Array(generator.length + 1).fill(0);
    for (let j = 0; j < generator.length; j++) {
      const val = generator[j];
      // умножаем на (x + α^i)
      next[j] ^= gf.exp[(gf.log[val] + i) % 255];
      next[j + 1] ^= val;
    }
    generator = next;
  }

  // Изначально ECC = массив из ecLength нулей
  let ecc = Array(ecLength).fill(0);

  // «Делим» polynom(data) на generator
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ ecc[0];
    ecc.shift();
    ecc.push(0);
    if (factor !== 0) {
      for (let j = 0; j < ecLength; j++) {
        ecc[j] ^= gf.exp[(gf.log[factor] + gf.log[generator[j]]) % 255];
      }
    }
  }
  return ecc;
}

// --------------------------------------------------
// Interleave для одного блока
// --------------------------------------------------
function interleaveBlocks(dataBlocks, eccBlocks) {
  const result = [];
  const maxData = Math.max(...dataBlocks.map((b) => b.length));
  for (let i = 0; i < maxData; i++) {
    for (const block of dataBlocks) {
      if (i < block.length) {
        result.push(block[i]);
      }
    }
  }
  const maxECC = Math.max(...eccBlocks.map((b) => b.length));
  for (let i = 0; i < maxECC; i++) {
    for (const block of eccBlocks) {
      if (i < block.length) {
        result.push(block[i]);
      }
    }
  }
  return result;
}

// --------------------------------------------------
// Запись Format Info (5 бит + 10 бит BCH, затем XOR 0x5412)
// --------------------------------------------------
function applyFormatInfo(matrix, mask, level) {
  const levelBitsMap = { L: 1, M: 0, Q: 3, H: 2 };
  const levelBits = levelBitsMap[level];
  const formatVal = (levelBits << 3) | mask; // (EC-level << 3) | mask
  let bch = getBCHCode(formatVal, 0x537, 10); // BCH (полином 0x537, 10 бит)
  const format15 = ((formatVal << 10) | bch) ^ 0x5412;
  const bits = toBits(format15, 15);

  const n = matrix.length;
  const formatPosA = [
    [0, 8],
    [1, 8],
    [2, 8],
    [3, 8],
    [4, 8],
    [5, 8],
    [7, 8],
    [8, 8],
    [8, 7],
    [8, 5],
    [8, 4],
    [8, 3],
    [8, 2],
    [8, 1],
    [8, 0],
  ];
  const formatPosB = [
    [n - 1, 8],
    [n - 2, 8],
    [n - 3, 8],
    [n - 4, 8],
    [n - 5, 8],
    [n - 6, 8],
    [n - 7, 8],
    [8, n - 8],
    [8, n - 7],
    [8, n - 6],
    [8, n - 5],
    [8, n - 4],
    [8, n - 3],
    [8, n - 2],
    [8, n - 1],
  ];

  for (let i = 0; i < 15; i++) {
    const [xA, yA] = formatPosA[i];
    const [xB, yB] = formatPosB[i];
    matrix[yA][xA] = bits[i];
    matrix[yB][xB] = bits[i];
  }
}

// --------------------------------------------------
// Запись Version Info (если версия >= 7)
// --------------------------------------------------
function applyVersionInfo(matrix, version) {
  let bch = getBCHCode(version, 0x1f25, 12);
  const ver18 = (version << 12) | bch;
  const bits = toBits(ver18, 18);

  const n = matrix.length;
  let idx = 0;
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      matrix[n - 11 + j][i] = bits[idx];
      matrix[i][n - 11 + j] = bits[idx];
      idx++;
    }
  }
}

// --------------------------------------------------
// BCH-кодирование
// --------------------------------------------------
function getBCHCode(value, poly, polyBits) {
  let v = value << polyBits;
  while (numHighestPower(v) >= numHighestPower(poly)) {
    const shift = numHighestPower(v) - numHighestPower(poly);
    v ^= poly << shift;
  }
  return v;
}

function numHighestPower(val) {
  let p = 0;
  while (val > 0) {
    val >>= 1;
    p++;
  }
  return p;
}
</script>
