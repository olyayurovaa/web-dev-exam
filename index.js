'use strict';

const apiKey = 'f051780e-f0dd-42a2-a379-fa8f0208952d';

async function getRequest(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new TypeError("Expected JSON response from server");
        }

        return response.json();
    } catch (error) {
        console.error(`Error: ${error}`);
    }
}

DG.then(function () {
    var map = DG.map('map', {
        center: [55.7558, 37.6176],
        zoom: 13
    });
});

function fillTable(data, currentPage, itemsPerPage) {
    let tableBody = document.querySelector('.walking-routes-tbody');
    tableBody.textContent = "";

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = data.slice(startIndex, endIndex);

    for (let i = 0; i < currentData.length; i++) {
        let tableRow = document.createElement('tr');
        tableRow.innerHTML = `
            <td>${currentData[i].name}</td>
            <td>${currentData[i].description}</td>
            <td>${currentData[i].mainObject}</td>
            <td><button class="btn btn-primary" data-id="${currentData[i].id}">Выбрать</button></td>
        `;

        tableRow.querySelector('button').addEventListener('click', function () {
            const routeId = this.getAttribute('data-id');
            highlightSelectedRoute(this);
        });

        tableBody.appendChild(tableRow);
    }
}

function highlightSelectedRoute(buttonElement) {
    let routeButtons = document.querySelectorAll('.walking-routes-tbody button');
    routeButtons.forEach(button => {
        button.classList.remove('btn-success');
    });

    buttonElement.classList.add('btn-success');
}

function createPaginationItem(pageNumber, currentPage) {
    let li = document.createElement('li');
    li.className = `page-item ${pageNumber === currentPage ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" data-page="${pageNumber}" href="#">${pageNumber}</a>`;
    return li;
}

function fillPagination(totalPages, currentPage) {
    let pagination = document.getElementById('pagination-walking-routes');
    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        pagination.appendChild(createPaginationItem(i, currentPage));
    }

    pagination.addEventListener('click', function (event) {
        if (event.target.tagName === 'A') {
            const pageNumber = parseInt(event.target.getAttribute('data-page'));
            updatePage(pageNumber);
        }
    });
}

function updatePage(pageNumber) {
    let data = JSON.parse(sessionStorage.getItem('data'));
    const itemsPerPage = 5;
    fillTable(data, pageNumber, itemsPerPage);
    fillPagination(Math.ceil(data.length / itemsPerPage), pageNumber);
}

function saveToSessionStorage(data) {
    sessionStorage.setItem("data", JSON.stringify(data));
}

function updateMainObjectFilter(data) {
    const mainObjectFilter = document.getElementById('main-object-filter');
    mainObjectFilter.innerHTML = '<option value="" selected>Не выбрано</option>';

    const uniqueMainObjects = [...new Set(data.map(route => route.mainObject))];
    uniqueMainObjects.forEach(mainObject => {
        const option = document.createElement('option');
        option.value = mainObject;
        option.textContent = mainObject;
        mainObjectFilter.appendChild(option);
    });
}

function updateTableWithFilters() {
    const data = JSON.parse(sessionStorage.getItem('data'));
    const mainObjectFilterValue = document.getElementById('main-object-filter').value.toLowerCase();
    const nameFilterValue = document.getElementById('find-route-input').value.toLowerCase();

    const filteredData = data.filter(route =>
        (mainObjectFilterValue === '' || route.mainObject.toLowerCase() === mainObjectFilterValue) &&
        (nameFilterValue === '' || route.name.toLowerCase().includes(nameFilterValue))
    );

    const currentPage = 1;
    const itemsPerPage = 5;
    fillTable(filteredData, currentPage, itemsPerPage);
    fillPagination(Math.ceil(filteredData.length / itemsPerPage), currentPage);
}

function searchStartPoint() {
    const startPoint = document.getElementById('start-point-input').value;
    if (startPoint.trim() !== "") {
    } else {
        console.log("Введите адрес начальной точки");
    }
}

function initializePage() {
    let url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes?api_key=${apiKey}`;
    getRequest(url)
        .then(data => {
            saveToSessionStorage(data);
            updateMainObjectFilter(data);
            const itemsPerPage = 5;
            fillTable(data, 1, itemsPerPage);
            fillPagination(Math.ceil(data.length / itemsPerPage), 1);
        })
        .catch(error => console.error(`Something went wrong: ${error}`));
}

document.getElementById('apply-filters-btn').addEventListener('click', updateTableWithFilters);
document.getElementById('find-route-input').addEventListener('input', updateTableWithFilters);
document.getElementById('start-point-btn').addEventListener('click', searchStartPoint);
document.getElementById('pagination-walking-routes').addEventListener('click', function (event) {
    if (event.target.tagName === 'A') {
        const pageNumber = parseInt(event.target.getAttribute('data-page'));
        updatePage(pageNumber);
    }
});

initializePage();