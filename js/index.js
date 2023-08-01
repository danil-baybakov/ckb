(() => {

  let clients = [];       // список клиентов с данными
  let headerSection = null;   // html-элемент -  верхняя заголовочная секция сайта
  let headerContainer = null; // html-элемент -  кониейнер верхней заголовочная секция сайта
  let mainSection = null;   // html-элемент - секция сайта с таблицей клиентов
  let table = null;   // html-элемент - таблица клиентов
  let footerSection = null;  // html-элемент -  нижняя секция сайта с кнопкой "Добавить"
  let footerContainer = null; // html-элемент -  контейнер нижней секции сайта с кнопкой "Добавить"
  let filter = '';      // текущее значение фильтра
  let sort = { prop: '', direct: 0 }; // текущее положение переключателя сортировки

  // функция сохраняет изменения данных клиента
  async function onSave(formData) {
    const response = await fetch(`http://localhost:3000/api/clients/${formData.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.name,
        surname: formData.surname,
        lastName: formData.lastName,
        contacts: formData.contacts,
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
  };

  // функция добавляет нового клиента в список
  async function onAdd(formData) {
    const response = await fetch(`http://localhost:3000/api/clients`, {
      method: 'POST',
      body: JSON.stringify({
        name: formData.name,
        surname: formData.surname,
        lastName: formData.lastName,
        contacts: formData.contacts,
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
  };

  // функция удаляет клиента
  async function onDelete(formData) {
    const response = await fetch(`http://localhost:3000/api/clients/${formData.id}`, {
      method: 'DELETE',
    });
  };

  // функция получает список клиентов с сервера
  async function onGet() {
    const response = await fetch('http://localhost:3000/api/clients');
    const clients = await response.json();
    return clients;
  }

  // функция закрытия модального окна с анимацией
  function onClose(tl = new TimelineMax()) {
    tl.reverse();
  };

  // функция инициализирует кастомный селект
  function initCustomChoise(el) {
    return new Choices(el, {
                            searchEnabled: false,
                            allowHTML: false,
                            position: 'bottom',
                            placeholder: false,
                            itemSelectText: '',
                            sorter: () => { },
                        });
  }

  // функция инициализации кастомного тултипа
  function initCustomTultips() {
    // тултип
    const tooltips = document.querySelectorAll('.tooltip');

    const changeArrowPosition = {
      name: 'changePosition',
      enabled: true,
      phase: 'main',
      fn({ state }) {

        if (state.placement === 'top') {
          state.elements.popper.querySelector('.tooltip__arrow').classList.remove('tooltip__arrow--reverse');
        }

        if (state.placement === 'bottom') {
          state.elements.popper.querySelector('.tooltip__arrow').classList.add('tooltip__arrow--reverse');
        }

      },
    }

    tooltips.forEach(el => {
      let tooltip = el.querySelector('.tooltip__content');

      Popper.createPopper(el, tooltip, {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 10],
            },
          },
          changeArrowPosition
        ],
      });
    });
  }

  // функция удаляет лишние пробелы из строки
  function deleteSpaceStr(str) {
    let arrStr = str.split(" ");
    let arrStrNotSpace = [];
    for (const value of arrStr) {
      if (value !== "") {
        arrStrNotSpace.push(value);
      }
    }
    if (arrStrNotSpace.length > 0) {
      return arrStrNotSpace.join(" ");
    } else {
      return "";
    }
  }

  // функция возращает время в нужном формате
  function parseStrDateTime(strDt) {
    dt = new Date(strDt);
    const year = dt.getFullYear().toString();
    const month = dt.getMonth().toString().length < 2 ? '0' + dt.getMonth() : dt.getMonth();
    const day = dt.getDate().toString().length < 2 ? '0' + dt.getDate() : dt.getDate();
    const hour = dt.getHours().toString().length < 2 ? '0' + dt.getHours() : dt.getHours();
    const min = dt.getMinutes().toString().length < 2 ? '0' + dt.getMinutes() : dt.getMinutes();
    const dmy = day + '.' + month + '.' + year;
    const hm = hour + ':' + min;
    return {
      year,
      month,
      day,
      hour,
      min,
      dmy,
      hm
    }
  }

  // функция создает HTML верстку шапки панели управления клиентами
  function createClientsHeader() {

    // создание html-элемента - контейнер шапки панели управления клиентами
    const headerContainer = document.createElement('div');
    headerContainer.classList.add('header__container', 'container');

    // создание html-элемента - логотип шапки панели управления клиентами
    const headerLogo = document.createElement('div');
    headerLogo.classList.add('header__logo');
    headerLogo.innerHTML = `<svg class="header__svg" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle class="header__svg-circle" cx="25" cy="25" r="25" fill="#9873FF" />
                              <path class="header__svg-path"
                              d="M17.2617 29.082C17.2617 30.0898 16.9102 30.8574 16.207 31.3848C15.5098 31.9121 14.4639 32.1758 13.0693 32.1758C12.3545 32.1758 11.7451 32.126 11.2412 32.0264C10.7373 31.9326 10.2656 31.792 9.82617 31.6045V29.3896C10.3242 29.624 10.8838 29.8203 11.5049 29.9785C12.1318 30.1367 12.6826 30.2158 13.1572 30.2158C14.1299 30.2158 14.6162 29.9346 14.6162 29.3721C14.6162 29.1611 14.5518 28.9912 14.4229 28.8623C14.2939 28.7275 14.0713 28.5781 13.7549 28.4141C13.4385 28.2441 13.0166 28.0479 12.4893 27.8252C11.7334 27.5088 11.1768 27.2158 10.8193 26.9463C10.4678 26.6768 10.21 26.3691 10.0459 26.0234C9.8877 25.6719 9.80859 25.2412 9.80859 24.7314C9.80859 23.8584 10.1455 23.1846 10.8193 22.71C11.499 22.2295 12.46 21.9893 13.7021 21.9893C14.8857 21.9893 16.0371 22.2471 17.1562 22.7627L16.3477 24.6963C15.8555 24.4854 15.3955 24.3125 14.9678 24.1777C14.54 24.043 14.1035 23.9756 13.6582 23.9756C12.8672 23.9756 12.4717 24.1895 12.4717 24.6172C12.4717 24.8574 12.5977 25.0654 12.8496 25.2412C13.1074 25.417 13.667 25.6777 14.5283 26.0234C15.2959 26.334 15.8584 26.624 16.2158 26.8936C16.5732 27.1631 16.8369 27.4736 17.0068 27.8252C17.1768 28.1768 17.2617 28.5957 17.2617 29.082ZM21.9287 26.6562L23.0977 25.1621L25.8486 22.1738H28.8721L24.9697 26.4365L29.1094 32H26.0156L23.1855 28.0186L22.0342 28.9414V32H19.3535V18.3242H22.0342V24.4238L21.8936 26.6562H21.9287ZM35.9824 21.9893C37.1426 21.9893 38.0508 22.4434 38.707 23.3516C39.3633 24.2539 39.6914 25.4932 39.6914 27.0693C39.6914 28.6924 39.3516 29.9492 38.6719 30.8398C37.998 31.7305 37.0781 32.1758 35.9121 32.1758C34.7578 32.1758 33.8525 31.7568 33.1963 30.9189H33.0117L32.5635 32H30.5156V18.3242H33.1963V21.5059C33.1963 21.9102 33.1611 22.5576 33.0908 23.4482H33.1963C33.8232 22.4756 34.752 21.9893 35.9824 21.9893ZM35.1211 24.1338C34.459 24.1338 33.9756 24.3389 33.6709 24.749C33.3662 25.1533 33.208 25.8242 33.1963 26.7617V27.0518C33.1963 28.1064 33.3516 28.8623 33.6621 29.3193C33.9785 29.7764 34.4766 30.0049 35.1562 30.0049C35.707 30.0049 36.1436 29.7529 36.4658 29.249C36.7939 28.7393 36.958 28.001 36.958 27.0342C36.958 26.0674 36.7939 25.3438 36.4658 24.8633C36.1377 24.377 35.6895 24.1338 35.1211 24.1338ZM41.5283 30.7432C41.5283 30.251 41.6602 29.8789 41.9238 29.627C42.1875 29.375 42.5713 29.249 43.0752 29.249C43.5615 29.249 43.9365 29.3779 44.2002 29.6357C44.4697 29.8936 44.6045 30.2627 44.6045 30.7432C44.6045 31.2061 44.4697 31.5723 44.2002 31.8418C43.9307 32.1055 43.5557 32.2373 43.0752 32.2373C42.583 32.2373 42.2021 32.1084 41.9326 31.8506C41.6631 31.5869 41.5283 31.2178 41.5283 30.7432Z"
                              fill="white" />
                          </svg>`;

    // создание html-элемента - поиск панели управления клиентами
    const headerInput = document.createElement('input');
    headerInput.classList.add('header__text');
    headerInput.placeholder = 'Введите запрос';

    // добавляем в контейнер логотип и поиск
    headerContainer.append(headerLogo);
    headerContainer.append(headerInput);

    // выводим html-структуру шапки панели управления клиентами
    return {
      headerContainer,
      headerInput
    }

  }

  // функция создает HTML верску ячееки заголовка таблицы клиентов
  function createClientsTableHeaderRow(name, isIcon = false, iconText1 = '', iconText2 = '') {

    // создание html-элемента - контейнер ячейки заголовка таблицы
    const th = document.createElement('th');
    th.classList.add('clients__thead-th');

    // создание html-элемента - контент ячейки заголовка таблицы
    const text = document.createElement('span');
    text.classList.add('clients__thead-th-text');
    text.innerHTML = name;
    th.append(text);

    // создание html-элемента - иконка ячейки заголовка таблицы
    const icon = document.createElement('span');
    icon.classList.add('clients__thead-th-icon');
    icon.innerHTML = `<svg class="clients__thead-th-svg" width="8" height="8" viewBox="0 0 8 8" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                          <path class="clients__thead-th-path"
                          d="M8 4L7.295 3.295L4.5 6.085L4.5 0L3.5 0L3.5 6.085L0.71 3.29L0 4L4 8L8 4Z" fill="none" />
                        </svg>
                        <span class="clients__thead-th-icon-text1">${iconText1}</span>
                        <span class="clients__thead-th-icon-text2">${iconText2}</span`;

    // если есть иконка добавляем в контейнер ячейки заголовка таблицы
    if (isIcon) th.append(icon);

    // возвращаем html-структуру ячейки заголовка таблицы
    return { th, icon }

  }

  // функция создает HTML верстку таблицы клиентов
  function createClientsBodyTable() {

    // создание html-элемента - секция размещения таблицы студентов
    const table = document.createElement('div')
    table.classList.add('clients');

    // создание html-элемента -контейнер размещения таблицы студентов
    const container = document.createElement('div');
    container.classList.add('clients__container', 'container');

    // помещаем контейнер в секцию
    table.append(container);

    // создание html-элемента -заголовок таблицы
    const title = document.createElement('h2');
    title.classList.add('clients__title', 'gap-reset');
    title.textContent = 'Клиенты';
    container.append(title);

    // создание html-элемента - обертка таблицы
    const wrapper = document.createElement('div');
    wrapper.classList.add('clients__wrapper');
    container.append(wrapper);

    // создание html-элемента - иконка загрузки таблицы
    const loadImg = document.createElement('div');
    loadImg.classList.add('clients__load');
    loadImg.innerHTML = `<svg class="clients__load-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path class="clients__load-path"
                            d="M2 20C2 29.941 10.059 38 20 38C29.941 38 38 29.941 38 20C38 10.059 29.941 2 20 2C17.6755 2 15.454 2.4405 13.414 3.243"
                            stroke="#9873FF" stroke-width="4" stroke-miterlimit="10" stroke-linecap="round" />
                          </svg>`;
    wrapper.append(loadImg);

    // создание html-элемента - шапка таблицы
    const tableHeader = document.createElement('table');
    tableHeader.classList.add('clients__table');
    const tableThead = document.createElement('thead');
    tableThead.classList.add('clients__thead');
    const tableTheadTr = document.createElement('tr');
    tableTheadTr.classList.add('clients__thead-tr');
    const tableHeaderId = createClientsTableHeaderRow('ID ', true, '', '');
    const tableHeaderFio = createClientsTableHeaderRow('Фамилия Имя Отчество ', true, 'A-Я', 'Я-А');
    const tableHeaderDateTimeCreate = createClientsTableHeaderRow('Дата и время<br> создания ', true, '', '');
    const tableHeaderDateTimeChange = createClientsTableHeaderRow('Последние<br> изменения ', true, '', '');
    const tableHeaderContacts = createClientsTableHeaderRow('Контакты', false, '', '');
    const tableHeaderAction = createClientsTableHeaderRow('Действия', false, '', '');
    tableTheadTr.append(tableHeaderId.th);
    tableTheadTr.append(tableHeaderFio.th);
    tableTheadTr.append(tableHeaderDateTimeCreate.th);
    tableTheadTr.append(tableHeaderDateTimeChange.th);
    tableTheadTr.append(tableHeaderContacts.th);
    tableTheadTr.append(tableHeaderAction.th);
    tableThead.append(tableTheadTr);
    tableHeader.append(tableThead);
    wrapper.append(tableHeader);

    // создание html-элемента - тело таблицы
    const tableBodyWrapper = document.createElement('div');
    tableBodyWrapper.classList.add('clients__table-body-wrapper');
    const tableBody = document.createElement('table');
    tableBody.classList.add('clients__table');
    const tableTbody = document.createElement('tbody');
    tableTbody.classList.add('clients__tbody');
    tableBody.append(tableTbody);
    tableBodyWrapper.append(tableBody);
    wrapper.append(tableBodyWrapper);

    // возвращаем html-структуру таблицы
    return {
      table,
      loadImg,
      tableTbody,
      tableHeaderId,
      tableHeaderFio,
      tableHeaderDateTimeCreate,
      tableHeaderDateTimeChange,
    };

  }

  // функция создает HTML верстку контакта клиента
  function createClientContact(contactObj) {

    let other = false;

    const li = document.createElement("li");
    li.classList.add("clients__tbody-item");
    const btn = document.createElement("button");
    btn.classList.add('tooltip', 'btn-reset');
    switch (contactObj.type) {
      case 'Телефон': btn.innerHTML = `<svg class="tooltip__svg" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g class="tooltip__g" opacity="0.7">
                                          <circle class="tooltip__circle" cx="8" cy="8" r="8" fill="#9873FF" />
                                          <path class="tooltip__path"
                                            d="M11.56 9.50222C11.0133 9.50222 10.4844 9.41333 9.99111 9.25333C9.83556 9.2 9.66222 9.24 9.54222 9.36L8.84444 10.2356C7.58667 9.63556 6.40889 8.50222 5.78222 7.2L6.64889 6.46222C6.76889 6.33778 6.80444 6.16444 6.75556 6.00889C6.59111 5.51556 6.50667 4.98667 6.50667 4.44C6.50667 4.2 6.30667 4 6.06667 4H4.52889C4.28889 4 4 4.10667 4 4.44C4 8.56889 7.43556 12 11.56 12C11.8756 12 12 11.72 12 11.4756V9.94222C12 9.70222 11.8 9.50222 11.56 9.50222Z"
                                            fill="white" />
                                        </g>
                                      </svg>`;
        break;
      case 'Facebook': btn.innerHTML = `<svg class="tooltip__svg" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <g class="tooltip__g" opacity="0.7">
                                            <path class="tooltip__path"
                                              d="M7.99999 0C3.6 0 0 3.60643 0 8.04819C0 12.0643 2.928 15.3976 6.75199 16V10.3775H4.71999V8.04819H6.75199V6.27309C6.75199 4.25703 7.94399 3.14859 9.77599 3.14859C10.648 3.14859 11.56 3.30121 11.56 3.30121V5.28514H10.552C9.55999 5.28514 9.24799 5.90362 9.24799 6.53815V8.04819H11.472L11.112 10.3775H9.24799V16C11.1331 15.7011 12.8497 14.7354 14.0879 13.2772C15.3261 11.819 16.0043 9.96437 16 8.04819C16 3.60643 12.4 0 7.99999 0Z"
                                              fill="#9873FF" />
                                          </g>
                                        </svg>`
        break;
      case 'VK': btn.innerHTML = `<svg class="tooltip__svg" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g class="tooltip__g" opacity="0.7">
                                      <path class="tooltip__path"
                                        d="M8 0C3.58187 0 0 3.58171 0 8C0 12.4183 3.58187 16 8 16C12.4181 16 16 12.4183 16 8C16 3.58171 12.4181 0 8 0ZM12.058 8.86523C12.4309 9.22942 12.8254 9.57217 13.1601 9.97402C13.3084 10.1518 13.4482 10.3356 13.5546 10.5423C13.7065 10.8371 13.5693 11.1604 13.3055 11.1779L11.6665 11.1776C11.2432 11.2126 10.9064 11.0419 10.6224 10.7525C10.3957 10.5219 10.1853 10.2755 9.96698 10.037C9.87777 9.93915 9.78382 9.847 9.67186 9.77449C9.44843 9.62914 9.2543 9.67366 9.1263 9.90707C8.99585 10.1446 8.96606 10.4078 8.95362 10.6721C8.93577 11.0586 8.81923 11.1596 8.43147 11.1777C7.60291 11.2165 6.81674 11.0908 6.08606 10.6731C5.44147 10.3047 4.94257 9.78463 4.50783 9.19587C3.66126 8.04812 3.01291 6.78842 2.43036 5.49254C2.29925 5.2007 2.39517 5.04454 2.71714 5.03849C3.25205 5.02817 3.78697 5.02948 4.32188 5.03799C4.53958 5.04143 4.68362 5.166 4.76726 5.37142C5.05633 6.08262 5.4107 6.75928 5.85477 7.38684C5.97312 7.55396 6.09391 7.72059 6.26594 7.83861C6.45582 7.9689 6.60051 7.92585 6.69005 7.71388C6.74734 7.57917 6.77205 7.43513 6.78449 7.29076C6.82705 6.79628 6.83212 6.30195 6.75847 5.80943C6.71263 5.50122 6.53929 5.30218 6.23206 5.24391C6.07558 5.21428 6.0985 5.15634 6.17461 5.06697C6.3067 4.91245 6.43045 4.81686 6.67777 4.81686L8.52951 4.81653C8.82136 4.87382 8.88683 5.00477 8.92644 5.29874L8.92808 7.35656C8.92464 7.47032 8.98521 7.80751 9.18948 7.88198C9.35317 7.936 9.4612 7.80473 9.55908 7.70111C10.0032 7.22987 10.3195 6.67368 10.6029 6.09801C10.7279 5.84413 10.8358 5.58142 10.9406 5.31822C11.0185 5.1236 11.1396 5.02785 11.3593 5.03112L13.1424 5.03325C13.195 5.03325 13.2483 5.03374 13.3004 5.04274C13.6009 5.09414 13.6832 5.22345 13.5903 5.5166C13.4439 5.97721 13.1596 6.36088 12.8817 6.74553C12.5838 7.15736 12.2661 7.55478 11.9711 7.96841C11.7001 8.34652 11.7215 8.53688 12.058 8.86523Z"
                                        fill="#9873FF" />
                                    </g>
                                  </svg>`
        break;
      case 'Email': btn.innerHTML = `<svg class="tooltip__svg" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path class="tooltip__path" opacity="0.7" fill-rule="evenodd" clip-rule="evenodd"
                                        d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4 5.75C4 5.3375 4.36 5 4.8 5H11.2C11.64 5 12 5.3375 12 5.75V10.25C12 10.6625 11.64 11 11.2 11H4.8C4.36 11 4 10.6625 4 10.25V5.75ZM8.424 8.1275L11.04 6.59375C11.14 6.53375 11.2 6.4325 11.2 6.32375C11.2 6.0725 10.908 5.9225 10.68 6.05375L8 7.625L5.32 6.05375C5.092 5.9225 4.8 6.0725 4.8 6.32375C4.8 6.4325 4.86 6.53375 4.96 6.59375L7.576 8.1275C7.836 8.28125 8.164 8.28125 8.424 8.1275Z"
                                        fill="#9873FF" />
                                    </svg>`
        break;
      default: btn.innerHTML = `<svg class="tooltip__svg" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path class="tooltip__path" opacity="0.7" fill-rule="evenodd" clip-rule="evenodd"
                                    d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8ZM9.5 6C9.5 5.17 8.83 4.5 8 4.5C7.17 4.5 6.5 5.17 6.5 6C6.5 6.83 7.17 7.5 8 7.5C8.83 7.5 9.5 6.83 9.5 6ZM5 9.99C5.645 10.96 6.75 11.6 8 11.6C9.25 11.6 10.355 10.96 11 9.99C10.985 8.995 8.995 8.45 8 8.45C7 8.45 5.015 8.995 5 9.99Z"
                                    fill="#9873FF" />
                                </svg>`;
        other = true;
    }

    const tooltipContent = document.createElement("span");
    tooltipContent.classList.add("tooltip__content");
    tooltipContent.role = 'tooltip';
    const tooltipValue = document.createElement("span");
    tooltipValue.classList.add("tooltip__value");
    tooltipValue.textContent = contactObj.value;
    const tooltipArrow = document.createElement("i");
    tooltipArrow.classList.add("tooltip__arrow");
    tooltipContent.append(tooltipValue);
    tooltipContent.append(tooltipArrow);
    btn.append(tooltipContent);
    li.append(btn);

    // вывод список контактов как html-элемент
    return li;
  }

  // функция создает HTML верстку строки таблицы данных клиентов для одного клиента
  function createClientsItem(clientsObj) {

    // создание строки тела таблицы студентов и присвоение класса
    const row = document.createElement("tr");
    row.classList.add("clients__tbody-tr");

    function createHtmlTd() {
      const td = document.createElement("td");
      td.classList.add("clients__tbody-td");
      return td;
    }

    // создаем в строке ячейку - ID
    const td1 = createHtmlTd();
    td1.textContent = clientsObj.id;
    row.append(td1);

    // создаем в строке ячейку - ФИО
    const td2 = createHtmlTd();
    td2.textContent = `${clientsObj.surname} ${clientsObj.name} ${clientsObj.lastName}`;
    row.append(td2);

    // создаем в строке ячейку - дата создания и дата изменения
    function createTdDateTime(dtStr) {
      const td = createHtmlTd();
      const date = document.createElement("time");
      date.classList.add("clients__tbody-date");
      date.setAttribute('datetime', parseStrDateTime(dtStr).dmy);
      date.textContent = parseStrDateTime(dtStr).dmy;
      const time = document.createElement("time");
      time.classList.add("clients__tbody-time");
      time.setAttribute('datetime', parseStrDateTime(dtStr).hm);
      time.textContent = parseStrDateTime(dtStr).hm;
      td.append(date);
      td.append(time);
      return td;
    }
    const td3 = createTdDateTime(clientsObj.createdAt);
    row.append(td3);
    const td4 = createTdDateTime(clientsObj.updatedAt);
    row.append(td4);

    // создаем в строке ячейку - контакты
    const contacts = clientsObj.contacts;
    const td5 = createHtmlTd();
    const listContacts = document.createElement("ul");
    listContacts.classList.add('clients__tbody-list', 'list-reset');
    for (const item of contacts) {
      listContacts.append(createClientContact(item));
    }
    td5.append(listContacts);
    row.append(td5);

    // создаем в строке ячейку - действие
    const td6 = createHtmlTd();
    function createBtnAction(action) {
      const svgChange = `<svg class="bth-action__svg" width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path class="bth-action__path"
                            d="M0 10.5002V13.0002H2.5L9.87333 5.62687L7.37333 3.12687L0 10.5002ZM11.8067 3.69354C12.0667 3.43354 12.0667 3.01354 11.8067 2.75354L10.2467 1.19354C9.98667 0.933535 9.56667 0.933535 9.30667 1.19354L8.08667 2.41354L10.5867 4.91354L11.8067 3.69354Z"
                            fill="#9873FF" />
                        </svg>`
      const svgDelete = `<svg class="bth-action__svg" width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path class="bth-action__path"
                            d="M6 0C2.682 0 0 2.682 0 6C0 9.318 2.682 12 6 12C9.318 12 12 9.318 12 6C12 2.682 9.318 0 6 0ZM6 10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354 1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646 8.646 10.8 6 10.8ZM8.154 3L6 5.154L3.846 3L3 3.846L5.154 6L3 8.154L3.846 9L6 6.846L8.154 9L9 8.154L6.846 6L9 3.846L8.154 3Z"
                            fill="#F06A4D" />
                        </svg>`
      const btn = document.createElement("button");
      btn.classList.add(`btn-action`, 'btn-reset');
      btn.dataset.id = `${clientsObj.id}`;
      btn.innerHTML = (action == 'change') ? svgChange : svgDelete;
      const text = document.createElement("span");
      text.classList.add(`btn-action__text`);
      text.textContent = (action == 'change') ? 'Изменить' : 'Удалить';
      btn.append(text);
      return btn;
    }
    const bthWrapper = document.createElement('div');
    bthWrapper.classList.add('btn-wrapper');
    const btnChange = createBtnAction('change');

    btnChange.addEventListener('click', (e) => {
      createModalWithForm(clientsObj, 'change');
      btnChange.blur();
    });

    const btnDelete = createBtnAction('delete');

    btnDelete.addEventListener('click', (e) => {
      createModalWithForm(clientsObj, 'delete');
      btnDelete.blur();
    });

    bthWrapper.append(btnChange);
    bthWrapper.append(btnDelete);
    td6.append(bthWrapper);
    row.append(td6);

    // вывод строки с данными клиента как html-элемент
    return row;
  }

  // функция создает HTML верстку таблицы клиентов
  function renderClientsToTable(table, clientsArray) {
    // удаляем из таблицы все строки клиентов если они уже созданы
    const trs = table.tableTbody.querySelectorAll("tr");
    trs.forEach((e) => {
      e.remove();
    });

    // создаем заново строки
    for (const clientsObj of clientsArray) {
      table.tableTbody.append(createClientsItem(clientsObj));
    }

    initCustomTultips();
  }

  // функция создает HTML верстку футера
  function createClientsFooter() {
    // создание html-элемента - контейнер футера
    const footerContainer = document.createElement('div');
    footerContainer.classList.add('footer__container', 'container');

    // создание html-элемента - кнопка добавления студента
    const footerBtn = document.createElement('button');
    footerBtn.classList.add('footer__btn', 'btn-reset');
    const btnIcon = document.createElement('span');
    btnIcon.classList.add('footer__btn-icon');
    btnIcon.innerHTML = `<svg class="footer__btn-svg" width="23" height="16" viewBox="0 0 23 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path class="footer__btn-path"
                            d="M14.5 8C16.71 8 18.5 6.21 18.5 4C18.5 1.79 16.71 0 14.5 0C12.29 0 10.5 1.79 10.5 4C10.5 6.21 12.29 8 14.5 8ZM5.5 6V3H3.5V6H0.5V8H3.5V11H5.5V8H8.5V6H5.5ZM14.5 10C11.83 10 6.5 11.34 6.5 14V16H22.5V14C22.5 11.34 17.17 10 14.5 10Z"
                            fill="#9873FF" />
                        </svg>`;
    const btnText = document.createElement('span');
    btnText.classList.add('footer__btn-text');
    btnText.textContent = 'Добавить клиента';

    footerBtn.append(btnIcon);
    footerBtn.append(btnText);
    footerContainer.append(footerBtn);

    // выводим html-структуру футера
    return {
      footerContainer,
      footerBtn,
    }
  }

  // функция проверяет корректность ввода данных в форму модального окна
  function checkDataModal(data) {

    let result = true;
    let message = '';
    const numsErrField = [];

    // проверка ввода имени
    if (data.name === '') {
      result = false;
      message = message + 'Имя не заполнено !!!<br>';
    }

    if (data.name.length >= 30) {
      result = false;
      message = message + 'Имя слишком длинное (> 30 символов)!!!<br>';
    }

    // проверка ввода фамилии
    if (data.surname === '') {
      result = false;
      message = message + 'Фамилия не заполнена !!!<br>';
    }

    if (data.surname.length >= 30) {
      result = false;
      message = message + 'Фамилия слишком длинная (> 30 символов) !!!<br>';
    }

    // проверка ввода отчества

    if (data.lastName.length >= 30) {
      result = false;
      message = message + 'Отчество слишком длинное (> 30 символов)!!!<br>';
    }

    // проверка ввода контактов
    const reTel = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
    const reEmail = /^[\w-\.]+@[\w-]+\.[a-z]{2,4}$/i;

    for (const key in data.contacts) {
      if (data.contacts[key].value === '') {
        result = false;
        message = message + `Значение контакта №${Number(key) + 1} не заполнено !!!<br>`;
        numsErrField.push(key);
      }

      if (data.contacts[key].value.length >= 30) {
        result = false;
        message = message + `Значение контакта №${Number(key) + 1} слишком длинное (> 30 символов) !!!<br>`;
        numsErrField.push(key);
      }

      if (data.contacts[key].type === 'Телефон') {
        if (!(reTel.test(data.contacts[key].value))) {
          result = false;
          message = message + `Контакт №${Number(key) + 1} - Номер телефона введен не правильно !!!<br>`;
          numsErrField.push(key);
        }
      }

      if (data.contacts[key].type === 'Email') {
        if (!(reEmail.test(data.contacts[key].value))) {
          result = false;
          message = message + `Контакт №${Number(key) + 1} - Адрес электронной почты введен неправильно !!!<br>`;
          numsErrField.push(key);
        }
      }
    }

    message = message.slice(0, -4);

    return {
      result,
      message,
      numsErrField
    }
  }

  // функция создает html-элемент контакта для модального окна
  function createModalContact(contact, number) {
    // создаем html-элемент - контейнер контакта модального окна
    const modalItem = document.createElement('li');
    modalItem.classList.add('modal__item');

    // создаем и добавляем в DOM обертку селекта
    const modalItemChoise = document.createElement('div');
    modalItemChoise.classList.add('modal__item-choise');
    modalItem.append(modalItemChoise);

    // создаем и добавляем в DOM селект
    const modalChoiseSelect = document.createElement('select');
    modalChoiseSelect.classList.add('modal__choise-select', 'choise');
    modalItemChoise.append(modalChoiseSelect);

    // создаем и добавляем в DOM список опций селекта
    const options = ['Телефон', 'Email', 'Facebook', 'VK', 'Другое'];
    let select = false;
    for (const option of options) {
      const modalChoiseOption = document.createElement('option');
      modalChoiseOption.classList.add('modal__choise-option', 'choise__item');
      modalChoiseOption.value = option;
      modalChoiseOption.textContent = option;
      if (((option === contact.type)) && !select) {
        modalChoiseOption.selected = 'true';
        select = true;
      }
      modalChoiseSelect.append(modalChoiseOption);
    }


    // создаем маску для ввода значения телефона еслт тип контакта Телефон
    im = new Inputmask("+7 (999)-999-99-99");

    // создаем кастомный селект
    const choiсe = initCustomChoise(modalChoiseSelect);

    // вешаем обработчик события выбора в селекте
    choiсe.passedElement.element.addEventListener('choice', event => {
      const typeContact = event.detail.choice.value;
      if (typeContact === 'Телефон') {
        im.mask(modalItemInput);
      } else {
        modalItemInput.inputmask.remove();
      }
    })

    // создаем и добавляем в DOM  поле ввода для контакта
    const modalItemInput = document.createElement('input');
    modalItemInput.classList.add('modal__item-input', 'input-reset');
    modalItemInput.type = 'text';
    modalItemInput.placeholder = 'Введите данные контакта';
    modalItemInput.value = contact.value;
    modalItemInput.addEventListener('input', event => {
      modalItemInput.classList.remove('modal__item-input--error');
    })
    modalItem.append(modalItemInput);

    // добавляем атрибут data-type для поля ввода контакта,
    // для того чтобы однозначно идентифицировать тип поля ввода
    switch (contact.type) {
      case 'Телефон':   modalItemInput.dataset.type = 'tel';
                        im.mask(modalItemInput);
                        break;
      case 'Email':   modalItemInput.dataset.type = 'email';
                      break;
      case 'Facebook':  modalItemInput.dataset.type = 'facebook';
                        break;
      case 'VK':  modalItemInput.dataset.type = 'vk';
                  break;
      case 'Другое':  modalItemInput.dataset.type = 'other';
                      break;
    }

    // создаем и добавляем в DOM кнопку удаления контакта
    const modalItemBtn = document.createElement('button');
    modalItemBtn.classList.add('modal__item-btn', 'modal__item-btn--ok', 'btn-reset');
    modalItemBtn.innerHTML = `<svg class="modal__item-btn-svg" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g class="modal__item-btn-g">
                                  <path class="modal__item-btn-path"
                                    d="M8 2C4.682 2 2 4.682 2 8C2 11.318 4.682 14 8 14C11.318 14 14 11.318 14 8C14 4.682 11.318 2 8 2ZM8 12.8C5.354 12.8 3.2 10.646 3.2 8C3.2 5.354 5.354 3.2 8 3.2C10.646 3.2 12.8 5.354 12.8 8C12.8 10.646 10.646 12.8 8 12.8ZM10.154 5L8 7.154L5.846 5L5 5.846L7.154 8L5 10.154L5.846 11L8 8.846L10.154 11L11 10.154L8.846 8L11 5.846L10.154 5Z"
                                    fill="#B0B0B0" />
                                </g>
                              </svg>`;
    modalItem.append(modalItemBtn);

    // вешшаем обработчик события click на кнопке удаления контакта
    modalItemBtn.addEventListener('click', () => {
      modalItem.remove();
      checkModalMiddleEmpty();
    });

    // возвращаем html-верстку поля контакта
    return {
      modalItem,
      modalChoiseSelect,
      modalItemInput
    };
  }


  // функция создания модального окна для добавления/изменения/удаления клиента
  function createModalWithForm(client = {}, type) {

    let surname = (client.surname === undefined) ? '###' : client.surname;
    let name = (client.name === undefined) ? '###' : client.name;
    let lastName = (client.lastName === undefined) ? '###' : client.lastName;
    let contacts = (client.contacts === undefined) ? [] : client.contacts;
    let id = (client.id === undefined) ? '###' : client.id;

    // определяем тип модального окна
    let modalType = '';
    if ((type !== 'change') && (type !== 'add') && (type !== 'delete')) {
      modalType = 'change';
    } else {
      modalType = type;
    }

    // получаем body html страницы
    const body = document.querySelector('body');

    if (document.querySelector('.modal') !== null) document.querySelector('.modal').remove();

    // создаем и добавляем в body html страницы основной блок модального окна
    const modal = document.createElement('div');
    modal.classList.add('modal');
    body.append(modal);

    // создаем и добавляем в основной блок модального окна контейнер модального окна
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('modal__container');
    modal.append(modalContainer);

    // создаем анимацию открытия/закрытия модального окна
    const tl1 = new TimelineMax({ onReverseComplete: () => { modal.remove() } });
    tl1.fromTo(modal, { visibility: 'hidden', opacity: 0 }, { duration: 0.3, visibility: 'visible', opacity: 1 })
      .fromTo(modalContainer, { opacity: 0, scale: 0 }, { duration: 0.3, scale: 1, opacity: 0.3 })
      .to(modalContainer, { duration: 0.2, opacity: 1 });
    tl1.play();

    // создаем кнопку закрытия модального окна и навешиваем обработчик события нажатия на эту кнопку для закрытия окна
    const modalBtnClose = document.createElement('button');
    modalBtnClose.classList.add('modal__btn-close', 'btn-reset');
    modalBtnClose.innerHTML = `<svg class="modal__btn-close-svg" width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path class="modal__btn-close-path" fill-rule="evenodd" clip-rule="evenodd"
                                   d="M22.2333 7.73333L21.2667 6.76666L14.5 13.5334L7.7333 6.7667L6.76664 7.73336L13.5333 14.5L6.76666 21.2667L7.73333 22.2333L14.5 15.4667L21.2666 22.2334L22.2333 21.2667L15.4666 14.5L22.2333 7.73333Z"
                                   fill="#B0B0B0" />
                               </svg>`;
    modalBtnClose.addEventListener('click', () => {
      onClose(tl1);
    })
    modalContainer.append(modalBtnClose);

    // создаем и добавляем в контейнер модального окна обертку модального окна
    const modalWrapper = document.createElement('div');
    modalWrapper.classList.add('modal__wrapper');
    if (modalType === 'add') modalWrapper.classList.add('modal__wrapper--add');
    modalContainer.append(modalWrapper);


    ///////////////////////////
    // ВВЕРХ модального окна
    ///////////////////////////

    // создаем и добавляем в обертку модального окна ВВЕРХ модального окна
    const modalTop = document.createElement('div');
    modalTop.classList.add('modal__top');
    if (modalType === 'delete') modalTop.classList.add('modal__top--delete');
    modalWrapper.append(modalTop);

    // создаем и добавляем в ВВЕРХ модального окна заголовок
    const modalTitle = document.createElement('h2');
    modalTitle.classList.add('modal__title', 'gap-reset');
    if (modalType === 'add') modalTitle.classList.add('modal__title--add');
    if (modalType === 'delete') modalTitle.classList.add('modal__title--delete');
    modalTop.append(modalTitle);

    const modalTitleHeader = document.createElement('span');
    modalTitleHeader.classList.add('modal__title-header');
    modalTitleHeader.textContent = 'Изменить данные';
    if (modalType === 'add') modalTitleHeader.textContent = 'Новый клиент';
    if (modalType === 'delete') modalTitleHeader.textContent = 'Удалить клиента';
    modalTitle.append(modalTitleHeader);

    // создаем и добавляем в ВВЕРХ модального окна ID клиента если модальное окно для изменения
    const modalTitleId = document.createElement('span');
    if (modalType === 'change') {
      modalTitleId.classList.add('modal__title-id');
      modalTitleId.textContent = `ID: ${id}`;
      modalTitle.append(modalTitleId);
    }

    // создаем и добавляем в ВВЕРХ модального окна предупреждение
    // о удалении клиента, если модальное окно для удаления клиента
    const modalDescr = document.createElement('div');
    const modalSpan = document.createElement('span');
    if (modalType === 'delete') {
      modalDescr.classList.add('modal__descr');
      modalTop.append(modalDescr);
      modalSpan.classList.add('modal__span');
      modalSpan.textContent = 'Вы действительно хотите удалить данного клиента?';
      modalDescr.append(modalSpan);
    }

    // функция создает поле ввода
    function createGroupInput(name, placeholder, isStar = true, requred = true, modalType) {
      const inputGroup = document.createElement('div');
      inputGroup.classList.add('modal__group');
      if (modalType === 'add') inputGroup.classList.add('modal__group--add');

      const modalLable = document.createElement('lable');
      const modalLableStar = document.createElement('span');
      if (modalType === 'change') {
        modalLable.classList.add('modal__lable');
        modalLableStar.classList.add('modal__lable-star');
        modalLable.textContent = placeholder;
        modalLableStar.textContent = '*';
        inputGroup.append(modalLable);
        if (isStar) modalLable.append(modalLableStar);
      }

      const input = document.createElement('input');
      input.classList.add('modal__input', 'input-reset');
      if (modalType === 'add') input.classList.add('modal__input--add');
      input.type = 'text';
      input.required = requred;
      input.value = (modalType === 'add') ? '' : name;
      input.placeholder = '';
      inputGroup.append(input);

      const modalPlaceholder = document.createElement('div');
      modalPlaceholder.classList.add('modal__placeholder');
      modalPlaceholder.textContent = placeholder;
      const modalStrong = document.createElement('strong');
      modalStrong.classList.add('modal__strong');
      modalStrong.textContent = '*';
      inputGroup.append(modalPlaceholder);
      if (isStar) modalPlaceholder.append(modalStrong);

      return {
        inputGroup,
        input
      };
    }

    // создаем и добавляем в ВВЕРХ модального окна поля ввода ФИО
    const inputSurname = createGroupInput(surname, 'Фамилия', true, true, modalType);
    const inputName = createGroupInput(name, 'Имя', true, true, modalType);
    const inputLastName = createGroupInput(lastName, 'Отчество', false, true, modalType);
    // если модальное окно для удаления поля ввода ФИО не добавляются
    if (modalType !== 'delete') {
      modalTop.append(inputSurname.inputGroup);
      modalTop.append(inputName.inputGroup);
      modalTop.append(inputLastName.inputGroup);
    }

    ///////////////////////////
    // СЕРЕДИНА модального окна
    ///////////////////////////

    const modalMidlle = document.createElement('div');
    modalMidlle.classList.add('modal__middle', 'modal__middle--empty');
    if (modalType !== 'delete') modalWrapper.append(modalMidlle);

    const modalList = document.createElement('ul');
    modalList.classList.add('modal__list', 'list-reset');
    modalMidlle.append(modalList);

    function checkModalMiddleEmpty() {
      if (modalList.querySelectorAll('.modal__item').length === 0) {
        modalMidlle.classList.add('modal__middle--empty');
      } else {
        modalMidlle.classList.remove('modal__middle--empty');
      }
    }

    if (modalType === 'change') {
      for (const key in contacts) {
        const contactElement = createModalContact(contacts[key], Number(key) + 1);
        modalList.append(contactElement.modalItem);
      }
    }

    checkModalMiddleEmpty();

    const modalMiddleBottom = document.createElement('div');
    modalMiddleBottom.classList.add('modal__middle-bottom');
    modalMidlle.append(modalMiddleBottom);
    const modalMiddleBtn = document.createElement('button');
    modalMiddleBtn.classList.add('modal__middle-btn', 'btn-reset');
    modalMiddleBottom.append(modalMiddleBtn);
    modalMiddleBtn.innerHTML = `<svg class="modal__middle-btn-svg" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <g class="modal__middle-btn-g">
                                    <path class="modal__middle-btn-path"
                                        d="M7.99998 4.66668C7.63331 4.66668 7.33331 4.96668 7.33331 5.33334V7.33334H5.33331C4.96665 7.33334 4.66665 7.63334 4.66665 8.00001C4.66665 8.36668 4.96665 8.66668 5.33331 8.66668H7.33331V10.6667C7.33331 11.0333 7.63331 11.3333 7.99998 11.3333C8.36665 11.3333 8.66665 11.0333 8.66665 10.6667V8.66668H10.6666C11.0333 8.66668 11.3333 8.36668 11.3333 8.00001C11.3333 7.63334 11.0333 7.33334 10.6666 7.33334H8.66665V5.33334C8.66665 4.96668 8.36665 4.66668 7.99998 4.66668ZM7.99998 1.33334C4.31998 1.33334 1.33331 4.32001 1.33331 8.00001C1.33331 11.68 4.31998 14.6667 7.99998 14.6667C11.68 14.6667 14.6666 11.68 14.6666 8.00001C14.6666 4.32001 11.68 1.33334 7.99998 1.33334ZM7.99998 13.3333C5.05998 13.3333 2.66665 10.94 2.66665 8.00001C2.66665 5.06001 5.05998 2.66668 7.99998 2.66668C10.94 2.66668 13.3333 5.06001 13.3333 8.00001C13.3333 10.94 10.94 13.3333 7.99998 13.3333Z"
                                        fill="#9873FF" />
                                  </g>
                                </svg>`;
    const modalMiddleBtnText = document.createElement('span');
    modalMiddleBtnText.classList.add('modal__middle-btn-text');
    modalMiddleBtn.append(modalMiddleBtnText);
    modalMiddleBtnText.textContent = 'Добавить контакт';
    modalMiddleBtn.addEventListener('click', () => {
      const contacts = document.querySelectorAll('.modal__item');
      if (contacts.length < 10) {
        const contactElement = createModalContact({ type: 'Другое', value: '' });
        modalList.append(contactElement.modalItem);
        contactElement.modalItemInput.dataset.type = 'other';
        initCustomChoise(contactElement.modalChoiseSelect);
        checkModalMiddleEmpty();
      }
    });


    ///////////////////////////
    // НИЗ модального окна
    ///////////////////////////

    const modalBootom = document.createElement('div');
    modalBootom.classList.add('modal__bottom');
    if (modalType === 'delete') modalBootom.classList.add('modal__bottom--delete');
    modalWrapper.append(modalBootom);

    const modalBottomText = document.createElement('p');
    modalBottomText.classList.add('modal__bottom-text', 'gap-reset');
    if (modalType === 'delete') modalBottomText.classList.add('modal__bottom-text--delete');
    modalBootom.append(modalBottomText);

    const modalBottomBtnSave = document.createElement('button');
    modalBottomBtnSave.classList.add('modal__bottom-btn-save', 'btn-reset');
    modalBottomBtnSave.setAttribute('tabindex', '0');
    if (modalType === 'add') modalBottomBtnSave.classList.add('modal__bottom-btn-save--add');
    modalBootom.append(modalBottomBtnSave);

    const modalBottomBtnSaveIcon = document.createElement('span');
    modalBottomBtnSaveIcon.classList.add('modal__bottom-btn-save-icon');
    modalBottomBtnSaveIcon.innerHTML = `<svg class="modal__bottom-btn-save-svg" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path class="modal__bottom-btn-save-path"
                                              d="M3.00008 8.03996C3.00008 10.8234 5.2566 13.08 8.04008 13.08C10.8236 13.08 13.0801 10.8234 13.0801 8.03996C13.0801 5.25648 10.8236 2.99996 8.04008 2.99996C7.38922 2.99996 6.7672 3.1233 6.196 3.348"
                                              stroke="#B89EFF" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" />
                                        </svg>`;


    //////////////////////////////////////////////////
    ////
    //////////////
    modalBottomBtnSave.addEventListener('click', async (e) => {

      const coisesValue = [];
      const inputsValue = [];
      const contacts = [];

      document.querySelectorAll('.modal__choise-select').forEach((e) => {
        coisesValue.push(e.value);
      });

      document.querySelectorAll('.modal__item-input').forEach((e) => {
        inputsValue.push(e.value);
      });

      for (const key in coisesValue) {
        contacts.push({ type: coisesValue[key], value: inputsValue[key] })
      }

      inputName.input.value = deleteSpaceStr(inputName.input.value);
      inputSurname.input.value = deleteSpaceStr(inputSurname.input.value);
      inputLastName.input.value = deleteSpaceStr(inputLastName.input.value);

      const dataModal = {
        id: client.id,
        name: inputName.input.value,
        surname: inputSurname.input.value,
        lastName: inputLastName.input.value,
        contacts: contacts,
      }

      modalBottomText.innerHTML = '';
      const resultCheckData = checkDataModal(dataModal);
      if (resultCheckData.result) {

        modalBottomBtnSaveContent.prepend(modalBottomBtnSaveIcon);
        modalBottomBtnSaveIcon.classList.add('rotate');
        modalWrapper.classList.add('modal__wrapper--load');

        if (modalType === 'add') {
          await onAdd(dataModal);
        }
        if (modalType === 'change') {
          await onSave(dataModal);
        }
        if (modalType === 'delete') {
          await onDelete(dataModal);
        }

        clients = await onGet();
        renderClientsToTable(table, filterListClients(sortListClients(clients, sort), filter));
        onClose(tl1);
      } else {
        modalBottomText.innerHTML = resultCheckData.message;
        for (item of resultCheckData.numsErrField) {
          document.querySelectorAll('.modal__item-input')[item].classList.add('modal__item-input--error');
        }
      }


    });


    const modalBottomBtnSaveContent = document.createElement('span');
    modalBottomBtnSaveContent.classList.add('modal__bottom-btn-save-content');
    modalBottomBtnSave.append(modalBottomBtnSaveContent);

    const modalBottomBtnSaveText = document.createElement('span');
    modalBottomBtnSaveText.classList.add('modal__bottom-btn-save-text');
    modalBottomBtnSaveContent.append(modalBottomBtnSaveText);
    modalBottomBtnSaveText.textContent = 'Сохранить';
    if (modalType === 'delete') modalBottomBtnSaveText.textContent = 'Удалить';

    const modalBottomBtnDelete = document.createElement('button');
    modalBottomBtnDelete.classList.add('modal__bottom-btn-delete', 'btn-reset');
    modalBootom.append(modalBottomBtnDelete);
    modalBottomBtnDelete.textContent = 'Отмена';
    if (modalType === 'change') {
      modalBottomBtnDelete.textContent = 'Удалить клиента';
      modalBottomBtnDelete.addEventListener('click', () => {
        createModalWithForm(client, 'delete');
      })
    } else {
      modalBottomBtnDelete.addEventListener('click', () => { onClose(tl1); });
    }

    return modal;
  }

  // функция фильтр массива клиентов
  function filterListClients(clients, filter) {
    // фильтр по Ф.И.О. для поиска подстроки в фамилии, имени или отчестве
    const clientsFilter = clients.filter((client) =>
      `${client.name} ${client.surname} ${client.lastName}`
        .toLowerCase()
        .includes(String(deleteSpaceStr(filter.toLowerCase()))));
    return clientsFilter;
  }

  // функция для сортировки массива клиентов
  function sortListClients(clientsList, sort) {
    const clientsListSort = [...clientsList];
    if ((sort.direct > 0) && (sort.direct < 3)) {
      switch (sort.prop) {
        // сортировка по ID
        case 'id':
          clientsListSort.sort((a, b) => {
            if (sort.direct === 1) return Number(a.id) - Number(b.id);
            if (sort.direct === 2) return Number(b.id) - Number(a.id);
            return;
          });
          break;
        // сортировка по ФИО
        case 'fio':
          clientsListSort.sort((a, b) => {
            const fioA = `${a.surname.toLowerCase()} ${a.name.toLowerCase()} ${a.lastName.toLowerCase()}`;
            const fioB = `${b.surname.toLowerCase()} ${b.name.toLowerCase()} ${b.lastName.toLowerCase()}`;
            if (((fioA < fioB) && (sort.direct === 1)) || ((fioA > fioB) && (sort.direct === 2))) return -1;
            if (((fioA > fioB) && (sort.direct === 1)) || ((fioA < fioB) && (sort.direct === 2))) return 1;
            return;
          });
          break;
        // сортировка по дате создания
        case 'createAt':
          clientsListSort.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            if (sort.direct === 1) return dateA - dateB;
            if (sort.direct === 2) return dateB - dateA;
            return;
          });
          break;
        // сортировка по дате изменения
        case 'updateAt':
          clientsListSort.sort((a, b) => {
            const dateA = new Date(a.updatedAt);
            const dateB = new Date(b.updatedAt);
            if (sort.direct === 1) return dateA - dateB;
            if (sort.direct === 2) return dateB - dateA;
            return;
          });
          break;
        default: break;
      }
    }
    // возвращаем отсортированный массив клиентов
    return clientsListSort;
  }

  // функция инициализации переключателей сортировки
  function initSwithSort() {
    table.tableHeaderId.th.classList.remove('clients__thead-th--up');
    table.tableHeaderId.th.classList.remove('clients__thead-th--dw');
    table.tableHeaderFio.th.classList.remove('clients__thead-th--up');
    table.tableHeaderFio.th.classList.remove('clients__thead-th--dw');
    table.tableHeaderDateTimeCreate.th.classList.remove('clients__thead-th--up');
    table.tableHeaderDateTimeCreate.th.classList.remove('clients__thead-th--dw');
    table.tableHeaderDateTimeChange.th.classList.remove('clients__thead-th--up');
    table.tableHeaderDateTimeChange.th.classList.remove('clients__thead-th--dw');
  }

  // функция для отрисовки переключателей сортировки
  function setSwithSort(sort) {
    initSwithSort();
    switch (sort.prop) {
      case 'id': if (sort.direct == 1) {
        table.tableHeaderId.th.classList.add('clients__thead-th--dw');
      }
        if (sort.direct == 2) {
          table.tableHeaderId.th.classList.add('clients__thead-th--up');
        }
        break;
      case 'fio': if (sort.direct == 1) {
        table.tableHeaderFio.th.classList.add('clients__thead-th--dw');
      }
        if (sort.direct == 2) {
          table.tableHeaderFio.th.classList.add('clients__thead-th--up');
        }
        break;
      case 'createAt': if (sort.direct == 1) {
        table.tableHeaderDateTimeCreate.th.classList.add('clients__thead-th--dw');
      }
        if (sort.direct == 2) {
          table.tableHeaderDateTimeCreate.th.classList.add('clients__thead-th--up');
        }
        break;
      case 'updateAt': if (sort.direct == 1) {
        table.tableHeaderDateTimeChange.th.classList.add('clients__thead-th--dw');
      }
        if (sort.direct == 2) {
          table.tableHeaderDateTimeChange.th.classList.add('clients__thead-th--up');
        }
        break;
    }
  }

  // функция переключатель сортировки
  function switchSort(sort, prop = '') {
    if (sort.prop !== prop) {
      sort.prop = prop;
      sort.direct = 0;
      initSwithSort();
    }

    if (sort.direct === 0) {
      sort.direct = 1;
      setSwithSort(sort);
    } else if (sort.direct === 1) {
      sort.direct = 2;
      setSwithSort(sort);
    } else {
      sort.direct = 0;
      setSwithSort(sort);
    }
  }

  // функция сохраняет данные в LocalStorage
  function saveLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // функция получает данные из LocalStorage
  function getLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  // функция для восстановления данных при обновлении страницы браузера
  function restoreDataFromLocalStorage() {
    if (!(localStorage.getItem('filter') === null)) {
      filter = getLocalStorage('filter');
      headerContainer.headerInput.value = filter;
    }
    if (!(localStorage.getItem('sort') === null)) {
      sort = getLocalStorage('sort');
      setSwithSort(sort);
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    // создаем html-верску шапки панели управления клиентами
    headerSection = document.querySelector('.header');
    headerContainer = createClientsHeader();
    headerSection.append(headerContainer.headerContainer);

    // создаем html-верску таблицы клиентов
    mainSection = document.querySelector('.main');
    table = createClientsBodyTable();
    mainSection.append(table.table);

    // создаем html-верску футера
    footerSection = document.querySelector('.footer');
    footerContainer = createClientsFooter();
    footerSection.append(footerContainer.footerContainer);

    table.loadImg.classList.add('clients__load--active', 'rotate');
    clients = await onGet();
    restoreDataFromLocalStorage();
    renderClientsToTable(table, filterListClients(sortListClients(clients, sort), filter));
    table.loadImg.classList.remove('clients__load--active', 'rotate');

    // навешиваем событие sumbmit для формы добавления студента
    footerContainer.footerBtn.addEventListener('click', () => {
      createModalWithForm({}, 'add');
    });

    // навешиваем событие изменения значения поиска для фильтрации клиентов
    headerContainer.headerInput.addEventListener('input', () => {
      setTimeout(() => {
        filter = headerContainer.headerInput.value;
        saveLocalStorage('filter', filter);
        renderClientsToTable(table, filterListClients(sortListClients(clients, sort), filter));
      }, 300);
    })

    // навешиваем обработчик сортировки таблицы по возрастанию/убыванию ID
    // по нажатию на соответствующий заголовок столбца таблицы
    table.tableHeaderId.th.addEventListener('click', (e) => {
      switchSort(sort, 'id');
      saveLocalStorage('sort', sort);
      renderClientsToTable(table, filterListClients(sortListClients(clients, sort), filter));
    })

    // навешиваем обработчик сортировки таблицы по алфавиту А-Б/Б-А ФМО
    // по нажатию на соответствующий заголовок столбца таблицы
    table.tableHeaderFio.th.addEventListener('click', () => {
      switchSort(sort, 'fio');
      saveLocalStorage('sort', sort);
      renderClientsToTable(table, filterListClients(sortListClients(clients, sort), filter));
    })

    // навешиваем обработчик сортировки таблицы по возрастанию/убыванию даты создания контакта
    // по нажатию на соответствующий заголовок столбца таблицы
    table.tableHeaderDateTimeCreate.th.addEventListener('click', () => {
      switchSort(sort, 'createAt');
      saveLocalStorage('sort', sort);
      renderClientsToTable(table, filterListClients(sortListClients(clients, sort), filter));
    })

    // навешиваем обработчик сортировки таблицы по возрастанию/убыванию даты изменения контакта
    // по нажатию на соответствующий заголовок столбца таблицы
    table.tableHeaderDateTimeChange.th.addEventListener('click', () => {
      switchSort(sort, 'updateAt');
      saveLocalStorage('sort', sort);
      renderClientsToTable(table, filterListClients(sortListClients(clients, sort), filter));
    })

  })

})();
