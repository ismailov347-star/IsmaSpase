const http = require('http');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body });
      });
    });
    
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function restoreContentLessons() {
  try {
    console.log('Восстанавливаю уроки по контент-маркетингу...');
    
    const lessons = [
      {
        title: 'Упаковка блога',
        description: 'Как оформить профиль так, чтобы подписывались и оставались. Разбираем элементы профиля, которые влияют на конверсию в подписчики и удержание аудитории.',
        videoUrl: 'https://example.com/packaging-blog.mp4',
        topicId: 2,
        order: 1
      },
      {
        title: 'Система идей — «Контент без ступора»',
        description: 'Как генерировать идеи каждый день и не выгорать. Практические методы поиска тем для контента, систематизации идей и создания контент-плана.',
        videoUrl: 'https://example.com/content-ideas.mp4',
        topicId: 2,
        order: 2
      },
      {
        title: 'Суть текстовых рилс. Формула захвата внимания',
        description: 'Структура заголовка и подача, чтобы ролики брали охваты. Разбираем формулы вирусных текстовых рилс и секреты удержания внимания.',
        videoUrl: 'https://example.com/text-reels.mp4',
        topicId: 2,
        order: 3
      },
      {
        title: 'Публикации-карусели — «Листай, не отпускай»',
        description: 'Сценарии, ритм и оформление каруселей, которые дочитывают. Практические советы по созданию вовлекающих каруселей с высоким engagement.',
        videoUrl: 'https://example.com/carousel-posts.mp4',
        topicId: 2,
        order: 4
      }
    ];
    
    for (const lesson of lessons) {
      const data = JSON.stringify(lesson);
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/lessons',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };
      
      try {
        const response = await makeRequest(options, data);
        if (response.status === 200 || response.status === 201) {
          console.log(`✅ Создан урок: ${lesson.title}`);
        } else {
          console.error(`❌ Ошибка создания урока "${lesson.title}": ${response.body}`);
        }
      } catch (err) {
        console.error(`❌ Ошибка запроса для урока "${lesson.title}": ${err.message}`);
      }
    }
    
    console.log('\n🎉 Все уроки по контент-маркетингу восстановлены!');
    console.log('📱 Проверьте результат: http://localhost:3000/topics/2');
    
  } catch (error) {
    console.error('💥 Ошибка при восстановлении уроков:', error.message);
  }
}

restoreContentLessons();