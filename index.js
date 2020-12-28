(function (d, lc) {
  function debounce(func, wait, immediate) {
    let timeout;
    return function() {
      const context = this, args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  const elem = document.getElementById('textarena-container');

  if (elem && (typeof Textarena !== 'undefined')) {
    let initData;
    const storedData = localStorage.getItem('data');
    try {
      if (storedData) {
        initData = JSON.parse(storedData);
      }
    } catch {}
    if (!initData) {
      initData = {
        content: '<h1>Lorem Imsum</h1><h2>Что такое Lorem Ipsum?</h2><p><strong>Lorem Ipsum</strong>&nbsp;- это текст-"рыба", часто используемый в печати и вэб-дизайне. </p><h3>Что такое Lorem Ipsum?</h3><p>Lorem Ipsum является стандартной "рыбой" для текстов на латинице с начала XVI века. </p><h4>Что такое Lorem Ipsum?</h4><p>В то время некий безымянный печатник создал большую коллекцию размеров и форм шрифтов, используя Lorem Ipsum для распечатки образцов. Lorem Ipsum не только успешно пережил без заметных изменений пять веков, но и перешагнул в электронный дизайн. Его популяризации в новое время послужили публикация листов Letraset с образцами Lorem Ipsum в 60-х годах и, в более недавнее время, программы электронной вёрстки типа Aldus PageMaker, в шаблонах которых используется Lorem Ipsum.</p><h2>Почему он используется?</h2><p>Давно выяснено, что при оценке дизайна и композиции читаемый текст мешает сосредоточиться. Lorem Ipsum используют потому, что тот обеспечивает более или менее стандартное заполнение шаблона, а также реальное распределение букв и пробелов в абзацах, которое не получается при простой дубликации "Здесь ваш текст.. Здесь ваш текст.. Здесь ваш текст.." Многие программы электронной вёрстки и редакторы HTML используют Lorem Ipsum в качестве текста по умолчанию, так что поиск по ключевым словам "lorem ipsum" сразу показывает, как много веб-страниц всё ещё дожидаются своего настоящего рождения. За прошедшие годы текст Lorem Ipsum получил много версий. Некоторые версии появились по ошибке, некоторые - намеренно (например, юмористические варианты).</p><p>Давно выяснено, что при оценке дизайна и композиции читаемый текст мешает сосредоточиться. Lorem Ipsum используют потому, что тот обеспечивает более или менее стандартное заполнение шаблона, а также реальное распределение букв и пробелов в абзацах, которое не получается при простой дубликации "Здесь ваш текст.. Здесь ваш текст.. Здесь ваш текст.." Многие программы электронной вёрстки и редакторы HTML используют Lorem Ipsum в качестве текста по умолчанию, так что поиск по ключевым словам "lorem ipsum" сразу показывает, как много веб-страниц всё ещё дожидаются своего настоящего рождения. За прошедшие годы текст Lorem Ipsum получил много версий. Некоторые версии появились по ошибке, некоторые - намеренно (например, юмористические варианты).</p><p><br></p><h2>Откуда он появился?</h2><p>Многие думают, что Lorem Ipsum - взятый с потолка псевдо-латинский набор слов, но это не совсем так. Его корни уходят в один фрагмент классической латыни 45 года н.э., то есть более двух тысячелетий назад. Ричард МакКлинток, профессор латыни из колледжа Hampden-Sydney, штат Вирджиния, взял одно из самых странных слов в Lorem Ipsum, "consectetur", и занялся его поисками в классической латинской литературе. В результате он нашёл неоспоримый первоисточник Lorem Ipsum в разделах 1.10.32 и 1.10.33 книги "de Finibus Bonorum et Malorum" ("О пределах добра и зла"), написанной Цицероном в 45 году н.э. Этот трактат по теории этики был очень популярен в эпоху Возрождения. Первая строка Lorem Ipsum, "Lorem ipsum dolor sit amet..", происходит от одной из строк в разделе 1.10.32</p><p><br></p>',
      };
    }
    const htmlElem = document.getElementById('html');
    const onChange = debounce((data) => {
      localStorage.setItem('data', JSON.stringify(data));
      if (htmlElem) {
        htmlElem.innerText = data.content;
      }
    }, 500);
    const textarena = new Textarena(
      elem,
      {
        editable: true,
        onChange,
        initData,
        // toolbar: {
        //   tools: [
        //     'bold',
        //     'italic',
        //     'underline',
        //     'strikethrough',
        //     {
        //       name: 'foreColor',
        //       icon: 'f',
        //       title: 'ForeColor',
        //       config: {
        //         color: '#545454',
        //       },
        //       processor: foreColor,
        //     },
        //   ],
        // }
      },
    );
  }
}());