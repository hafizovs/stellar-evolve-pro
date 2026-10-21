## Live demo

https://hafizovs.github.io/stellar-evolve-pro/

# StellarEvolve Pro

**StellarEvolve Pro** — интерактивный симулятор эволюции звёзд и HR-диаграммы на Angular 22+. Приложение использует параметрическую модель (scaling relations, Stefan–Boltzmann, стадийную машину), а **не** полный код MESA/1D hydro.

## Установка и запуск

```bash
npm install
npm start
```

Откройте `http://localhost:4200/`.

## Тесты и сборка

```bash
npm test
npm run build
```

## Горячие клавиши

| Клавиша | Действие |
|---------|----------|
| Space | Play / Pause |
| R | Reset |
| C | Разрез ядра |
| 1–4 | Пресеты масс (0.2 / 1 / 8 / 25 M☉) |
| S | Screenshot Canvas |
| T | Тема dark/light |
| G | Язык RU/EN |
| H | Справка по клавишам |
| Esc | Закрыть overlay |

## Модель

Образовательная параметрическая эволюция: главная последовательность, гиганты, сверхновая/ПТ, остатки (WD/NS/BH) с учётом пределов Чандрасекара и Оппенгеймера–Волкова. Числа и пороги заданы в `docs/` родительского пакета `stellar_evolve_pro`.

**Disclaimer:** это упрощённая параметрическая модель для визуализации и обучения, не замена MESA или других 1D stellar evolution codes.
