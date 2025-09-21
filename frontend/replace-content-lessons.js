const http = require('http');
const https = require('https');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : null;
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function replaceLessonsInTopic2() {
  try {
    console.log('Начинаем замену уроков в теме 2...');
    
    // Получаем существующие уроки в теме 2
    const response = await makeRequest('http://localhost:3000/api/topics/2/lessons');
    
    if (!response.ok) {
      console.error('Ошибка получения уроков:', response.status);
      return;
    }
    
    const existingLessons = response.data || [];
    console.log('Найдено существующих уроков:', existingLessons.length);
    
    // Удаляем все существующие уроки
    for (const lesson of existingLessons) {
      const deleteResponse = await makeRequest(`http://localhost:3000/api/lessons/${lesson.id}`, {
        method: 'DELETE'
      });
      
      if (deleteResponse.ok || deleteResponse.status === 200 || deleteResponse.status === 204) {
        console.log(`✓ Удален урок: ${lesson.title}`);
      } else {
        console.log(`✗ Ошибка удаления урока ${lesson.title}: ${deleteResponse.status}`);
      }
    }
    
    // Создаем новые уроки по контент-маркетингу
    const newLessons = [
      {
        title: 'Упаковка блога',
        description: 'Как оформить профиль так, чтобы подписывались и оставались. Разбираем элементы профиля, которые влияют на конверсию в подписчики.',
        content: 'В этом уроке мы детально разберем все элементы профиля в социальных сетях, которые влияют на решение пользователя подписаться на ваш аккаунт.',
        videoUrl: 'https://miro.com/app/board/uXjVJRG4MJs=/?playRecording=67075cf5-24c9-4ecb-8edd-9738c2c9555a',
        order: 1
      },
      {
        title: 'Система идей — «Контент без ступора»',
        description: 'Как генерировать идеи каждый день и не выгорать. Практические методы поиска тем для контента и систематизации идей.',
        content: 'Изучим проверенную систему генерации идей для контента, которая поможет вам никогда не сталкиваться с творческим кризисом.',
        videoUrl: 'https://www.youtube.com/embed/content-ideas',
        order: 2
      },
      {
        title: 'Суть текстовых рилс. Формула захвата внимания',
        description: 'Структура заголовка и подача, чтобы ролики брали охваты. Разбираем формулы вирусных текстовых рилс.',
        content: 'Разберем проверенные формулы создания текстовых рилс, которые гарантированно привлекают внимание и набирают охваты.',
        videoUrl: 'https://www.youtube.com/embed/text-reels-formula',
        order: 3
      },
      {
        title: 'Публикации-карусели — «Листай, не отпускай»',
        description: 'Сценарии, ритм и оформление каруселей, которые дочитывают. Практические советы по созданию вовлекающих каруселей.',
        content: 'Научимся создавать карусели, которые пользователи листают до конца и которые значительно повышают вовлеченность аудитории.',
        videoUrl: 'https://www.youtube.com/embed/carousel-posts',
        order: 4
      }
    ];
    
    // Создаем каждый урок через API
    for (const lessonData of newLessons) {
      try {
        const createResponse = await makeRequest('http://localhost:3000/api/topics/2/lessons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(lessonData)
        });
        
        if (createResponse.ok || createResponse.status === 200 || createResponse.status === 201) {
          console.log(`✓ Создан урок: ${lessonData.title}`);
        } else {
          console.log(`✗ Ошибка создания урока "${lessonData.title}": ${createResponse.status}`);
          console.log('Ответ сервера:', createResponse.data);
        }
      } catch (error) {
        console.log(`✗ Ошибка создания урока "${lessonData.title}": ${error.message}`);
      }
    }
    
    console.log('\n✅ Замена уроков завершена! Проверьте http://localhost:3000/topics/2');
    
  } catch (error) {
    console.error('❌ Общая ошибка:', error.message);
  }
}

replaceLessonsInTopic2();