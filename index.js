'use strict';

// Функция для отправки асинхронного GET-запроса
async function getRequest(url) {
    try {
        const response = await fetch(url);
        return response.json();
    } catch (error) {
        console.error(`Error: ${error}`);
    }
}

// Функция для заполнения таблицы с маршрутами
function fillTable(data) {
    let tableBody = document.querySelector('.walking-routes-tbody');
    tableBody.textContent = "";

    for (let i = 0; i < data.length; i++) {
        let tableRow = document.createElement('tr');
        tableRow.innerHTML = `
            <td>${data[i].name}</td>
            <td>${data[i].description}</td>
            <td>${data[i].mainObject}</td>
            <td><button class="btn btn-primary" data-id="${data[i].id}">Выбрать</button></td>
        `;

        tableRow.querySelector('button').addEventListener('click', function () {
            // Обработка выбора маршрута
            const routeId = this.getAttribute('data-id');
            showGuides(routeId);
        });

        tableBody.appendChild(tableRow);
    }
}

// Функция для отображения гидов по выбранному маршруту
function showGuides(routeId) {
    // Здесь можно реализовать логику для получения гидов по выбранному маршруту
    // и отображения их в таблице guides-tbody
}

// Функция для обработки события поиска маршрута
function searchRoute() {
    let inputValue = document.getElementById('find-route-input').value;
    let data = JSON.parse(sessionStorage.getItem('data'));

    if (inputValue === "") {
        fillTable(data);
    } else {
        let newData = data.filter(route => route.name.includes(inputValue));
        if (newData.length === 0) {
            // Обработка случая, когда маршрут не найден
            console.log("Маршрут не найден");
        } else {
            fillTable(newData);
        }
    }
}

// Функция для инициализации страницы
function initializePage() {
    let url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes?api_key=${apiKey}`;
    getRequest(url)
        .then(data => {
            saveToSessionStorage(data);
            fillTable(data);
        })
        .catch(error => console.error(`Something went wrong: ${error}`));
}

// Функция для сохранения данных в sessionStorage
function saveToSessionStorage(data) {
    sessionStorage.setItem("data", JSON.stringify(data));
}

// Обработчик события поиска маршрута
document.getElementById('find-route-btn').addEventListener('click', searchRoute);

// Инициализация страницы
initializePage();