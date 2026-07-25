# 09 — Acceptance Criteria & Definition of Done

Чеклист приёмки. Генератор после завершения работ **обязан** пройти каждый пункт. Пункт провален → доработать код, не оправдываться.

---

## 9.1 Build & Run

- [ ] `npm install` завершается без ошибок
- [ ] `npm start` / `ng serve` поднимает приложение
- [ ] Консоль браузера без ошибок runtime при старте
- [ ] Нет красных ошибок Angular (NG0xxx) в консоли
- [ ] Zoneless: play/pause и слайдеры обновляют UI без Zone.js hacks
- [ ] Title / brand: **StellarEvolve Pro**

---

## 9.2 Научная достоверность / физика

- [ ] Масса задаётся в диапазоне **0.08–150** \(M_\odot\)
- [ ] Металличность Z задаётся и влияет на стартовые/MS параметры (хотя бы слабо)
- [ ] Есть кусочный \(L(M)\) со сегментом \(L \propto M^{3.5}\) для средних масс
- [ ] \(T_{\mathrm{eff}}\) согласован со Stefan–Boltzmann через \(L\) и \(R\)
- [ ] Стадии включают путь до остатка (не только MS)
- [ ] Для \(M\sim1\): путь к planetary nebula / white dwarf
- [ ] Для \(M\sim8+\): supernova и NS или BH
- [ ] Для высокой массы (\(\sim25+\)): black hole ветка
- [ ] Используется предел Чандрасекара и Оппенгеймера–Волкова в remnant logic
- [ ] Выгорание H→He (и далее для массивных) меняет composition
- [ ] Mass-loss на гигантских стадиях уменьшает массу (или явно документирован нулевой wind только на MS)
- [ ] Adaptive `dt`: на MS шаг заметно больше, чем на быстрых пост-MS / SN proxy
- [ ] `remainingLifeYears` конечен и уменьшается по мере старения

---

## 9.3 Stellar Canvas

- [ ] Звезда рисуется радиальным градиентом + glow
- [ ] Цвет зависит от спектрального класса O–M
- [ ] Пульсация видна на нестабильных/гигантских стадиях
- [ ] Тумблер «Разрез ядра» показывает core / radiative / convective
- [ ] В разрезе указан доминирующий элемент ядра
- [ ] Remnant стадии имеют отличимый визуал (WD/NS/BH)
- [ ] Resize окна не ломает canvas (DPR учтён)
- [ ] Screenshot сохраняет PNG stellar canvas

---

## 9.4 HR Diagram (SVG)

- [ ] Ось X: \(T_{\mathrm{eff}}\) от 40 000 до 2 000 K, **инвертирована**
- [ ] Подписи спектральных классов присутствуют
- [ ] Ось Y: \(\log L/L_\odot\) от \(10^{-5}\) до \(10^{6}\)
- [ ] Видны статическая MS и области giants / white dwarfs
- [ ] Эволюционный трек растёт во время play
- [ ] Маркер текущего положения синхронизирован со state
- [ ] Клик по точке трека делает rewind (pause + truncate future + restore snapshot)
- [ ] Нет Chart.js / D3 / Plotly

---

## 9.5 Control Room / Time / Telemetry

- [ ] Слайдеры M и Z работают в idle; disabled после старта до Reset
- [ ] Play / Pause / Reset работают
- [ ] Ускоритель времени меняет скорость эволюции
- [ ] HUD показывает adaptive `dt` (humanized)
- [ ] Телеметрия: возраст, оставшаяся жизнь, стадия, burning, M/R/L/Teff, process text
- [ ] Composition chart показывает H, He, C/O, Fe
- [ ] Terminal banner для remnant

---

## 9.6 Extended features

- [ ] Пресеты 0.2 / 1 / 8 / 25 применяются и сбрасывают симуляцию
- [ ] i18n RU↔EN переводит UI (stage/process/toolbar)
- [ ] Theme dark↔light переключает CSS variables панелей
- [ ] Hotkeys: Space, R, C, 1–4, S, T, G, H, Esc
- [ ] Hotkeys help overlay открывается/закрывается

---

## 9.7 Tests

- [ ] `npm test` проходит для обязательных specs
- [ ] mass-luminosity / stefan-boltzmann / spectral-class / adaptive-dt / remnant / star-step покрыты

---

## 9.8 Запреты в коде (grep-проверка)

- [ ] Нет `// TODO`, `// ...`, `...existing code...`
- [ ] Нет `*ngIf`, `*ngFor`, `*ngSwitch`
- [ ] Нет BehaviorSubject/Subject как хранилища UI/sim state
- [ ] Нет `tailwindcss` в package.json
- [ ] Нет `three` / `chart.js` / `d3` / `plotly`
- [ ] UI компоненты не содержат формул \(L\propto M^{3.5}\) / remnant thresholds (только domain/services)

---

## 9.9 File checklist

- [ ] Все пути из [08-file-checklist.md](08-file-checklist.md) существуют
- [ ] Barrel `stellar.interfaces.ts` реэкспортирует модели
- [ ] Словари RU и EN полные (нет массовых missing keys)

---

## 9.10 Ручной сценарий приёмки (обязательно проиграть)

1. Старт → пресет **Sun** → Play → увидеть движение по MS вправо-вверх/трек → дождаться (с accel) ухода с MS.
2. Reset → пресет **0.2** → Play → убедиться, что звезда краснее/тусклее, жизнь длиннее.
3. Reset → пресет **25** → Play + высокий accel → увидеть supergiant/SN/BH ветку.
4. Во время трека кликнуть назад по HR → rewind работает.
5. Включить разрез ядра → зоны видны.
6. Переключить EN и light theme → UI жив.
7. Screenshot → файл скачался.

---

## 9.11 Финальная декларация генератора

После выполнения выведи короткий отчёт:

```
StellarEvolve Pro — DONE
- start: npm start
- test: npm test
- checklist 08: OK
- acceptance 09: OK
```

Если что-то не ок — не пиши DONE; добей пробелы.
