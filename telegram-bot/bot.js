const { Telegraf, Markup } = require('telegraf')
require('dotenv').config()

console.log('🔗 Используемый URL:', process.env.API_BASE_URL)

const bot = new Telegraf(process.env.BOT_TOKEN)

// Главная клавиатура (переиспользуется)
const mainKeyboard = Markup.keyboard([
  [Markup.button.webApp('Открыть платформу', process.env.API_BASE_URL)],
  ['Главная', 'Помощь'],
  ['Перезапустить']
]).resize();

// Инлайн-кнопка "Открыть"
const openInlineKb = Markup.inlineKeyboard([
  Markup.button.webApp('Открыть', process.env.API_BASE_URL)
])

// Функция установки Chat Menu Button для пользователя
const setChatMenuButton = async (chatId) => {
  try {
    await bot.telegram.setChatMenuButton(chatId, {
      type: 'web_app',
      text: 'Открыть приложение',
      web_app: { url: process.env.API_BASE_URL }
    })
    console.log(`✅ Chat Menu Button установлена для чата ${chatId}`)
  } catch (err) {
    console.log('Ошибка установки menu button:', err)
  }
}

// Глобальная установка Chat Menu Button при запуске
bot.telegram.setChatMenuButton(undefined, {
  type: 'web_app',
  text: 'Открыть приложение',
  web_app: { url: process.env.API_BASE_URL }
}).then(() => {
  console.log('🌐 Глобальная Chat Menu Button установлена')
}).catch(err => {
  console.log('Ошибка глобальной установки menu button:', err)
})

// Middleware для логирования
bot.use((ctx, next) => {
  console.log(`📨 Сообщение от ${ctx.from.username || ctx.from.first_name}: ${ctx.message?.text || 'действие'}`)
  return next()
})

// Функция отправки typing action
const sendTyping = async (ctx) => {
  try {
    await ctx.sendChatAction('typing')
  } catch (err) {
    console.log('Ошибка typing action:', err)
  }
}

// Функция показа главного меню
const showMainMenu = async (ctx) => {
  await sendTyping(ctx)
  const welcomeText = `Добро пожаловать в IsmaSpace!\nЗдесь ты можешь проходить уроки, изучать новые темы и отслеживать свой прогресс.`
  
  try {
    await ctx.reply(welcomeText, {
      ...openInlineKb,
      disable_web_page_preview: true
    })
    await ctx.reply('Выбери действие:', mainKeyboard)
  } catch (err) {
    console.error('Ошибка отправки главного меню:', err)
    await ctx.reply('Упс, что-то пошло не так. Нажми «Перезапустить» или «Главная».', mainKeyboard)
  }
}

// Обработчик команды /start с поддержкой deep-link
bot.start(async (ctx) => {
    try {
        await ctx.sendChatAction('typing');
        
        // Устанавливаем Chat Menu Button для пользователя
        await setChatMenuButton(ctx.chat.id);
        
        // Мгновенно отправляем приветствие с инлайн-кнопкой для отображения в списке чатов
        await ctx.reply(
            'Добро пожаловать в IsmaSpace!\nЗдесь ты можешь проходить уроки, изучать новые темы и отслеживать свой прогресс.',
            { 
                reply_markup: {
                    inline_keyboard: [[
                        { text: 'Открыть', web_app: { url: process.env.API_BASE_URL } }
                    ]]
                },
                disable_web_page_preview: true 
            }
        );
        
        // Затем отправляем основное меню
        await showMainMenu(ctx);
    } catch (error) {
        console.error('Ошибка в команде /start:', error);
        await ctx.reply('Произошла ошибка. Попробуйте позже.');
    }
});

// Обработчик для startapp deep-link
bot.on('message', async (ctx, next) => {
    try {
        // Проверяем, если это первое сообщение от пользователя через startapp
        if (ctx.message && ctx.message.web_app_data) {
            await ctx.sendChatAction('typing');
            
            // Отправляем то же приветствие с инлайн-кнопкой
            await ctx.reply(
                'Добро пожаловать в IsmaSpace!\nЗдесь ты можешь проходить уроки, изучать новые темы и отслеживать свой прогресс.',
                { 
                    reply_markup: {
                        inline_keyboard: [[
                            { text: 'Открыть', web_app: { url: process.env.API_BASE_URL } }
                        ]]
                    },
                    disable_web_page_preview: true 
                }
            );
        }
    } catch (error) {
        console.error('Ошибка в обработчике startapp:', error);
    }
    
    // Продолжаем обработку других сообщений
    await next();
});

// Обработка кнопок и команд
bot.on('text', async (ctx) => {
  const text = ctx.message.text

  try {
    switch (text) {
      case 'Главная':
      case 'Перезапустить':
        await showMainMenu(ctx)
        break

      // Кнопка "Открыть платформу" теперь WebApp - не обрабатываем текст

      case 'Помощь':
        await sendTyping(ctx)
        const helpText = `Как пользоваться:\n• Открыть платформу — вход на учебную платформу.\n• Темы — список разделов.\n• Прогресс — сводка прохождения.\n• Перезапустить — вернуться к началу.\nЕсли есть вопрос — просто напиши сюда.`
        await ctx.reply(helpText, mainKeyboard)
        break

      case '📚 Темы':
        await sendTyping(ctx)
        await ctx.reply('Выбери тему:', 
          Markup.inlineKeyboard([
            [Markup.button.webApp('1) Упаковка блога', 'https://placeholder.local/app?lesson=1')],
            [Markup.button.webApp('2) Контент без ступора', 'https://placeholder.local/app?lesson=2')],
            [Markup.button.webApp('3) Текстовые рилс', 'https://placeholder.local/app?lesson=3')],
            [Markup.button.webApp('4) Карусели', 'https://placeholder.local/app?lesson=4')]
          ])
        )
        break

      case '📊 Прогресс':
        await sendTyping(ctx)
        await ctx.reply('Твой прогресс: 0/4 уроков ✅', 
          Markup.inlineKeyboard([
            Markup.button.webApp('Открыть платформу', 'https://placeholder.local/app')
          ])
        )
        break

      default:
        // Неизвестная команда
        await sendTyping(ctx)
        await ctx.reply('Не понял команду. Выбери действие на клавиатуре 👇', mainKeyboard)
        break
    }
  } catch (error) {
    console.error('Ошибка обработки сообщения:', error)
    try {
      await ctx.reply('Упс, что-то пошло не так. Нажми «Перезапустить» или «Главная».', mainKeyboard)
    } catch (err) {
      console.error('Критическая ошибка:', err)
    }
  }
})

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error('Ошибка бота:', err)
  try {
    ctx.reply('Упс, что-то пошло не так. Нажми «Перезапустить» или «Главная».', mainKeyboard)
  } catch (error) {
    console.error('Критическая ошибка в обработчике ошибок:', error)
  }
})

// Запуск бота
bot.launch()
  .then(() => {
    console.log('🤖 IsmaSpace бот запущен!')
    console.log('📱 Найдите бота в Telegram и отправьте /start')
  })
  .catch(err => {
    console.error('Ошибка запуска бота:', err)
  })

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))