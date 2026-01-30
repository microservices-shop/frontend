import { Product, Category, Order } from './types';

export const MOCK_PRODUCTS: Product[] = [
  // --- SMARTPHONES ---
  {
    id: "p1",
    name: "iPhone 15 Pro Max",
    price: 135000,
    oldPrice: 145000,
    description: "Прорывной iPhone с титановым дизайном, чипом A17 Pro и самой мощной системой камер в истории iPhone.",
    category: Category.SMARTPHONES,
    rating: 4.9,
    stock: 50,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Экран": "6.7 дюймов OLED", "Процессор": "A17 Pro", "Память": "256ГБ" }
  },
  {
    id: "p2",
    name: "Samsung Galaxy S24 Ultra",
    price: 125000,
    description: "Galaxy AI уже здесь. Добро пожаловать в эру мобильного ИИ. С самым мощным процессором и камерой.",
    category: Category.SMARTPHONES,
    rating: 4.8,
    stock: 40,
    isActive: true,
    images: ["https://images.samsung.com/is/image/samsung/p6pim/ru/2401/gallery/ru-galaxy-s24-s928-sm-s928bztgcau-thumb-539333587?$216_216_PNG$"],
    attributes: { "Экран": "6.8 дюймов AMOLED", "Процессор": "Snapdragon 8 Gen 3", "Стилус": "S-Pen в комплекте" }
  },
  {
    id: "p3",
    name: "Pixel 10",
    price: 95000,
    oldPrice: 105000,
    description: "Телефон профессионального уровня от Google с продвинутым ИИ и лучшей камерой для фотосъемки.",
    category: Category.SMARTPHONES,
    rating: 4.7,
    stock: 35,
    isActive: true,
    images: ["https://lh3.googleusercontent.com/d0RQTNwa0bQwQ3SrQFBBmiOX1k1-oWDzGBsFdoGwhC69uT5MGQZVefMBBh4r0oiWJWlPN5eJtgqa1rTuoLuZlKtQ0aUi8LJSBQ=s6000-w6000-e365-rw-v0-nu"],
    attributes: { "Экран": "6.7 дюймов LTPO", "Процессор": "Tensor G3", "Камера": "50Мп Основная" }
  },
  {
    id: "p4",
    name: "OnePlus 12",
    price: 85000,
    description: "Невероятно плавный. Настоящий убийца флагманов с потрясающе быстрой зарядкой.",
    category: Category.SMARTPHONES,
    rating: 4.6,
    stock: 20,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Зарядка": "100Вт SuperVOOC", "Процессор": "Snapdragon 8 Gen 3", "ОЗУ": "16ГБ" }
  },
  {
    id: "p5",
    name: "Xiaomi 14 Ultra",
    price: 110000,
    description: "Разработано совместно с Leica. Камера, которая умеет звонить.",
    category: Category.SMARTPHONES,
    rating: 4.7,
    stock: 15,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1695043513337-dec49d375276?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Камера": "Leica Quad Cam", "Сенсор": "1-дюймовый тип", "Аккумулятор": "5000мАч" }
  },
  {
    id: "p6",
    name: "Sony Xperia 1 V",
    price: 115000,
    description: "Создан для творцов. Оснащен сенсором Exmor T следующего поколения.",
    category: Category.SMARTPHONES,
    rating: 4.5,
    stock: 10,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1621330396173-e41b1cafd17f?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Экран": "4K HDR OLED", "Аудио": "3.5мм Разъем", "Соотношение": "21:9" }
  },
  {
    id: "p7",
    name: "Nothing Phone (2)",
    price: 65000,
    description: "Переходи на светлую сторону. Уникальный интерфейс Glyph и чистая ОС.",
    category: Category.SMARTPHONES,
    rating: 4.4,
    stock: 25,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1678911820864-e2c567c655d7?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Интерфейс": "Glyph UI", "ОС": "Nothing OS 2.0", "Корпус": "Прозрачный" }
  },
  {
    id: "p8",
    name: "Asus ROG Phone 8",
    price: 105000,
    description: "Больше чем гейминг. Премиальный телефон для серьезных игр.",
    category: Category.SMARTPHONES,
    rating: 4.8,
    stock: 12,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Частота обновления": "165Гц", "Триггеры": "AirTrigger", "Охлаждение": "Активное" }
  },

  // --- LAPTOPS ---
  {
    id: "p9",
    name: "MacBook Air 15 M3",
    price: 155000,
    description: "Невероятно тонкий и потрясающе быстрый. На базе чипа M3.",
    category: Category.LAPTOPS,
    rating: 4.9,
    stock: 30,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Процессор": "M3", "ОЗУ": "8ГБ", "Накопитель": "512ГБ SSD" }
  },
  {
    id: "p10",
    name: "MacBook Pro 16",
    price: 280000,
    description: "Потрясающий. Впечатляющий. Самый мощный MacBook в истории.",
    category: Category.LAPTOPS,
    rating: 5.0,
    stock: 15,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1531297461136-82lw8u8w1?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Процессор": "M3 Max", "ОЗУ": "36ГБ", "Экран": "Liquid Retina XDR" }
  },
  {
    id: "p11",
    name: "Dell XPS 13 Plus",
    price: 180000,
    description: "В два раза мощнее, чем прежде, в том же компактном корпусе.",
    category: Category.LAPTOPS,
    rating: 4.6,
    stock: 20,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1593642632823-8f78536788c6?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Экран": "13.4 OLED", "Процессор": "Intel Core i7", "Дизайн": "Минималистичный" }
  },
  {
    id: "p12",
    name: "HP Spectre x360",
    price: 165000,
    description: "Мастерство исполнения и мощь. Дизайн-трансформер 2-в-1.",
    category: Category.LAPTOPS,
    rating: 4.7,
    stock: 18,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1544731612-de7f96afe55f?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Тип": "2-в-1", "Экран": "Сенсорный OLED", "Стилус": "В комплекте" }
  },
  {
    id: "p13",
    name: "Asus Zephyrus G14",
    price: 195000,
    oldPrice: 210000,
    description: "Самый мощный в мире 14-дюймовый игровой ноутбук.",
    category: Category.LAPTOPS,
    rating: 4.8,
    stock: 10,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Видеокарта": "RTX 4070", "Экран": "120Гц OLED", "Вес": "1.5 кг" }
  },
  {
    id: "p14",
    name: "Lenovo ThinkPad X1 Carbon",
    price: 210000,
    description: "Ультралегкий. Ультрамощный. Золотой стандарт для бизнеса.",
    category: Category.LAPTOPS,
    rating: 4.8,
    stock: 25,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Корпус": "Углеродное волокно", "Клавиатура": "Лучшая в классе", "Безопасность": "vPro" }
  },
  {
    id: "p15",
    name: "Razer Blade 16",
    price: 350000,
    description: "Ультимативная замена настольного ПК. Безумная производительность.",
    category: Category.LAPTOPS,
    rating: 4.9,
    stock: 5,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Видеокарта": "RTX 4090", "Экран": "Dual Mode Mini-LED", "Шасси": "Алюминий" }
  },
  {
    id: "p16",
    name: "Microsoft Surface Laptop 5",
    price: 130000,
    description: "Стиль и скорость. Элегантный и суперлегкий.",
    category: Category.LAPTOPS,
    rating: 4.5,
    stock: 22,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1588872657578-a3d2e184590c?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Экран": "13.5 PixelSense", "Материал": "Алькантара/Металл", "Сенсорный": "Да" }
  },

  // --- HEADPHONES ---
  {
    id: "p17",
    name: "Sony WH-1000XM5",
    price: 35000,
    oldPrice: 42000,
    description: "Лучшие в отрасли наушники с шумоподавлением и премиальным звуком.",
    category: Category.HEADPHONES,
    rating: 4.7,
    stock: 100,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Тип": "Полноразмерные", "Шумоподавление": "Лучшее в классе", "Батарея": "30ч" }
  },
  {
    id: "p18",
    name: "AirPods Max",
    price: 65000,
    description: "Идеальный баланс захватывающего Hi-Fi звука и магии AirPods.",
    category: Category.HEADPHONES,
    rating: 4.6,
    stock: 45,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1628202926206-c63a34b1618f?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Материал": "Нержавеющая сталь", "Аудио": "Пространственное аудио", "Цвета": "5" }
  },
  {
    id: "p19",
    name: "Bose QuietComfort Ultra",
    price: 45000,
    description: "Шумоподавление мирового уровня, тише, чем когда-либо прежде.",
    category: Category.HEADPHONES,
    rating: 4.8,
    stock: 30,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Комфорт": "Премиум", "Режим": "Иммерсивный", "Батарея": "24ч" }
  },
  {
    id: "p20",
    name: "Sennheiser Momentum 4",
    price: 32000,
    description: "Фирменный звук Sennheiser с выдающимся временем автономной работы.",
    category: Category.HEADPHONES,
    rating: 4.5,
    stock: 40,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1585298723682-7115561c51b7?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Батарея": "60ч", "Звук": "Аудиофильский", "Шумоподавление": "Адаптивное" }
  },
  {
    id: "p21",
    name: "Marshall Major IV",
    price: 15000,
    description: "Иконичный дизайн и более 80 часов беспроводного воспроизведения.",
    category: Category.HEADPHONES,
    rating: 4.6,
    stock: 60,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Стиль": "Накладные", "Батарея": "80ч+", "Зарядка": "Беспроводная" }
  },
  {
    id: "p22",
    name: "Sony WF-1000XM5",
    price: 28000,
    description: "Лучшие полностью беспроводные наушники с шумоподавлением.",
    category: Category.HEADPHONES,
    rating: 4.7,
    stock: 80,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Тип": "Внутриканальные", "Драйвер": "Dynamic X", "Размер": "Компактный" }
  },
  {
    id: "p23",
    name: "AirPods Pro (2-го пок.)",
    price: 25000,
    description: "Полностью переосмысленный звук. До 2 раз больше активного шумоподавления.",
    category: Category.HEADPHONES,
    rating: 4.8,
    stock: 120,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Чип": "H2", "Кейс": "MagSafe USB-C", "Аудио": "Адаптивное" }
  },

  // --- WEARABLES ---
  {
    id: "p24",
    name: "Apple Watch Ultra 2",
    price: 90000,
    description: "Самые прочные и функциональные Apple Watch. Созданы для экстремальных условий.",
    category: Category.WEARABLES,
    rating: 4.9,
    stock: 25,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1675789488589-32593b4c90d0?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Корпус": "49мм Титан", "Экран": "3000 нит", "Батарея": "36ч" }
  },
  {
    id: "p25",
    name: "Samsung Galaxy Watch 6 Classic",
    price: 35000,
    description: "Классический вид с вращающимся безелем и продвинутым отслеживанием здоровья.",
    category: Category.WEARABLES,
    rating: 4.6,
    stock: 40,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Безель": "Вращающийся", "Датчик": "BioActive", "ОС": "Wear OS" }
  },
  {
    id: "p26",
    name: "Garmin Fenix 7 Pro",
    price: 85000,
    description: "Мультиспортивные GPS-часы с солнечной зарядкой.",
    category: Category.WEARABLES,
    rating: 4.8,
    stock: 15,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1551817958-c18561b41d11?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Зарядка от солнца": "Да", "GPS": "Многодиапазонный", "Автономность": "28 дней" }
  },
  {
    id: "p27",
    name: "Apple Watch Series 9",
    price: 45000,
    description: "Умнее. Ярче. Мощнее.",
    category: Category.WEARABLES,
    rating: 4.7,
    stock: 60,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Чип": "S9 SiP", "Жест": "Двойное касание", "Экран": "2000 нит" }
  },
  {
    id: "p28",
    name: "Fitbit Charge 6",
    price: 16000,
    description: "Улучшите свою рутину с нашим самым продвинутым трекером.",
    category: Category.WEARABLES,
    rating: 4.4,
    stock: 55,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Google": "Карты и Кошелек", "Пульс": "Улучшенный", "Батарея": "7 дней" }
  },
  {
    id: "p29",
    name: "Pixel Watch 2",
    price: 38000,
    description: "Помощь от Google. Здоровье от Fitbit.",
    category: Category.WEARABLES,
    rating: 4.5,
    stock: 30,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Дизайн": "Купольное стекло", "Датчики": "Новый пульсометр", "Безопасность": "Обнаружение" }
  },
  {
    id: "p30",
    name: "Xiaomi Smart Band 8",
    price: 4500,
    description: "Спорт встречает стиль. Универсальный дисплей и ремешки.",
    category: Category.WEARABLES,
    rating: 4.6,
    stock: 100,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800"],
    attributes: { "Экран": "60Гц AMOLED", "Режимы": "150+", "Конструкция": "Быстросъемная" }
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: "ord-123",
    date: "2023-10-15",
    status: 'Delivered',
    total: 170000,
    items: [
      {
        name: "iPhone 15 Pro Max",
        price: 135000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800",
        attributes: { "Память": "256ГБ" }
      },
      {
        name: "Sony WH-1000XM5",
        price: 35000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800",
        attributes: { "Тип": "Полноразмерные" }
      }
    ]
  }
];