let data;

function handleFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const fileName = file.name.toLowerCase();
            if (fileName.endsWith('.json')) {
                data = JSON.parse(e.target.result);
            } else if (fileName.endsWith('.csv')) {
                data = parseCSV(e.target.result);
            }

            populateAvailableFields();
        };

        reader.readAsText(file);
    } else {
        console.error('No file selected.');
    }
}

function parseCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');

    const result = {
        products: {}
    };

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const product = {};

        for (let j = 0; j < headers.length; j++) {
            product[headers[j]] = values[j];
        }

        result.products[values[0]] = product;
    }

    return result;
}

function populateAvailableFields() {
    const availableFieldsSelect = document.getElementById('availableFields');
    availableFieldsSelect.innerHTML = '';

    if (data && 'products' in data) {
        const products = data['products'];
        const sampleProduct = products[Object.keys(products)[0]];

        Object.keys(sampleProduct).forEach(field => {
            const option = document.createElement('option');
            option.value = field;
            option.textContent = field;
            availableFieldsSelect.appendChild(option);
        });
    }
}

function addField() {
    const availableFieldsSelect = document.getElementById('availableFields');
    const displayedFieldsSelect = document.getElementById('displayedFields');

    Array.from(availableFieldsSelect.selectedOptions).forEach(option => {
        const newOption = document.createElement('option');
        newOption.value = option.value;
        newOption.textContent = option.textContent;
        displayedFieldsSelect.appendChild(newOption);
        option.remove();
    });

    updateTableHeaders();
}

function removeField() {
    const availableFieldsSelect = document.getElementById('availableFields');
    const displayedFieldsSelect = document.getElementById('displayedFields');

    Array.from(displayedFieldsSelect.selectedOptions).forEach(option => {
        const newOption = document.createElement('option');
        newOption.value = option.value;
        newOption.textContent = option.textContent;
        availableFieldsSelect.appendChild(newOption);
        option.remove();
    });

    updateTableHeaders();
}

function updateTableHeaders() {
    const displayedFieldsSelect = document.getElementById('displayedFields');
    const tableHeadersRow = document.getElementById('tableHeaders');

    tableHeadersRow.innerHTML = '';

    Array.from(displayedFieldsSelect.options).forEach(option => {
        const th = document.createElement('th');
        th.textContent = option.textContent;
        tableHeadersRow.appendChild(th);
    });

    displayData();
}

function displayData() {
    const displayedFieldsSelect = document.getElementById('displayedFields');
    const tbody = document.querySelector('#dataTable tbody');

    if (data && 'products' in data) {
        const products = data['products'];

        // Sort the items based on popularity in descending order
        const sortedItems = Object.keys(products).sort((a, b) => {
            return products[b].popularity - products[a].popularity;
        });

        tbody.innerHTML = '';

        sortedItems.forEach(id => {
            const item = products[id];
            const row = document.createElement('tr');

            Array.from(displayedFieldsSelect.options).forEach(option => {
                const td = document.createElement('td');
                td.textContent = item[option.value];
                row.appendChild(td);
            });

            tbody.appendChild(row);
        });

        const countElement = document.getElementById('count');
        countElement.textContent = sortedItems.length;
        document.getElementById("recordCount").style.display = 'block';
    } else {
        console.error('Invalid data format. "products" key not found.');
    }
}