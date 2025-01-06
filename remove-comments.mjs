// remove-comments.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import recast from 'recast';
import typescriptParser from 'recast/parsers/typescript.js'; // Убедитесь, что файл существует

// Получаем путь к текущему файлу (для работы с ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Список директорий и файлов для исключения
const excludedDirs = [
  'node_modules',
  '.next',
  'dist',
  'build',
  'coverage',
  '.storybook',
  'stories',
  'readme',
  '.yarn',
  'packages/shared/prisma/schema',
];

const excludedFiles = [
  '*.d.ts', // Исключаем файлы деклараций TypeScript
  'next.config.ts', // Если нужно исключить конкретный файл
  // Добавьте другие файлы для исключения по необходимости
];

// Функция для проверки, находится ли путь в исключённой директории или является исключённым файлом
const isExcluded = (fullPath) => {
  const normalizedPath = path.normalize(fullPath);
  const pathSegments = normalizedPath.split(path.sep);

  // Проверяем, содержит ли путь любой из исключённых директорий
  if (excludedDirs.some((dir) => pathSegments.includes(dir))) {
    return true;
  }

  // Проверяем, соответствует ли файл одному из шаблонов исключений
  const fileName = path.basename(fullPath);
  return excludedFiles.some((pattern) => {
    if (pattern.startsWith('*')) {
      // Простая проверка шаблона типа '*.d.ts'
      const ext = pattern.slice(1); // '.d.ts'
      return fileName.endsWith(ext);
    }
    return fileName === pattern;
  });
};

// Функция для удаления комментариев из AST
const removeComments = (ast) => {
  recast.types.visit(ast, {
    visitNode(path) {
      // Удаляем все типы комментариев
      if (path.node.leadingComments) {
        delete path.node.leadingComments;
      }
      if (path.node.trailingComments) {
        delete path.node.trailingComments;
      }
      if (path.node.innerComments) {
        delete path.node.innerComments;
      }
      this.traverse(path);
    },
  });
};

// Функция для обработки одного файла с использованием Recast
const processFile = (filePath) => {
  try {
    console.log(`🔍 Обрабатывается файл: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Парсим содержимое файла в AST с использованием Recast
    const ast = recast.parse(content, {
      parser: typescriptParser,
    });

    // Удаляем комментарии из AST
    removeComments(ast);

    // Генерируем код без комментариев
    const output = recast.print(ast).code;

    // Проверяем, удалены ли комментарии
    const hasComments = /\/\/|\/\*|\*\//.test(output);
    if (hasComments) {
      console.warn(`⚠️ Комментарии остались в файле: ${filePath}`);
    } else {
      // Создаём резервную копию файла перед записью (закомментировано)
      // fs.copyFileSync(filePath, `${filePath}.bak`);

      // Записываем обновлённый код обратно в файл
      fs.writeFileSync(filePath, output, 'utf-8');
      console.log(`✅ Комментарии удалены из файла: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Ошибка при обработке файла ${filePath}: ${error.message}`);
  }
};

// Рекурсивная функция для обработки директорий
const processDirectory = (dirPath) => {
  try {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const fullPath = path.join(dirPath, file);

      if (fs.lstatSync(fullPath).isDirectory()) {
        if (!isExcluded(fullPath)) {
          // Рекурсивно обрабатываем папки, если они не исключены
          processDirectory(fullPath);
        }
      } else if (['.js', '.jsx', '.ts', '.tsx'].some((ext) => fullPath.endsWith(ext))) {
        // Обрабатываем только файлы с нужными расширениями и не являющиеся исключёнными
        if (!isExcluded(fullPath)) {
          processFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Ошибка при обработке директории ${dirPath}: ${error.message}`);
  }
};

// Определяем корневые директории для обработки
const rootDirs = ['./apps', './packages']; // Добавьте другие корневые директории при необходимости

// Запуск обработки
rootDirs.forEach((rootDir) => {
  const absolutePath = path.resolve(__dirname, rootDir);
  if (fs.existsSync(absolutePath)) {
    processDirectory(absolutePath);
  } else {
    console.warn(`⚠️ Директория не найдена: ${absolutePath}`);
  }
});

console.log('🎉 Комментарии удалены из всех указанных файлов!');
